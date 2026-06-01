import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";

import connectDB from "./config/db.js";

const app = express();

// Create temporary upload directory
const uploadDir = path.join(process.cwd(), "tmp/uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// =======================
// Middlewares
// =======================

app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL],
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

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/resources", resourceRoutes);

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Required for Vercel
export default app;
