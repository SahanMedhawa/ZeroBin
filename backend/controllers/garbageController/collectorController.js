import asyncHandler from "../../middlewares/asyncHandler.js";
import Garbage from "../../models/garbageModel.js";
import Collector from "../../models/collectorModel.js";

/**
 * Get bins that are Full/High in collector's assigned areas
 */
const getFullBinsForCollector = asyncHandler(async (req, res) => {
  const collector = await Collector.findById(req.collector._id);
  if (!collector) {
    res.status(404);
    throw new Error("Collector not found.");
  }

  const bins = await Garbage.find({
    area: { $in: collector.assignedAreas },
    "sensorData.fillLevel": { $in: ["Full", "High"] },
    status: { $in: ["Pending", "In Progress"] },
  })
    .populate("user", "username email contact address")
    .populate("area", "name district")
    .sort({ "sensorData.fillPercentage": -1 });

  res.json({ success: true, count: bins.length, bins });
});

/**
 * Mark bin collected and reset sensor
 */
const markBinCollected = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { weight } = req.body;

  // Validate bin ID format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Invalid bin ID format");
  }

  const garbage = await Garbage.findById(id);
  if (!garbage) {
    res.status(404);
    throw new Error("Garbage request not found");
  }

  const collector = await Collector.findById(req.collector._id);
  if (!collector) {
    res.status(404);
    throw new Error("Collector not found");
  }

  if (!collector.assignedAreas.includes(garbage.area.toString())) {
    res.status(403);
    throw new Error("You are not assigned to this area");
  }

  // Validate weight if provided
  if (weight !== undefined && weight !== null) {
    if (typeof weight !== 'number' || weight < 0) {
      res.status(400);
      throw new Error("Weight must be a non-negative number");
    }
  }

  garbage.status = "Collected";
  garbage.collectionDate = new Date();
  garbage.assignedCollector = collector._id;
  garbage.assignedWma = collector.wmaId;

  if (weight && weight > 0) {
    garbage.weight = weight;
  }

  // instance method: resetSensor
  garbage.resetSensor(collector._id);

  const updatedBin = await garbage.save();
  await updatedBin.populate("user", "username email contact address");
  await updatedBin.populate("area", "name district postalCode");
  await updatedBin.populate("assignedCollector", "collectorName truckNumber");
  await updatedBin.populate("assignedWma", "wmaname");

  res.json({
    success: true,
    message: "Bin collected successfully! Sensor reset to Empty.",
    bin: updatedBin,
  });
});

/**
 * Get garbage requests for collector's assigned areas (legacy/other view)
 */
const getCollectorGarbageRequests = asyncHandler(async (req, res) => {
  const collector = await Collector.findById(req.collector._id);
  if (!collector) {
    res.status(404);
    throw new Error("Collector not found.");
  }

  const garbageRequests = await Garbage.find({
    area: { $in: collector.assignedAreas },
    status: { $in: ["Pending", "In Progress"] },
  })
    .populate("user", "username email contact address")
    .populate("area", "name district postalCode")
    .populate("assignedCollector", "collectorName truckNumber")
    .populate("assignedWma", "wmaname")
    .sort({ createdAt: -1 });

  res.json(garbageRequests);
});

/**
 * Assign garbage request to collector
 */
const assignGarbageToCollector = asyncHandler(async (req, res) => {
  const garbage = await Garbage.findById(req.params.id);
  if (!garbage) {
    res.status(404);
    throw new Error("Garbage request not found");
  }

  const collector = await Collector.findById(req.collector._id);
  if (!collector) {
    res.status(404);
    throw new Error("Collector not found");
  }

  if (!collector.assignedAreas.includes(garbage.area.toString())) {
    res.status(403);
    throw new Error("You are not assigned to this area");
  }

  garbage.assignedCollector = collector._id;
  garbage.assignedWma = collector.wmaId;
  garbage.status = "In Progress";

  const updatedGarbage = await garbage.save();
  await updatedGarbage.populate("user", "username email contact address");
  await updatedGarbage.populate("area", "name district");
  await updatedGarbage.populate("assignedCollector", "collectorName truckNumber");
  await updatedGarbage.populate("assignedWma", "wmaname");

  res.json(updatedGarbage);
});

export {
  getFullBinsForCollector,
  markBinCollected,
  getCollectorGarbageRequests,
  assignGarbageToCollector,
};