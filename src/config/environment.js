import 'dotenv/config';

export const env = { 
MONGODB_URI:process.env.MONGODB_URI,
DATABASE_NAME: process.env.DATABASE_NAME,
LOCAL_DEV_APP_HOST: process.env.LOCAL_DEV_APP_HOST,
LOCAL_DEV_APP_PORT: process.env.LOCAL_DEV_APP_PORT,

FONTEND_URL: process.env.FONTEND_URL,
SECRET_KEY: process.env.SECRET_KEY,

BUILD_MODE: process.env.BUILD_MODE,// Mặc định nếu không có BUILD_MODE thì sẽ là 'dev' để dễ dàng debug, còn nếu muốn chạy production thì phải set BUILD_MODE=production khi start server nhé. Muốn hiểu rõ hơn về cách xử lý lỗi tập trung thì hãy xem video 55 trong bộ MERN Stack trên kênh Youtube: https://www.youtube.com/@trungquandev
AUTHOR :  process.env.AUTHOR,
SMTP_USER:process.env.SMTP_USER,

SMTP_PASS:process.env.SMTP_PASS,

HTTPS: process.env.HTTPS,
MAILER_SECURE: process.env.MAILER_SECURE,
MAILER_HOST: process.env.MAILER_HOST,
MAILER_PORT: process.env.MAILER_PORT,


CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
}