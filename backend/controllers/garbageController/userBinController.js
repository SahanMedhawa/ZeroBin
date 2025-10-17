import asyncHandler from "express-async-handler";
import Garbage from "../../models/garbageModel.js";
import User from "../../models/userModel.js";
import Collector from "../../models/collectorModel.js";

/**
 * Register a new garbage bin (one-time per user)
 */
const registerGarbageBin = asyncHandler(async (req, res) => {
  const { area, address, longitude, latitude, type } = req.body;
  if (!longitude || !latitude || !type || !area || !address) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  const existingBin = await Garbage.findOne({
    user: req.user._id,
    isBinRegistered: true,
  });

  if (existingBin) {
    res.status(400);
    throw new Error("You already have a registered bin. Only one bin per user allowed.");
  }

  const binId = `BIN-${req.user._id}-${Date.now()}`;
  const garbage = new Garbage({
    user: req.user._id,
    address,
    longitude,
    latitude,
    type,
    area,
    isBinRegistered: true,
    binId,
    sensorData: {
      fillLevel: "Empty",
      fillPercentage: 0,
      lastUpdated: new Date(),
      isAutoDetected: false,
      updateHistory: [
        {
          level: "Empty",
          percentage: 0,
          updatedBy: req.user._id,
          timestamp: new Date(),
          method: "system",
        },
      ],
    },
    isVisibleToCollectors: false,
    status: "Pending",
  });

  const createdBin = await garbage.save();
  await createdBin.populate("user", "username email contact address");
  await createdBin.populate("area", "name district postalCode");

  res.status(201).json({
    success: true,
    message: "Garbage bin registered successfully!",
    bin: createdBin,
  });
});

/**
 * Get user's registered bin
 */
const getUserBin = asyncHandler(async (req, res) => {
  const bin = await Garbage.getUserBin(req.user._id);
  if (!bin) {
    res.status(404);
    throw new Error("No registered bin found. Please register a bin first.");
  }
  res.json({ success: true, bin });
});

/**
 * Check if user has a registered bin
 */
const checkUserHasBin = asyncHandler(async (req, res) => {
  const bin = await Garbage.findOne({
    user: req.user._id,
    isBinRegistered: true,
  }).select("binId");

  res.json({ success: true, hasBin: !!bin, binId: bin?.binId || null });
});

/**
 * Update sensor fill level (manual simulation) - user/admin
 */
const updateSensorData = asyncHandler(async (req, res) => {
  const { binId } = req.params;
  const { fillLevel } = req.body;

  const bin = await Garbage.findOne({ binId });
  if (!bin) {
    res.status(404);
    throw new Error("Bin not found");
  }

  // instance method from model (existing): updateSensorLevel
  await bin.updateSensorLevel(fillLevel, req.user._id, "User", "manual");
  await bin.save();

  await bin.populate("user", "username email contact");
  await bin.populate("area", "name district");

  let statusMessage = "Sensor data updated successfully";
  if (bin.isVisibleToCollectors && fillLevel === "Full") {
    statusMessage = bin.status === "Pending"
      ? "Bin is now full and visible to collectors again!"
      : "Bin is now full and visible to collectors!";
  } else if (bin.isVisibleToCollectors && fillLevel === "High") {
    statusMessage = bin.status === "Pending"
      ? "Bin is high and visible to collectors again!"
      : "Bin is high and visible to collectors!";
  }

  res.json({
    success: true,
    message: statusMessage,
    bin,
    isVisibleToCollectors: bin.isVisibleToCollectors,
  });
});

/**
 * Get sensor update history
 */
const getSensorHistory = asyncHandler(async (req, res) => {
  const { binId } = req.params;
  const bin = await Garbage.findOne({ binId })
    .select("sensorData")
    .populate("sensorData.updateHistory.updatedBy", "username email");

  if (!bin) {
    res.status(404);
    throw new Error("Bin not found");
  }

  res.json({
    success: true,
    history: bin.sensorData.updateHistory.sort((a, b) => b.timestamp - a.timestamp),
  });
});

export {
  registerGarbageBin,
  getUserBin,
  checkUserHasBin,
  updateSensorData,
  getSensorHistory,
};