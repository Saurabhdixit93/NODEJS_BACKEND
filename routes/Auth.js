const { Router } = require("express");
const router = Router();
const {
  sendPassResetOtp,
  updatePassword,
} = require("../controllers/authController");

router.post("/sendpassword-otp", sendPassResetOtp);
router.post("/update-password", updatePassword);

module.exports = router;
