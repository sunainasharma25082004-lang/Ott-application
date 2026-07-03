const express = require("express");
const router = express.Router();

const {
  getMyProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfile,
} = require("../controllers/profileController");

const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  createProfileValidator,
  updateProfileValidator,
  profileIdValidator,
} = require("../validators/profileValidators");

router.use(protect); // All profile routes require authentication

router
  .route("/")
  .get(getMyProfiles)
  .post(createProfileValidator, validate, createProfile);

router
  .route("/:id")
  .get(profileIdValidator, validate, getProfile)
  .put(updateProfileValidator, validate, updateProfile)
  .delete(profileIdValidator, validate, deleteProfile);

module.exports = router;

