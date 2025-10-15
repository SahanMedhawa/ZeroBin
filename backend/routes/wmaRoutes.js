import express from "express";
import {
    createWMA,
    getAllWMAs,
    loginWMA,
    logoutCurrentWMA,
    getCurrentWMAProfile,
    updateCurrentWMAProfile,
    deleteWMAById,
    getWMAById,
    updateWMAById,
    getWMAServiceAreas,
    addServiceArea,
    removeServiceArea,
} from "../controllers/wmaController.js";

import { authenticate, authenticateWMA, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(createWMA)
  .get(authenticate, authorizeAdmin,getAllWMAs);
router.post("/auth", loginWMA);
router.post("/logout", authenticateWMA, logoutCurrentWMA); 

router
  .route("/wmaprofile")
  .get(authenticateWMA, getCurrentWMAProfile)
  .put(authenticateWMA, updateCurrentWMAProfile);

// Service Area Management Routes
router
  .route("/service-areas")
  .get(authenticateWMA, getWMAServiceAreas);

router
  .route("/service-areas/:areaId")
  .post(authenticateWMA, addServiceArea)
  .delete(authenticateWMA, removeServiceArea);

// Administrator Routes
router
  .route("/:id")
  .delete( deleteWMAById)
  .get(authenticate,authorizeAdmin, getWMAById)
  .put(authenticate, authorizeAdmin,updateWMAById);

export default router;
