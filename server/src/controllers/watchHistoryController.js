const WatchHistory = require("../models/WatchHistory");
const Movie = require("../models/Movie");
const Series = require("../models/Series");
const Episode = require("../models/Episode");
const Profile = require("../models/Profile");
const { successResponse, errorResponse } = require("../utils/response");

const populateContent = async (historyItems) => {
  const movieIds = [];
  const seriesIds = [];
  const episodeIds = [];

  historyItems.forEach((item) => {
    if (item.contentType === "Movie") movieIds.push(item.contentId);
    else if (item.contentType === "Series") seriesIds.push(item.contentId);
    else if (item.contentType === "Episode") episodeIds.push(item.contentId);
  });

  const [movies, series, episodes] = await Promise.all([
    movieIds.length ? Movie.find({ _id: { $in: movieIds } }) : [],
    seriesIds.length ? Series.find({ _id: { $in: seriesIds } }) : [],
    episodeIds.length ? Episode.find({ _id: { $in: episodeIds } }) : [],
  ]);

  const movieMap = {};
  movies.forEach((m) => { movieMap[m._id.toString()] = m; });
  const seriesMap = {};
  series.forEach((s) => { seriesMap[s._id.toString()] = s; });
  const episodeMap = {};
  episodes.forEach((e) => { episodeMap[e._id.toString()] = e; });

  return historyItems.map((item) => {
    const obj = item.toObject ? item.toObject() : item;
    const id = item.contentId.toString();
    if (item.contentType === "Movie") obj.content = movieMap[id] || null;
    else if (item.contentType === "Series") obj.content = seriesMap[id] || null;
    else if (item.contentType === "Episode") obj.content = episodeMap[id] || null;
    return obj;
  });
};

// @desc    Update watch progress (create or update)
// @route   POST /api/watch-history
exports.updateProgress = async (req, res, next) => {
  try {
    const { contentId, contentType, profileId, progress, completed } = req.body;

    const update = {
      progress,
      lastWatchedAt: new Date(),
    };
    if (typeof completed === "boolean") update.completed = completed;
    if (profileId) update.profile = profileId;

    const entry = await WatchHistory.findOneAndUpdate(
      { user: req.user._id, contentId, contentType },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    if (profileId) {
      await Profile.findOneAndUpdate(
        { _id: profileId, user: req.user._id, "lastWatched.contentId": { $ne: contentId } },
        {
          $push: {
            lastWatched: {
              $each: [{ contentId, contentType, progress, updatedAt: new Date() }],
              $slice: -20,
            },
          },
        }
      );
      await Profile.findOneAndUpdate(
        { _id: profileId, user: req.user._id, "lastWatched.contentId": contentId },
        {
          $set: {
            "lastWatched.$.progress": progress,
            "lastWatched.$.updatedAt": new Date(),
          },
        }
      );
    }

    return successResponse(res, { entry }, "Watch progress updated");
  } catch (error) {
    next(error);
  }
};

// @desc    Get watch history
// @route   GET /api/watch-history
exports.getHistory = async (req, res, next) => {
  try {
    const { profileId, limit = 20, page = 1, contentId } = req.query;
    const filter = { user: req.user._id };
    if (profileId) filter.profile = profileId;
    if (contentId) filter.contentId = contentId;

    const [items, total] = await Promise.all([
      WatchHistory.find(filter)
        .sort({ lastWatchedAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      WatchHistory.countDocuments(filter),
    ]);

    const history = await populateContent(items);

    return successResponse(res, {
      count: history.length,
      total,
      page: parseInt(page),
      history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get continue watching list
// @route   GET /api/watch-history/continue
exports.getContinueWatching = async (req, res, next) => {
  try {
    const { profileId, limit = 10 } = req.query;
    const filter = {
      user: req.user._id,
      completed: false,
      progress: { $gt: 0 },
    };
    if (profileId) filter.profile = profileId;

    const items = await WatchHistory.find(filter)
      .sort({ lastWatchedAt: -1 })
      .limit(parseInt(limit));

    const continueWatching = await populateContent(items);

    return successResponse(res, { count: continueWatching.length, items: continueWatching });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a single history entry
// @route   DELETE /api/watch-history/:id
exports.deleteHistory = async (req, res, next) => {
  try {
    const entry = await WatchHistory.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!entry) return errorResponse(res, "History entry not found", 404);
    return successResponse(res, {}, "History entry deleted");
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all watch history
// @route   DELETE /api/watch-history
exports.clearHistory = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.profileId) filter.profile = req.query.profileId;

    const result = await WatchHistory.deleteMany(filter);
    return successResponse(res, { deletedCount: result.deletedCount }, "Watch history cleared");
  } catch (error) {
    next(error);
  }
};
