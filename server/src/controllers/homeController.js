const Movie = require("../models/Movie");
const Series = require("../models/Series");
const Talent = require("../models/Talent");
const WatchHistory = require("../models/WatchHistory");
const { successResponse } = require("../utils/response");

// @desc    Get home page sections
// @route   GET /api/home
exports.getHomeSections = async (req, res, next) => {
  try {
    const [
      trendingMovies,
      newReleaseMovies,
      trendingSeries,
      newReleaseSeries,
      featuredTalent,
      topMovies,
    ] = await Promise.all([
      Movie.find({ isTrending: true })
        .limit(10)
        .select("title thumbnail poster rating releaseYear genres duration"),
      Movie.find({ isNewRelease: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title thumbnail poster rating releaseYear genres duration"),
      Series.find({ isTrending: true })
        .limit(10)
        .select("title thumbnail poster rating releaseYear genres numberOfSeasons"),
      Series.find({ isNewRelease: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title thumbnail poster rating releaseYear genres numberOfSeasons"),
      Talent.find({ isFeatured: true, status: "featured" })
        .limit(6)
        .select("name category thumbnail auditionVideo votes"),
      Movie.find()
        .sort({ views: -1 })
        .limit(10)
        .select("title thumbnail poster rating releaseYear genres duration"),
    ]);

    let continueWatching = [];
    if (req.user) {
      const historyItems = await WatchHistory.find({
        user: req.user._id,
        completed: false,
        progress: { $gt: 0 },
      })
        .sort({ lastWatchedAt: -1 })
        .limit(10);

      if (historyItems.length) {
        const movieIds = [];
        const seriesIds = [];
        historyItems.forEach((item) => {
          if (item.contentType === "Movie") movieIds.push(item.contentId);
          else if (item.contentType === "Series") seriesIds.push(item.contentId);
        });

        const [cwMovies, cwSeries] = await Promise.all([
          movieIds.length
            ? Movie.find({ _id: { $in: movieIds } }).select("title thumbnail poster rating genres duration")
            : [],
          seriesIds.length
            ? Series.find({ _id: { $in: seriesIds } }).select("title thumbnail poster rating genres numberOfSeasons")
            : [],
        ]);

        const contentMap = {};
        cwMovies.forEach((m) => { contentMap[m._id.toString()] = m; });
        cwSeries.forEach((s) => { contentMap[s._id.toString()] = s; });

        continueWatching = historyItems.map((item) => ({
          ...item.toObject(),
          content: contentMap[item.contentId.toString()] || null,
        }));
      }
    }

    return successResponse(res, {
      sections: {
        trendingMovies,
        newReleaseMovies,
        trendingSeries,
        newReleaseSeries,
        featuredTalent,
        topMovies,
        continueWatching,
      },
    });
  } catch (error) {
    next(error);
  }
};
