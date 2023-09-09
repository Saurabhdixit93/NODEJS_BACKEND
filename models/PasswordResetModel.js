const { Schema, model } = require("mongoose");

const resetPasswordSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "UserModel",
    },
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpiresAt: {
      type: Date,
      default: null,
    },
    isOtpUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = model("ResetPasswordModel", resetPasswordSchema);
