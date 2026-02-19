import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Cover letter / message to recruiter
    coverLetter: {
      type: String,
      maxlength: [2000, "Cover letter cannot exceed 2000 characters"],
      default: "",
    },
    // Optional resume URL (Cloudinary or external link)
    resumeUrl: { type: String, default: null },
    resumePublicId: { type: String, default: null },
    resumeFileName: { type: String, default: null },

    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "rejected", "hired"],
      default: "pending",
    },
    // Admin/recruiter notes
    notes: { type: String, default: "" },

    // Track if the application was for an external job (redirect only)
    isExternalJob: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("JobApplication", jobApplicationSchema);
