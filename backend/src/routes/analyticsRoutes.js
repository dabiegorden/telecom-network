import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import {
  getPlatformAnalytics,
  getRecruiterAnalytics,
  getProfessionalAnalytics,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/platform", verifyToken, checkRole("admin"), getPlatformAnalytics);
router.get("/recruiter", verifyToken, checkRole("recruiter"), getRecruiterAnalytics);
router.get("/professional", verifyToken, checkRole("professional"), getProfessionalAnalytics);

export default router;
