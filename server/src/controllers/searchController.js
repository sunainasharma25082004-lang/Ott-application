const Movie = require("../models/Movie");
const Series = require("../models/Series");
const Talent = require("../models/Talent");
const { successResponse } = require("../utils/response");

// Simple unified search
exports.searchAll = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return successResponse(res, { count: 0, results: [] });
    }

    const regex = new RegExp(q, "i");

    const [movies, series, talent] = await Promise.all([
      Movie.find({ title: regex }).limit(8),
      Series.find({ title: regex }).limit(8),
      Talent.find({ name: regex, status: { $in: ["approved", "featured"] } }).limit(6),
    ]);

    const results = [
      ...movies.map((m) => ({ ...m.toObject(), type: "Movie" })),
      ...series.map((s) => ({ ...s.toObject(), type: "Series" })),
      ...talent.map((t) => ({ ...t.toObject(), type: "Talent" })),
    ];

    return successResponse(res, { count: results.length, results });
  } catch (error) {
    next(error);
  }
};
