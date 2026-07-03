const User = require("../models/User");
const Profile = require("../models/Profile");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const { sendOTPEmail } = require("../utils/sendEmail");
const { successResponse, errorResponse } = require("../utils/response");

// @desc    Register new user (with strong validation)
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "An account with this email already exists", 409);
    }

    // Create user instance first so we can set OTP before the (single) save
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      phone: phone?.trim(),
    });

    // Generate OTP (sets otp + otpExpires on the doc)
    const otp = user.generateOTP();

    // This save will trigger the password pre-save hook exactly once
    await user.save();

    // Automatically create a default profile with the same name as the registered user
    // This way, right after registration + OTP verification, the user sees their profile on "Who's Watching"
    try {
      await Profile.create({
        user: user._id,
        name: user.name,
        avatar: user.avatar || "https://i.pravatar.cc/300",
        isKids: false,
      });
    } catch (profileErr) {
      // Don't fail registration if profile creation has an issue (e.g. duplicate name for this user)
      console.warn("Could not auto-create default profile for new user:", profileErr.message);
    }

    sendOTPEmail(user.email, otp, user.name).catch((err) =>
      console.error("OTP email failed:", err.message)
    );

    // Dev only: show OTP in console
    if (process.env.NODE_ENV !== "production") {
      console.log(`🔐 [DEV] OTP for ${user.email}: ${otp}`);
    }

    const payload = {
      userId: user._id,
      email: user.email,
    };
    if (process.env.NODE_ENV !== "production") {
      payload.devOtp = otp;
    }

    return successResponse(res, payload, "Registration successful. A default profile has been created with your name. Please verify the OTP sent to your email.", 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (production ready)
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // If account not verified → force OTP flow
    if (!user.isVerified) {
      const otp = user.generateOTP();
      await user.save({ validateBeforeSave: false });

      sendOTPEmail(user.email, otp, user.name).catch(console.error);

      if (process.env.NODE_ENV !== "production") {
        console.log(`🔐 [DEV] OTP for unverified login ${user.email}: ${otp}`);
      }

      const verifyPayload = {
        requiresVerification: true,
        userId: user._id,
      };
      if (process.env.NODE_ENV !== "production") {
        verifyPayload.devOtp = otp;
      }

      return successResponse(res, verifyPayload, "Account not verified. A new OTP has been sent to your email.");
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token for rotation/blacklisting
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
      },
    }, "Login successful");
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP (6-digit, time limited)
// @route   POST /api/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp, email } = req.body;

    let user = null;

    if (userId) {
      user = await User.findById(userId).select("+otp +otpExpires");
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select("+otp +otpExpires");
    }

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    if (!user.otp || !user.otpExpires) {
      return errorResponse(res, "No active OTP request. Please request a new one.", 400);
    }

    if (user.otpExpires < Date.now()) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, "OTP has expired. Please request a new OTP.", 400);
    }

    if (user.otp !== String(otp)) {
      return errorResponse(res, "Invalid OTP. Please try again.", 400);
    }

    // Success: verify account
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return successResponse(res, {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    }, "Account verified successfully. You are now logged in.");
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP (rate limited in routes)
// @route   POST /api/auth/resend-otp
exports.resendOTP = async (req, res, next) => {
  try {
    const { email, userId } = req.body;

    let user = userId
      ? await User.findById(userId)
      : await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    sendOTPEmail(user.email, otp, user.name).catch(console.error);

    if (process.env.NODE_ENV !== "production") {
      console.log(`🔐 [DEV] Resent OTP for ${user.email}: ${otp}`);
    }

    const resendPayload = {};
    if (process.env.NODE_ENV !== "production") {
      resendPayload.devOtp = otp;
    }

    return successResponse(res, resendPayload, "A new OTP has been sent to your email.");
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Access Token using Refresh Token
// @route   POST /api/auth/refresh
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, "Refresh token is required", 400);
    }

    // Verify refresh token
    const decoded = require("jsonwebtoken").verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, "Invalid or expired refresh token", 401);
    }

    // Issue new tokens (rotation)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }, "Token refreshed successfully");
  } catch (error) {
    return errorResponse(res, "Invalid or expired refresh token", 401);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    return successResponse(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout - invalidate refresh token
// @route   POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    }
    return successResponse(res, {}, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};
