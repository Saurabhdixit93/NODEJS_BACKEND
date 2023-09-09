const { Router } = require("express");
const router = Router();
const {
  UserSignup,
  LoginWithPassword,
  sendOtpLogin,
  verifyOtpLogin,
  userDetailsUpdate,
  userAccountDelete,
  getUserDetails,
} = require("../controllers/userController");
const { verifyToken } = require("../middlewares/AuthVerify");

router.post("/signup", UserSignup);
router.post("/login-password", LoginWithPassword);

// send otp to login
router.post("/send-loginOtp", sendOtpLogin);
router.post("/verify-loginOtp", verifyOtpLogin);
router.get("/get-user/:userId", verifyToken, getUserDetails);
router.put("/update/:userId", verifyToken, userDetailsUpdate);
router.delete("/delete/:userId", verifyToken, userAccountDelete);
module.exports = router;
