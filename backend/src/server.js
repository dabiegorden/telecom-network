import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js"; // NEW
import resourceRoutes from "./routes/resourceRoutes.js";
import connectDB from "./config/db.js";

fs.mkdirSync("tmp/uploads", { recursive: true });

const app = express();

app.use(helmet());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res
    .status(200)
    .json({
      success: true,
      message: "Telecom Network API is running 🚀",
      version: "2.0.0",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes); // NEW
app.use("/api/resources", resourceRoutes);

app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);
app.use((err, _req, res, _next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
