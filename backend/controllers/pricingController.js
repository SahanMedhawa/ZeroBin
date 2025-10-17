// Single Responsibility: pricing quotes
import asyncHandler from "express-async-handler";
import Area from "../models/areaModel.js";
import pricingConfig from "../config/pricingConfig.js";
import PayAsYouThrowPricingService from "../services/pricing/PayAsYouThrowPricingService.js";
import mongoose from "mongoose";

const pricingService = new PayAsYouThrowPricingService(pricingConfig);

/**
 * @route   GET /api/pricing/quote?areaId=&materialType=&weightKg=
 * @access  Private (Authenticated)
 */
export const getQuote = asyncHandler(async (req, res) => {
  const { areaId, materialType, weightKg } = req.query;

  if (!areaId || !mongoose.Types.ObjectId.isValid(areaId)) {
    res.status(400);
    throw new Error("Invalid or missing areaId");
  }

  const area = await Area.findById(areaId).select("name basePerKgRate");
  if (!area) {
    res.status(404);
    throw new Error("Area not found");
  }

  const result = pricingService.computeCharge(
    area,
    Number(weightKg),
    materialType
  );

  res.json({
    success: true,
    ...result,
  });
});