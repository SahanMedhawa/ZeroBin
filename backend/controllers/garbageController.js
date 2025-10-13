import Garbage from "../models/garbageModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";

/**
 * @route   POST /api/garbage
 * @desc    Create a new garbage collection request
 * @access  Private
 * @param   {Number} longitude - The longitude of the collection location (required)
 * @param   {Number} latitude - The latitude of the collection location (required)
 * @param   {String} typeOfGarbage - The type of garbage (required)
 * @param   {String} address - The address for garbage collection (required)
 * @param   {String} mobileNumber - The mobile number for contact (required)
 * @returns {Object} - A JSON object containing the newly created garbage request data
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

export {
  createGarbageRequest,
  getAllGarbageRequests,
  getUserGarbageRequests,
  getGarbageRequestById,
  updateGarbageRequest,
  deleteGarbageRequest,
  getGarbageRequestByArea
};
