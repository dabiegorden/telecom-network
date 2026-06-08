import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    department: { type: String, trim: true, default: null },
    requiredSkills: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // External job fields (RapidAPI sync)
    source: {
      type: String,
      enum: ["internal", "rapidapi"],
      default: "internal",
    },
    externalId: {
      type: String,
      unique: true,
      sparse: true,
    },

    applyUrl: { type: String, default: null },
    salary: { type: String, default: null },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote", "other"],
      default: "other",
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "executive", "any"],
      default: "any",
    },
    employmentType: { type: String, default: null },
    postedDate: { type: Date, default: null },
    deadline: { type: Date, default: null },

    // Engagement
    viewCount: { type: Number, default: 0 },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Application control
    acceptsApplications: { type: Boolean, default: true },
    applicationCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Text index so keyword search spans title, company, description, skills.
jobSchema.index({ title: "text", company: "text", description: "text" });
// Compound indexes for common filter combinations.
jobSchema.index({ isActive: 1, source: 1, createdAt: -1 });
jobSchema.index({ isActive: 1, jobType: 1, createdAt: -1 });
jobSchema.index({ isActive: 1, experienceLevel: 1, createdAt: -1 });

export default mongoose.model("Job", jobSchema);
