import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb";

const RENTAL_ROOM_COLLECTION_NAME = "rental_rooms";

const RENTAL_ROOM_COLLECTION_SCHEMA = Joi.object({
  _id: Joi.object().required(),
  title: Joi.string().required(),
  price: Joi.number().required(),
  address: Joi.string().required(),
  displayTime: Joi.string().required(),
  userId: Joi.object().required(),
  type: Joi.object().required(), // ObjectId liên kết với property_types
  city: Joi.string().required(), // String liên kết với cities
  contact: Joi.string().required(),
  highlights: Joi.array().items(Joi.string()).default([]), // Mảng String dạng slug (ví dụ: ["day-du-noi-that"])
  images: Joi.any().optional(),
  thumbnail: Joi.string().required(),
  latitude: Joi.string().required(),
  longitude: Joi.string().required(),
  description: Joi.string(),
  createdAt: Joi.date()
    .timestamp("javascript")
    .default(() => Date.now()),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  active: Joi.boolean().default(true),
});

const validateBeoreCreate = async (data) => {
  return await RENTAL_ROOM_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

// =========================================================
// HÀM GETALL HOÀN CHỈNH ĐÃ SỬA LỖI ĐỊNH DẠNG SLUG STRING
// =========================================================
const getAll = async () => {
  const today = new Date().toISOString().split("T")[0];
  try {
    const results = await GET_DB()
      .collection(RENTAL_ROOM_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            active: true,
            displayTime: {
              $gte: today,
            },
          },
        },
        // Bước 1: Liên kết với bảng "cities" dựa trên chuỗi slug (Ví dụ: "hai-phong")
        {
          $lookup: {
            from: "cities",
            localField: "city",
            foreignField: "slug",
            as: "cityDetail",
          },
        },
        {
          $unwind: { path: "$cityDetail", preserveNullAndEmptyArrays: true },
        },

        // Bước 2: SỬA LỖI TẠI ĐÂY - Liên kết thẳng mảng chuỗi slug với trường "slug" của bảng utilities
        // Đã loại bỏ hoàn toàn tầng trung gian $toObjectId gây lỗi độ dài 24 ký tự
        {
          $lookup: {
            from: "utilities", // Tên bảng tiện ích
            localField: "highlights", // Mảng chuỗi gửi lên (ví dụ: ["day-du-noi-that"])
            foreignField: "slug", // Khóa đối chiếu ở bảng utilities gốc (nếu cột trong DB của bạn tên là 'key' hoặc 'code' thì đổi lại nhé)
            as: "utilitiesDetail",
          },
        },

        // Bước 3: Liên kết với bảng "property_types" dựa trên trường "type" (Đã là ObjectId sẵn)
        {
          $lookup: {
            from: "property_types",
            localField: "type",
            foreignField: "_id",
            as: "propertyTypeDetail",
          },
        },
        {
          $unwind: {
            path: "$propertyTypeDetail",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Bước 4: Định hình lại toàn bộ cấu trúc dữ liệu trả về cho danh sách bài đăng
        {
          $project: {
            _id: 1,
            title: 1,
            price: 1,
            address: 1,
            displayTime: 1,
            contact: 1,
            thumbnail: 1,
            description: 1,
            images: 1,
            latitude: 1,
            longitude: 1,
            createdAt: 1,
            updatedAt: 1,
            city: { $ifNull: ["$cityDetail", "$city"] },
            type: { $ifNull: ["$propertyTypeDetail", "$type"] },
            highlights: { $ifNull: ["$utilitiesDetail", "$highlights"] },
          },
        },

        // Bước 5: Sắp xếp bài đăng mới nhất lên đầu
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return results;
  } catch (error) {
    throw new Error(error);
  }
};

const createNew = async (postData) => {
  const post = await validateBeoreCreate(postData);
  try {
    // check username tồn tại chưa
    const create = await GET_DB()
      .collection(RENTAL_ROOM_COLLECTION_NAME)
      .insertOne(post);

    return create;
  } catch (error) {
    throw new Error(error);
  }
};

const findRentalRoom = async (id) => {
  try {
    // check username tồn tại chưa
    const edit = await GET_DB()
      .collection(RENTAL_ROOM_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    return edit;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (id, data) => {
  try {
    // check username tồn tại chưa
    const update = await GET_DB()
      .collection(RENTAL_ROOM_COLLECTION_NAME)
      .updateOne({ _id: new ObjectId(id) }, { $set: data });
    return update;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteRentalRoom = async (id) => {
  try {
    // check username tồn tại chưa
    const deleteRentalRoom = await GET_DB()
      .collection(RENTAL_ROOM_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) });
    return deleteRentalRoom;
  } catch (error) {
    throw new Error(error);
  }
};

export const rentalRoomModel = {
  RENTAL_ROOM_COLLECTION_NAME,
  RENTAL_ROOM_COLLECTION_SCHEMA,
  createNew,
  getAll,
  findRentalRoom,
  update,
  deleteRentalRoom,
};
