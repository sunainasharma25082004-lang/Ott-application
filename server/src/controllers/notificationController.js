const Notification = require("../models/Notification");
const { successResponse, errorResponse } = require("../utils/response");

// @desc    Get user notifications
// @route   GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, limit = 20, page = 1 } = req.query;
    const filter = { user: req.user._id };
    if (unreadOnly === "true") filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    return successResponse(res, {
      count: notifications.length,
      total,
      unreadCount,
      page: parseInt(page),
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return errorResponse(res, "Notification not found", 404);
    return successResponse(res, { notification }, "Notification marked as read");
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    return successResponse(res, { modifiedCount: result.modifiedCount }, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};
