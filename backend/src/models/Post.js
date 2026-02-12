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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
