const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { mongoIdParamValidator } = require("../validators/adminValidators");

router.use(protect);

router.get("/", getNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", mongoIdParamValidator, validate, markAsRead);

module.exports = router;
