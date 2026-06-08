import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { getIO, getOnlineUsers } from "../socket.js";

/**
 * Find an existing conversation between two users or create a new one.
 */
export const findOrCreateConversation = async (userId, otherUserId) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [userId, otherUserId], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, otherUserId],
    });
  }

  return conversation;
};

/**
 * Persist a message, update the conversation, and emit it in real time.
 */
export const createAndDeliverMessage = async ({
  conversationId,
  senderId,
  recipientId,
  content,
}) => {
  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    recipient: recipientId,
    content,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    lastMessageAt: message.createdAt,
  });

  const populated = await message.populate(
    "sender recipient",
    "name profileImage role",
  );

  const onlineUsers = getOnlineUsers();
  const io = getIO();
  const recipientSocketId = onlineUsers.get(recipientId.toString());

  if (io && recipientSocketId) {
    io.to(recipientSocketId).emit("receive_message", populated);
  }

  return populated;
};

/**
 * @desc    Get all conversations for the current user
 * @route   GET /messages/conversations
 * @access  Private
 */
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name profileImage role specialization")
      .populate({
        path: "lastMessage",
        select: "content sender read createdAt",
      })
      .sort({ lastMessageAt: -1 });

    const onlineUsers = getOnlineUsers();

    const data = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUser = conversation.participants.find(
          (p) => p._id.toString() !== req.user._id.toString(),
        );

        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          recipient: req.user._id,
          read: false,
        });

        return {
          _id: conversation._id,
          otherUser,
          isOnline: otherUser ? onlineUsers.has(otherUser._id.toString()) : false,
          lastMessage: conversation.lastMessage,
          lastMessageAt: conversation.lastMessageAt,
          unreadCount,
        };
      }),
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching conversations.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get or create a conversation with another user
 * @route   GET /messages/conversations/with/:userId
 * @access  Private
 */
export const getOrCreateConversationWithUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id." });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot start a conversation with yourself.",
      });
    }

    const otherUser = await User.findById(userId).select(
      "name profileImage role specialization",
    );

    if (!otherUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const conversation = await findOrCreateConversation(req.user._id, userId);
    const onlineUsers = getOnlineUsers();

    res.status(200).json({
      success: true,
      data: {
        _id: conversation._id,
        otherUser,
        isOnline: onlineUsers.has(userId),
      },
    });
  } catch (error) {
    console.error("Get or create conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error starting conversation.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get messages in a conversation
 * @route   GET /messages/conversations/:conversationId
 * @access  Private
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender recipient", "name profileImage role")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching messages.",
      error: error.message,
    });
  }
};

/**
 * @desc    Send a message in a conversation
 * @route   POST /messages/conversations/:conversationId
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message content is required." });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    const recipientId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString(),
    );

    const message = await createAndDeliverMessage({
      conversationId: conversation._id,
      senderId: req.user._id,
      recipientId,
      content: content.trim(),
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error sending message.",
      error: error.message,
    });
  }
};

/**
 * @desc    Mark all messages in a conversation as read
 * @route   PUT /messages/conversations/:conversationId/read
 * @access  Private
 */
export const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    await Message.updateMany(
      { conversation: conversationId, recipient: req.user._id, read: false },
      { read: true },
    );

    const sender = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString(),
    );

    const onlineUsers = getOnlineUsers();
    const io = getIO();
    const senderSocketId = sender && onlineUsers.get(sender.toString());

    if (io && senderSocketId) {
      io.to(senderSocketId).emit("messages_read", {
        conversationId,
        readBy: req.user._id,
      });
    }

    res.status(200).json({ success: true, message: "Conversation marked as read." });
  } catch (error) {
    console.error("Mark conversation as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating conversation.",
      error: error.message,
    });
  }
};
