const Profile = require("../models/Profile");
const { successResponse, errorResponse } = require("../utils/response");

// @desc    Get all profiles for logged in user
exports.getMyProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.find({ user: req.user._id }).sort({ createdAt: -1 });

    return successResponse(res, {
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new profile
exports.createProfile = async (req, res, next) => {
  try {
    const { name, avatar, isKids, pin } = req.body;

    const count = await Profile.countDocuments({ user: req.user._id });
    if (count >= 5) {
      return errorResponse(res, "Maximum 5 profiles allowed per account", 400);
    }

    const profile = await Profile.create({
      user: req.user._id,
      name: name.trim(),
      avatar: avatar || "https://i.pravatar.cc/300",
      isKids: !!isKids,
      pin,
    });

    return successResponse(res, { profile }, "Profile created successfully", 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, isKids } = req.body;

    const profile = await Profile.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!profile) {
      return errorResponse(res, "Profile not found", 404);
    }

    if (name) profile.name = name.trim();
    if (avatar) profile.avatar = avatar;
    if (typeof isKids === "boolean") profile.isKids = isKids;

    await profile.save();

    return successResponse(res, { profile }, "Profile updated");
  } catch (error) {
    next(error);
  }
};

// @desc    Delete profile
exports.deleteProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!profile) {
      return errorResponse(res, "Profile not found", 404);
    }

    return successResponse(res, {}, "Profile deleted successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get single profile
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!profile) {
      return errorResponse(res, "Profile not found", 404);
    }

    return successResponse(res, { profile });
  } catch (error) {
    next(error);
  }
};
