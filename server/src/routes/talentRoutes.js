const express = require("express");
const router = express.Router();

const {
  getTalent,
  getLeaderboard,
  submitTalent,
  voteTalent,
  updateTalentStatus,
} = require("../controllers/talentController");

const { protect, adminOnly } = require("../middlewares/auth");
const { uploadTalentMedia } = require("../middlewares/upload");
const { uploadLimiter } = require("../middlewares/rateLimiter");
const validate = require("../middlewares/validate");
const {
  submitTalentValidator,
  talentIdValidator,
  voteValidator,
} = require("../validators/talentValidators");

// Public routes
router.get("/", getTalent);
router.get("/leaderboard", getLeaderboard);

// Protected - submit audition (rate limited + file upload)
router.post(
  "/",
  protect,
  uploadLimiter,
  uploadTalentMedia,
  submitTalentValidator,
  validate,
  submitTalent
);

// Vote on talent
router.post("/:id/vote", protect, voteValidator, validate, voteTalent);

// Admin only
router.put(
  "/:id/status",
  protect,
  adminOnly,
  talentIdValidator,
  validate,
  updateTalentStatus
);

module.exports = router;

