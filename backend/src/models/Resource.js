import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Resource description is required"],
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    uploadedBy: {
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
resourceSchema.index({ uploadedBy: 1, createdAt: -1 });

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
