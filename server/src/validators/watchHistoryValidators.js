const { body, param } = require("express-validator");

const updateProgressValidator = [
  body("contentId")
    .isMongoId()
    .withMessage("Invalid content ID"),

  body("contentType")
    .isIn(["Movie", "Series", "Episode"])
    .withMessage("contentType must be Movie, Series, or Episode"),

  body("profileId")
    .optional()
    .isMongoId()
    .withMessage("Invalid profile ID"),

  body("progress")
    .isInt({ min: 0 })
    .withMessage("Progress must be a non-negative integer (seconds)"),

  body("completed")
    .optional()
    .isBoolean()
    .withMessage("completed must be a boolean"),
];

const mongoIdParamValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid ID"),
];

module.exports = {
  updateProgressValidator,
  mongoIdParamValidator,
};
