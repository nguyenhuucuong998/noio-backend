import sharp from "sharp";

const WEBP = async (buffer, width, height, quality = 80) => {
  return sharp(buffer).resize(width, height).webp({ quality }).toBuffer();
};

const JPEG = async (buffer, width, height, quality = 80) => {
  return sharp(buffer).resize(width, height).jpeg({ quality }).toBuffer();
};

export const resizeImage = {
  WEBP,
  JPEG,
};

// sử dụng 
// const backgroundBuffer = await resizeWebp(
//   req.files.background[0].buffer,
//   1200,
//   400,
//   75
// );