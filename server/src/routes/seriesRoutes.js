const express = require("express");
const router = express.Router();
const {
  getSeries,
  getSeriesById,
  getSeasons,
  createSeries,
  createEpisode,
} = require("../controllers/seriesController");
const { protect, adminOnly } = require("../middlewares/auth");

router.route("/").get(getSeries).post(protect, adminOnly, createSeries);
router.route("/:id").get(getSeriesById);
router.route("/:id/seasons").get(getSeasons);
router.post("/episodes", protect, adminOnly, createEpisode);

module.exports = router;
