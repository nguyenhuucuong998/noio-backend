import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { ObjectId } from "mongodb";
import ApiError from "~/utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { rentalRoomModel } from "~/models/rentalRoomModel";
import jwt from "jsonwebtoken";
import streamifier from "streamifier";
import { env } from "~/config/environment";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
/**
 * Hàm hỗ trợ lấy Public ID từ URL Cloudinary phục vụ việc xóa ảnh
 */

const getPublicIdFromUrlRemove = (url) => {
  try {
    if (!url || typeof url !== "string") return null;

    // 1. Tách chuỗi theo từ khóa '/upload/'
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;

    // 2. Lấy phần phía sau '/upload/', loại bỏ phần quản lý phiên bản 'v1234567/' (nếu có)
    let publicIdWithExt = parts[1].replace(/^v\d+\//, "");

    // 3. Loại bỏ hoàn toàn đuôi định dạng file (.jpg, .png, .webp, .jpeg) ở cuối chuỗi
    const publicId = publicIdWithExt.substring(
      0,
      publicIdWithExt.lastIndexOf("."),
    );

    return publicId;
  } catch (error) {
    console.error("Lỗi xử lý cắt chuỗi URL Cloudinary:", error);
    return null;
  }
};

const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const publicIdWithExtension = parts[1].replace(/^v\d+\//, "");
    const publicId = publicIdWithExtension.substring(
      0,
      publicIdWithExtension.lastIndexOf("."),
    );
    return publicId;
  } catch (error) {
    return null;
  }
};

// 2. SỬA LỖI TẠI ĐÂY: Loại bỏ 'format: webp' trong luồng upload_stream của Cloudinary
// Ép định dạng trong stream nhị phân dễ gây lỗi giải mã "Invalid image data" đối với ảnh từ điện thoại.
const uploadStreamToCloudinary = (buffer, folderPath) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: folderPath,
        resource_type: "image", // Xác định rõ kiểu dữ liệu tải lên là ảnh
      },
      (error, result) => {
        if (error) return reject(error);
        if (result && result.secure_url) return resolve(result.secure_url);
        return reject(new Error("Cloudinary không phản hồi liên kết ảnh"));
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const createNew = async (decoded, data, files) => {
  const verify = jwt.verify(decoded, env.SECRET_KEY);
  try {
    // ==========================
    // Validate files
    // ==========================
    if (!files || files.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Vui lòng tải lên ít nhất 1 ảnh",
      );
    }

    if (files.length > 5) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Chỉ được tải lên tối đa 5 ảnh",
      );
    }

    const thumbnailIndex = Number(data.thumbnail);
    const now = new Date();
    const dateString =
      String(now.getDate()).padStart(2, "0") +
      String(now.getMonth() + 1).padStart(2, "0") +
      now.getFullYear();

    if (
      Number.isNaN(thumbnailIndex) ||
      thumbnailIndex < 0 ||
      thumbnailIndex >= files.length
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Ảnh bìa không hợp lệ");
    }

    const postId = new ObjectId();
    const cloudinaryFolderPath = `posts/${verify.id}/${dateString}`;

    // ==========================
    // Process & Upload images (Parallel)
    // ==========================
    const uploadPromises = files.map(async (file, i) => {
      const fileMime = file && file.mimetype ? file.mimetype.toLowerCase() : "";

      if (!ALLOWED_TYPES.includes(fileMime)) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `${file.originalname || "Ảnh"} không phải file ảnh hợp lệ`,
        );
      }

      if (!file.buffer || file.buffer.length === 0) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `${file.originalname || "Ảnh"} không có dữ liệu`,
        );
      }

      let finalBuffer = file.buffer;

      // Cố gắng tối ưu ảnh bằng Sharp
      try {
        const imageProcessor = sharp(file.buffer, { failOn: "none" });
        await imageProcessor.metadata();

        finalBuffer = await imageProcessor
          .resize({
            width: 1063,
            height: 709,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toBuffer();
      } catch (sharpError) {
        console.warn(
          `[Sharp Warning] Không thể tối ưu file ${file.originalname}, chuyển sang upload ảnh gốc:`,
          sharpError.message,
        );
        finalBuffer = file.buffer;
      }

      // Đẩy dữ liệu ảnh lên Cloudinary
      try {
        const secureUrl = await uploadStreamToCloudinary(
          finalBuffer,
          cloudinaryFolderPath,
        );
        return { index: i, url: secureUrl };
      } catch (cloudinaryError) {
        // 3. SỬA LỖI TẠI ĐÂY: In toàn bộ object lỗi của Cloudinary ra terminal để bạn kiểm tra nguyên nhân gốc
        // console.error("=== [Cloudinary Core Error Log] ===");
        // console.error(`File lỗi: ${file.originalname}`);
        // console.error("Chi tiết lỗi hệ thống:", cloudinaryError);
        // console.error("=====================================");

        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Lỗi khi tải ảnh ${file.originalname} lên Cloudinary: ${cloudinaryError.message || "Sai thông tin cấu hình tài khoản"}`,
        );
      }
    });

    const uploadResults = await Promise.all(uploadPromises);

    let thumbnailUrl = "";
    const imageUrls = [];

    uploadResults.forEach((result) => {
      imageUrls.push(result.url);
      if (result.index === thumbnailIndex) {
        thumbnailUrl = result.url;
      }
    });

    // ==========================
    // Create post data
    // ==========================
    const postData = {
      _id: postId,
      ...data,
      userId: new ObjectId(verify.id),
      type: new ObjectId(data.type),
      price: Number(data.price),
      thumbnail: thumbnailUrl,
      highlights: data.highlights ? JSON.parse(data.highlights) : [],
      images: imageUrls,
    };

    const result = await rentalRoomModel.createNew(postData);
    return result;
  } catch (error) {
    throw error;
  }
};

const getAll = async () => {
  try {
    const result = await rentalRoomModel.getAll();
    return result;
  } catch (error) {
    throw error;
  }
};

const edit = async (id) => {
  try {
    const result = await rentalRoomModel.findRentalRoom(id);
    return result;
  } catch (error) {
    throw error;
  }
};

const update = async (data, files) => {
  try {
    // Chấp nhận cả 2 trường hợp đặt tên key từ Frontend: images hoặc oldImages
    const { _id, images, oldImages, thumbnail, ...restData } = data;

    const checkRentalRoom = await rentalRoomModel.findRentalRoom(_id);
    if (!checkRentalRoom) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Bài đăng không tồn tại.");
    }

    // Lấy nguồn dữ liệu ảnh cũ (ưu tiên cái nào có dữ liệu)
    const rawImages = images || oldImages;

    // =====================================================================
    // CHUẨN HÓA MẢNG ẢNH CŨ AN TOÀN TUYỆT ĐỐI
    // =====================================================================
    let keptImages = [];
    if (rawImages) {
      if (typeof rawImages === "string") {
        try {
          // Giải mã nếu Frontend gửi chuỗi JSON dạng '["url1", "url2"]'
          const parsed = JSON.parse(rawImages);
          keptImages = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // Nếu Frontend gửi chuỗi thường chứa dấu phẩy phân cách
          if (rawImages.includes(",")) {
            keptImages = rawImages.split(",");
          } else {
            // Nếu chỉ gửi duy nhất 1 chuỗi URL ảnh cũ
            keptImages = [rawImages];
          }
        }
      } else if (Array.isArray(rawImages)) {
        keptImages = rawImages;
      }
    }

    // Dọn dẹp dữ liệu mảng ảnh cũ (xóa khoảng trắng, loại bỏ null/undefined)
    keptImages = keptImages
      .map((img) => (typeof img === "string" ? img.trim() : img))
      .filter(Boolean);

    // Chuẩn hóa trường tiện ích highlights (bếp, tủ...)
    let finalHighlights = [];
    if (restData.highlights) {
      if (typeof restData.highlights === "string") {
        try {
          finalHighlights = JSON.parse(restData.highlights);
        } catch (e) {
          finalHighlights = restData.highlights
            .split(",")
            .map((item) => item.trim());
        }
      } else if (Array.isArray(restData.highlights)) {
        finalHighlights = restData.highlights;
      }
    }

    // =====================================================================
    // SO SÁNH VÀ XÓA ẢNH TRÊN CLOUDINARY
    // =====================================================================
    const oldImagesInDb = checkRentalRoom.images || [];
    const imagesToDelete = oldImagesInDb.filter(
      (imgUrl) => !keptImages.includes(imgUrl.trim()),
    );

    for (const imgUrl of imagesToDelete) {
      const publicId = getPublicIdFromUrl(imgUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Đã xóa ảnh thành công trên Cloudinary: ${publicId}`);
        } catch (delError) {
          console.error(
            `Lỗi khi xóa ảnh ${publicId} trên Cloudinary:`,
            delError,
          );
        }
      }
    }

    // =====================================================================
    // XỬ LÝ ẢNH MỚI BẰNG SHARP
    // =====================================================================
    const newUploadedImageUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const optimizedImageBuffer = await sharp(file.buffer)
          .resize({
            width: 1063,
            height: 709,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toBuffer();

        const fileBase64 = `data:image/webp;base64,${optimizedImageBuffer.toString("base64")}`;

        const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
          folder: "posts",
        });

        newUploadedImageUrls.push(uploadResponse.secure_url);
      }
    }

    // TRỘN MẢNG: Ảảnh cũ xếp trước, ảnh mới nạp xếp sau
    const finalImagesArray = [...keptImages, ...newUploadedImageUrls];

    // =====================================================================
    // KIỂM TRA ĐIỀU KIỆN CHỌN THUMBNAIL (ẢNH BÌA)
    // =====================================================================
    const thumbnailIndex = parseInt(thumbnail, 10);

    // In console log để bạn dễ debug kiểm tra dữ liệu thực tế tại terminal
    // console.log("--- DEBUG THUMBNAIL LOG ---");
    // console.log("Tổng số lượng ảnh (cũ + mới):", finalImagesArray.length);
    // console.log("Mảng danh sách ảnh thực tế:", finalImagesArray);
    // console.log("Vị trí ảnh bìa nhận được từ Frontend:", thumbnailIndex);

    if (
      Number.isNaN(thumbnailIndex) ||
      thumbnailIndex < 0 ||
      thumbnailIndex >= finalImagesArray.length
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Ảnh bìa lựa chọn không hợp lệ.",
      );
    }

    const thumbnailUrl = finalImagesArray[thumbnailIndex];

    // Đóng gói dữ liệu đồng bộ xuống MongoDB
    const updateData = {
      ...restData,
      highlights: finalHighlights,
      images: finalImagesArray,
      thumbnail: thumbnailUrl,
      updatedAt: Date.now(),
    };

    const updateResult = await rentalRoomModel.update(_id, updateData);

    return {
      success: true,
      data: updateResult,
    };
  } catch (error) {
    throw error;
  }
};

const deleteRentalRoom = async (id) => {
  try {
    // 1. Tìm thông tin bài đăng trong cơ sở dữ liệu MongoDB trước khi thực hiện xóa
    const checkRentalRoom = await rentalRoomModel.findRentalRoom(id);
    if (!checkRentalRoom) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Bài đăng này không tồn tại hoặc đã bị xóa.",
      );
    }

    // 2. Gom toàn bộ danh sách ảnh đang được lưu trong bài đăng
    const allImages = checkRentalRoom.images || [];

    // 3. Duyệt mảng tuần tự để hạ lệnh xóa tận gốc trên tài khoản Cloudinary của bạn
    for (const imgUrl of allImages) {
      const publicId = getPublicIdFromUrlRemove(imgUrl);

      if (publicId) {
        try {
          // Thực thi lệnh xóa chính thức của SDK Cloudinary
          await cloudinary.uploader.destroy(publicId);
          // Nếu log ra: { result: 'ok' } nghĩa là ảnh trên Cloudinary đã biến mất thành công!
        } catch (cloudinaryError) {}
      }
    }

    // 4. Sau khi dọn sạch kho ảnh trên Cloud, tiến hành xóa bản ghi cuối cùng trong MongoDB
    const deleteResult = await rentalRoomModel.deleteRentalRoom(id);

    return deleteResult;
  } catch (error) {
    throw error;
  }
};

export const rentalRoomService = {
  createNew,
  getAll,
  edit,
  update,
  deleteRentalRoom,
};
