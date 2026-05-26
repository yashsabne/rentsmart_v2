const express = require("express");
const router = express.Router();

const {protect} = require("../middleware/authMiddleware");

const {
  validateStartConversation,
} = require("../validators/conversationValidator");


const {
  startConversation,
  getConversations,
  getConversation,
  archiveConversation,
} = require("../controllers/conversationController");


 
 
router.post(
  "/start",
  protect,
  validateStartConversation,
  startConversation
);

router.get(
  "/",
  protect,
  getConversations
);

router.get(
  "/:slug",
  protect,
  getConversation
);

router.patch(
  "/archive/:slug",
  protect,
  archiveConversation
);

module.exports = router;