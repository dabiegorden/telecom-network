import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    requiredSkills: { type: [String], default: [] },
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
      enum: [
        "full-time",
        "part-time",
        "contract",
        "internship",
        "remote",
        "other",
      ],
      default: "other",
    },
    employmentType: { type: String, default: null },
    postedDate: { type: Date, default: null },

    // Application control
    acceptsApplications: { type: Boolean, default: true },
    applicationCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Job", jobSchema);
