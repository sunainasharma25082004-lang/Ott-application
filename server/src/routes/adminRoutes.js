const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  mongoIdParamValidator,
  updateUserRoleValidator,
  reviewTalentValidator,
  bulkReviewValidator,
} = require("../validators/adminValidators");
const {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserRole,
  getPendingTalent,
  getAllTalent,
  getTalentById,
  reviewTalent,
  bulkReviewTalent,
  deleteTalent,
  getLoginLogs,
  getAnalytics,
} = require("../controllers/adminController");

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Dashboard
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getUsers);
router.get("/users/:id", mongoIdParamValidator, validate, getUserById);
router.put("/users/:id/role", updateUserRoleValidator, validate, updateUserRole);

// Talent moderation — static routes before parameterized
router.get("/talent", getAllTalent);
router.get("/talent/pending", getPendingTalent);
router.put("/talent/bulk-review", bulkReviewValidator, validate, bulkReviewTalent);
router.get("/talent/:id", mongoIdParamValidator, validate, getTalentById);
router.put("/talent/:id/review", reviewTalentValidator, validate, reviewTalent);
router.delete("/talent/:id", mongoIdParamValidator, validate, deleteTalent);

// Login logs
router.get("/login-logs", getLoginLogs);

// Analytics
router.get("/analytics", getAnalytics);

module.exports = router;
