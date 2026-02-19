import Resource from "../models/Resource.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cleanupFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (_) {}
  }
};

/**
 * Detect a friendly fileType category from the raw MIME type.
 */
const detectFileType = (mimeType = "") => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "document";
  if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "text/csv"
  )
    return "spreadsheet";
  return "other";
};

/**
 * Upload a file to Cloudinary.
 * Images → image resource type; everything else → raw.
 */
const uploadResourceFile = async (file) => {
  const isImage = file.mimetype.startsWith("image/");
  const result = await uploadToCloudinary(
    file.path,
    "telecom-network/resources",
    { resource_type: isImage ? "image" : "raw" },
  );
  cleanupFile(file.path);
  return result;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * @desc    Upload a new resource
 * @route   POST /api/resources
 * @access  Private
 */
export const createResource = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      cleanupFile(req.file?.path);
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

    const result = await uploadResourceFile(req.file);

    const resource = await Resource.create({
      title,
      description,
      fileUrl: result.url,
      filePublicId: result.publicId || result.public_id || null,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileType: detectFileType(req.file.mimetype),
      fileSize: req.file.size,
      uploadedBy: req.user._id,
    });

    await resource.populate("uploadedBy", "name email profileImage");

    res.status(201).json({
      success: true,
      message: "Resource uploaded successfully.",
      data: resource,
    });
  } catch (error) {
    cleanupFile(req.file?.path);
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
    const { page = 1, limit = 20, fileType, search } = req.query;

    const query = {};
    if (fileType && fileType !== "all") query.fileType = fileType;
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const skip = (page - 1) * limit;
    const [resources, total] = await Promise.all([
      Resource.find(query)
        .populate("uploadedBy", "name email profileImage specialization")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Resource.countDocuments(query),
    ]);

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
      return res
        .status(404)
        .json({ success: false, message: "Resource not found." });
    }

    res.status(200).json({ success: true, data: resource });
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
 * @desc    Update resource (title, description, and/or replace file)
 * @route   PUT /api/resources/:id
 * @access  Private
 */
export const updateResource = async (req, res) => {
  try {
    const { title, description } = req.body;

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      cleanupFile(req.file?.path);
      return res
        .status(404)
        .json({ success: false, message: "Resource not found." });
    }

    if (
      resource.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      cleanupFile(req.file?.path);
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this resource.",
      });
    }

    if (title) resource.title = title;
    if (description) resource.description = description;

    // Replace file if a new one is provided
    if (req.file) {
      // Delete the old Cloudinary asset
      if (resource.filePublicId) {
        const isImage = resource.fileType === "image";
        try {
          await deleteFromCloudinary(
            resource.filePublicId,
            isImage ? "image" : "raw",
          );
        } catch (e) {
          console.error("Old file deletion error:", e);
        }
      }

      const result = await uploadResourceFile(req.file);
      resource.fileUrl = result.url;
      resource.filePublicId = result.publicId || result.public_id || null;
      resource.fileName = req.file.originalname;
      resource.mimeType = req.file.mimetype;
      resource.fileType = detectFileType(req.file.mimetype);
      resource.fileSize = req.file.size;
    }

    await resource.save();
    await resource.populate("uploadedBy", "name email profileImage");

    res.status(200).json({
      success: true,
      message: "Resource updated successfully.",
      data: resource,
    });
  } catch (error) {
    cleanupFile(req.file?.path);
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
      return res
        .status(404)
        .json({ success: false, message: "Resource not found." });
    }

    if (
      resource.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this resource.",
      });
    }

    // Delete from Cloudinary
    if (resource.filePublicId) {
      const isImage = resource.fileType === "image";
      try {
        await deleteFromCloudinary(
          resource.filePublicId,
          isImage ? "image" : "raw",
        );
      } catch (e) {
        console.error("Cloudinary deletion error:", e);
      }
    }

    await resource.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Resource deleted successfully." });
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting resource.",
      error: error.message,
    });
  }
};
