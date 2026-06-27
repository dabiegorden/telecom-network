import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
// ─── Helpers ──────────────────────────────────────────────────────────────────

// In-memory storage leaves no temp file to clean up. No-op kept for call sites.
const cleanupFile = () => {};

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

const detectFileType = (mime = "") => {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("word")) return "document";
  if (mime.includes("excel") || mime.includes("sheet") || mime === "text/csv")
    return "spreadsheet";
  return "other";
};

const uploadAttachment = async (file) => {
  const isImage = file.mimetype.startsWith("image/");
  const result = await uploadToCloudinary(file.buffer, "telecom-network/posts", {
    resource_type: isImage ? "image" : "raw",
  });
  return {
    attachmentUrl: result.url,
    attachmentPublicId: result.publicId || result.public_id || null,
    attachmentName: file.originalname,
    attachmentType: detectFileType(file.mimetype),
    attachmentMime: file.mimetype,
    attachmentSize: file.size,
  };
};

const deleteAttachment = async (publicId, fileType) => {
  if (!publicId) return;
  try {
    await deleteFromCloudinary(
      publicId,
      fileType === "image" ? "image" : "raw",
    );
  } catch (e) {
    console.error("Attachment deletion error:", e);
  }
};

// ─── Posts ────────────────────────────────────────────────────────────────────

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      cleanupFile(req.file?.path);
      return res.status(400).json({
        success: false,
        message: "Please provide title, content, and category.",
      });
    }

    if (req.file && !ALLOWED_MIMES.has(req.file.mimetype)) {
      cleanupFile(req.file.path);
      return res
        .status(400)
        .json({ success: false, message: "Invalid file type." });
    }

    const postData = { title, content, category, author: req.user._id };

    if (req.file) {
      const attach = await uploadAttachment(req.file);
      Object.assign(postData, attach);
    }

    const post = await Post.create(postData);
    await post.populate("author", "name email profileImage specialization");

    res.status(201).json({
      success: true,
      message: "Post created successfully.",
      data: post,
    });
  } catch (error) {
    cleanupFile(req.file?.path);
    console.error("Create post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating post.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all posts
 * @route   GET /api/posts
 * @access  Public
 */
export const getAllPosts = async (req, res) => {
  try {
    const {
      category,
      page = 1,
      limit = 20,
      search,
      sort = "newest",
    } = req.query;

    const query = { isActive: true };
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { content: new RegExp(search, "i") },
      ];
    }

    const sortMap = {
      newest: { isPinned: -1, createdAt: -1 },
      oldest: { isPinned: -1, createdAt: 1 },
      popular: { isPinned: -1, likeCount: -1, commentCount: -1 },
    };

    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name email profileImage specialization")
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(parseInt(limit)),
      Post.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: posts,
    });
  } catch (error) {
    console.error("Get all posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching posts.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single post by ID (increments view count)
 * @route   GET /api/posts/:id
 * @access  Public
 */
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true },
    ).populate("author", "name email profileImage specialization");

    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error("Get post by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching post.",
      error: error.message,
    });
  }
};

/**
 * @desc    Update post
 * @route   PUT /api/posts/:id
 * @access  Private
 */
export const updatePost = async (req, res) => {
  try {
    const { title, content, category, removeAttachment } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      cleanupFile(req.file?.path);
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "recruiter"
    ) {
      cleanupFile(req.file?.path);
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;

    // Handle attachment removal
    if (removeAttachment === "true" && post.attachmentPublicId) {
      await deleteAttachment(post.attachmentPublicId, post.attachmentType);
      post.attachmentUrl = null;
      post.attachmentPublicId = null;
      post.attachmentName = null;
      post.attachmentType = null;
      post.attachmentMime = null;
      post.attachmentSize = null;
    }

    // Replace attachment
    if (req.file) {
      if (ALLOWED_MIMES.has(req.file.mimetype)) {
        if (post.attachmentPublicId) {
          await deleteAttachment(post.attachmentPublicId, post.attachmentType);
        }
        const attach = await uploadAttachment(req.file);
        Object.assign(post, attach);
      } else {
        cleanupFile(req.file.path);
        return res
          .status(400)
          .json({ success: false, message: "Invalid file type." });
      }
    }

    await post.save();
    await post.populate("author", "name email profileImage specialization");

    res.status(200).json({
      success: true,
      message: "Post updated successfully.",
      data: post,
    });
  } catch (error) {
    cleanupFile(req.file?.path);
    console.error("Update post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating post.",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "recruiter"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    // Delete post attachment from Cloudinary
    if (post.attachmentPublicId) {
      await deleteAttachment(post.attachmentPublicId, post.attachmentType);
    }

    // Delete all comment attachments from Cloudinary
    const comments = await Comment.find({
      post: post._id,
      attachmentPublicId: { $ne: null },
    });
    for (const c of comments) {
      await deleteAttachment(c.attachmentPublicId, c.attachmentType);
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully." });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting post.",
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle like on post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
export const togglePostLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    const userId = req.user._id;
    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      post.likes.push(userId);
      post.likeCount = post.likeCount + 1;
    }

    await post.save();
    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likeCount: post.likeCount,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

/**
 * @desc    Pin / unpin a post (admin only)
 * @route   PATCH /api/posts/:id/pin
 * @access  Admin
 */
export const togglePinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    post.isPinned = !post.isPinned;
    await post.save();

    res.status(200).json({
      success: true,
      message: post.isPinned ? "Post pinned." : "Post unpinned.",
      isPinned: post.isPinned,
    });
  } catch (error) {
    console.error("Toggle pin error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─── Comments ─────────────────────────────────────────────────────────────────

/**
 * @desc    Add comment (or reply) to post
 * @route   POST /api/posts/:id/comments
 * @access  Private
 */
export const addComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;

    if (!content) {
      cleanupFile(req.file?.path);
      return res
        .status(400)
        .json({ success: false, message: "Please provide comment content." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      cleanupFile(req.file?.path);
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    // Validate parent comment if replying
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent || parent.post.toString() !== post._id.toString()) {
        cleanupFile(req.file?.path);
        return res
          .status(400)
          .json({ success: false, message: "Invalid parent comment." });
      }
    }

    if (req.file && !ALLOWED_MIMES.has(req.file.mimetype)) {
      cleanupFile(req.file.path);
      return res
        .status(400)
        .json({ success: false, message: "Invalid file type." });
    }

    const commentData = {
      post: post._id,
      user: req.user._id,
      content,
      parentComment: parentComment || null,
    };

    if (req.file) {
      const attach = await uploadAttachment(req.file);
      Object.assign(commentData, attach);
    }

    const comment = await Comment.create(commentData);

    // Update counts
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $inc: { replyCount: 1 },
      });
    }
    await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });

    await comment.populate("user", "name email profileImage specialization");

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: comment,
    });
  } catch (error) {
    cleanupFile(req.file?.path);
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error adding comment.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get top-level comments for a post (with reply counts)
 * @route   GET /api/posts/:id/comments
 * @access  Public
 */
export const getCommentsByPost = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ post: req.params.id, parentComment: null, isActive: true })
        .populate("user", "name email profileImage specialization")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Comment.countDocuments({
        post: req.params.id,
        parentComment: null,
        isActive: true,
      }),
    ]);

    res.status(200).json({
      success: true,
      count: comments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching comments.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get replies for a comment
 * @route   GET /api/posts/:id/comments/:commentId/replies
 * @access  Public
 */
export const getReplies = async (req, res) => {
  try {
    const replies = await Comment.find({
      post: req.params.id,
      parentComment: req.params.commentId,
      isActive: true,
    })
      .populate("user", "name email profileImage specialization")
      .sort({ createdAt: 1 });

    res
      .status(200)
      .json({ success: true, count: replies.length, data: replies });
  } catch (error) {
    console.error("Get replies error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching replies.",
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle like on a comment
 * @route   POST /api/posts/:postId/comments/:commentId/like
 * @access  Private
 */
export const toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "Comment not found." });

    const userId = req.user._id;
    const alreadyLiked = comment.likes.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      comment.likes.push(userId);
      comment.likeCount = comment.likeCount + 1;
    }

    await comment.save();
    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likeCount: comment.likeCount,
    });
  } catch (error) {
    console.error("Toggle comment like error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

/**
 * @desc    Delete comment (soft or hard, cascades to replies)
 * @route   DELETE /api/posts/:postId/comments/:commentId
 * @access  Private
 */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "Comment not found." });

    if (
      comment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    // Delete attachment from Cloudinary
    if (comment.attachmentPublicId) {
      await deleteAttachment(
        comment.attachmentPublicId,
        comment.attachmentType,
      );
    }

    // Delete all replies' attachments and the replies themselves
    const replies = await Comment.find({ parentComment: comment._id });
    for (const reply of replies) {
      if (reply.attachmentPublicId) {
        await deleteAttachment(reply.attachmentPublicId, reply.attachmentType);
      }
    }
    const replyCount = replies.length;
    await Comment.deleteMany({ parentComment: comment._id });

    // Decrement post comment count (comment + its replies)
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentCount: -(1 + replyCount) },
    });

    // If it was a reply, decrement parent's replyCount
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $inc: { replyCount: -1 },
      });
    }

    await comment.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting comment.",
      error: error.message,
    });
  }
};

/**
 * @desc    Admin — get all posts including inactive
 * @route   GET /api/posts/admin/all
 * @access  Admin
 */
export const adminGetAllPosts = async (req, res) => {
  try {
    const { category, page = 1, limit = 20, search } = req.query;

    const query = {};
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { content: new RegExp(search, "i") },
      ];
    }

    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name email profileImage specialization")
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Post.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: posts,
    });
  } catch (error) {
    console.error("Admin get all posts error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};
