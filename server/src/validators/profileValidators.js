const { body, param } = require("express-validator");

const createProfileValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Profile name is required")
    .isLength({ min: 1, max: 30 })
    .withMessage("Profile name must be between 1 and 30 characters"),

  body("avatar")
    .optional()
    .isURL()
    .withMessage("Avatar must be a valid URL"),

  body("isKids")
    .optional()
    .isBoolean()
    .withMessage("isKids must be a boolean"),

  body("pin")
    .optional()
    .isLength({ min: 4, max: 4 })
    .withMessage("PIN must be 4 digits")
    .isNumeric()
    .withMessage("PIN must be numeric"),
];

const updateProfileValidator = [
  param("id").isMongoId().withMessage("Invalid profile ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Profile name must be between 1 and 30 characters"),

  body("avatar")
    .optional()
    .isURL()
    .withMessage("Avatar must be a valid URL"),

  body("isKids")
    .optional()
    .isBoolean()
    .withMessage("isKids must be a boolean"),
];

const profileIdValidator = [
  param("id").isMongoId().withMessage("Invalid profile ID"),
];

module.exports = {
  createProfileValidator,
  updateProfileValidator,
  profileIdValidator,
};
