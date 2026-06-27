import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import {
  findOrCreateConversation,
  createAndDeliverMessage,
} from "./messageController.js";
// In-memory storage leaves no temp file to clean up. No-op kept for call sites.
const cleanupFile = () => {};

// Friendly, candidate-facing copy for each stage of the pipeline.
const STATUS_MESSAGES = {
  pending: {
    title: "Application received",
    summary: (job) =>
      `Your application for "${job.title}" at ${job.company} has been received and is awaiting review.`,
    chat: (job) =>
      `Hi! Thanks for applying to "${job.title}" at ${job.company}. Your application has been received and is currently pending review. We'll keep you posted on your progress.`,
  },
  reviewing: {
    title: "Your application is being reviewed",
    summary: (job) =>
      `Good news — your application for "${job.title}" at ${job.company} is now being reviewed by the hiring team.`,
    chat: (job) =>
      `Update on your application for "${job.title}" at ${job.company}: the hiring team has started reviewing your profile. We'll let you know the outcome soon.`,
  },
  shortlisted: {
    title: "You've been shortlisted!",
    summary: (job) =>
      `Congratulations! You've been shortlisted for "${job.title}" at ${job.company}. The hiring team may reach out to schedule next steps.`,
    chat: (job) =>
      `Great news! You've been shortlisted for "${job.title}" at ${job.company}. The hiring team will be reaching out soon to discuss next steps — keep an eye on your messages and email.`,
  },
  rejected: {
    title: "Update on your application",
    summary: (job) =>
      `Thank you for applying for "${job.title}" at ${job.company}. After careful consideration, the hiring team has decided not to move forward with your application at this time.`,
    chat: (job) =>
      `Thank you for taking the time to apply for "${job.title}" at ${job.company}. After careful review, we've decided not to move forward with your application for this role. We genuinely appreciate your interest and encourage you to apply for future openings that match your skills.`,
  },
  hired: {
    title: "Congratulations — you got the job!",
    summary: (job) =>
      `Congratulations! You've been selected for "${job.title}" at ${job.company}. The hiring team will contact you with onboarding details.`,
    chat: (job) =>
      `Congratulations! 🎉 You've been selected for the "${job.title}" position at ${job.company}. Welcome aboard — the hiring team will be in touch shortly with offer and onboarding details.`,
  },
};

/**
 * Notify a candidate about their application status via both an in-app
 * notification and a direct chat message from the hiring contact, so they
 * always know exactly where they stand (mirrors how LinkedIn/Indeed keep
 * applicants informed about progress).
 */
const notifyApplicant = async ({ application, job, status, actorId }) => {
  const copy = STATUS_MESSAGES[status];
  if (!copy) return;

  try {
    await Notification.create({
      user: application.applicant,
      type: "application_status",
      title: copy.title,
      message: copy.summary(job),
      link: `/professional-dashboard/jobs?tab=applications`,
    });
  } catch (err) {
    console.error("Failed to create application status notification:", err);
  }

  // Send a direct message from the hiring contact (job poster, or the acting
  // admin/recruiter for external/unowned jobs) so the applicant can reply
  // and ask follow-up questions about their progress.
  try {
    const senderId = job.postedBy || actorId;
    if (senderId && senderId.toString() !== application.applicant.toString()) {
      const conversation = await findOrCreateConversation(
        senderId,
        application.applicant,
      );
      await createAndDeliverMessage({
        conversationId: conversation._id,
        senderId,
        recipientId: application.applicant,
        content: copy.chat(job),
      });
    }
  } catch (err) {
    console.error("Failed to send application status message:", err);
  }
};

/**
 * Let the hiring contact (job poster, falling back to admins for external
 * jobs) know a new candidate has applied — keeps recruiters in the loop in
 * real time, just like LinkedIn's "New applicant" alerts.
 */
const notifyNewApplicant = async ({ application, job, applicant }) => {
  try {
    let recipients = [];

    if (job.postedBy) {
      recipients = [job.postedBy];
    } else {
      // External/unowned jobs: alert admins so someone follows up.
      const admins = await User.find({ role: "admin" }).select("_id");
      recipients = admins.map((a) => a._id);
    }

    await Promise.all(
      recipients.map((recipientId) =>
        Notification.create({
          user: recipientId,
          type: "job_application",
          title: "New job application",
          message: `${applicant.name} applied for "${job.title}" at ${job.company}.`,
          link: `/recruiter-dashboard/jobs?jobId=${job._id}&tab=applications`,
        }),
      ),
    );
  } catch (err) {
    console.error("Failed to notify recruiter of new application:", err);
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
          req.file.buffer,
          "telecom-network/resumes",
          {
            resource_type: "raw",
          },
        );

        appData.resumeUrl = result.url;
        appData.resumePublicId = result.publicId;
        appData.resumeFileName = req.file.originalname;
      } catch (err) {
        console.error("Resume upload error:", err);
      }
    }

    appData.statusHistory = [{ status: "pending", changedBy: null, note: "" }];
    const application = await JobApplication.create(appData);

    // Increment application count safely
    await Job.findByIdAndUpdate(job._id, {
      $inc: { applicationCount: 1 },
    });

    await application.populate("applicant", "name email profileImage");
    await application.populate("job", "title company location");

    // Notify the recruiter/poster that a new candidate applied.
    await notifyNewApplicant({
      application,
      job,
      applicant: application.applicant,
    });

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

    const previousStatus = application.status;
    application.status = status;
    if (notes !== undefined) application.notes = notes;

    // Append to history so both sides can see the full progression.
    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: notes || "",
    });

    // Mark as viewed the first time a recruiter opens/touches an application.
    if (!application.viewedAt) application.viewedAt = new Date();

    await application.save();

    await application.populate("applicant", "name email profileImage");

    // Notify the applicant (notification + direct message) whenever the
    // status changes — this is the core "keep me posted" flow.
    if (previousStatus !== status) {
      await notifyApplicant({
        application,
        job: application.job,
        status,
        actorId: req.user._id,
      });
    }

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

/**
 * PATCH /api/applications/:id/viewed
 * Recruiter marks an application as viewed — shows "Viewed" badge to the
 * applicant (same as LinkedIn's "Application viewed" milestone).
 */
export const markApplicationViewed = async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { $set: { viewedAt: new Date() } },
      { new: true },
    );

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("Mark viewed error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};
