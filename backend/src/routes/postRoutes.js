import express from "express";
import multer from "multer";
import path from "path";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  togglePostLike,
  togglePinPost,
  addComment,
  getCommentsByPost,
  getReplies,
  toggleCommentLike,
  deleteComment,
  adminGetAllPosts,
} from "../controllers/postController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ─── Multer config ────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "tmp/uploads/"),
  filename: (_req, file, cb) =>
    cb(null, `post-${Date.now()}${path.extname(file.originalname)}`),
});

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
]);

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIMES.has(file.mimetype)) return cb(null, true);
  cb(new Error("Invalid file type. Allowed: images, PDF, Word, Excel, CSV."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// ─── Post routes ──────────────────────────────────────────────────────────────

router.get(
  "/admin/all",
  verifyToken,
  checkRole("admin", "recruiter"),
  adminGetAllPosts,
);

router.get("/", getAllPosts);
router.get("/:id", getPostById);

router.post("/", verifyToken, upload.single("attachment"), createPost);
router.put("/:id", verifyToken, upload.single("attachment"), updatePost);
router.delete("/:id", verifyToken, deletePost);

router.post("/:id/like", verifyToken, togglePostLike);
router.patch(
  "/:id/pin",
  verifyToken,
  checkRole("admin", "recruiter"),
  togglePinPost,
);

// ─── Comment routes ───────────────────────────────────────────────────────────

router.get("/:id/comments", getCommentsByPost);
router.post(
  "/:id/comments",
  verifyToken,
  upload.single("attachment"),
  addComment,
);

router.get("/:id/comments/:commentId/replies", getReplies);
router.post(
  "/:postId/comments/:commentId/like",
  verifyToken,
  toggleCommentLike,
);
router.delete("/:postId/comments/:commentId", verifyToken, deleteComment);

export default router;
