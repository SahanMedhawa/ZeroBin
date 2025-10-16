import express from "express";
import {
    createSchedule,
    getAllSchedules,
    getTruckSchedules,
    getScheduleById,
    updateSchedule,
    updateScheduleStatus,
    deleteSchedule,
    getSchedulesByWma,
    getActiveSchedules
} from "../controllers/scheduleController.js";
import { authenticateWMA, authenticateCollector } from "../middlewares/authMiddleware.js";

const router = express.Router();

// WMA Schedule Management Routes
router
  .route("/")
  .post(authenticateWMA, createSchedule) // WMA creates schedules
  .get(authenticateWMA, getAllSchedules); // WMA views all their schedules

// Collector Routes
router.route("/collector-schedules").get(authenticateCollector, getTruckSchedules);

// Collector Status Update Route (only status field)
router.route("/:id/status").put(authenticateCollector, updateScheduleStatus);

// Get schedules by WMA ID
router.route("/wma-schedules/:id").get(getSchedulesByWma);

// Get active schedules (In Progress status)
router.route("/active").get(getActiveSchedules);

// Schedule CRUD operations (WMA authenticated)
router
  .route("/:id")
  .get(getScheduleById)
  .put(authenticateWMA, updateSchedule) // WMA updates schedules
  .delete(authenticateWMA, deleteSchedule); // WMA deletes schedules

export default router;