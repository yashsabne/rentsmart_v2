const { body, param } = require("express-validator");

// Validation rules for sending a message
const validateSendMessage = [
  body("conversationSlug")
    .notEmpty()
    .withMessage("conversationSlug is required."),

  body("text")
    .trim()
    .notEmpty()
    .withMessage("text is required."),
];

// Validation for slug param
const validateSlugParam = [
  param("slug")
    .notEmpty()
    .matches(/^chat-rs-[a-z0-9]+$/)
    .withMessage("Invalid conversation slug format."),
];

module.exports = {
  validateSendMessage,
  validateSlugParam,
};