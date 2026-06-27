import express from "express";
import {
  getCurrentUser,
  updateCurrentUser,
  getUserById,
  getAllUsers,
  deleteUser,
  getAllProfessionals,
  getAllRecruiters,
  updateUserByAdmin,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

import multer from "multer";

// In-memory storage → buffers streamed to Cloudinary (serverless-safe).
const storage = multer.memoryStorage();

const upload = multer({ storage });

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
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  updateCurrentUser,
);

// @route   GET /api/users/professionals
// @desc    Get all professionals (Admin only)
// @access  Private/Admin
router.get(
  "/professionals",
  verifyToken,
  checkRole("admin", "recruiter"),

  getAllProfessionals,
);

// @route   GET /api/users/recruiters
// @desc    Get all recruiters (Admin only)
// @access  Private/Admin
router.get("/recruiters", verifyToken, checkRole("admin"), getAllRecruiters);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get("/", verifyToken, checkRole("admin"), getAllUsers);

// @route   PUT /api/users/:id
// @desc    Update user by admin (Admin only)
// @access  Private/Admin
router.put("/:id", verifyToken, checkRole("admin"), updateUserByAdmin);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete("/:id", verifyToken, checkRole("admin"), deleteUser);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get("/:id", getUserById);

export default router;
