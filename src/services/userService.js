import { genSaltSync, hashSync,compareSync } from "bcryptjs";
import { sentMailer } from "~/utils/sentMailer";
import jwt from "jsonwebtoken";
import { env } from "~/config/environment";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import { userModel } from "~/models/userModel"; // import model để tương tác với database, nếu có nhiều model thì cứ import vào đây hết, sau này sẽ có 1 file index.js trong folder models để export tất cả model ra, sau đó chỉ cần import vào đây là được, không cần phải import từng model nữa, cho gọn gàng hơn.
import { VerifyMailer } from "~/utils/VerifyLinkMailer";
import { getToken } from "~/utils/jwtToken";

const createNew = async (reqBody) => {
  try {
       
    const newUser = {
      ...reqBody,
    };


    // check username tồn tại chưa
    const createdUser = await userModel.findUser(newUser); //tra kết dữ liệu với database, nếu có lỗi thì sẽ bị catch ở đây và throw error ra để controller bắt được lỗi và trả về cho client, nếu không có lỗi thì sẽ trả về kết quả cho controller để controller trả về cho client

    if (createdUser) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        "Tài khoản đã tồn tại!",
      );
    }

    // check email tồn tại chưa
    const findEmail = await userModel.findEmail(newUser);
    if (findEmail) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, "Email đã tồn tại!");
    }

    // //    nếu đã tồn tại

    // xóa confirm_password

    delete reqBody.comfim_pasword;

    const hashedPassword = hashSync(reqBody.password, genSaltSync(10));

    // const otp = getToken.makeid(6);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const email = reqBody.email;
    const token = jwt.sign(
      {
        email,
        otp,
      },
      env.SECRET_KEY,
      {
        expiresIn: "5m",
      },
    );

       const now = new Date();
    const dateYear = now.getFullYear();
    const dateDay = String(now.getDate()).padStart(2, "0")
    const id = dateYear + getToken.makeid(10) + dateDay

    const userData = {
      ...reqBody,
      password: hashedPassword,
      account: id,
      is_verified: token,
    };

    sentMailer.sentMail(
      reqBody.email,
      otp,
      "yêu cầu xác thực từ tài khoản của bạn.",
    );
    // // lay du lieu tu database tra ve, neu co loi thi se bi catch o day va throw error ra de controller bat duoc loi va tra ve cho client, neu khong co loi thi se tra ve ket qua cho controller de controller tra ve cho client

    const CreateUser = await userModel.createNew(userData);
    //tra kết dữ liệu với database, nếu có lỗi thì sẽ bị catch ở đây và throw error ra để controller bắt được lỗi và trả về cho client, nếu không có lỗi thì sẽ trả về kết quả cho controller để controller trả về cho client
    const findIdUser = await userModel.findId(CreateUser.insertedId); //tra kết dữ liệu với database, nếu có lỗi thì sẽ bị catch ở đây và throw error ra để controller bắt được lỗi và trả về cho client, nếu không có lỗi thì sẽ trả về kết quả cho controller để controller trả về cho client
    //tra kết dữ liệu với database, nếu có lỗi thì sẽ bị catch ở đây và throw error ra để controller bắt được lỗi và trả về cho client, nếu không có lỗi thì sẽ trả về kết quả cho controller để controller trả về cho client
  
 

    const resultData = {
      _id: findIdUser._id,
      otp: token,
    };

    return resultData;
  } catch (error) {
    throw error;
  }
};

const otpVerify = async (reqbody) => {
  try {
    const userVerify = {
      ...reqbody,
    };

    const Verify = await userModel.findEmail(userVerify);

    const token = reqbody.is_verified;

    try {
      const decoded = jwt.verify(token, env.SECRET_KEY);

      // Check OTP
      if (decoded.otp !== reqbody.otp) {
        return false;
      }
      const success = {
        _id: Verify._id,
        email: Verify.email,
      };
      await userModel.verifyApprove(Verify);

      return success;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("OTP đã hết hạn!");
      }
    }
  } catch (error) {
    throw error;
  }
};

const userLogin = async (data) => {
  try {
    const loginData = {
      ...data,
    };

    const login = await userModel.userLogin(loginData);

    if (!login) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Địa chỉ Email hoặc tài khoản đã bị khóa!",
      );
    }

    if (!compareSync(data.password, login.password)) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Mật khẩu không đúng!");
    }

    const loginSuccess = {
      _id: login._id,
      email: login.email,
    };

    return loginSuccess;
  } catch (error) {
    throw error;
  }
};

const forgotpassword = async (email) => {
  try {
    const findEmail = await userModel.forgotpassword(email);
    if (!findEmail) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy tài khoản!");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const token = jwt.sign(
      {
        email,
        otp,
      },
      env.SECRET_KEY,
      {
        expiresIn: "10m",
      },
    );

    VerifyMailer.VerifyLinkMailer(email, token);

  
    await userModel.VerifyLinkForgotPassword(
      findEmail.email,
      token,
    );

    return token;
  } catch (error) {
    throw error;
  }
};

const changePassword = async (data) => {
  try {
    if (data.confirm_password !== data.password) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Nhập lại mật khẩu không khớp!",
      );
    }

    delete data.confirm_password;

    const decoded = jwt.verify(data.token, env.SECRET_KEY);

    if (!decoded) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Tài khoản không hợp lệ!");
    }

    const hashedPassword = hashSync(data.password, genSaltSync(10));

    const changePass = await userModel.changePassword(
      decoded.email,
      hashedPassword,
    );

    return changePass;
  } catch (error) {
    throw error;
  }
};

const verifyTokenForgotpassword = async (token) => {
  try {
    const findToken = await userModel.verifyTokenForgotpassword(token);
   
       if (findToken == null) {
      throw new ApiError(StatusCodes.GONE, "Đường dẫn không đúng hoặc sai cú pháp!");
    }
    
    if (!(findToken.reset_token_expire > Date.now())) {
      throw new ApiError(StatusCodes.GONE, "Đã quá thời gian xác nhận!");
    }

    
    if (findToken.reset_token_used_count >= 2) {
      throw new ApiError(StatusCodes.GONE, "Đã quá giới hạn!");
    }

    const count = {
      token: token,
      count: findToken.reset_token_used_count + 1
    }

    await userModel.resertToken(count);


    return findToken;
  } catch (error) {
    throw error;
  }
};

const getUser = async (id) => {
  try {
    const getUser = await userModel.getUser(id)
    return getUser;
  } catch (error) {
    throw error;
  }
};

export const userService = {
  createNew,
  otpVerify,
  userLogin,
  forgotpassword,
  changePassword,
  verifyTokenForgotpassword,
  getUser
};
