import express from "express";
import multer from "multer";
import path from "path";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  syncExternalJobs,
  previewExternalJobs,
  getJobApplications,
} from "../controllers/jobController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "tmp/uploads/"),
  filename: (_req, file, cb) =>
    cb(null, `job-${Date.now()}${path.extname(file.originalname)}`),
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error("Only image files are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Public
router.get("/", getAllJobs);
router.get("/external/preview", previewExternalJobs); // preview RapidAPI results
router.get("/:id", getJobById);

// Recruiter / Admin only
router.post(
  "/",
  verifyToken,
  checkRole("recruiter", "admin"),
  upload.single("image"),
  createJob,
);
router.post(
  "/sync-external",
  verifyToken,
  checkRole("admin", "recruiter"),
  syncExternalJobs,
); // sync to DB
router.put(
  "/:id",
  verifyToken,
  checkRole("recruiter", "admin"),
  upload.single("image"),
  updateJob,
);
router.delete("/:id", verifyToken, checkRole("recruiter", "admin"), deleteJob);

// Applications for a specific job (admin/recruiter)
router.get("/:id/applications", verifyToken, getJobApplications);

export default router;
