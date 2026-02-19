import express from "express";
import multer from "multer";
import path from "path";
import {
  applyToJob,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  withdrawApplication,
} from "../controllers/applicationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Resume upload (PDF, DOC, DOCX up to 5MB)
const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "tmp/uploads/"),
  filename: (_req, file, cb) =>
    cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`),
});

const resumeFilter = (_req, file, cb) => {
  const allowed = /pdf|doc|docx/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) return cb(null, true);
  cb(new Error("Only PDF, DOC, DOCX files allowed for resume"));
};

const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// User routes
router.post("/:jobId", verifyToken, uploadResume.single("resume"), applyToJob);
router.get("/my/all", verifyToken, getMyApplications);
router.delete("/:id/withdraw", verifyToken, withdrawApplication);

// Admin routes
router.get("/admin/all", verifyToken, checkRole("admin"), getAllApplications);
router.patch("/:id/status", verifyToken, updateApplicationStatus);

export default router;
