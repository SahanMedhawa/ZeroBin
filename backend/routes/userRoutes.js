import express from "express";
import {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  checkEmail,
  googleAuth,
  googleCallback,
} from "../controllers/userController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(createUser)
  .get(authenticate, authorizeAdmin,getAllUsers);
router.post("/auth", loginUser);
router.post("/logout", authenticate,  logoutCurrentUser);
router.post("/check-email", checkEmail);

// Google OAuth routes
router.get("/auth/google", googleAuth);
router.get("/auth/google/callback", googleCallback);

router
  .route("/profile")
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateCurrentUserProfile);

// Administrator Routes
router
  .route("/:id")
  .delete( deleteUserById)
  .get(authenticate, authorizeAdmin, getUserById)
  .put(authenticate, authorizeAdmin,updateUserById);

export default router;
