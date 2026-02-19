import express from "express";
import multer from "multer";
import path from "path";
import {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
} from "../controllers/resourceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ─── Multer config ────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "tmp/uploads/"),
  filename: (_req, file, cb) =>
    cb(null, `resource-${Date.now()}${path.extname(file.originalname)}`),
});

/**
 * Allowed MIME types:
 *  - Images:       jpeg, jpg, png, gif, webp, svg
 *  - PDFs:         application/pdf
 *  - Word docs:    .doc, .docx
 *  - Excel sheets: .xls, .xlsx
 *  - CSV:          text/csv
 */
const ALLOWED_MIMES = new Set([
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Spreadsheets
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
]);

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIMES.has(file.mimetype)) return cb(null, true);
  cb(
    new Error(
      "Invalid file type. Allowed: images, PDF, Word (.doc/.docx), Excel (.xls/.xlsx), CSV.",
    ),
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public
router.get("/", getAllResources);
router.get("/:id", getResourceById);

// Private — any authenticated user can upload
router.post(
  "/",
  verifyToken,
  upload.single("file"),
  checkRole("admin", "recruiter"),
  createResource,
);
router.put(
  "/:id",
  verifyToken,
  upload.single("file"),
  checkRole("admin", "recruiter"),
  updateResource,
);
router.delete(
  "/:id",
  verifyToken,
  checkRole("admin", "recruiter"),
  deleteResource,
);

export default router;
