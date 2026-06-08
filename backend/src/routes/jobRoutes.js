import express from "express";
import multer from "multer";
import path from "path";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  saveJob,
  unsaveJob,
  getSavedJobs,
  getMyPostedJobs,
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
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error("Only image files are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getAllJobs);
router.get("/external/preview", previewExternalJobs);

// ── Authenticated (any role) ──────────────────────────────────────────────────
router.get("/saved", verifyToken, getSavedJobs);
router.get("/:id", getJobById);
router.post("/:id/save", verifyToken, saveJob);
router.delete("/:id/save", verifyToken, unsaveJob);

// ── Recruiter / Admin ─────────────────────────────────────────────────────────
router.get(
  "/my/posted",
  verifyToken,
  checkRole("recruiter", "admin"),
  getMyPostedJobs,
);
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
);
router.put(
  "/:id",
  verifyToken,
  checkRole("recruiter", "admin"),
  upload.single("image"),
  updateJob,
);
router.delete("/:id", verifyToken, checkRole("recruiter", "admin"), deleteJob);

// ── Applications (admin/recruiter + job poster) ───────────────────────────────
router.get("/:id/applications", verifyToken, getJobApplications);

export default router;
