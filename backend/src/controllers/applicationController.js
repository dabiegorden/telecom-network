import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";

const cleanupFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (_) {}
  }
};

/** POST /api/applications/:jobId
 *  User applies to a job. Optionally uploads resume PDF.
 */
import mongoose from "mongoose";

export const applyToJob = async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const { jobId } = req.params;
    const applicantId = req.user._id;

    let job;

    // ✅ Validate ObjectId first
    if (mongoose.Types.ObjectId.isValid(jobId)) {
      job = await Job.findById(jobId);
    } else {
      // Optional: allow applying via externalId
      job = await Job.findOne({ externalId: jobId });
    }

    if (!job || !job.isActive) {
      cleanupFile(req.file?.path);
      return res.status(404).json({
        success: false,
        message: "Job not found or no longer active.",
      });
    }

    if (!job.acceptsApplications) {
      cleanupFile(req.file?.path);
      return res.status(400).json({
        success: false,
        message: "This job is not accepting applications.",
      });
    }

    // ✅ Check duplicate application
    const existing = await JobApplication.findOne({
      job: job._id,
      applicant: applicantId,
    });

    if (existing) {
      cleanupFile(req.file?.path);
      return res.status(409).json({
        success: false,
        message: "You have already applied to this job.",
      });
    }

    const appData = {
      job: job._id,
      applicant: applicantId,
      coverLetter: coverLetter || "",
      isExternalJob: job.source === "rapidapi",
    };

    // ✅ Optional resume upload
    if (req.file) {
      try {
        const result = await uploadToCloudinary(
          req.file.path,
          "telecom-network/resumes",
          {
            resource_type: "raw",
          },
        );

        appData.resumeUrl = result.url;
        appData.resumePublicId = result.publicId;
        appData.resumeFileName = req.file.originalname;

        cleanupFile(req.file.path);
      } catch (err) {
        cleanupFile(req.file.path);
        console.error("Resume upload error:", err);
      }
    }

    const application = await JobApplication.create(appData);

    // ✅ Increment application count safely
    await Job.findByIdAndUpdate(job._id, {
      $inc: { applicationCount: 1 },
    });

    await application.populate("applicant", "name email profileImage");
    await application.populate("job", "title company location");

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      data: application,
    });
  } catch (error) {
    cleanupFile(req.file?.path);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this job.",
      });
    }

    console.error("Apply to job error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error submitting application.",
      error: error.message,
    });
  }
};

/** GET /api/applications/my — Logged-in user's own applications */
export const getMyApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { applicant: req.user._id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
      JobApplication.find(filter)
        .populate(
          "job",
          "title company location imageUrl applyUrl source jobType salary",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JobApplication.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: applications,
    });
  } catch (error) {
    console.error("Get my applications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

/** GET /api/applications/all — Admin: see all applications */
export const getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, jobId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (jobId) filter.job = jobId;

    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
      JobApplication.find(filter)
        .populate("applicant", "name email profileImage")
        .populate("job", "title company location source")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JobApplication.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: applications,
    });
  } catch (error) {
    console.error("Get all applications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

/** PATCH /api/applications/:id/status — Admin/recruiter updates status */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = [
      "pending",
      "reviewing",
      "shortlisted",
      "rejected",
      "hired",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const application = await JobApplication.findById(req.params.id).populate(
      "job",
      "postedBy title",
    );

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    // Only the job poster or admin can update status
    if (
      application.job.postedBy?.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    application.status = status;
    if (notes !== undefined) application.notes = notes;
    await application.save();

    await application.populate("applicant", "name email profileImage");

    res.status(200).json({
      success: true,
      message: "Application status updated.",
      data: application,
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

/** DELETE /api/applications/:id — User withdraws their application */
export const withdrawApplication = async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    if (application.resumePublicId) {
      try {
        await deleteFromCloudinary(application.resumePublicId, "raw");
      } catch (_) {}
    }

    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicationCount: -1 },
    });
    await application.deleteOne();

    res.status(200).json({ success: true, message: "Application withdrawn." });
  } catch (error) {
    console.error("Withdraw application error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};
