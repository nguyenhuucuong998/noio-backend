import express from "express";
import { StatusCodes } from "http-status-codes";
import { userValidation } from "~/validations/userValidation";
import { userController } from "~/controllers/userController";

const Router = express.Router();


Router.route("/:id").get(userController.getUser);

// đăng kí
Router.route("/register").post(
  userValidation.CreateNew,
  userController.createNew,
);

// đăng nhập
Router.route("/login").post(userValidation.userLogin, userController.userLogin);

// Đăng kí xác thực otp
Router.route("/otp-verify").post(
  userValidation.userVerify,
  userController.userVerify,
);


Router.route("/forgot-password")
.post(userValidation.forgotPassword, userController.forgotpassword)

Router.route('/verify-token-forgotpassword')
.post(userValidation.verifyTokenForgotpassword, userController.verifyTokenForgotpassword)


Router.route("/change-password")
.post(userValidation.changePassword, userController.changePassword)


Router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.status(StatusCodes.OK).json({
    message: "Logout success",
  });
});

export const userRoute = Router;
