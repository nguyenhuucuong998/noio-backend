import { StatusCodes } from "http-status-codes";
import { env } from "~/config/environment";
import { getToken } from "~/utils/jwtToken";

import { userService } from "~/services/userService";
import { assert } from "joi";
const createNew = async (req, res, next) => {
  try {
    // req.body
    // req.query
    // req.params
    // req.jwtDecoded
    // req.cookies
    // req.files

    // điều hướng dữ liệu sang tầng service để xử lý logic nghiệp vụ, sau đó trả về response cho client

    const createNewUser = await userService.createNew(req.body); // có kết quả thì trả về cho client, không có kết quả thì trả về lỗi
    if (!createNewUser) {
      res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json({ messages: "Đăng ký thất bại" });
    }
    // có kết quả thì trả về cho client, không có kết quả thì trả về lỗi
    res.status(StatusCodes.CREATED).json(createNewUser);
  } catch (error) {
    next(error); // Gọi next với tham số error để chuyển lỗi sang middleware xử lý lỗi tập trung, không cần phải viết try catch ở tất cả controller nữa, chỉ cần viết ở service là đủ, còn controller thì cứ để mặc định như này là được.
  }
};

const userVerify = async (req, res, next) => {
  try {
    const verify = await userService.otpVerify(req.body); // có kết quả thì trả về cho client, không có kết quả thì trả về lỗi
    if (!verify) {
      res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json({ messages: "OTP bị sai" });
    } else {
      // có kết quả thì trả về cho client, không có kết quả thì trả về lỗi
      const token = getToken.getJsonWebToken(verify._id, verify.email);

      res.cookie("token", token, {
        httpOnly: true,
        secure: env.HTTPS, // true nếu deploy https
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(StatusCodes.OK).json({
        message: "Đăng nhập thành công!",
        user: verify._id,
      });
    }
  } catch (error) {
    next(error);
  }
};

const userLogin = async (req, res, next) => {
  try {
    const login = await userService.userLogin(req.body);

    const token = getToken.getJsonWebToken(login._id, login.email);

    res.cookie("token", token, {
      httpOnly: true,
      secure: env.HTTPS, // true nếu deploy https
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(StatusCodes.OK).json({
      message: "Đăng nhập thành công!",
      user: login._id,
    });
  } catch (error) {
    next(error);
  }
};

const forgotpassword = async (req, res, next) => {
  try {
    const forgot = await userService.forgotpassword(req.body.email);

    res.status(StatusCodes.OK).json(forgot);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  const data = {
    ...req.body,
  };

  try {
    const changePassword = await userService.changePassword(data);

    res.status(StatusCodes.OK).json(changePassword);
  } catch (error) {
    next(error);
  }
};

const verifyTokenForgotpassword = async (req, res, next) => {
  const { reset_token } = req.body;

  try {
    const verifyToken =
      await userService.verifyTokenForgotpassword(reset_token);

    res.status(StatusCodes.OK).json(verifyToken);
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {

    const id = req.params.id
  try {
  
    const getUser = await userService.getUser(id); // có kết quả thì trả về cho client, không có kết quả thì trả về lỗi

    res.status(StatusCodes.OK).json(getUser);
  } catch (error) {
    next(error); // Gọi next với tham số error để chuyển lỗi sang middleware xử lý lỗi tập trung, không cần phải viết try catch ở tất cả controller nữa, chỉ cần viết ở service là đủ, còn controller thì cứ để mặc định như này là được.
  }
};

export const userController = {
  createNew,
  userVerify,
  userLogin,
  forgotpassword,
  changePassword,
  verifyTokenForgotpassword,
  getUser
};
