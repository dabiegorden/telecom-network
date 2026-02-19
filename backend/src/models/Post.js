import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Network", "Fiber", "5G", "Certifications", "General"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── Attachments (image or file) ───────────────────────────────────
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

    // ─── Engagement ────────────────────────────────────────────────────
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    // ─── Admin controls ────────────────────────────────────────────────
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ isPinned: -1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);
export default Post;
