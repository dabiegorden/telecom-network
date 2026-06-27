import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import { createServer } from "http";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

import connectDB from "./config/db.js";
import { initSocket } from "./socket.js";

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

// Create temporary upload directory
const uploadDir = "/tmp/uploads";
fs.mkdirSync(uploadDir, { recursive: true });

// =======================
// Middlewares
// =======================

app.use(helmet());

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// Database Connection
// =======================

connectDB();

// =======================
// Health Check
// =======================

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Telecom Network API is running 🚀",
    version: "2.0.0",
  });
});

// =======================
// API Routes
// =======================

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use("/resources", resourceRoutes);
app.use("/notifications", notificationRoutes);
app.use("/connections", connectionRoutes);
app.use("/messages", messageRoutes);
app.use("/analytics", analyticsRoutes);

// =======================
// 404 Handler
// =======================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =======================
// Global Error Handler
// =======================

app.use((err, _req, res, _next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// =======================
// Start Server
// =======================

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Required for Vercel
export default app;
