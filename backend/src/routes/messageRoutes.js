import express from "express";
import {
  getConversations,
  getOrCreateConversationWithUser,
  getMessages,
  sendMessage,
  markConversationAsRead,
} from "../controllers/messageController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// In-memory storage → buffers streamed to Cloudinary (serverless-safe).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// @route   GET /messages/conversations
// @desc    Get all conversations for the current user
// @access  Private
router.get("/conversations", verifyToken, getConversations);

// @route   GET /messages/conversations/with/:userId
// @desc    Get or create a conversation with another user
// @access  Private
router.get("/conversations/with/:userId", verifyToken, getOrCreateConversationWithUser);

// @route   GET /messages/conversations/:conversationId
// @desc    Get messages in a conversation
// @access  Private
router.get("/conversations/:conversationId", verifyToken, getMessages);

// @route   POST /messages/conversations/:conversationId
// @desc    Send a message in a conversation
// @access  Private
router.post(
  "/conversations/:conversationId",
  verifyToken,
  upload.single("attachment"),
  sendMessage,
);

// @route   PUT /messages/conversations/:conversationId/read
// @desc    Mark a conversation as read
// @access  Private
router.put("/conversations/:conversationId/read", verifyToken, markConversationAsRead);

export default router;
