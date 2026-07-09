const User = require("../models/User");
const Movie = require("../models/Movie");
const Series = require("../models/Series");
const Talent = require("../models/Talent");
const Profile = require("../models/Profile");
const WatchHistory = require("../models/WatchHistory");
const LoginLog = require("../models/LoginLog");
const Notification = require("../models/Notification");
const { successResponse, errorResponse } = require("../utils/response");

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalMovies,
      totalSeries,
      pendingTalent,
      approvedTalent,
      featuredTalent,
      rejectedTalent,
      recentSignups,
      totalWatchHistory,
    ] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      Series.countDocuments(),
      Talent.countDocuments({ status: "pending" }),
      Talent.countDocuments({ status: "approved" }),
      Talent.countDocuments({ status: "featured" }),
      Talent.countDocuments({ status: "rejected" }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      WatchHistory.countDocuments(),
    ]);

    return successResponse(res, {
      stats: {
        totalUsers,
        totalMovies,
        totalSeries,
        talent: {
          pending: pendingTalent,
          approved: approvedTalent,
          featured: featuredTalent,
          rejected: rejectedTalent,
          total: pendingTalent + approvedTalent + featuredTalent + rejectedTalent,
        },
        recentSignups,
        totalWatchHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all users (with filtering)
// @route   GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, limit = 20, page = 1 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -otp -otpExpires -refreshToken")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      User.countDocuments(filter),
    ]);

    return successResponse(res, {
      count: users.length,
      total,
      page: parseInt(page),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user details by ID
// @route   GET /api/admin/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -otp -otpExpires -refreshToken"
    );
    if (!user) return errorResponse(res, "User not found", 404);

    const [profiles, loginLogCount, history] = await Promise.all([
      Profile.find({ user: req.params.id }),
      LoginLog.countDocuments({ user: req.params.id }),
      WatchHistory.find({ user: req.params.id }).sort({ lastWatchedAt: -1 }).limit(20)
    ]);

    const movieIds = history.filter(h => h.contentType === 'Movie').map(h => h.contentId);
    const seriesIds = history.filter(h => h.contentType === 'Series' || h.contentType === 'Episode').map(h => h.contentId);

    const [movies, series] = await Promise.all([
      Movie.find({ _id: { $in: movieIds } }).select('title'),
      Series.find({ _id: { $in: seriesIds } }).select('title')
    ]);

    const movieMap = new Map(movies.map(m => [m._id.toString(), m.title]));
    const seriesMap = new Map(series.map(s => [s._id.toString(), s.title]));

    const historyWithTitle = history.map(h => {
      const idStr = h.contentId.toString();
      const title = h.contentType === 'Movie' ? movieMap.get(idStr) : seriesMap.get(idStr);
      return {
        ...h.toObject(),
        title: title || 'Unknown Title'
      };
    });

    const profilesWithHistory = profiles.map(p => {
      const pHistory = historyWithTitle.filter(h => h.profile && h.profile.toString() === p._id.toString());
      return {
        ...p.toObject(),
        watchHistory: pHistory
      };
    });

    return successResponse(res, { user, profiles: profilesWithHistory, loginLogCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return errorResponse(res, "You cannot change your own role", 400);
    }

    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpires -refreshToken");

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, { user }, "User role updated");
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending talent submissions
// @route   GET /api/admin/talent/pending
exports.getPendingTalent = async (req, res, next) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    const filter = { status: "pending" };
    if (category) filter.category = category;

    const [talent, total] = await Promise.all([
      Talent.find(filter)
        .populate("submittedBy", "name email avatar")
        .sort({ createdAt: 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      Talent.countDocuments(filter),
    ]);

    return successResponse(res, {
      count: talent.length,
      total,
      page: parseInt(page),
      talent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all talent (any status)
// @route   GET /api/admin/talent
exports.getAllTalent = async (req, res, next) => {
  try {
    const { status, category, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const [talent, total] = await Promise.all([
      Talent.find(filter)
        .populate("submittedBy", "name email avatar")
        .populate("adminReviewedBy", "name email")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      Talent.countDocuments(filter),
    ]);

    return successResponse(res, {
      count: talent.length,
      total,
      page: parseInt(page),
      talent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single talent detail for admin review
// @route   GET /api/admin/talent/:id
exports.getTalentById = async (req, res, next) => {
  try {
    const talent = await Talent.findById(req.params.id)
      .populate("submittedBy", "name email avatar phone")
      .populate("adminReviewedBy", "name email");

    if (!talent) return errorResponse(res, "Talent submission not found", 404);

    return successResponse(res, { talent });
  } catch (error) {
    next(error);
  }
};

// @desc    Review (approve/reject/feature) a talent submission
// @route   PUT /api/admin/talent/:id/review
exports.reviewTalent = async (req, res, next) => {
  try {
    const { status, isFeatured, adminNotes } = req.body;

    const talent = await Talent.findById(req.params.id);
    if (!talent) return errorResponse(res, "Talent submission not found", 404);

    talent.status = status;
    talent.adminReviewedBy = req.user._id;
    talent.reviewedAt = new Date();
    if (adminNotes !== undefined) talent.adminNotes = adminNotes;

    if (status === "featured") {
      talent.isFeatured = true;
    } else if (status === "rejected") {
      talent.isFeatured = false;
    } else if (typeof isFeatured === "boolean") {
      talent.isFeatured = isFeatured;
    }

    await talent.save();

    if (talent.submittedBy) {
      const notifTypeMap = {
        approved: "talent_approved",
        rejected: "talent_rejected",
        featured: "talent_featured",
      };
      const notifTitleMap = {
        approved: "Your audition has been approved!",
        rejected: "Your audition was not selected",
        featured: "Congratulations! Your audition is now featured!",
      };
      const notifMessageMap = {
        approved: `Your "${talent.name}" audition has been approved and is now visible to everyone.`,
        rejected: `Your "${talent.name}" audition was not selected at this time.${adminNotes ? " Note: " + adminNotes : ""}`,
        featured: `Your "${talent.name}" audition has been featured on the home page! Keep up the great work.`,
      };

      await Notification.create({
        user: talent.submittedBy,
        type: notifTypeMap[status],
        title: notifTitleMap[status],
        message: notifMessageMap[status],
        relatedId: talent._id,
        relatedModel: "Talent",
      });
    }

    await talent.populate("submittedBy", "name email avatar");
    await talent.populate("adminReviewedBy", "name email");

    return successResponse(res, { talent }, "Talent reviewed successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk review talent submissions
// @route   PUT /api/admin/talent/bulk-review
exports.bulkReviewTalent = async (req, res, next) => {
  try {
    const { ids, status, adminNotes } = req.body;

    const talentItems = await Talent.find({ _id: { $in: ids } }).select("submittedBy name");

    const updateData = {
      status,
      adminReviewedBy: req.user._id,
      reviewedAt: new Date(),
    };
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (status === "featured") updateData.isFeatured = true;
    if (status === "rejected") updateData.isFeatured = false;

    const result = await Talent.updateMany({ _id: { $in: ids } }, { $set: updateData });

    const notifTypeMap = {
      approved: "talent_approved",
      rejected: "talent_rejected",
      featured: "talent_featured",
    };
    const notifTitleMap = {
      approved: "Your audition has been approved!",
      rejected: "Your audition was not selected",
      featured: "Congratulations! Your audition is now featured!",
    };

    const notifications = talentItems
      .filter((t) => t.submittedBy)
      .map((t) => ({
        user: t.submittedBy,
        type: notifTypeMap[status],
        title: notifTitleMap[status],
        message: `Your "${t.name}" audition status has been updated to ${status}.${adminNotes ? " Note: " + adminNotes : ""}`,
        relatedId: t._id,
        relatedModel: "Talent",
      }));

    if (notifications.length) {
      await Notification.insertMany(notifications);
    }

    return successResponse(
      res,
      { modifiedCount: result.modifiedCount },
      "Bulk review completed"
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete a talent submission
// @route   DELETE /api/admin/talent/:id
exports.deleteTalent = async (req, res, next) => {
  try {
    const talent = await Talent.findByIdAndDelete(req.params.id);
    if (!talent) return errorResponse(res, "Talent submission not found", 404);
    return successResponse(res, {}, "Talent submission deleted");
  } catch (error) {
    next(error);
  }
};

// @desc    Get login logs
// @route   GET /api/admin/login-logs
exports.getLoginLogs = async (req, res, next) => {
  try {
    const { email, status, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (email) filter.email = email.toLowerCase();
    if (status) filter.status = status;

    const [logs, total] = await Promise.all([
      LoginLog.find(filter)
        .populate("user", "name email")
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      LoginLog.countDocuments(filter),
    ]);

    return successResponse(res, {
      count: logs.length,
      total,
      page: parseInt(page),
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [topTalent, topMovies, topSeries, signupTrend, talentByCategory] =
      await Promise.all([
        Talent.find({ status: { $in: ["approved", "featured"] } })
          .sort({ votes: -1 })
          .limit(10)
          .select("name category votes thumbnail"),

        Movie.find()
          .sort({ views: -1 })
          .limit(10)
          .select("title views thumbnail"),

        Series.find()
          .sort({ views: -1 })
          .limit(10)
          .select("title views thumbnail"),

        User.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        Talent.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

    return successResponse(res, {
      topTalent,
      topMovies,
      topSeries,
      signupTrend,
      talentByCategory,
    });
  } catch (error) {
    next(error);
  }
};
