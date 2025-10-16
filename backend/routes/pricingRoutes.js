import express from "express";
import { getQuote } from "../controllers/pricingController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/quote", authenticate, getQuote);

export default router;