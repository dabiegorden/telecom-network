import Job from "../models/Job.js";

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private (Recruiter or Admin)
 */
export const createJob = async (req, res) => {
  try {
    const { title, company, description, location, requiredSkills } = req.body;

    // Validate required fields
    if (!title || !company || !description || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, company, description, and location.",
      });
    }

    const job = await Job.create({
      title,
      company,
      description,
      location,
      requiredSkills,
      postedBy: req.user._id,
    });

    // Populate posted by details
    await job.populate("postedBy", "name email profileImage");

    res.status(201).json({
      success: true,
      message: "Job posted successfully.",
      data: job,
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating job.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all jobs
 * @route   GET /api/jobs
 * @access  Public
 */
export const getAllJobs = async (req, res) => {
  try {
    const { location, page = 1, limit = 10 } = req.query;

    // Build query
    const query = location ? { location: new RegExp(location, "i") } : {};

    // Calculate pagination
    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .populate("postedBy", "name email profileImage company")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

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

/**
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "name email profileImage company",
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Get job by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching job.",
      error: error.message,
    });
  }
};

/**
 * @desc    Update job
 * @route   PUT /api/jobs/:id
 * @access  Private
 */
export const updateJob = async (req, res) => {
  try {
    const { title, company, description, location, requiredSkills } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    // Check if user is the poster or admin
    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this job.",
      });
    }

    // Update fields
    if (title) job.title = title;
    if (company) job.company = company;
    if (description) job.description = description;
    if (location) job.location = location;
    if (requiredSkills) job.requiredSkills = requiredSkills;

    await job.save();

    // Populate posted by details
    await job.populate("postedBy", "name email profileImage");

    res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      data: job,
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating job.",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete job
 * @route   DELETE /api/jobs/:id
 * @access  Private
 */
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    // Check if user is the poster or admin
    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this job.",
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
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
