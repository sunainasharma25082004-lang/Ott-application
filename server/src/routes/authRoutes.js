const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verifyOTP,
  resendOTP,
  getMe,
  logout,
  refreshToken,
} = require("../controllers/authController");

const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  registerValidator,
  loginValidator,
  otpValidator,
  resendOtpValidator,
} = require("../validators/authValidators");

const { authLimiter, otpLimiter } = require("../middlewares/rateLimiter");

// Public routes with strict rate limiting + validation
router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.post("/verify-otp", otpLimiter, otpValidator, validate, verifyOTP);
router.post("/resend-otp", otpLimiter, resendOtpValidator, validate, resendOTP);

// Token refresh
router.post("/refresh", authLimiter, refreshToken);

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;

