import asyncHandler from "express-async-handler";
import Garbage from "../../models/garbageModel.js";

/**
 * Get all garbage requests (Admin)
 */
const getAllGarbageRequests = asyncHandler(async (req, res) => {
  const garbageRequests = await Garbage.find({})
    .populate("user", "username email contact address")
    .populate("area", "name type rate");
  res.json(garbageRequests);
});

/**
 * Update a garbage request status (Admin)
 */
const updateGarbageRequest = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const garbage = await Garbage.findById(req.params.id);

  if (garbage) {
    garbage.status = status || garbage.status;
    const updatedGarbage = await garbage.save();
    res.json(updatedGarbage);
  } else {
    res.status(404);
    throw new Error("Garbage request not found");
  }
});

/**
 * Delete a garbage request (Admin)
 */
const deleteGarbageRequest = asyncHandler(async (req, res) => {
  const garbage = await Garbage.findByIdAndDelete(req.params.id);
  if (garbage) {
    res.json({ message: "Garbage removed successfully!" });
  } else {
    res.status(404);
    throw new Error("Garbage not found!");
  }
});

/**
 * Legacy: Create a new garbage collection request (kept for backward compatibility)
 */
const createGarbageRequest = asyncHandler(async (req, res) => {
  const { area, address, longitude, latitude, type, weight } = req.body;
  if (!longitude || !latitude || !type || !area) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  const garbage = new Garbage({
    user: req.user._id,
    address,
    longitude,
    latitude,
    type,
    area,
    weight,
  });

  const createdGarbage = await garbage.save();
  res.status(201).json(createdGarbage);
});

export {
  getAllGarbageRequests,
  updateGarbageRequest,
  deleteGarbageRequest,
  createGarbageRequest,
};