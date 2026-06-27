import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

let io = null;

// Maps userId (string) -> socketId
const onlineUsers = new Map();

export const getIO = () => io;

export const getOnlineUsers = () => onlineUsers;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", process.env.FRONTEND_URL],
      credentials: true,
    },
  });

  // Authenticate every socket connection with the same JWT used for REST
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication required."));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found."));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid or expired token."));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    // Let everyone know this user just came online
    socket.broadcast.emit("user_online", { userId });

    // Send the newly connected user the current online list
    socket.emit("online_users", { userIds: Array.from(onlineUsers.keys()) });

    // Real-time message delivery (persists via the same flow as the REST endpoint)
    socket.on("send_message", async ({ conversationId, recipientId, content }) => {
      try {
        if (!content || !content.trim()) return;

        // Lazy import avoids a circular dependency with messageController
        const { findOrCreateConversation, createAndDeliverMessage } = await import(
          "./controllers/messageController.js"
        );

        const conversation = conversationId
          ? { _id: conversationId }
          : await findOrCreateConversation(socket.user._id, recipientId);

        const message = await createAndDeliverMessage({
          conversationId: conversation._id,
          senderId: socket.user._id,
          recipientId,
          content: content.trim(),
        });

        // Echo back to the sender (other tabs / confirmation)
        socket.emit("message_sent", message);
      } catch (error) {
        socket.emit("message_error", { message: "Failed to send message." });
      }
    });

    // Typing indicators
    socket.on("typing", ({ recipientId, conversationId }) => {
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("user_typing", {
          conversationId,
          userId,
        });
      }
    });

    socket.on("stop_typing", ({ recipientId, conversationId }) => {
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("user_stop_typing", {
          conversationId,
          userId,
        });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit("user_offline", { userId });
    });
  });

  return io;
};
