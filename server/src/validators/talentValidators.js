const { body, param, query } = require("express-validator");

const submitTalentValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Talent name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters"),

  body("category")
    .optional()
    .isIn(["Actor", "Actress", "Singer", "Dancer", "Musician", "Comedian", "Model", "Other"])
    .withMessage("Invalid category"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 }),
];

const talentIdValidator = [
  param("id").isMongoId().withMessage("Invalid talent ID"),
];

const voteValidator = talentIdValidator;

module.exports = {
  submitTalentValidator,
  talentIdValidator,
  voteValidator,
};
