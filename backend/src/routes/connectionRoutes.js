import express from "express";
import {
  sendRequest,
  respondToRequest,
  removeConnection,
  getMyConnections,
  getDiscoverableUsers,
  getPendingRequests,
  getConnectionStatus,
} from "../controllers/connectionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   GET /api/connections
// @desc    Get current user's accepted connections
// @access  Private
router.get("/", verifyToken, getMyConnections);

// @route   GET /api/connections/discover
// @desc    Get other users to discover and connect with
// @access  Private
router.get("/discover", verifyToken, getDiscoverableUsers);

// @route   GET /api/connections/requests
// @desc    Get pending connection requests (incoming and sent)
// @access  Private
router.get("/requests", verifyToken, getPendingRequests);

// @route   GET /api/connections/status/:userId
// @desc    Get connection status with another user
// @access  Private
router.get("/status/:userId", verifyToken, getConnectionStatus);

// @route   POST /api/connections/request/:userId
// @desc    Send a connection request to another user
// @access  Private
router.post("/request/:userId", verifyToken, sendRequest);

// @route   PUT /api/connections/:id/respond
// @desc    Accept or decline a pending connection request
// @access  Private
router.put("/:id/respond", verifyToken, respondToRequest);

// @route   DELETE /api/connections/:id
// @desc    Remove a connection or cancel/withdraw a request
// @access  Private
router.delete("/:id", verifyToken, removeConnection);

export default router;
