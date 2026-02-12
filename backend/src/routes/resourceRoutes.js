import express from "express";
import multer from "multer";
import {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
} from "../controllers/resourceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// @route   POST /api/resources
// @desc    Upload a new resource
// @access  Private
router.post("/", verifyToken, upload.single("file"), createResource);

// @route   GET /api/resources
// @desc    Get all resources
// @access  Public
router.get("/", getAllResources);

// @route   GET /api/resources/:id
// @desc    Get single resource by ID
// @access  Public
router.get("/:id", getResourceById);

// @route   PUT /api/resources/:id
// @desc    Update resource
// @access  Private
router.put("/:id", verifyToken, upload.single("file"), updateResource);

// @route   DELETE /api/resources/:id
// @desc    Delete resource
// @access  Private
router.delete("/:id", verifyToken, deleteResource);

export default router;
