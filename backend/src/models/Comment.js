import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },

    // ─── Attachment on comment/reply ───────────────────────────────────
    attachmentUrl: { type: String, default: null },
    attachmentPublicId: { type: String, default: null },
    attachmentName: { type: String, default: null },
    attachmentType: {
      type: String,
      enum: ["image", "pdf", "document", "spreadsheet", "other", null],
      default: null,
    },
    attachmentMime: { type: String, default: null },
    attachmentSize: { type: Number, default: null },

    // ─── Threading — null means top-level comment, ObjectId means reply ──
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    replyCount: { type: Number, default: 0 },

    // ─── Likes ─────────────────────────────────────────────────────────
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likeCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

commentSchema.index({ post: 1, parentComment: 1, createdAt: 1 });
commentSchema.index({ user: 1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
