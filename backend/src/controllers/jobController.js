import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
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
    try {
      fs.unlinkSync(filePath);
    } catch (_) {}
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
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : raw || [];

// ─── Internal Job CRUD ────────────────────────────────────────────────────────

/** POST /api/jobs — Create job (recruiter/admin) */
export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      location,
      requiredSkills,
      jobType,
      salary,
      applyUrl,
    } = req.body;

    if (!title || !company || !description || !location) {
      cleanupFile(req.file?.path);
      return res.status(400).json({
        success: false,
        message: "Please provide title, company, description, and location.",
      });
    }

    const jobData = {
      title,
      company,
      description,
      location,
      requiredSkills: parseSkills(requiredSkills),
      jobType: jobType || "other",
      salary: salary || null,
      applyUrl: applyUrl || null,
      postedBy: req.user._id,
      source: "internal",
      acceptsApplications: true,
    };

    if (req.file) {
      const img = await handleImageUpload(req.file, "telecom-network/jobs");
      if (img) {
        jobData.imageUrl = img.imageUrl;
        jobData.imagePublicId = img.imagePublicId;
      }
    }

    const job = await Job.create(jobData);
    await job.populate("postedBy", "name email profileImage");

    res
      .status(201)
      .json({ success: true, message: "Job posted successfully.", data: job });
  } catch (error) {
    cleanupFile(req.file?.path);
    console.error("Create job error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating job.",
      error: error.message,
    });
  }
};

/** GET /api/jobs — List all jobs with pagination */
export const getAllJobs = async (req, res) => {
  try {
    const { location, source, page = 1, limit = 10, search } = req.query;
    const query = { isActive: true };

    if (location) query.location = new RegExp(location, "i");
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { company: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("postedBy", "name email profileImage company")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: jobs,
    });
  } catch (error) {
    console.error("Get all jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching jobs.",
      error: error.message,
    });
  }
};

/** GET /api/jobs/:id — Single job with application count */
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "name email profileImage company",
    );
    if (!job)
      return res
        .status(404)
        .json({ success: false, message: "Job not found." });

    // Include applicant count for admin/recruiter
    const applicationCount = await JobApplication.countDocuments({
      job: job._id,
    });

    res
      .status(200)
      .json({ success: true, data: { ...job.toObject(), applicationCount } });
  } catch (error) {
    console.error("Get job by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching job.",
      error: error.message,
    });
  }
};

/** PUT /api/jobs/:id — Update job */
export const updateJob = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      location,
      requiredSkills,
      jobType,
      salary,
      applyUrl,
      acceptsApplications,
    } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      cleanupFile(req.file?.path);
      return res
        .status(404)
        .json({ success: false, message: "Job not found." });
    }

    if (
      job.postedBy?.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      job.postedBy?.toString() !== req.user._id.toString() &&
      req.user.role !== "recruiter"
    ) {
      cleanupFile(req.file?.path);
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this job.",
      });
    }

    if (title) job.title = title;
    if (company) job.company = company;
    if (description) job.description = description;
    if (location) job.location = location;
    if (jobType) job.jobType = jobType;
    if (salary !== undefined) job.salary = salary;
    if (applyUrl !== undefined) job.applyUrl = applyUrl;
    if (acceptsApplications !== undefined)
      job.acceptsApplications =
        acceptsApplications === "true" || acceptsApplications === true;
    if (requiredSkills !== undefined)
      job.requiredSkills = parseSkills(requiredSkills);

    if (req.file) {
      if (job.imagePublicId) {
        try {
          await deleteFromCloudinary(job.imagePublicId);
        } catch (e) {
          console.error(e);
        }
      }
      const img = await handleImageUpload(req.file, "telecom-network/jobs");
      if (img) {
        job.imageUrl = img.imageUrl;
        job.imagePublicId = img.imagePublicId;
      }
    }

    await job.save();
    await job.populate("postedBy", "name email profileImage");

    res
      .status(200)
      .json({ success: true, message: "Job updated successfully.", data: job });
  } catch (error) {
    cleanupFile(req.file?.path);
    console.error("Update job error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating job.",
      error: error.message,
    });
  }
};

/** DELETE /api/jobs/:id */
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job)
      return res
        .status(404)
        .json({ success: false, message: "Job not found." });

    if (
      job.postedBy?.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      job.postedBy?.toString() !== req.user._id.toString() &&
      req.user.role !== "recruiter"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this job.",
      });
    }

    if (job.imagePublicId) {
      try {
        await deleteFromCloudinary(job.imagePublicId);
      } catch (e) {
        console.error(e);
      }
    }

    // Also remove all applications for this job
    await JobApplication.deleteMany({ job: job._id });
    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job and related applications deleted.",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting job.",
      error: error.message,
    });
  }
};

// ─── RapidAPI Sync ────────────────────────────────────────────────────────────

/**
 * POST /api/jobs/sync-external
 * Fetches jobs from RapidAPI Indeed endpoint and upserts them into the DB.
 * Query params: query, location, countryCode (all optional, have defaults)
 */
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
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
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

    // RapidAPI v2 returns { jobs: [...] }
    const rawJobs = data?.jobs || data?.data || [];

    if (!rawJobs.length) {
      return res.status(200).json({
        success: true,
        message: "No jobs returned from API.",
        synced: 0,
      });
    }

    let synced = 0;
    let skipped = 0;

    for (const raw of rawJobs) {
      // Build a stable unique ID from the external source
      const externalId = raw.id || raw.jobId || raw.jobkey || null;
      if (!externalId) {
        skipped++;
        continue;
      }

      const jobDoc = {
        title: raw.title || raw.jobTitle || "Untitled",
        company: raw.company || raw.companyName || "Unknown Company",
        description:
          raw.description ||
          raw.snippet ||
          raw.jobDescription ||
          "No description provided.",
        location: raw.location || raw.jobLocation || location,
        applyUrl: raw.applyUrl || raw.jobUrl || raw.url || null,
        salary: raw.salary || raw.salaryRange || null,
        employmentType: raw.employmentType || raw.jobType || null,
        jobType: normalizeJobType(raw.employmentType || raw.jobType),
        requiredSkills: extractSkills(raw),
        postedDate: raw.postedAt ? new Date(raw.postedAt) : null,
        source: "rapidapi",
        externalId,
        acceptsApplications: true, // users can apply via in-app form
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
      synced,
      skipped,
      total: rawJobs.length,
    });
  } catch (error) {
    console.error("Sync external jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error syncing jobs.",
      error: error.message,
    });
  }
};

/** GET /api/jobs/external/preview
 *  Fetch from RapidAPI and return raw results WITHOUT saving (for preview)
 */
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
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    const data = await response.json();
    const jobs = data?.jobs || data?.data || [];

    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    console.error("Preview external jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching external jobs.",
      error: error.message,
    });
  }
};

// ─── Admin: View Applications per Job ────────────────────────────────────────

/** GET /api/jobs/:id/applications — Admin/recruiter sees all applicants */
export const getJobApplications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const job = await Job.findById(req.params.id);
    if (!job)
      return res
        .status(404)
        .json({ success: false, message: "Job not found." });

    // Only the poster or admin can view applications
    if (
      job.postedBy?.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    const filter = { job: job._id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
      JobApplication.find(filter)
        .populate("applicant", "name email profileImage headline")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JobApplication.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      job: { _id: job._id, title: job.title, company: job.company },
      count: applications.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: applications,
    });
  } catch (error) {
    console.error("Get job applications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function extractSkills(raw) {
  // Some APIs return skills array, others embed them in description
  if (Array.isArray(raw.skills)) return raw.skills.slice(0, 10);
  if (Array.isArray(raw.requiredSkills)) return raw.requiredSkills.slice(0, 10);
  return [];
}
