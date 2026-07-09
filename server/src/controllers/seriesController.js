const Series = require("../models/Series");
const Episode = require("../models/Episode");
const { successResponse, errorResponse } = require("../utils/response");

exports.getSeries = async (req, res, next) => {
  try {
    const { genre, trending, limit = 20 } = req.query;
    const query = {};
    if (genre) query.genres = genre;
    if (trending === "true") query.isTrending = true;

    const series = await Series.find(query).sort({ createdAt: -1 }).limit(parseInt(limit));
    return successResponse(res, { count: series.length, series });
  } catch (error) {
    next(error);
  }
};

exports.getSeriesById = async (req, res, next) => {
  try {
    const series = await Series.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!series) return errorResponse(res, "Series not found", 404);

    const episodes = await Episode.find({ series: series._id }).sort({
      seasonNumber: 1,
      episodeNumber: 1,
    });

    return successResponse(res, { series, episodes });
  } catch (error) {
    next(error);
  }
};

exports.getSeasons = async (req, res, next) => {
  try {
    const episodes = await Episode.find({ series: req.params.id }).sort({
      seasonNumber: 1,
      episodeNumber: 1,
    });

    const seasonsMap = {};
    episodes.forEach((ep) => {
      if (!seasonsMap[ep.seasonNumber]) seasonsMap[ep.seasonNumber] = [];
      seasonsMap[ep.seasonNumber].push(ep);
    });

    const seasons = Object.keys(seasonsMap).map((num) => ({
      seasonNumber: parseInt(num),
      episodes: seasonsMap[num],
    }));

    return successResponse(res, { seasons });
  } catch (error) {
    next(error);
  }
};

exports.createSeries = async (req, res, next) => {
  try {
    const series = await Series.create(req.body);
    return successResponse(res, { series }, "Series created", 201);
  } catch (error) {
    next(error);
  }
};

exports.createEpisode = async (req, res, next) => {
  try {
    const episode = await Episode.create(req.body);
    return successResponse(res, { episode }, "Episode created", 201);
  } catch (error) {
    next(error);
  }
};

exports.updateSeries = async (req, res, next) => {
  try {
    const series = await Series.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!series) return errorResponse(res, "Series not found", 404);
    return successResponse(res, { series }, "Series updated");
  } catch (error) {
    next(error);
  }
};

exports.deleteSeries = async (req, res, next) => {
  try {
    const series = await Series.findByIdAndDelete(req.params.id);
    if (!series) return errorResponse(res, "Series not found", 404);
    await Episode.deleteMany({ series: req.params.id });
    return successResponse(res, {}, "Series and its episodes deleted");
  } catch (error) {
    next(error);
  }
};

exports.updateEpisode = async (req, res, next) => {
  try {
    const episode = await Episode.findByIdAndUpdate(req.params.episodeId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!episode) return errorResponse(res, "Episode not found", 404);
    return successResponse(res, { episode }, "Episode updated");
  } catch (error) {
    next(error);
  }
};

exports.deleteEpisode = async (req, res, next) => {
  try {
    const episode = await Episode.findByIdAndDelete(req.params.episodeId);
    if (!episode) return errorResponse(res, "Episode not found", 404);
    return successResponse(res, {}, "Episode deleted");
  } catch (error) {
    next(error);
  }
};
