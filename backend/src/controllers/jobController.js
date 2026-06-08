import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";

const RAPIDAPI_KEY =
  process.env.RAPIDAPI_KEY ||
  "26c573e268mshc969a50d4a14acfp1ad9e3jsn4f032149e9e3";
const RAPIDAPI_HOST = "jobs-api14.p.rapidapi.com";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const cleanupFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (_) {}
  }
};

const handleImageUpload = async (file, folder) => {
  try {
    const result = await uploadToCloudinary(file.path, folder);
    cleanupFile(file.path);
    return { imageUrl: result.url, imagePublicId: result.publicId };
  } catch (err) {
    cleanupFile(file.path);
    console.error("Image upload error:", err);
    return null;
  }
};

const parseSkills = (raw) =>
  typeof raw === "string"
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : Array.isArray(raw) ? raw : [];

function normalizeJobType(raw) {
  if (!raw) return "other";
  const lower = raw.toLowerCase();
  if (lower.includes("full")) return "full-time";
  if (lower.includes("part")) return "part-time";
  if (lower.includes("contract")) return "contract";
  if (lower.includes("intern")) return "internship";
  if (lower.includes("remote")) return "remote";
  return "other";
}

function normalizeExperienceLevel(raw) {
  if (!raw) return "any";
  const lower = raw.toLowerCase();
  if (lower.includes("entry") || lower.includes("junior") || lower.includes("grad")) return "entry";
  if (lower.includes("mid") || lower.includes("intermediate")) return "mid";
  if (lower.includes("senior") || lower.includes("lead") || lower.includes("principal")) return "senior";
  if (lower.includes("exec") || lower.includes("director") || lower.includes("vp") || lower.includes("chief")) return "executive";
  return "any";
}

function extractSkills(raw) {
  if (Array.isArray(raw.skills)) return raw.skills.slice(0, 15);
  if (Array.isArray(raw.requiredSkills)) return raw.requiredSkills.slice(0, 15);
  return [];
}

// ─── Internal Job CRUD ────────────────────────────────────────────────────────

/** POST /api/jobs — Create job (recruiter/admin) */
export const createJob = async (req, res) => {
  try {
    const {
      title, company, description, location, department,
      requiredSkills, benefits, jobType, experienceLevel,
      salary, applyUrl, deadline, acceptsApplications,
    } = req.body;

    if (!title || !company || !description || !location) {
      cleanupFile(req.file?.path);
      return res.status(400).json({
        success: false,
        message: "title, company, description, and location are required.",
      });
    }

    const jobData = {
      title: title.trim(),
      company: company.trim(),
      description,
      location: location.trim(),
      department: department?.trim() || null,
      requiredSkills: parseSkills(requiredSkills),
      benefits: parseSkills(benefits),
      jobType: jobType || "other",
      experienceLevel: experienceLevel || "any",
      salary: salary || null,
      applyUrl: applyUrl || null,
      deadline: deadline ? new Date(deadline) : null,
      acceptsApplications: acceptsApplications !== "false" && acceptsApplications !== false,
      postedBy: req.user._id,
      source: "internal",
    };

    if (req.file) {
      const img = await handleImageUpload(req.file, "telecom-network/jobs");
      if (img) Object.assign(jobData, img);
    }

    const job = await Job.create(jobData);
    await job.populate("postedBy", "name email profileImage");

    res.status(201).json({ success: true, message: "Job posted successfully.", data: job });
  } catch (error) {
    cleanupFile(req.file?.path);
    console.error("Create job error:", error);
    res.status(500).json({ success: false, message: "Server error creating job.", error: error.message });
  }
};

/** GET /api/jobs — List jobs with filtering, search, and pagination */
export const getAllJobs = async (req, res) => {
  try {
    const {
      location, source, jobType, experienceLevel,
      page = 1, limit = 10, search,
    } = req.query;

    const query = { isActive: true };

    if (source) query.source = source;
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (location) query.location = new RegExp(location, "i");

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { company: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { requiredSkills: new RegExp(search, "i") },
      ];
    }

    // Automatically deactivate jobs past their deadline (non-blocking).
    Job.updateMany(
      { deadline: { $lt: new Date() }, isActive: true },
      { isActive: false },
    ).catch(() => {});

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("postedBy", "name email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: jobs,
    });
  } catch (error) {
    console.error("Get all jobs error:", error);
    res.status(500).json({ success: false, message: "Server error fetching jobs.", error: error.message });
  }
};

/** GET /api/jobs/:id — Single job; increments view count */
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true },
    ).populate("postedBy", "name email profileImage");

    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    const applicationCount = await JobApplication.countDocuments({ job: job._id });

    res.status(200).json({ success: true, data: { ...job.toObject(), applicationCount } });
  } catch (error) {
    console.error("Get job by ID error:", error);
    res.status(500).json({ success: false, message: "Server error fetching job.", error: error.message });
  }
};

/** PUT /api/jobs/:id — Update job */
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      cleanupFile(req.file?.path);
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    const isOwner = job.postedBy?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin" && req.user.role !== "recruiter") {
      cleanupFile(req.file?.path);
      return res.status(403).json({ success: false, message: "Not authorized to update this job." });
    }

    const fields = [
      "title", "company", "description", "location", "department",
      "jobType", "experienceLevel", "salary", "applyUrl",
    ];
    fields.forEach((f) => { if (req.body[f] !== undefined) job[f] = req.body[f]; });

    if (req.body.requiredSkills !== undefined) job.requiredSkills = parseSkills(req.body.requiredSkills);
    if (req.body.benefits !== undefined) job.benefits = parseSkills(req.body.benefits);
    if (req.body.deadline !== undefined) job.deadline = req.body.deadline ? new Date(req.body.deadline) : null;
    if (req.body.acceptsApplications !== undefined)
      job.acceptsApplications = req.body.acceptsApplications === "true" || req.body.acceptsApplications === true;
    if (req.body.isActive !== undefined)
      job.isActive = req.body.isActive === "true" || req.body.isActive === true;

    if (req.file) {
      if (job.imagePublicId) {
        try { await deleteFromCloudinary(job.imagePublicId); } catch (_) {}
      }
      const img = await handleImageUpload(req.file, "telecom-network/jobs");
      if (img) Object.assign(job, img);
    }

    await job.save();
    await job.populate("postedBy", "name email profileImage");

    res.status(200).json({ success: true, message: "Job updated successfully.", data: job });
  } catch (error) {
    cleanupFile(req.file?.path);
    console.error("Update job error:", error);
    res.status(500).json({ success: false, message: "Server error updating job.", error: error.message });
  }
};

/** DELETE /api/jobs/:id */
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    const isOwner = job.postedBy?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin" && req.user.role !== "recruiter") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this job." });
    }

    if (job.imagePublicId) {
      try { await deleteFromCloudinary(job.imagePublicId); } catch (_) {}
    }

    await JobApplication.deleteMany({ job: job._id });
    await job.deleteOne();

    res.status(200).json({ success: true, message: "Job and related applications deleted." });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ success: false, message: "Server error deleting job.", error: error.message });
  }
};

// ─── Save / Unsave (Bookmark) ─────────────────────────────────────────────────

/** POST /api/jobs/:id/save — Bookmark a job */
export const saveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    const userId = req.user._id;
    const alreadySaved = job.savedBy.some((id) => id.toString() === userId.toString());

    if (alreadySaved) {
      return res.status(200).json({ success: true, saved: true, message: "Already saved." });
    }

    job.savedBy.push(userId);
    await job.save();

    res.status(200).json({ success: true, saved: true, message: "Job saved." });
  } catch (error) {
    console.error("Save job error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

/** DELETE /api/jobs/:id/save — Remove bookmark */
export const unsaveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    job.savedBy = job.savedBy.filter((id) => id.toString() !== req.user._id.toString());
    await job.save();

    res.status(200).json({ success: true, saved: false, message: "Job removed from saved." });
  } catch (error) {
    console.error("Unsave job error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

/** GET /api/jobs/saved — Current user's bookmarked jobs */
export const getSavedJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      Job.find({ savedBy: req.user._id, isActive: true })
        .populate("postedBy", "name email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments({ savedBy: req.user._id, isActive: true }),
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: jobs,
    });
  } catch (error) {
    console.error("Get saved jobs error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─── My Posted Jobs (recruiter view) ─────────────────────────────────────────

/** GET /api/jobs/my-posted — Jobs posted by the current recruiter/admin */
export const getMyPostedJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { postedBy: req.user._id };
    if (status === "active") query.isActive = true;
    if (status === "closed") query.isActive = false;

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: jobs,
    });
  } catch (error) {
    console.error("Get my posted jobs error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─── Admin: View Applications per Job ────────────────────────────────────────

/** GET /api/jobs/:id/applications — Admin/recruiter sees all applicants */
export const getJobApplications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    const isOwner = job.postedBy?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin" && req.user.role !== "recruiter") {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const filter = { job: job._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [applications, total] = await Promise.all([
      JobApplication.find(filter)
        .populate("applicant", "name email profileImage headline location skills")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      JobApplication.countDocuments(filter),
    ]);

    // Per-status breakdown for analytics panel.
    const breakdown = await JobApplication.aggregate([
      { $match: { job: job._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const stats = breakdown.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      job: { _id: job._id, title: job.title, company: job.company },
      stats,
      count: applications.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: applications,
    });
  } catch (error) {
    console.error("Get job applications error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─── RapidAPI External Jobs ───────────────────────────────────────────────────

/** POST /api/jobs/sync-external — Fetch from RapidAPI and upsert into DB */
export const syncExternalJobs = async (req, res) => {
  try {
    const {
      query = "Telecommunications",
      location = "United States",
      countryCode = "us",
      radius = "50",
      sortType = "relevance",
    } = req.query;

    const url = `https://${RAPIDAPI_HOST}/v2/indeed/search?countryCode=${countryCode}&query=${encodeURIComponent(query)}&sortType=${sortType}&location=${encodeURIComponent(location)}&radius=${radius}&radiusType=km`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": RAPIDAPI_HOST },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("RapidAPI error:", errText);
      return res.status(502).json({
        success: false,
        message: `RapidAPI returned ${response.status}`,
        detail: errText,
      });
    }

    const data = await response.json();
    const rawJobs = data?.jobs || data?.data || [];

    if (!rawJobs.length) {
      return res.status(200).json({ success: true, message: "No jobs returned from API.", synced: 0 });
    }

    let synced = 0;
    let skipped = 0;

    for (const raw of rawJobs) {
      const externalId = raw.id || raw.jobId || raw.jobkey || null;
      if (!externalId) { skipped++; continue; }

      const jobDoc = {
        title: raw.title || raw.jobTitle || "Untitled",
        company: raw.company || raw.companyName || "Unknown Company",
        description: raw.description || raw.snippet || raw.jobDescription || "No description provided.",
        location: raw.location || raw.jobLocation || location,
        applyUrl: raw.applyUrl || raw.jobUrl || raw.url || null,
        salary: raw.salary || raw.salaryRange || null,
        employmentType: raw.employmentType || raw.jobType || null,
        jobType: normalizeJobType(raw.employmentType || raw.jobType),
        experienceLevel: normalizeExperienceLevel(raw.experienceLevel || raw.jobLevel),
        requiredSkills: extractSkills(raw),
        postedDate: raw.postedAt ? new Date(raw.postedAt) : null,
        source: "rapidapi",
        externalId,
        acceptsApplications: true,
        isActive: true,
      };

      await Job.findOneAndUpdate(
        { externalId },
        { $set: jobDoc },
        { upsert: true, new: true },
      );
      synced++;
    }

    res.status(200).json({
      success: true,
      message: `Sync complete. ${synced} jobs synced, ${skipped} skipped.`,
      synced, skipped, total: rawJobs.length,
    });
  } catch (error) {
    console.error("Sync external jobs error:", error);
    res.status(500).json({ success: false, message: "Server error syncing jobs.", error: error.message });
  }
};

/** GET /api/jobs/external/preview — Raw RapidAPI results without saving */
export const previewExternalJobs = async (req, res) => {
  try {
    const {
      query = "Telecommunications",
      location = "United States",
      countryCode = "us",
      radius = "50",
    } = req.query;

    const url = `https://${RAPIDAPI_HOST}/v2/indeed/search?countryCode=${countryCode}&query=${encodeURIComponent(query)}&sortType=relevance&location=${encodeURIComponent(location)}&radius=${radius}&radiusType=km`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": RAPIDAPI_HOST },
    });

    const data = await response.json();
    const jobs = data?.jobs || data?.data || [];

    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    console.error("Preview external jobs error:", error);
    res.status(500).json({ success: false, message: "Error fetching external jobs.", error: error.message });
  }
};
