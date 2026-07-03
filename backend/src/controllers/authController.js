import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import {
  sendEmail,
  welcomeEmailTemplate,
  otpEmailTemplate,
} from "../utils/sendEmail.js";

/**
 * Generate JWT token
 * @param {String} id - User ID
 * @returns {String} - JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generate a 6-digit OTP, store its hash on the user, and email it.
 */
const issueOtp = async (user) => {
  const otp = crypto.randomInt(100000, 1000000).toString();

  user.otpCode = crypto.createHash("sha256").update(otp).digest("hex");
  user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
  await user.save();

  const result = await sendEmail({
    to: user.email,
    subject: "Your TelecomNet Ghana verification code",
    html: otpEmailTemplate(user.name, otp),
  });

  return result;
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  specialization: user.specialization,
  experience: user.experience,
  skills: user.skills,
  bio: user.bio,
  location: user.location,
  profileImage: user.profileImage,
  createdAt: user.createdAt,
});

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      specialization,
      experience,
      skills,
      bio,
      location,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Allowed roles
    const allowedRoles = ["professional", "recruiter", "admin"];

    // Validate role
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role provided.",
      });
    }

    // Create user (unverified until OTP is confirmed)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "professional", // default role
      specialization,
      experience,
      skills,
      bio,
      location,
      isVerified: false,
    });

    // Create a persistent welcome notification
    await Notification.create({
      user: user._id,
      type: "welcome",
      title: "Welcome to TelecomNet Ghana!",
      message: `Hi ${user.name}, your account has been created successfully. Complete your profile to start connecting with telecom professionals across Ghana.`,
      link: "/profile",
    });

    // Send welcome email (non-blocking — failure should not break registration)
    sendEmail({
      to: user.email,
      subject: "Welcome to TelecomNet Ghana!",
      html: welcomeEmailTemplate(user.name),
    }).catch((error) => console.error("Welcome email error:", error));

    // Send the verification OTP
    await issueOtp(user);

    res.status(201).json({
      success: true,
      message:
        "Account created. A verification code has been sent to your email.",
      data: {
        requiresVerification: true,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

/**
 * @desc    Login user (step 1: credentials → OTP sent to email)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+otpCode +otpExpires");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Credentials OK — issue an OTP instead of a token
    const emailResult = await issueOtp(user);
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message:
          "Could not send the verification code. Please try again shortly.",
      });
    }

    res.status(200).json({
      success: true,
      message: "A verification code has been sent to your email.",
      data: {
        requiresVerification: true,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message,
    });
  }
};

/**
 * @desc    Verify OTP (step 2: OTP → JWT token)
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and the verification code.",
      });
    }

    const user = await User.findOne({ email }).select("+otpCode +otpExpires");
    if (!user || !user.otpCode || !user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }

    if (user.otpExpires.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    const hashed = crypto
      .createHash("sha256")
      .update(String(otp).trim())
      .digest("hex");

    if (hashed !== user.otpCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    // OTP is valid — clear it and mark the account verified
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Verification successful.",
      data: {
        user: publicUser(user),
        token,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during verification.",
    });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address.",
      });
    }

    const user = await User.findOne({ email }).select("+otpCode +otpExpires");

    // Do not reveal whether the account exists
    if (user) {
      await issueOtp(user);
    }

    res.status(200).json({
      success: true,
      message:
        "If an account exists for this email, a new verification code has been sent.",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error resending verification code.",
    });
  }
};
