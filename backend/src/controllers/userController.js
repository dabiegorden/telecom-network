import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching user profile.",
      error: error.message,
    });
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
export const updateCurrentUser = async (req, res) => {
  try {
    const {
      name,
      specialization,
      experience,
      skills,
      bio,
      headline,
      location,
      website,
      phone,
      password,
      currentPassword,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update fields
    if (name) user.name = name;
    if (specialization) user.specialization = specialization;
    if (experience !== undefined) user.experience = experience;
    if (skills) {
      user.skills = Array.isArray(skills)
        ? skills
        : skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
    if (bio !== undefined) user.bio = bio;
    if (headline !== undefined) user.headline = headline;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (phone !== undefined) user.phone = phone;

    // Update password if provided (requires verifying the current password)
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set a new password.",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Handle profile image upload if file exists
    const profileImageFile = req.files?.profileImage?.[0] || req.file;
    if (profileImageFile) {
      const result = await uploadToCloudinary(
        profileImageFile.buffer,
        "telecom-network/profiles",
      );
      user.profileImage = result.url;
    }

    // Handle banner image upload if file exists
    const bannerImageFile = req.files?.bannerImage?.[0];
    if (bannerImageFile) {
      const result = await uploadToCloudinary(
        bannerImageFile.buffer,
        "telecom-network/banners",
      );
      user.bannerImage = result.url;
    }

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating profile.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching user.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching users.",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting user.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all professionals (Admin only)
 * @route   GET /api/users/professionals
 * @access  Private/Admin
 */
export const getAllProfessionals = async (req, res) => {
  try {
    const professionals = await User.find({ role: "professional" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: professionals.length,
      data: professionals,
    });
  } catch (error) {
    console.error("Get all professionals error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching professionals.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all recruiters (Admin only)
 * @route   GET /api/users/recruiters
 * @access  Private/Admin
 */
export const getAllRecruiters = async (req, res) => {
  try {
    const recruiters = await User.find({ role: "recruiter" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: recruiters.length,
      data: recruiters,
    });
  } catch (error) {
    console.error("Get all recruiters error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching recruiters.",
      error: error.message,
    });
  }
};

/**
 * @desc    Update user by admin
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUserByAdmin = async (req, res) => {
  try {
    console.log("========== ADMIN UPDATE ==========");
    console.log("PARAM ID:", req.params.id);
    console.log("BODY:", req.body);
    console.log("HEADERS:", req.headers["content-type"]);

    const {
      name,
      email,
      role,
      specialization,
      experience,
      skills,
      bio,
      location,
    } = req.body || {};

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (specialization) user.specialization = specialization;
    if (experience !== undefined) user.experience = experience;
    if (skills) user.skills = skills;
    if (bio) user.bio = bio;
    if (location) user.location = location;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
