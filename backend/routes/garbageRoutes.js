import express from "express";
import {
  // New Bin Registration & Sensor Management
  registerGarbageBin,
  getUserBin,
  checkUserHasBin,
  updateSensorData,
  getSensorHistory,
  getFullBinsForCollector,
  markBinCollected,
  // Legacy/Existing endpoints
  createGarbageRequest,
  getAllGarbageRequests,
  getUserGarbageRequests,
  getGarbageRequestById,
  updateGarbageRequest,
  deleteGarbageRequest,
  getGarbageRequestByArea,
  getCollectorGarbageRequests,
  assignGarbageToCollector,
} from "../controllers/garbageController.js";
import { authenticate, authenticateCollector, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ============ NEW: BIN REGISTRATION & SENSOR ROUTES ============

/**
 * User Bin Management Routes
 * - Register a new bin (one-time)
 * - Get user's bin details
 * - Check if user has a bin
 */
router.post("/register-bin", authenticate, registerGarbageBin);
router.get("/user/my-bin", authenticate, getUserBin);
router.get("/user/check-bin", authenticate, checkUserHasBin);

/**
 * Sensor Data Routes
 * - Update sensor fill level (manual simulation)
 * - Get sensor update history
 */
router.put("/sensor/:binId", authenticate, updateSensorData);
router.get("/sensor-history/:binId", authenticate, getSensorHistory);

/**
 * Collector Routes for Sensor-Based Collection
 * - Get bins that are full/high in assigned areas
 * - Mark bin as collected (resets sensor)
 */
router.get("/collector/full-bins", authenticateCollector, getFullBinsForCollector);
router.put("/:id/collect", authenticateCollector, markBinCollected);

// ============ EXISTING ROUTES (LEGACY SUPPORT) ============

// Route to create a new garbage request and get all garbage requests
router
  .route("/")
  .post(authenticate, createGarbageRequest)
  .get(getAllGarbageRequests);

// Route to get garbage requests for a specific user
router.route("/garbage-requests").get(authenticate, getUserGarbageRequests);

// Route to get garbage requests for collector's assigned areas
router.route("/collector/my-requests").get(authenticateCollector, getCollectorGarbageRequests);

router.route("/garbage-requests-area/:id").get(getGarbageRequestByArea);

// Route to assign garbage request to collector
router.route("/:id/assign").put(authenticateCollector, assignGarbageToCollector);

// Routes to get, update, and delete a garbage request by ID
router
  .route("/:id")
  .get(getGarbageRequestById)
  .put(updateGarbageRequest)
  .delete(authenticate, deleteGarbageRequest);

export default router;
