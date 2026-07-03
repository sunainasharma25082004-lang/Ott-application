const nodemailer = require("nodemailer");

// Create transporter (supports Gmail + other SMTP + Ethereal for testing)
const createTransporter = () => {
  // If using real Gmail (recommended: use App Password)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback: Ethereal (fake SMTP for development - prints message to console)
  console.log("⚠️  No email credentials found. Using Ethereal test account (emails will not be delivered).");
  return nodemailer.createTestAccount().then((testAccount) => {
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "Talent Hunt <no-reply@talenthunt.com>",
      to,
      subject,
      text: text || "",
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);

    // For Ethereal, log preview URL
    if (info.messageId && nodemailer.getTestMessageUrl) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log("📧 Preview email: " + preview);
    }

    console.log(`✅ Email sent to ${to} | Subject: ${subject}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    // Don't crash the app on email failure in dev
    return { success: false, error: error.message };
  }
};

// OTP email template
const sendOTPEmail = async (email, otp, name = "User") => {
  const subject = "Your Talent Hunt Verification Code";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px; background: #0B0B0B; color: #fff; border-radius: 16px;">
      <h2 style="color: #F4B840; text-align: center;">TALENT HUNT ✨</h2>
      <p>Hi ${name},</p>
      <p>Your one-time verification code is:</p>
      <div style="background: #1F1F1F; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: 700; border-radius: 12px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p style="color: #888; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      <hr style="border-color: #333; margin: 30px 0;" />
      <p style="text-align: center; font-size: 12px; color: #666;">© Talent Hunt — Stream & Discover New Talent</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
};
