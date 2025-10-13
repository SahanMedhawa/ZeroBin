import express from "express";
import {
    createSchedule,
    getAllSchedules,
    getTruckSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
    getSchedulesByWma
} from "../controllers/scheduleController.js";
import { authenticate, authorizeAdmin, authenticateCollector } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(authenticate, authorizeAdmin, createSchedule)
  .get(authenticate, authorizeAdmin, getAllSchedules);
  // .post(authenticate, authorizeAdmin, createSchedule)
  // .get(authenticate, getAllSchedules);

router.route("/collector-schedules").get(authenticateCollector,getTruckSchedules);

router.route("/wma-schedules/:id").get(getSchedulesByWma);

router
  .route("/:id")
  .get(getScheduleById)
  .put(updateSchedule)
  .delete(deleteSchedule);
  // .get(authenticate, getScheduleById)
  // .put(authenticate, authorizeAdmin, updateSchedule)
  // .delete(authenticate, authorizeAdmin, deleteSchedule);

export default router;