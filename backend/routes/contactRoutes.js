import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} from "../controllers/contactController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route - anyone can submit contact form
router.post("/", createContact);

// Protected routes - admin only
router.get("/", authenticate, authorizeAdmin, getAllContacts);
router.get("/:id", authenticate, authorizeAdmin, getContactById);
router.put("/:id", authenticate, authorizeAdmin, updateContactStatus);
router.delete("/:id", authenticate, authorizeAdmin, deleteContact);

export default router;
