const Movie = require("../models/Movie");
const { successResponse, errorResponse } = require("../utils/response");
const { storeMedia } = require("../middlewares/upload");

exports.getMovies = async (req, res, next) => {
  try {
    const { genre, trending, newRelease, limit = 20, page = 1 } = req.query;

    const query = {};
    if (genre) query.genres = genre;
    if (trending === "true") query.isTrending = true;
    if (newRelease === "true") query.isNewRelease = true;

    const sortOption = trending === "true" 
      ? { views: -1, createdAt: -1 } 
      : { createdAt: -1 };

    const movies = await Movie.find(query)
      .sort(sortOption)
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
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!movie) return errorResponse(res, "Movie not found", 404);

    // Auto-promote to trending if views count hits 3 or more
    if (movie.views >= 3 && !movie.isTrending) {
      movie.isTrending = true;
      await movie.save();
    }

    return successResponse(res, { movie });
  } catch (error) {
    next(error);
  }
};

exports.createMovie = async (req, res, next) => {
  try {
    const movieData = { ...req.body };

    if (typeof movieData.genres === 'string') {
      try { movieData.genres = JSON.parse(movieData.genres); } catch { /* keep as-is */ }
    }

    // Cast is sent as a JSON string from the admin form: [{ name, image, character }]
    if (typeof movieData.cast === 'string') {
      try {
        const parsed = JSON.parse(movieData.cast);
        movieData.cast = Array.isArray(parsed)
          ? parsed.filter((c) => c && c.name && String(c.name).trim())
          : [];
      } catch {
        movieData.cast = [];
      }
    }

    const videoFile = req.files?.video?.[0];
    const trailerFile = req.files?.trailer?.[0];

    if (videoFile) {
      const videoResult = await storeMedia(videoFile, {
        folder: "movies",
        resourceType: "video",
        req,
      });
      movieData.videoUrl = videoResult.url;
      // Auto-fill duration from the real video (Cloudinary returns seconds).
      // Guard against a missing duration and never round a real video down to 0 min.
      if (videoResult.duration) {
        movieData.duration = Math.max(1, Math.round(videoResult.duration / 60));
      }
      movieData.isDummy = false;
    } else if (req.body.videoUrl && req.body.videoUrl.trim()) {
      movieData.isDummy = false;
    } else {
      movieData.isDummy = true;
      movieData.videoUrl = undefined;
    }

    if (trailerFile) {
      const trailerResult = await storeMedia(trailerFile, {
        folder: "movies/trailers",
        resourceType: "video",
        req,
      });
      movieData.trailerUrl = trailerResult.url;
    } else if (req.body.trailerUrl && req.body.trailerUrl.trim()) {
      movieData.trailerUrl = req.body.trailerUrl.trim();
    }

    // Thumbnail / poster can be uploaded as image files (fall back to pasted URLs).
    const thumbnailFile = req.files?.thumbnail?.[0];
    const posterFile = req.files?.poster?.[0];

    if (thumbnailFile) {
      const thumbResult = await storeMedia(thumbnailFile, {
        folder: "movies/thumbnails",
        resourceType: "image",
        req,
      });
      movieData.thumbnail = thumbResult.url;
    }

    if (posterFile) {
      const posterResult = await storeMedia(posterFile, {
        folder: "movies/posters",
        resourceType: "image",
        req,
      });
      movieData.poster = posterResult.url;
    }

    // Poster defaults to the thumbnail if none supplied.
    if (!movieData.poster && movieData.thumbnail) {
      movieData.poster = movieData.thumbnail;
    }

    const movie = await Movie.create(movieData);
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
