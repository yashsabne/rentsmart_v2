const express = require("express");
const router = express.Router();

const {protect} = require("../middleware/authMiddleware");

const {
  validateSendMessage,
  validateSlugParam,
} = require("../validators/messageValidator");

const {
  sendMessage,
  getMessages,
  markMessagesRead,
} = require("../controllers/messageController");

router.post(
  "/send",
  protect,
  validateSendMessage,
  sendMessage
);

router.get(
  "/:slug",
  protect,
  validateSlugParam,
  getMessages
);

router.patch(
  "/read",
  protect,
  markMessagesRead
);

module.exports = router;