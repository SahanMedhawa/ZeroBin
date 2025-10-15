import Garbage from "../models/garbageModel.js";
import Collector from "../models/collectorModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";

// ============ BIN REGISTRATION ENDPOINTS ============

/**
 * @route   POST /api/garbage/register-bin
 * @desc    Register a new garbage bin (one-time per user)
 * @access  Private (Authenticated User)
 * @body    {String} area - Area ID (required)
 * @body    {String} address - Physical address (required)
 * @body    {Number} longitude - GPS longitude (required)
 * @body    {Number} latitude - GPS latitude (required)
 * @body    {String} type - Recyclable or Non-Recyclable (required)
 * @returns {Object} - Registered bin with sensor data
 */
const registerGarbageBin = asyncHandler(async (req, res) => {
  const { area, address, longitude, latitude, type } = req.body;

  // Validation
  if (!longitude || !latitude || !type || !area || !address) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  // Check if user already has a registered bin
  const existingBin = await Garbage.userHasBin(req.user._id);

  if (existingBin) {
    res.status(400);
    throw new Error(
      "You already have a registered bin. Only one bin per user allowed."
    );
  }

  // Generate unique bin ID
  const binId = `BIN-${req.user._id}-${Date.now()}`;

  // Create new bin
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
          updatedByModel: "User",
          timestamp: new Date(),
          method: "system",
        },
      ],
    },
    isVisibleToCollectors: false,
    status: "Pending",
  });

  const createdBin = await garbage.save();

  // Populate for response
  await createdBin.populate("user", "username email contact address");
  await createdBin.populate("area", "name district postalCode");

  res.status(201).json({
    success: true,
    message: "Garbage bin registered successfully!",
    bin: createdBin,
  });
});

/**
 * @route   GET /api/garbage/user/my-bin
 * @desc    Get user's registered bin with sensor data
 * @access  Private (Authenticated User)
 * @returns {Object} - User's bin with full details
 */
const getUserBin = asyncHandler(async (req, res) => {
  const bin = await Garbage.getUserBin(req.user._id);

  if (!bin) {
    res.status(404);
    throw new Error("No registered bin found. Please register a bin first.");
  }

  res.json({
    success: true,
    bin,
  });
});

/**
 * @route   GET /api/garbage/user/check-bin
 * @desc    Check if user has a registered bin
 * @access  Private (Authenticated User)
 * @returns {Object} - { hasBin: Boolean, binId: String }
 */
const checkUserHasBin = asyncHandler(async (req, res) => {
  const bin = await Garbage.findOne({
    user: req.user._id,
    isBinRegistered: true,
  }).select("binId");

  res.json({
    success: true,
    hasBin: !!bin,
    binId: bin?.binId || null,
  });
});

// ============ SENSOR DATA MANAGEMENT ============

/**
 * @route   PUT /api/garbage/sensor/:binId
 * @desc    Update sensor fill level (Manual simulation)
 * @access  Private (User or Admin)
 * @param   {String} binId - Unique bin identifier
 * @body    {String} fillLevel - Empty, Low, Medium, High, Full (required)
 * @returns {Object} - Updated bin with new sensor data
 */
const updateSensorData = asyncHandler(async (req, res) => {
  const { binId } = req.params;
  const { fillLevel } = req.body;

  // Validation
  if (!["Empty", "Low", "Medium", "High", "Full"].includes(fillLevel)) {
    res.status(400);
    throw new Error(
      "Invalid fill level. Must be: Empty, Low, Medium, High, or Full"
    );
  }

  const bin = await Garbage.findOne({ binId });

  if (!bin) {
    res.status(404);
    throw new Error("Bin not found");
  }

  // Authorization: User owns the bin OR admin
  if (
    bin.user.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(403);
    throw new Error("Not authorized to update this bin");
  }

  // Update sensor using instance method
  bin.updateSensorLevel(fillLevel, req.user._id, "User", "manual");

  await bin.save();

  // Populate for response
  await bin.populate("user", "username email contact");
  await bin.populate("area", "name district");

  // Create appropriate status message
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
 * @route   GET /api/garbage/sensor-history/:binId
 * @desc    Get sensor update history for a bin
 * @access  Private (User owns bin or Admin)
 * @param   {String} binId - Unique bin identifier
 * @returns {Object} - Sensor update history
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
    history: bin.sensorData.updateHistory.sort(
      (a, b) => b.timestamp - a.timestamp
    ),
  });
});

// ============ COLLECTOR ENDPOINTS ============

/**
 * @route   GET /api/garbage/collector/full-bins
 * @desc    Get bins that are full/high in collector's assigned areas
 * @access  Private (Authenticated Collector)
 * @returns {Array} - List of bins needing collection
 */
const getFullBinsForCollector = asyncHandler(async (req, res) => {
  const collector = await Collector.findById(req.collector._id);

  if (!collector) {
    res.status(404);
    throw new Error("Collector not found");
  }

  // Find bins that are Full or High in collector's areas
  const fullBins = await Garbage.find({
    area: { $in: collector.assignedAreas },
    isBinRegistered: true,
    isVisibleToCollectors: true,
    status: { $in: ["Pending", "In Progress"] },
  })
    .populate("user", "username email contact address")
    .populate("area", "name district postalCode")
    .populate("assignedCollector", "collectorName truckNumber")
    .populate("assignedWma", "wmaname")
    .sort({ "sensorData.fillPercentage": -1, createdAt: -1 }); // Fullest bins first

  res.json({
    success: true,
    count: fullBins.length,
    bins: fullBins,
  });
});

/**
 * @route   PUT /api/garbage/:id/collect
 * @desc    Mark bin as collected and reset sensor
 * @access  Private (Authenticated Collector)
 * @param   {String} id - Garbage bin ID
 * @body    {Number} weight - Collected weight in kg (optional)
 * @returns {Object} - Updated bin with reset sensor
 */
const markBinCollected = asyncHandler(async (req, res) => {
  const { weight } = req.body;
  const bin = await Garbage.findById(req.params.id);

  if (!bin) {
    res.status(404);
    throw new Error("Bin not found");
  }

  const collector = await Collector.findById(req.collector._id);

  if (!collector) {
    res.status(404);
    throw new Error("Collector not found");
  }

  // Verify collector is assigned to this area
  if (!collector.assignedAreas.includes(bin.area.toString())) {
    res.status(403);
    throw new Error("You are not assigned to this area");
  }

  // Update bin status
  bin.status = "Collected";
  bin.collectionDate = new Date();
  bin.assignedCollector = collector._id;
  bin.assignedWma = collector.wmaId;

  // Update weight if provided
  if (weight && weight > 0) {
    bin.weight = weight;
  }

  // Reset sensor using instance method
  bin.resetSensor(collector._id);

  const updatedBin = await bin.save();

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

// ============ EXISTING ENDPOINTS (KEPT FOR BACKWARD COMPATIBILITY) ============

/**
 * @route   POST /api/garbage
 * @desc    Create a new garbage collection request (LEGACY - Use register-bin instead)
 * @access  Private
 */
const createGarbageRequest = asyncHandler(async (req, res) => {
  const { area, address, longitude, latitude, type, weight } = req.body;

  if (!longitude || !latitude || !type || !area) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  // Find the user
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  // Create the garbage request
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

  try {
    // console.log(`createdGarbage => `, createdGarbage);
    // await user.save();
    res.status(201).json(createdGarbage);
  } catch (error) {
    res.status(500);
    throw new Error("Error saving user or creating garbage request.");
  }
});

/**
 * @route   GET /api/garbage
 * @desc    Get all garbage requests (Admin only)
 * @access  Private/Admin
 * @returns {Array} - A list of all garbage collection requests
 */
const getAllGarbageRequests = asyncHandler(async (req, res) => {
  const garbageRequests = await Garbage.find({})
    .populate("user", "username email contact address")
    .populate("area", "name type rate");
  res.json(garbageRequests);
});

/**
 * @route   GET /api/garbage/my-requests
 * @desc    Get all garbage requests made by the logged-in user
 * @access  Private (Authenticated User)
 * @returns {Array} - A list of garbage collection requests made by the user
 */
const getUserGarbageRequests = asyncHandler(async (req, res) => {
  // Find garbage requests where the user ID matches the logged-in user
  const garbageRequests = await Garbage.find({ user: req.user._id })
    .populate("user", "username email contact address")
    .populate("area", "name type rate");

  res.json(garbageRequests);
});

/**
 * @route   GET /api/garbage/:id
 * @desc    Get a single garbage collection request by ID
 * @access  Private
 * @returns {Object} - A single garbage request
 */
const getGarbageRequestById = asyncHandler(async (req, res) => {
  const garbage = await Garbage.findById(req.params.id)
    .populate("user", "username email contact address")
    .populate("area", "name type rate");

  if (garbage) {
    res.json(garbage);
  } else {
    res.status(404);
    throw new Error("Garbage request not found");
  }
});

/**
 * @route   PUT /api/garbage/:id
 * @desc    Update a garbage request status (Admin only)
 * @access  Private/Admin
 * @param   {String} status - The new status of the garbage collection request
 * @param   {Date} collectionDate - The date of garbage collection
 * @returns {Object} - The updated garbage request
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
 * @route   DELETE /api/garbage/:id
 * @desc    Delete a garbage request (Admin only)
 * @access  Private/Admin
 * @returns {Object} - A JSON object confirming deletion
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

const getGarbageRequestByArea = asyncHandler(async (req, res) => {
  const garbage = await Garbage.find({ area: req.params.id })
  .populate("area", "name")
  res.json(garbage);
});

/**
 * @route   GET /api/garbage/collector/my-requests
 * @desc    Get garbage requests for collector's assigned areas
 * @access  Private (Authenticated Collector)
 * @returns {Array} - A list of garbage requests in collector's assigned areas
 */
const getCollectorGarbageRequests = asyncHandler(async (req, res) => {
  // Find the collector
  const collector = await Collector.findById(req.collector._id);
  
  if (!collector) {
    res.status(404);
    throw new Error("Collector not found.");
  }

  // Find garbage requests where area matches collector's assigned areas
  const garbageRequests = await Garbage.find({
    area: { $in: collector.assignedAreas },
    status: { $in: ["Pending", "In Progress"] }, // Only show pending or in-progress requests
  })
    .populate("user", "username email contact address")
    .populate("area", "name district postalCode")
    .populate("assignedCollector", "collectorName truckNumber")
    .populate("assignedWma", "wmaname")
    .sort({ createdAt: -1 });

  res.json(garbageRequests);
});

/**
 * @route   PUT /api/garbage/:id/assign
 * @desc    Assign garbage request to collector
 * @access  Private (Authenticated Collector)
 * @returns {Object} - Updated garbage request
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

  // Check if collector is assigned to this area
  if (!collector.assignedAreas.includes(garbage.area.toString())) {
    res.status(403);
    throw new Error("You are not assigned to this area");
  }

  // Assign the garbage request
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
  // New Bin Registration & Sensor Management
  registerGarbageBin,
  getUserBin,
  checkUserHasBin,
  updateSensorData,
  getSensorHistory,
  getFullBinsForCollector,
  markBinCollected,
  // Legacy/Existing endpoints
  createGarbageRequest,
  getAllGarbageRequests,
  getUserGarbageRequests,
  getGarbageRequestById,
  updateGarbageRequest,
  deleteGarbageRequest,
  getGarbageRequestByArea,
  getCollectorGarbageRequests,
  assignGarbageToCollector,
};
