const Wishlist = require("../models/Wishlist");
const { successResponse, errorResponse } = require("../utils/response");

// @desc    Get user's wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, { count: wishlist.length, wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Add to wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const { contentId, contentType } = req.body;

    const exists = await Wishlist.findOne({
      user: req.user._id,
      contentId,
      contentType,
    });

    if (exists) {
      return errorResponse(res, "Item already in wishlist", 400);
    }

    const item = await Wishlist.create({
      user: req.user._id,
      contentId,
      contentType,
    });

    return successResponse(res, { item }, "Added to wishlist", 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from wishlist
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { contentId, contentType } = req.body;

    await Wishlist.findOneAndDelete({
      user: req.user._id,
      contentId,
      contentType,
    });

    return successResponse(res, {}, "Removed from wishlist");
  } catch (error) {
    next(error);
  }
};
