import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Recruiter or Admin)
router.post("/", verifyToken, checkRole("recruiter", "admin"), createJob);

// @route   GET /api/jobs
// @desc    Get all jobs
// @access  Public
router.get("/", getAllJobs);

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
router.get("/:id", getJobById);

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private
router.put("/:id", verifyToken, updateJob);

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private
router.delete("/:id", verifyToken, deleteJob);

export default router;
