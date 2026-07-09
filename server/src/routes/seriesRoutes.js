const express = require("express");
const router = express.Router();
const {
  getSeries,
  getSeriesById,
  getSeasons,
  createSeries,
  createEpisode,
  updateSeries,
  deleteSeries,
  updateEpisode,
  deleteEpisode,
} = require("../controllers/seriesController");
const { protect, adminOnly } = require("../middlewares/auth");

router.route("/").get(getSeries).post(protect, adminOnly, createSeries);

router.post("/episodes", protect, adminOnly, createEpisode);
router
  .route("/episodes/:episodeId")
  .put(protect, adminOnly, updateEpisode)
  .delete(protect, adminOnly, deleteEpisode);

router
  .route("/:id")
  .get(getSeriesById)
  .put(protect, adminOnly, updateSeries)
  .delete(protect, adminOnly, deleteSeries);

router.route("/:id/seasons").get(getSeasons);

module.exports = router;
