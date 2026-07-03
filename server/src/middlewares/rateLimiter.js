const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV !== "production";

/**
 * Rate limiters for sensitive routes (auth, OTP, uploads)
 * 
 * In development we are very lenient because you test login/register/OTP a lot
 * while fixing bugs. In production these limits are strict.
 */

// Strict limiter for auth actions (login, register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 10,   // Very high in dev, strict in prod
  message: {
    success: false,
    message: isDev 
      ? "Rate limit hit in development. We increased the limit a lot. Just restart the backend if you're blocked."
      : "Too many attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP specific (more strict)
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: isDev ? 500 : 5,
  message: {
    success: false,
    message: isDev
      ? "Too many OTP requests (dev). Normally you have to wait."
      : "Too many OTP requests. Please wait before requesting again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter (soft)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Talent upload limiter (prevent spam)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: "Too many uploads. Please try again later.",
  },
});

module.exports = {
  authLimiter,
  otpLimiter,
  apiLimiter,
  uploadLimiter,
};
