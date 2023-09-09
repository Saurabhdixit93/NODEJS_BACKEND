const passwordResetModel = require("../models/PasswordResetModel");
const userModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../config/nodemailerConfig");
const { generateOTP } = require("../utils/GenerateOtp");
const ejs = require("ejs");
const fs = require("fs");

const passwordResetTemplate = fs.readFileSync(
  "./views/Emails/ResetPass.ejs",
  "utf-8"
);

const passwordResetSuccess = fs.readFileSync(
  "./views/Emails/PassUpdate.ejs",
  "utf-8"
);

const sendPassResetOtp = async (req, res) => {
  const { userEmail } = req.body;
  const email = userEmail.toLowerCase();

  try {
    const user = await userModel.findOne({ userEmail: email });
    if (!user) {
      return res.json({
        message: "User not Found with this email !",
        success: false,
      });
    }
    const resetOtp = generateOTP();
    // const resetOtpExpiresAt = new Date(Date.now() + 3600000);
    const resetOtpExpiresAt = 10;
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + resetOtpExpiresAt);

    const resetOtpDoc = new passwordResetModel({
      user: user._id,
      resetOtp,
      resetOtpExpiresAt,
    });

    await resetOtpDoc.save();
    const resetOtpValue = resetOtp;

    const from = process.env.MAIL_FROM;
    const to = user.userEmail;
    const subject = "Password Reset Request";
    const html = ejs.render(passwordResetTemplate, {
      resetOtpValue,
      user,
    });

    await sendEmail(to, subject, html, from);
    return res.json({
      success: true,
      message: "Password reset otp sent successfully.",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Internal Server Error .",
    });
  }
};

const updatePassword = async (req, res) => {
  const { passOtp, password } = req.body;
  try {
    const resetOtpDoc = await passwordResetModel.findOne({
      resetOtp: passOtp,
      resetOtpExpiresAt: { $gt: new Date() },
      isOtpUsed: false,
    });
    if (!resetOtpDoc) {
      return res.json({
        message: "Invalid or expired Otp .",
        success: false,
      });
    }
    const user = await userModel.findById(resetOtpDoc.user);
    if (!user) {
      return res.json({
        message: "User not found .",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    user.userPassword = hashedPassword;
    await user.save();

    // Mark the reset otp as used
    resetOtpDoc.isOtpUsed = true;
    resetOtpDoc.resetOtp = null;
    resetOtpDoc.resetOtpExpiresAt = null;
    await resetOtpDoc.save();

    const html = ejs.render(passwordResetSuccess);
    const from = process.env.MAIL_FROM;
    const to = user.userEmail;
    const subject = "Password Changed Successfully";
    await sendEmail(to, subject, html, from);
    return res.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Internal Server Error .",
    });
  }
};

module.exports = {
  sendPassResetOtp,
  updatePassword,
};
