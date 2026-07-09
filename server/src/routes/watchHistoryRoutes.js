const express = require("express");
const router = express.Router();
const {
  updateProgress,
  getHistory,
  getContinueWatching,
  deleteHistory,
  clearHistory,
} = require("../controllers/watchHistoryController");
const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  updateProgressValidator,
  mongoIdParamValidator,
} = require("../validators/watchHistoryValidators");

router.use(protect);

router
  .route("/")
  .get(getHistory)
  .post(updateProgressValidator, validate, updateProgress)
  .delete(clearHistory);

router.get("/continue", getContinueWatching);

router.delete("/:id", mongoIdParamValidator, validate, deleteHistory);

module.exports = router;
