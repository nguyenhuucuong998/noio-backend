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

// Hàm gửi mail xác thực bằng Đường Link (Không dùng mã OTP số)
const VerifyLinkMailer = async (mailAdress, resetLink) => {
  try {
    await transporter.sendMail({
      from: `"Nơi ở gửi đến bạn" <${env.SMTP_USER}>`,
      to: mailAdress,
      subject: "[NoiO.vn] Xác thực yêu cầu đặt lại mật khẩu của bạn",
      text: `Xin chào, Chúng tôi nhận được yêu cầu đổi mật khẩu từ bạn. Vui lòng truy cập đường link sau để xác thực và tiến hành đặt lại mật khẩu mới: ${env.FONTEND_URL}/verify-forgot-password/${resetLink}. Yêu cầu này sẽ hết hạn trong 10 phút.`,
      html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; color: #334155; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
    
    <!-- Header Giao diện NoiO.vn -->
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 35px 20px; text-align: center;">
    <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 1px;">
        NoiO<span style="color: #10b981;">.vn</span>
      </h2>
      <p style="margin: 6px 0 0 0; color: #e0e7ff; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">
        Nền tảng đăng tin & tìm kiếm nơi ở toàn quốc
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 35px 30px; line-height: 1.6;">
      <h3 style="margin-top: 0; color: #0f172a; font-size: 18px; font-weight: 800;">
        Xác thực đặt lại mật khẩu
      </h3>
      <p style="color: #475569; font-size: 15px; margin-bottom: 8px;">Xin chào bạn,</p>
      <p style="color: #475569; font-size: 15px; margin-top: 0;">
        Hệ thống <b>NoiO.vn</b> vừa nhận được yêu cầu khôi phục mật khẩu cho tài khoản liên kết với địa chỉ Email này.
      </p>
      
      <p style="color: #475569; font-size: 15px; margin-top: 20px;">
        Để xác minh chính chủ và tiến hành thiết lập mật khẩu mới, bạn vui lòng bấm vào nút xác thực an toàn dưới đây:
      </p>
      
      <!-- Nút bấm hành động (Chuyển đến trang nhập pass mới) -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${env.FONTEND_URL}/change-password/${resetLink}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 12px; display: inline-block; box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3); text-transform: uppercase; letter-spacing: 0.5px; transition: background-color 0.2s;">
          Xác thực & Đổi mật khẩu
        </a>
      </div>

      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
        Nếu nút bấm trên không hoạt động, bạn có thể sao chép và dán trực tiếp đường dẫn này vào trình duyệt của mình:
      </p>
    

      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
      
      <!-- Lưu ý -->
      <div style="background-color: #fffbeb; padding: 15px; border-radius: 12px; border-left: 4px solid #f59e0b;">
        <p style="font-size: 12.5px; color: #b45309; font-style: italic; margin: 0; line-height: 1.5;">
          <b>* Lưu ý bảo mật:</b> Đường link xác thực này chỉ có hiệu lực trong vòng <b>10 phút</b>. Nếu bạn không đưa ra yêu cầu khôi phục này, vui lòng bỏ qua thư này, tài khoản của bạn vẫn được bảo vệ an toàn.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 25px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
      <p style="margin: 0; font-weight: 700; color: #4f46e5; font-size: 14px;">Thân ái, Ban quản trị NoiO.vn</p>
      <p style="margin: 6px 0 0; font-size: 11px; color: #cbd5e1;">Hệ thống kết nối an toàn bảo mật mã hóa SSL 256-bit</p>
      <p style="margin: 16px 0 0; font-size: 11px;">© 2026 NoiO.vn Platform. All rights reserved.</p>
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

export const VerifyMailer = {
  VerifyLinkMailer,
};
