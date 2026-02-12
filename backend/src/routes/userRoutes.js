import express from "express";
import multer from "multer";
import {
  getCurrentUser,
  updateCurrentUser,
  getUserById,
  getAllUsers,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get("/me", verifyToken, getCurrentUser);

// @route   PUT /api/users/me
// @desc    Update current user profile
// @access  Private
router.put(
  "/me",
  verifyToken,
  upload.single("profileImage"),
  updateCurrentUser,
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get("/:id", getUserById);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get("/", verifyToken, checkRole("admin"), getAllUsers);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete("/:id", verifyToken, checkRole("admin"), deleteUser);

export default router;
