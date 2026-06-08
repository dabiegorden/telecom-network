import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "rejected", "hired"],
      required: true,
    },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, default: "" },
  },
  { _id: false, timestamps: { createdAt: "changedAt", updatedAt: false } },
);

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    coverLetter: {
      type: String,
      maxlength: [3000, "Cover letter cannot exceed 3000 characters"],
      default: "",
    },

    resumeUrl: { type: String, default: null },
    resumePublicId: { type: String, default: null },
    resumeFileName: { type: String, default: null },

    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "rejected", "hired"],
      default: "pending",
    },

    // Full audit trail — each stage change is appended here.
    statusHistory: { type: [statusHistorySchema], default: [] },

    // Internal recruiter/admin notes — not visible to the applicant.
    notes: { type: String, default: "" },

    isExternalJob: { type: Boolean, default: false },

    // Track when the recruiter first viewed this application.
    viewedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    // Prevent a user from applying to the same job twice at the DB level.
    indexes: [{ key: { job: 1, applicant: 1 }, unique: true }],
  },
);

// Fast status-filter queries.
jobApplicationSchema.index({ job: 1, status: 1 });
jobApplicationSchema.index({ applicant: 1, createdAt: -1 });

export default mongoose.model("JobApplication", jobApplicationSchema);
