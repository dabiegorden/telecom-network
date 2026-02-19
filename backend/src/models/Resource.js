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
    // Cloudinary public_id — required for deletion
    filePublicId: {
      type: String,
      default: null,
    },
    // Original filename shown in the UI
    fileName: {
      type: String,
      default: null,
    },
    // Category used to render the right icon / badge
    fileType: {
      type: String,
      enum: ["image", "pdf", "document", "spreadsheet", "other"],
      default: "other",
    },
    // Raw MIME string, e.g. "application/pdf"
    mimeType: {
      type: String,
      default: null,
    },
    // File size in bytes
    fileSize: {
      type: Number,
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

resourceSchema.index({ uploadedBy: 1, createdAt: -1 });
resourceSchema.index({ fileType: 1 });

const Resource = mongoose.model("Resource", resourceSchema);
export default Resource;
