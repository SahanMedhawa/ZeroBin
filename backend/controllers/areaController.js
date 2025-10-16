import Area from "../models/areaModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";

/**
 * @route   POST /api/areas
 * @desc    Create a new area
 * @access  Private/Admin
 * @param   {String} name - The name of the area (required)
 * @param   {String} district - The district of the area (required)
 * @param   {String} postalCode - The postal code of the area (optional)
 * @param   {Object} coordinates - The coordinates of the area (optional)
 * @param   {Boolean} isActive - Whether the area is active (optional, default: true)
 * @returns {Object} - A JSON object containing the newly created area data
 */
const createArea = asyncHandler(async (req, res) => {
  const { name, district, postalCode, coordinates, isActive } = req.body;

  if (!name || !district) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  // Check if the area already exists in the same district
  const existingArea = await Area.findOne({ name, district });
  if (existingArea) {
    res.status(400);
    throw new Error("Area already exists in this district.");
  }

  // Create the area
  const area = new Area({
    name,
    district,
    postalCode,
    coordinates,
    isActive: isActive !== undefined ? isActive : true,
  });

  const createdArea = await area.save();
  res.status(201).json(createdArea);
});

/**
 * @route   GET /api/areas
 * @desc    Get all areas
 * @access  Public
 * @returns {Array} - A list of all areas
 */
const getAllAreas = asyncHandler(async (req, res) => {
  const areas = await Area.find({});
  res.json(areas);
});

/**
 * @route   GET /api/areas/:id
 * @desc    Get a single area by ID
 * @access  Public
 * @returns {Object} - A single area object
 */
const getAreaById = asyncHandler(async (req, res) => {
  const area = await Area.findById(req.params.id);

  if (area) {
    res.json(area);
  } else {
    res.status(404);
    throw new Error("Area not found");
  }
});

/**
 * @route   PUT /api/areas/:id
 * @desc    Update an area by ID
 * @access  Private/Admin
 * @param   {String} name - The new name of the area (optional)
 * @param   {String} district - The new district of the area (optional)
 * @param   {String} postalCode - The new postal code of the area (optional)
 * @param   {Object} coordinates - The new coordinates of the area (optional)
 * @param   {Boolean} isActive - The new active status (optional)
 * @returns {Object} - The updated area object
 */
const updateArea = asyncHandler(async (req, res) => {
  const { name, district, postalCode, coordinates, isActive } = req.body;

  const area = await Area.findById(req.params.id);

  if (area) {
    area.name = name || area.name;
    area.district = district || area.district;
    area.postalCode = postalCode !== undefined ? postalCode : area.postalCode;
    area.coordinates = coordinates !== undefined ? coordinates : area.coordinates;
    area.isActive = isActive !== undefined ? isActive : area.isActive;

    const updatedArea = await area.save();
    res.json(updatedArea);
  } else {
    res.status(404);
    throw new Error("Area not found");
  }
});

/**
 * @route   DELETE /api/areas/:id
 * @desc    Delete an area by ID
 * @access  Private/Admin
 * @returns {Object} - A JSON object confirming deletion
 */
const deleteArea = asyncHandler(async (req, res) => {
  const area = await Area.findByIdAndDelete(req.params.id);

  if (area) {
    res.json({ message: "Area removed successfully!" });
  } else {
    res.status(404);
    throw new Error("Area not found!");
  }
});

export { createArea, getAllAreas, getAreaById, updateArea, deleteArea };
