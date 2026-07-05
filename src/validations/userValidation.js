import Joi from "joi";

import { StatusCodes } from "http-status-codes";

import ApiError from "~/utils/ApiError";

const CreateNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(2).max(50).trim().strict().messages({
      "any.required": `"a" is a required field`,
      "string.empty": "Vui lòng không để trống",
      "string.min": "Vui lòng nhập ít nhất {#limit} ký tự",
      "string.max": "Vui lòng nhập nhiều nhất {#limit} ký tự",
    }),
    phone: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .required()
      .messages({
        "any.required": `"a" is a required field`,
        "string.empty": "Vui lòng không để trống",
        "string.min": "Vui lòng nhập ít nhất {#limit} ký tự",
        "string.max": "Vui lòng nhập nhiều nhất {#limit} ký tự",
      }),
    email: Joi.string()
      .email()
      .required()
      .min(4)
      .max(100)
      .trim()
      .strict()
      .messages({
        "any.required": `"a" is a required field`,
        "string.empty": "Vui lòng không để trống",
        "string.email": "Vui lòng nhập đúng định dạng email",
      }),
    password: Joi.string()
      .required()
      .min(8)
      .max(50)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      )
      .messages({
        "string.empty": "Vui lòng không để trống",
        "string.min": "Mật khẩu phải ít nhất {#limit} ký tự",
        "string.max": "Mật khẩu tối đa {#limit} ký tự",
        "string.pattern.base":
          "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt",
      }),
    comfim_pasword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "any.only": "Mật khẩu nhập lại không khớp",
        "any.required": "Vui lòng nhập lại mật khẩu",
      }),
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

const userVerify = async (req, res, next) => {
  const correctCondition = Joi.object({
    is_verified: Joi.string().required().trim().strict(),
    otp: Joi.string().required().trim().strict(),
    email: Joi.string().email().required().min(4).max(100).trim().strict(),
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

const userLogin = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .min(4)
      .max(100)
      .trim()
      .strict()
      .messages({
        "any.required": `"a" is a required field`,
        "string.empty": "Vui lòng không để trống",
        "string.email": "Vui lòng nhập đúng định dạng email",
      }),
    password: Joi.string().required().min(6).max(50).trim().strict().messages({
      "any.required": `"a" is a required field`,
      "string.empty": "Vui lòng không để trống",
      "string.min": "Vui lòng nhập ít nhất {#limit} ký tự",
      "string.max": "Vui lòng nhập nhiều nhất {#limit} ký tự",
    }),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });

    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message));
  }
};

const forgotPassword = async (req, res, next) => {

  const correctCondition = Joi.object({
    email: Joi.string().email().required().min(4).max(100).trim().strict(),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });

    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message));
  }
};

const changePassword = async (req, res, next) => {
  const correctCondition = Joi.object({
    token: Joi.string().required().trim().strict(),
    password: Joi.string()
      .required()
      .min(8)
      .max(50)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      )
      .messages({
        "string.empty": "Vui lòng không để trống",
        "string.min": "Mật khẩu phải ít nhất {#limit} ký tự",
        "string.max": "Mật khẩu tối đa {#limit} ký tự",
        "string.pattern.base":
          "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt",
      }),
    confirm_password: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "any.only": "Mật khẩu nhập lại không khớp",
        "any.required": "Vui lòng nhập lại mật khẩu",
      }),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message));
  }
};

const verifyTokenForgotpassword = async (req, res, next) => {
  const correctCondition = Joi.object({
    reset_token: Joi.string().required().trim().strict(),
  });
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message));
  }
};

export const userValidation = {
  CreateNew,
  userVerify,
  userLogin,
  forgotPassword,
  changePassword,
  verifyTokenForgotpassword,
};
