import express from "express";
import {
  // user bin & sensor
  registerGarbageBin,
  getUserBin,
  checkUserHasBin,
  updateSensorData,
  getSensorHistory,
} from "../controllers/garbageController/userBinController.js";
import {
  // collector
  getFullBinsForCollector,
  markBinCollected,
  getCollectorGarbageRequests,
  assignGarbageToCollector,
} from "../controllers/garbageController/collectorController.js";
import {
  // admin/legacy
  createGarbageRequest,
  getAllGarbageRequests,
  updateGarbageRequest,
  deleteGarbageRequest,
} from "../controllers/garbageController/adminGarbageController.js";
import { createBinTicket } from "../controllers/garbageController/ticketController.js";

import { authenticate, authenticateCollector, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ============ NEW: BIN REGISTRATION & SENSOR ROUTES ============
router.post("/register-bin", authenticate, registerGarbageBin);
router.get("/user/my-bin", authenticate, getUserBin);
router.get("/user/check-bin", authenticate, checkUserHasBin);
router.put("/sensor/:binId", authenticate, updateSensorData);
router.get("/sensor-history/:binId", authenticate, getSensorHistory);

// ============ COLLECTOR ROUTES ============
router.get("/collector/full-bins", authenticateCollector, getFullBinsForCollector);
router.put("/:id/collect", authenticateCollector, markBinCollected);
router.get("/collector/my-requests", authenticateCollector, getCollectorGarbageRequests);
router.put("/:id/assign", authenticateCollector, assignGarbageToCollector);

// ============ ADMIN / LEGACY ============
router.post("/", authenticate, createGarbageRequest);
router.get("/", getAllGarbageRequests);
router.route("/:id").get(/* getById kept if needed */).put(updateGarbageRequest).delete(deleteGarbageRequest);

// ============ USER TICKET ============
// Create a maintenance ticket for a specific bin (user)
router.post("/:binId/ticket", authenticate, createBinTicket);

export default router;