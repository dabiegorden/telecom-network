import express from "express";
import {
  register,
  login,
  verifyOtp,
  resendOtp,
} from "../controllers/authController.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (sends verification OTP)
// @access  Public
router.post("/register", register);

// @route   POST /api/auth/login
// @desc    Login user (step 1: credentials → OTP email)
// @access  Public
router.post("/login", login);

// @route   POST /api/auth/verify-otp
// @desc    Verify the emailed OTP and receive a JWT
// @access  Public
router.post("/verify-otp", verifyOtp);

// @route   POST /api/auth/resend-otp
// @desc    Resend a verification OTP
// @access  Public
router.post("/resend-otp", resendOtp);

export default router;
