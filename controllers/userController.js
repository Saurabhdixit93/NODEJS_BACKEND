const bcrypt = require("bcryptjs");
const userModel = require("../models/UserModel");
const { generateOTP } = require("../utils/GenerateOtp");
const { sendEmail } = require("../config/nodemailerConfig");
const ejs = require("ejs");
const mongoose = require("mongoose");
const fs = require("fs");
const { generateUsernameFromEmail } = require("../utils/UsernameGenerate");
const { generateToken } = require("../utils/jwtGenerate");
const RegisterMessage = fs.readFileSync(
  "./views/Emails/Registration.ejs",
  "utf-8"
);
const LoginOtpTemplate = fs.readFileSync(
  "./views/Emails/LoginWithOtp.ejs",
  "utf-8"
);

const UserSignup = async (req, res) => {
  const {
    legalName,
    userEmail,
    userPassword,
    userConfirmPassword,
    userProfileImage,
  } = req.body;

  if (!legalName || !userEmail || !userPassword || !userConfirmPassword) {
    return res.json({
      success: false,
      message: "Please Enter Required Fields.",
    });
  }

  if (userPassword !== userConfirmPassword) {
    return res.json({
      success: false,
      message: "Password and confirm password do not match.",
    });
  }
  const email = userEmail.toLowerCase();
  const securePassword = await bcrypt.hash(userPassword, 15);
  try {
    const userExists = await userModel.findOne({ userEmail: email });
    if (userExists) {
      return res.json({
        success: false,
        message: "User already exists. Please choose a different email.",
      });
    }
    const randomUsername = generateUsernameFromEmail(email);
    const newUser = await new userModel({
      userName: randomUsername,
      userEmail: email,
      legalName: legalName,
      userPassword: securePassword,
      userProfileImage: userProfileImage,
    });
    await newUser.save();
    const from = process.env.MAIL_FROM;
    const to = newUser.userEmail;
    const subject = "Account Created Successfuly";
    const HomeLink = process.env.FRONT_END;
    const html = ejs.render(RegisterMessage, {
      newUser,
      HomeLink,
    });
    await sendEmail(to, subject, html, from);
    return res.json({
      success: true,
      message: "Registration successful. Welcome to our platform!",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "An error occurred during registration. Please try again later.",
    });
  }
};

const sendOtpLogin = async (req, res) => {
  const { userEmail } = req.body;
  const email = userEmail.toLowerCase();
  try {
    const user = await userModel.findOne({ userEmail: email });
    if (!user) {
      return res.json({
        success: false,
        message:
          "User not found. Please check your email address or register a new account.",
      });
    }
    const Otp = generateOTP();
    // const otpExpirationMinutes = 10;
    // const otpExpiresAt = new Date();
    // otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + otpExpirationMinutes);
    const otpExpirationMinutes = 5;
    const otpExpiresAt = new Date(Date.now() + otpExpirationMinutes * 60000);
    user.userOtp = {
      code: Otp,
      expiresAt: otpExpiresAt,
    };
    await user.save();

    const from = process.env.MAIL_FROM;
    const to = user.userEmail;
    const subject = "Your One-Time Password (OTP) for Secure Login";
    const html = ejs.render(LoginOtpTemplate, {
      Otp,
      otpExpiresAt,
    });
    await sendEmail(to, subject, html, from);
    return res.json({
      success: true,
      message:
        "An OTP has been sent to your email address. Please check your inbox and use it to log in.",
    });
  } catch (error) {
    return res.json({
      success: false,
      message:
        "An error occurred during Login wia OTP. Please try again later.",
    });
  }
};

const verifyOtpLogin = async (req, res) => {
  const { loginOtp, userEmail } = req.body;
  try {
    const user = await userModel.findOne({ userEmail });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found. !",
      });
    }
    if (loginOtp === user.userOtp.code && new Date() < user.userOtp.expiresAt) {
      const payload = {
        userId: user._id,
      };
      const secretKey = process.env.SECRETKEY;
      const expiresIn = "7d";
      const token = await generateToken(payload, secretKey, expiresIn);
      user.userOtp = undefined;
      await user.save();
      return res.json({
        success: true,
        message:
          "You have successfully logged in with a One-Time Password (OTP).",
        token,
      });
    } else {
      return res.json({
        success: false,
        message:
          "Invalid OTP. Please check the One-Time Password (OTP) and try again.",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message:
        "An error occurred during Login wia OTP. Please try again later.",
    });
  }
};

const LoginWithPassword = async (req, res) => {
  const { userEmail, userPassword } = req.body;
  const email = userEmail.toLowerCase();
  try {
    const user = await userModel.findOne({ userEmail: email });
    if (!user) {
      return res.json({
        success: false,
        message:
          "User not found. Please check your email address or register a new account.",
      });
    }
    const passwordMatched = await bcrypt.compare(
      userPassword,
      user.userPassword
    );
    if (!passwordMatched) {
      return res.json({
        success: false,
        message:
          "Incorrect password. Please check your password and try again.",
      });
    }

    const payload = {
      userId: user._id,
    };
    const secretKey = process.env.SECRETKEY;
    const expiresIn = "7d";
    const token = await generateToken(payload, secretKey, expiresIn);
    return res.json({
      success: true,
      message: "You have successfully logged in .",
      token,
    });
  } catch (error) {
    return res.json({
      success: false,
      message:
        "An error occurred during Login wia Password. Please try again later.",
    });
  }
};



 const userDetailsUpdate = async (req, res, next) => {
  const { userEmail, legalName, userProfileImage } = req.body;
  const { userId } = req.params;

  const existingUser = await userModel.findOne({
    userEmail: userEmail.toLowerCase(),
  });
  if (existingUser) {
    return res.json({
      success: false,
      message: "Email already exists. Please use a different email.",
    });
  }

  const updates = {};

  if (legalName) {
    updates.legalName = legalName;
  }

  if (userEmail) {
    const validEmail = userEmail.toLowerCase();
    updates.userEmail = validEmail;
  }

  if (userProfileImage) {
    updates.userProfileImage = userProfileImage;
  }

  if (Object.keys(updates).length === 0) {
    return res.json({
      success: false,
      message: "No changes were made.",
    });
  }

  try {
    const updatedUser = await userModel.findByIdAndUpdate(userId, updates, {
      new: true,
    });
    if (!updatedUser) {
      return res.json({
        success: false,
        message: "User not found or no changes were made.",
      });
    }

    return res.json({
      success: true,
      message: "User information has been updated successfully.",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "An error occurred during update. Please try again later.",
    });
  }
};



const userAccountDelete = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await userModel.deleteOne({ _id: userId });
    if (result.deletedCount === 0) {
      return res.json({
        success: false,
        message: "User not found. No user was deleted.",
      });
    }
    return res.json({
      success: true,
      message: "User has been successfully deleted.",
    });
  } catch (error) {
    return res.json({
      success: false,
      message:
        "An error occurred during Delete Account. Please try again later.",
    });
  }
};

const getUserDetails = async (req, res) => {
  const { userId } = req.params;
  const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);
    
    if (!isValidObjectId) {
      return res.json({
        success: false,
        message: "Invalid user ID format. Please provide a valid user ID.",
      });
    }
  try {
    const userDetails = await userModel
      .findById(userId)
      .select("-userPassword");
    if (!userDetails) {
      return res.json({
        success: false,
        message: "User not found. The requested user does not exist.",
      });
    }
    return res.json({
      success: true,
      userDetails,
    });
  } catch (error) {
    console.log(error,"ERROR in user get");
    return res.json({
      success: false,
      error,
      message: "An error occurred during get user. Please try again later.",
    });
  }
};
module.exports = {
  UserSignup,
  sendOtpLogin,
  verifyOtpLogin,
  LoginWithPassword,
  userDetailsUpdate,
  userAccountDelete,
  getUserDetails,
};
