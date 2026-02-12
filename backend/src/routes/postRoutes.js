import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  getCommentsByPost,
  deleteComment,
} from "../controllers/postController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post("/", verifyToken, createPost);

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get("/", getAllPosts);

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get("/:id", getPostById);

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private
router.put("/:id", verifyToken, updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private
router.delete("/:id", verifyToken, deletePost);

// @route   POST /api/posts/:id/comments
// @desc    Add comment to post
// @access  Private
router.post("/:id/comments", verifyToken, addComment);

// @route   GET /api/posts/:id/comments
// @desc    Get comments for a post
// @access  Public
router.get("/:id/comments", getCommentsByPost);

// @route   DELETE /api/posts/:postId/comments/:commentId
// @desc    Delete comment
// @access  Private
router.delete("/:postId/comments/:commentId", verifyToken, deleteComment);

export default router;
