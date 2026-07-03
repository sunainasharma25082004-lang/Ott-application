const Movie = require("../models/Movie");
const { successResponse, errorResponse } = require("../utils/response");

exports.getMovies = async (req, res, next) => {
  try {
    const { genre, trending, newRelease, limit = 20, page = 1 } = req.query;

    const query = {};
    if (genre) query.genres = genre;
    if (trending === "true") query.isTrending = true;
    if (newRelease === "true") query.isNewRelease = true;

    const movies = await Movie.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Movie.countDocuments(query);

    return successResponse(res, {
      count: movies.length,
      total,
      page: parseInt(page),
      movies,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return errorResponse(res, "Movie not found", 404);
    return successResponse(res, { movie });
  } catch (error) {
    next(error);
  }
};

exports.createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    return successResponse(res, { movie }, "Movie created", 201);
  } catch (error) {
    next(error);
  }
};

exports.updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) return errorResponse(res, "Movie not found", 404);
    return successResponse(res, { movie }, "Movie updated");
  } catch (error) {
    next(error);
  }
};

exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return errorResponse(res, "Movie not found", 404);
    return successResponse(res, {}, "Movie deleted");
  } catch (error) {
    next(error);
  }
};
