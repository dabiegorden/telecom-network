import Connection from "../models/Connection.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const PUBLIC_FIELDS =
  "name email role specialization experience skills bio location profileImage";

const connectionsLinkFor = (role) => {
  if (role === "recruiter") return "/recruiter-dashboard/connections";
  if (role === "admin") return "/admin-dashboard/connections";
  return "/professional-dashboard/connections";
};

/**
 * @desc    Send a connection request to another user
 * @route   POST /api/connections/request/:userId
 * @access  Private
 */
export const sendRequest = async (req, res) => {
  try {
    const recipientId = req.params.userId;

    if (recipientId === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot connect with yourself.",
      });
    }

    const recipient = await User.findById(recipientId).select("role");

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const existing = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id },
      ],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A connection already exists with status "${existing.status}".`,
      });
    }

    const connection = await Connection.create({
      requester: req.user._id,
      recipient: recipientId,
      status: "pending",
    });

    await Notification.create({
      user: recipientId,
      type: "connection_request",
      title: "New connection request",
      message: `${req.user.name} wants to connect with you.`,
      link: connectionsLinkFor(recipient.role),
    });

    res.status(201).json({
      success: true,
      data: connection,
    });
  } catch (error) {
    console.error("Send connection request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error sending connection request.",
      error: error.message,
    });
  }
};

/**
 * @desc    Respond to a pending connection request (accept or decline)
 * @route   PUT /api/connections/:id/respond
 * @access  Private
 */
export const respondToRequest = async (req, res) => {
  try {
    const { action } = req.body;

    if (!["accepted", "declined"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "accepted" or "declined".',
      });
    }

    const connection = await Connection.findOne({
      _id: req.params.id,
      recipient: req.user._id,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found.",
      });
    }

    connection.status = action;
    await connection.save();

    if (action === "accepted") {
      const requester = await User.findById(connection.requester).select("role");
      await Notification.create({
        user: connection.requester,
        type: "connection_accepted",
        title: "Connection accepted",
        message: `${req.user.name} accepted your connection request.`,
        link: connectionsLinkFor(requester?.role),
      });
    }

    res.status(200).json({
      success: true,
      data: connection,
    });
  } catch (error) {
    console.error("Respond to connection request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error responding to connection request.",
      error: error.message,
    });
  }
};

/**
 * @desc    Remove a connection or cancel/withdraw a request
 * @route   DELETE /api/connections/:id
 * @access  Private
 */
export const removeConnection = async (req, res) => {
  try {
    const connection = await Connection.findOneAndDelete({
      _id: req.params.id,
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Connection removed.",
    });
  } catch (error) {
    console.error("Remove connection error:", error);
    res.status(500).json({
      success: false,
      message: "Server error removing connection.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get current user's accepted connections
 * @route   GET /api/connections
 * @access  Private
 */
export const getMyConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      status: "accepted",
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    })
      .populate("requester", PUBLIC_FIELDS)
      .populate("recipient", PUBLIC_FIELDS)
      .sort({ updatedAt: -1 });

    const data = connections.map((conn) => {
      const isRequester = String(conn.requester._id) === String(req.user._id);
      return {
        _id: conn._id,
        status: conn.status,
        connectedAt: conn.updatedAt,
        user: isRequester ? conn.recipient : conn.requester,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get my connections error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching connections.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get other users to discover and connect with, annotated with connection status
 * @route   GET /api/connections/discover
 * @access  Private
 */
export const getDiscoverableUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
      role: { $in: ["professional", "recruiter", "admin"] },
    })
      .select(PUBLIC_FIELDS)
      .sort({ createdAt: -1 });

    const connections = await Connection.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    });

    const statusByUserId = new Map();
    connections.forEach((conn) => {
      const isRequester = String(conn.requester) === String(req.user._id);
      const otherId = String(isRequester ? conn.recipient : conn.requester);
      statusByUserId.set(otherId, {
        status: conn.status,
        connectionId: String(conn._id),
        isRequester,
      });
    });

    const data = users.map((user) => ({
      user,
      connection: statusByUserId.get(String(user._id)) || { status: "none" },
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get discoverable users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching users to discover.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get pending connection requests (incoming and sent)
 * @route   GET /api/connections/requests
 * @access  Private
 */
export const getPendingRequests = async (req, res) => {
  try {
    const incoming = await Connection.find({
      recipient: req.user._id,
      status: "pending",
    })
      .populate("requester", PUBLIC_FIELDS)
      .sort({ createdAt: -1 });

    const sent = await Connection.find({
      requester: req.user._id,
      status: "pending",
    })
      .populate("recipient", PUBLIC_FIELDS)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { incoming, sent },
    });
  } catch (error) {
    console.error("Get pending connection requests error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching connection requests.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get connection status between current user and another user
 * @route   GET /api/connections/status/:userId
 * @access  Private
 */
export const getConnectionStatus = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const connection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: otherUserId },
        { requester: otherUserId, recipient: req.user._id },
      ],
    });

    if (!connection) {
      return res.status(200).json({
        success: true,
        data: { status: "none" },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: connection.status,
        connectionId: connection._id,
        isRequester: String(connection.requester) === String(req.user._id),
      },
    });
  } catch (error) {
    console.error("Get connection status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching connection status.",
      error: error.message,
    });
  }
};
