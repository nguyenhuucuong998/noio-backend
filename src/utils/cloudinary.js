import cloudinary from 'cloudinary'
import {env} from '~/config/environment'
import multer from 'multer' 

cloudinary.v2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

// 2. Cấu hình Multer để lưu file vào bộ nhớ đệm (buffer) trước khi đẩy lên Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Hàm upload ảnh lên Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: "my_uploads" }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }).end(buffer);
  });
};