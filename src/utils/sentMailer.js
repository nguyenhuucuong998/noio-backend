import nodeMailer from "nodemailer";
import { env } from "~/config/environment";

import path from "path";

const logoPath = path.join(process.cwd(), "src/assets/images/logo.png");
const transporter = nodeMailer.createTransport({
  service: "gmail",
  host: env.MAILER_HOST,
  port: env.MAILER_PORT,
  secure: env.MAILER_SECURE, 
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

const sentMail = async (mailAdress, otp, message) => {
  try {
     await transporter.sendMail({
      from: env.SMTP_USER,
      to: mailAdress,
      subject: "Gohi -Yêu cầu xác thực OTP",
      text: "",
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; color: #333;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #eeeeee;">
            <img src="cid:logo" alt="Gohi Logo" style="width: 80px; height: auto; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #007bff; font-size: 24px;">Gohi KHÁM PHÁ DU LỊCH VÀ TRẢI NGHIỆM</h2>
        </div>
        <div style="padding: 30px; line-height: 1.6;">
          <h3 style="margin-top: 0; color: #222;">Mã xác thực của bạn</h3>
          <p>Chào bạn,</p>
          <p>Chúng tôi đã nhận được ${message} Vui lòng sử dụng mã bên dưới để hoàn tất quá trình:</p>
          <div style="background: #f0f7ff; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #007bff;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666;">
            <i>Lưu ý: Mã này sẽ hết hạn trong <b>5 phút</b>. Vì lý do bảo mật, tuyệt đối không chia sẻ mã này với bất kỳ ai.</i>
          </p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          <p style="margin: 0;">Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này hoặc liên hệ hỗ trợ.</p>
          <p style="margin: 10px 0 0;">© 2024 [Brand Name]. All rights reserved.</p>
        </div>
      </div>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo",
        },
      ],
    });
  } catch (error) {
    throw error;
  }
};

export const sentMailer = {
  sentMail,
};
