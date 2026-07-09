const { body, param } = require("express-validator");

const mongoIdParamValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid ID"),
];

const updateUserRoleValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid user ID"),

  body("role")
    .isIn(["user", "admin"])
    .withMessage("Role must be user or admin"),
];

const reviewTalentValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid talent ID"),

  body("status")
    .isIn(["approved", "rejected", "featured"])
    .withMessage("Status must be approved, rejected, or featured"),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),

  body("adminNotes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Admin notes cannot exceed 1000 characters"),
];

const bulkReviewValidator = [
  body("ids")
    .isArray({ min: 1 })
    .withMessage("ids must be a non-empty array"),

  body("ids.*")
    .isMongoId()
    .withMessage("Each id must be a valid MongoDB ID"),

  body("status")
    .isIn(["approved", "rejected", "featured"])
    .withMessage("Status must be approved, rejected, or featured"),

  body("adminNotes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Admin notes cannot exceed 1000 characters"),
];

module.exports = {
  mongoIdParamValidator,
  updateUserRoleValidator,
  reviewTalentValidator,
  bulkReviewValidator,
};
