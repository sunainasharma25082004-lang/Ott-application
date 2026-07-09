const Wishlist = require("../models/Wishlist");
const Movie = require("../models/Movie");
const Series = require("../models/Series");
const { successResponse, errorResponse } = require("../utils/response");

// @desc    Get user's wishlist with populated content
exports.getWishlist = async (req, res, next) => {
  try {
    const wishlistItems = await Wishlist.find({ user: req.user._id }).sort({ createdAt: -1 });

    const movieIds = [];
    const seriesIds = [];
    wishlistItems.forEach((item) => {
      if (item.contentType === "Movie") movieIds.push(item.contentId);
      else if (item.contentType === "Series") seriesIds.push(item.contentId);
    });

    const [movies, series] = await Promise.all([
      movieIds.length ? Movie.find({ _id: { $in: movieIds } }) : [],
      seriesIds.length ? Series.find({ _id: { $in: seriesIds } }) : [],
    ]);

    const movieMap = {};
    movies.forEach((m) => { movieMap[m._id.toString()] = m; });
    const seriesMap = {};
    series.forEach((s) => { seriesMap[s._id.toString()] = s; });

    const wishlist = wishlistItems.map((item) => {
      const obj = item.toObject();
      obj.content = item.contentType === "Movie"
        ? movieMap[item.contentId.toString()] || null
        : seriesMap[item.contentId.toString()] || null;
      return obj;
    });

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
