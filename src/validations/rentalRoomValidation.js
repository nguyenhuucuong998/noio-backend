import Joi from "joi";

import { StatusCodes } from "http-status-codes";

import ApiError from "~/utils/ApiError";

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    _id: Joi.string().hex().length(24),
    title: Joi.string().required(),
    price: Joi.number().required(),
    address: Joi.string().required(),
    displayTime: Joi.string().required(),
    type: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().required(),
    contact: Joi.string().required(),
    highlights: Joi.string().required(),
    images: Joi.any().optional(),
    description: Joi.string(),
    thumbnail: Joi.number().required(),
    latitude: Joi.string().required(),
    longitude: Joi.string().required(),
  });

  try {
    //set abortEarly to false to get all errors at once
    await correctCondition.validateAsync(req.body, { abortEarly: false });

    //validation xong xong thì gọi next để chuyển sang controller xử lý tiếp
    next();
  } catch (error) {
    // const errorMessage = new Error(error).message
    // const customerError = new ApiError(StatusCodes.BAD_REQUEST, errorMessage);
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)); // Gọi next với tham số error để chuyển lỗi sang middleware xử lý lỗi tập trung, không cần phải viết try catch ở tất cả controller nữa, chỉ cần viết ở service là đủ, còn controller thì cứ để mặc định như này là được.
  }
};

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    _id: Joi.string().hex().length(24),
    title: Joi.string().required(),
    price: Joi.number().required(),
    address: Joi.string().required(),
    displayTime: Joi.string().required(),
    type: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().required(),
    contact: Joi.string().required(),
    highlights: Joi.string().required(),
    oldImages: Joi.any().optional(),
    images: Joi.any().optional(),
    description: Joi.string(),
    thumbnail: Joi.number().required(),
  });

  try {
    //set abortEarly to false to get all errors at once
    await correctCondition.validateAsync(req.body, { abortEarly: false });

    //validation xong xong thì gọi next để chuyển sang controller xử lý tiếp
    next();
  } catch (error) {
    // const errorMessage = new Error(error).message
    // const customerError = new ApiError(StatusCodes.BAD_REQUEST, errorMessage);
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)); // Gọi next với tham số error để chuyển lỗi sang middleware xử lý lỗi tập trung, không cần phải viết try catch ở tất cả controller nữa, chỉ cần viết ở service là đủ, còn controller thì cứ để mặc định như này là được.
  }
};

export const rentalRoomValidation = {
  createNew,
  update
};
