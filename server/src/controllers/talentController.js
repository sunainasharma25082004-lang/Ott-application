const Talent = require("../models/Talent");
const { uploadToCloudinary } = require("../middlewares/upload");
const { successResponse, errorResponse } = require("../utils/response");

// @desc    Get approved/featured talent
exports.getTalent = async (req, res, next) => {
  try {
    const { category, featured, limit = 30 } = req.query;

    const query = { status: { $in: ["approved", "featured"] } };
    if (category) query.category = category;
    if (featured === "true") query.isFeatured = true;

    const talent = await Talent.find(query)
      .sort({ isFeatured: -1, votes: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate("submittedBy", "name avatar");

    return successResponse(res, {
      count: talent.length,
      talent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await Talent.find({ status: { $in: ["approved", "featured"] } })
      .sort({ votes: -1 })
      .limit(20)
      .select("name category votes thumbnail auditionVideo isFeatured");

    return successResponse(res, { leaderboard });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit talent audition (with validation + rate limit in route)
exports.submitTalent = async (req, res, next) => {
  try {
    const { name, category, bio, location } = req.body;

    if (!req.files?.auditionVideo?.[0]) {
      return errorResponse(res, "Audition video is required", 400);
    }

    let thumbnailUrl = null;
    let videoUrl = null;

    // Upload thumbnail (optional)
    if (req.files.thumbnail?.[0]) {
      const result = await uploadToCloudinary(req.files.thumbnail[0].buffer, {
        folder: "talenthunt/talent",
        resourceType: "image",
      });
      thumbnailUrl = result.secure_url;
    }

    // Upload video
    const videoResult = await uploadToCloudinary(req.files.auditionVideo[0].buffer, {
      folder: "talenthunt/talent",
      resourceType: "video",
    });
    videoUrl = videoResult.secure_url;

    const talent = await Talent.create({
      submittedBy: req.user?._id || null,
      name: name.trim(),
      category: category || "Actor",
      bio,
      location,
      thumbnail: thumbnailUrl,
      auditionVideo: videoUrl,
      status: "pending",
    });

    return successResponse(
      res,
      { talent },
      "Audition submitted successfully! It will be reviewed by our team.",
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Vote / unvote for talent
exports.voteTalent = async (req, res, next) => {
  try {
    const talent = await Talent.findById(req.params.id);

    if (!talent) {
      return errorResponse(res, "Talent not found", 404);
    }

    const userId = req.user?._id?.toString();

    if (userId && talent.likedBy.some((id) => id.toString() === userId)) {
      talent.likedBy = talent.likedBy.filter((id) => id.toString() !== userId);
      talent.votes = Math.max(0, talent.votes - 1);
    } else {
      if (userId) talent.likedBy.push(req.user._id);
      talent.votes += 1;
    }

    await talent.save();

    return successResponse(res, {
      votes: talent.votes,
      hasVoted: userId ? talent.likedBy.some((id) => id.toString() === userId) : false,
    });
  } catch (error) {
    next(error);
  }
};

// Admin update
exports.updateTalentStatus = async (req, res, next) => {
  try {
    const { status, isFeatured } = req.body;

    const talent = await Talent.findByIdAndUpdate(
      req.params.id,
      { status, isFeatured },
      { new: true, runValidators: true }
    );

    if (!talent) {
      return errorResponse(res, "Talent not found", 404);
    }

    return successResponse(res, { talent }, "Talent updated");
  } catch (error) {
    next(error);
  }
};
