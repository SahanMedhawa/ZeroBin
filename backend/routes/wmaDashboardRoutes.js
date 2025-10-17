import express from "express";
import {
  getDashboardOverview,
  getTotalIncome,
  getAreaBreakdown,
  getRecentRequests,
  getActiveVehicles,
  getPerformanceMetrics,
} from "../controllers/wmaDashboardController.js";
import { authenticateWMA } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * WMA Dashboard Routes
 * All routes require WMA authentication
 *
 * Design Pattern: Route Grouping Pattern
 * Justification: Logical grouping improves maintainability
 */

// Main dashboard endpoint
router.get("/overview", authenticateWMA, getDashboardOverview);

// Individual metric endpoints (for granular control)
router.get("/income", authenticateWMA, getTotalIncome);
router.get("/areas", authenticateWMA, getAreaBreakdown);
router.get("/requests", authenticateWMA, getRecentRequests);
router.get("/vehicles", authenticateWMA, getActiveVehicles);
router.get("/metrics", authenticateWMA, getPerformanceMetrics);

export default router;
