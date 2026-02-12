import Resource from "../models/Resource.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

/**
 * @desc    Upload a new resource
 * @route   POST /api/resources
 * @access  Private
 */
export const createResource = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide title and description.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file.",
      });
    }

    // Upload file to Cloudinary
    const result = uploadToCloudinary(
      req.file.path,
      "telecom-network/resources",
    );

    const resource = await Resource.create({
      title,
      description,
      fileUrl: result.url,
      uploadedBy: req.user._id,
    });

    // Populate uploaded by details
    await resource.populate("uploadedBy", "name email profileImage");

    res.status(201).json({
      success: true,
      message: "Resource uploaded successfully.",
      data: resource,
    });
  } catch (error) {
    console.error("Create resource error:", error);
    res.status(500).json({
      success: false,
      message: "Server error uploading resource.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all resources
 * @route   GET /api/resources
 * @access  Public
 */
export const getAllResources = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const resources = await Resource.find()
      .populate("uploadedBy", "name email profileImage specialization")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments();

    res.status(200).json({
      success: true,
      count: resources.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: resources,
    });
  } catch (error) {
    console.error("Get all resources error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching resources.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single resource by ID
 * @route   GET /api/resources/:id
 * @access  Public
 */
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "uploadedBy",
      "name email profileImage specialization",
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    console.error("Get resource by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching resource.",
      error: error.message,
    });
  }
};

/**
 * @desc    Update resource
 * @route   PUT /api/resources/:id
 * @access  Private
 */
export const updateResource = async (req, res) => {
  try {
    const { title, description } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    // Check if user is the uploader or admin
    if (
      resource.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this resource.",
      });
    }

    // Update fields
    if (title) resource.title = title;
    if (description) resource.description = description;

    // Update file if new file is uploaded
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.path,
        "telecom-network/resources",
      );
      resource.fileUrl = result.url;
    }

    await resource.save();

    // Populate uploaded by details
    await resource.populate("uploadedBy", "name email profileImage");

    res.status(200).json({
      success: true,
      message: "Resource updated successfully.",
      data: resource,
    });
  } catch (error) {
    console.error("Update resource error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating resource.",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete resource
 * @route   DELETE /api/resources/:id
 * @access  Private
 */
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    // Check if user is the uploader or admin
    if (
      resource.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this resource.",
      });
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully.",
    });
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting resource.",
      error: error.message,
    });
  }
};
