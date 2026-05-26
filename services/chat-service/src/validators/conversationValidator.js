const { body } = require("express-validator");

// Validation rules for starting a new conversation
const validateStartConversation = [
  body("propertyId")
    .notEmpty()
    .withMessage("propertyId is required."),

  body("propertyTitle")
    .notEmpty()
    .withMessage("propertyTitle is required."),

  body("propertyImage")
    .optional()
    .isString()
    .withMessage("propertyImage must be a string."),

  body("propertyLocation")
    .optional()
    .isString()
    .withMessage("propertyLocation must be a string."),

  body("propertyPrice")
    .optional()
    .isString()
    .withMessage("propertyPrice must be a string."),

  body("owner")
    .notEmpty()
    .withMessage("owner object is required."),

  body("owner.userId")
    .notEmpty()
    .withMessage("owner.userId is required."),

  body("owner.fullName")
    .notEmpty()
    .withMessage("owner.fullName is required."),

  body("owner.email")
    .notEmpty()
    .withMessage("owner.email is required.")
    .isEmail()
    .withMessage("owner.email must be valid."),

  body("owner.avatar")
    .optional()
    .isString()
    .withMessage("owner.avatar must be a string."),

  body("text")
    .trim()
    .notEmpty()
    .withMessage("text is required."),
];

module.exports = {
  validateStartConversation,
};