const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { body } = require("express-validator");

const wishlistItemValidator = [
  body("contentId").isMongoId().withMessage("Invalid content ID"),
  body("contentType")
    .isIn(["Movie", "Series"])
    .withMessage("contentType must be Movie or Series"),
];

router.use(protect);

router.get("/", getWishlist);
router.post("/", wishlistItemValidator, validate, addToWishlist);
router.delete("/", wishlistItemValidator, validate, removeFromWishlist);

module.exports = router;

