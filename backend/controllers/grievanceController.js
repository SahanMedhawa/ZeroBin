import asyncHandler from "express-async-handler";
import Grievance from "../models/grievanceModel.js";
import Garbage from "../models/garbageModel.js";
import Collector from "../models/collectorModel.js";
import User from "../models/userModel.js";
import Area from "../models/areaModel.js";
import routeOptimizer from "../services/IRouteOptimizer.js";

/**
 * Grievance Management Controller
 * Handles all grievance-related operations following SOLID principles
 * Single Responsibility: Only handles grievance business logic
 * Open/Closed: Extensible for new grievance types without modification
 */

// ============ USER GRIEVANCE OPERATIONS ============

/**
 * @route   POST /api/grievances/create
 * @desc    Create a new grievance
 * @access  Private (Authenticated User)
 * @body    {String} binId - Bin ID for the grievance
 * @body    {String} severity - Low, Medium, High, Critical
 * @body    {String} description - Issue description
 * @returns {Object} - Created grievance
 */
const createGrievance = asyncHandler(async (req, res) => {
  const { binId, severity, description } = req.body;
  const userId = req.user._id;

  // Validation
  if (!binId || !severity || !description) {
    res.status(400);
    throw new Error("Bin ID, severity, and description are required");
  }

  // Verify bin exists and belongs to user
  const bin = await Garbage.findOne({ binId, user: userId });
  if (!bin) {
    res.status(404);
    throw new Error("Bin not found or you don't have permission to create grievances for this bin");
  }

  // Check for existing open grievances for this bin
  const existingGrievance = await Grievance.findOne({
    binId,
    userId,
    status: { $in: ["Open", "In Progress"] }
  });

  if (existingGrievance) {
    res.status(400);
    throw new Error("You already have an open grievance for this bin. Please wait for resolution or add a note to the existing grievance.");
  }

  // Create grievance
  const grievance = await Grievance.create({
    binId,
    garbageId: bin._id, // Store the garbage model ID for special markers
    userId,
    areaId: bin.area, // Auto-populated from bin
    severity,
    description: description.trim(),
    status: "Open"
  });

  // Populate related data
  await grievance.populate("userId", "username email contact address");
  await grievance.populate("areaId", "name district");

  // Add initial system note
  grievance.addNote(
    `Grievance created by user. Issue: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`,
    userId,
    "User",
    "System"
  );
  await grievance.save();

  // Trigger route optimization if high priority
  if (severity === "Critical" || severity === "High") {
    try {
      await routeOptimizer.triggerReevaluation(bin.area, {
        urgent: severity === "Critical",
        grievanceId: grievance._id
      });
    } catch (error) {
      console.error("Route optimization failed:", error);
      // Don't fail the grievance creation if optimization fails
    }
  }

  res.status(201).json({
    success: true,
    message: "Grievance created successfully",
    grievance
  });
});

/**
 * @route   GET /api/grievances/user/my-grievances
 * @desc    Get user's grievances
 * @access  Private (Authenticated User)
 * @query   {String} status - Optional status filter
 * @query   {Number} page - Page number for pagination
 * @query   {Number} limit - Items per page
 * @returns {Object} - User's grievances with pagination
 */
const getUserGrievances = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { userId };
  if (status) {
    query.status = status;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const total = await Grievance.countDocuments(query);

  // Get grievances
  const grievances = await Grievance.find(query)
    .populate("areaId", "name district")
    .populate("assignedTo", "collectorName truckNumber contactNo")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    grievances,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
});

/**
 * @route   POST /api/grievances/:id/user-note
 * @desc    Add a note to grievance by user
 * @access  Private (Authenticated User)
 * @param   {String} id - Grievance ID
 * @body    {String} content - Note content
 * @returns {Object} - Updated grievance
 */
const addUserNote = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;

  if (!content || content.trim().length === 0) {
    res.status(400);
    throw new Error("Note content is required");
  }

  const grievance = await Grievance.findOne({
    _id: req.params.id,
    userId: userId
  });

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found or you don't have permission to add notes");
  }

  grievance.addNote(content.trim(), userId, "User", "Update");
  await grievance.save();

  await grievance.populate("userId", "username email contact address");
  await grievance.populate("areaId", "name district");
  await grievance.populate("assignedTo", "collectorName truckNumber");

  res.json({
    success: true,
    message: "Note added successfully",
    grievance
  });
});

// ============ ADMIN GRIEVANCE OPERATIONS ============

/**
 * @route   GET /api/grievances/all
 * @desc    Get all grievances with filtering and pagination
 * @access  Private (Admin)
 * @query   {String} status - Status filter
 * @query   {String} severity - Severity filter
 * @query   {String} areaId - Area filter
 * @query   {String} assignedTo - Collector filter
 * @query   {Boolean} escalated - Escalated filter
 * @query   {Number} page - Page number
 * @query   {Number} limit - Items per page
 * @query   {String} sortBy - Sort field
 * @query   {String} sortOrder - asc or desc
 * @returns {Object} - Filtered grievances with pagination and statistics
 */
const getAllGrievances = asyncHandler(async (req, res) => {
  const {
    status,
    severity,
    areaId,
    assignedTo,
    escalated,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = req.query;

  // Build query
  const query = {};
  if (status) query.status = status;
  if (severity) query.severity = severity;
  if (areaId) query.areaId = areaId;
  if (assignedTo) query.assignedTo = assignedTo;
  if (escalated !== undefined) query.isEscalated = escalated === 'true';

  // Calculate pagination
  const skip = (page - 1) * limit;
  const total = await Grievance.countDocuments(query);

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Get grievances
  const grievances = await Grievance.find(query)
    .populate("userId", "username email contact address")
    .populate("areaId", "name district postalCode")
    .populate("assignedTo", "collectorName truckNumber contactNo")
    .populate("garbageId", "binId location latitude longitude status")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get statistics
  const stats = await Grievance.getStatistics();

  res.json({
    success: true,
    grievances,
    statistics: stats,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
});

/**
 * @route   PUT /api/grievances/:id/status
 * @desc    Update grievance status
 * @access  Private (Admin)
 * @param   {String} id - Grievance ID
 * @body    {String} status - New status
 * @body    {String} reason - Reason for status change
 * @returns {Object} - Updated grievance
 */
const updateGrievanceStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const adminId = req.admin?._id || req.user?._id; // Support both admin and user auth

  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status. Must be: " + validStatuses.join(", "));
  }

  const grievance = await Grievance.findById(req.params.id);
  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  // Update status with reason
  grievance.updateStatus(status, adminId, "Admin", reason);
  await grievance.save();

  // Populate related data
  await grievance.populate("userId", "username email contact address");
  await grievance.populate("areaId", "name district");
  await grievance.populate("assignedTo", "collectorName truckNumber");

  res.json({
    success: true,
    message: "Grievance status updated successfully",
    grievance
  });
});

/**
 * @route   PUT /api/grievances/:id/assign
 * @desc    Assign grievance to collector
 * @access  Private (Admin)
 * @param   {String} id - Grievance ID
 * @body    {String} collectorId - Collector to assign
 * @body    {String} reason - Assignment reason
 * @returns {Object} - Updated grievance
 */
const assignGrievanceToCollector = asyncHandler(async (req, res) => {
  const { collectorId, reason } = req.body;
  const adminId = req.admin?._id || req.user?._id;

  if (!collectorId) {
    res.status(400);
    throw new Error("Collector ID is required");
  }

  const grievance = await Grievance.findById(req.params.id);
  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  // Verify collector exists and is assigned to the area
  const collector = await Collector.findById(collectorId);
  if (!collector) {
    res.status(404);
    throw new Error("Collector not found");
  }

  if (!collector.assignedAreas.includes(grievance.areaId.toString())) {
    res.status(400);
    throw new Error("Collector is not assigned to this area");
  }

  if (collector.statusOfCollector !== "Available") {
    res.status(400);
    throw new Error("Collector is not available");
  }

  // Assign grievance
  grievance.assignToCollector(collectorId, adminId, reason);
  await grievance.save();

  // Populate related data
  await grievance.populate("userId", "username email contact address");
  await grievance.populate("areaId", "name district");
  await grievance.populate("assignedTo", "collectorName truckNumber contactNo");

  res.json({
    success: true,
    message: "Grievance assigned successfully",
    grievance
  });
});

/**
 * @route   POST /api/grievances/:id/notes
 * @desc    Add admin note to grievance
 * @access  Private (Admin)
 * @param   {String} id - Grievance ID
 * @body    {String} content - Note content
 * @body    {String} noteType - Note type (Update, Resolution, Assignment, System)
 * @returns {Object} - Updated grievance
 */
const addAdminNote = asyncHandler(async (req, res) => {
  const { content, noteType = "Update" } = req.body;
  const adminId = req.admin?._id || req.user?._id;

  if (!content || content.trim().length === 0) {
    res.status(400);
    throw new Error("Note content is required");
  }

  const grievance = await Grievance.findById(req.params.id);
  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  grievance.addNote(content.trim(), adminId, "Admin", noteType);
  await grievance.save();

  await grievance.populate("userId", "username email contact address");
  await grievance.populate("areaId", "name district");
  await grievance.populate("assignedTo", "collectorName truckNumber");

  res.json({
    success: true,
    message: "Note added successfully",
    grievance
  });
});

/**
 * @route   GET /api/grievances/area/:areaId
 * @desc    Get grievances by area
 * @access  Private (Admin)
 * @param   {String} areaId - Area ID
 * @query   {String} status - Optional status filter
 * @returns {Object} - Area grievances and statistics
 */
const getGrievancesByArea = asyncHandler(async (req, res) => {
  const { areaId } = req.params;
  const { status } = req.query;

  // Verify area exists
  const area = await Area.findById(areaId);
  if (!area) {
    res.status(404);
    throw new Error("Area not found");
  }

  // Get grievances
  const grievances = await Grievance.getByArea(areaId, status);

  // Get area-specific statistics
  const stats = await Grievance.getStatistics({ areaId });

  res.json({
    success: true,
    area: {
      _id: area._id,
      name: area.name,
      district: area.district
    },
    grievances,
    statistics: stats
  });
});

/**
 * @route   POST /api/grievances/area/:areaId/optimize
 * @desc    Trigger route optimization for an area
 * @access  Private (Admin)
 * @param   {String} areaId - Area ID
 * @body    {Boolean} urgent - Whether this is urgent optimization
 * @body    {String} excludeCollectorId - Collector to exclude from optimization
 * @returns {Object} - Optimization results
 */
const triggerRouteOptimization = asyncHandler(async (req, res) => {
  const { areaId } = req.params;
  const { urgent = false, excludeCollectorId } = req.body;

  // Verify area exists
  const area = await Area.findById(areaId);
  if (!area) {
    res.status(404);
    throw new Error("Area not found");
  }

  // Trigger optimization
  const result = await routeOptimizer.triggerReevaluation(areaId, {
    urgent,
    excludeCollectorId
  });

  res.json({
    success: result.success,
    message: result.message,
    optimizationResults: result
  });
});

/**
 * @route   GET /api/grievances/area/:areaId/recommendations
 * @desc    Get optimization recommendations for an area
 * @access  Private (Admin)
 * @param   {String} areaId - Area ID
 * @returns {Object} - Optimization recommendations
 */
const getOptimizationRecommendations = asyncHandler(async (req, res) => {
  const { areaId } = req.params;

  // Verify area exists
  const area = await Area.findById(areaId);
  if (!area) {
    res.status(404);
    throw new Error("Area not found");
  }

  // Get recommendations
  const recommendations = await routeOptimizer.getOptimizationRecommendations(areaId);

  res.json({
    success: true,
    area: {
      _id: area._id,
      name: area.name,
      district: area.district
    },
    recommendations
  });
});

// ============ COLLECTOR GRIEVANCE OPERATIONS ============

/**
 * @route   GET /api/grievances/assigned
 * @desc    Get grievances assigned to collector
 * @access  Private (Authenticated Collector)
 * @query   {String} status - Optional status filter
 * @returns {Object} - Assigned grievances
 */
const getAssignedGrievances = asyncHandler(async (req, res) => {
  const collectorId = req.collector._id;
  const { status } = req.query;

  // Get assigned grievances
  const grievances = await Grievance.getAssignedToCollector(collectorId, status);

  // Get collector statistics
  const stats = await Grievance.aggregate([
    { $match: { assignedTo: collectorId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
        critical: { $sum: { $cond: [{ $eq: ["$severity", "Critical"] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ["$severity", "High"] }, 1, 0] } }
      }
    }
  ]);

  res.json({
    success: true,
    grievances,
    statistics: stats[0] || { total: 0, inProgress: 0, resolved: 0, critical: 0, high: 0 }
  });
});

/**
 * @route   PUT /api/grievances/:id/resolve
 * @desc    Mark grievance as resolved by collector
 * @access  Private (Authenticated Collector)
 * @param   {String} id - Grievance ID
 * @body    {String} resolutionNote - Resolution details
 * @returns {Object} - Updated grievance
 */
const resolveGrievance = asyncHandler(async (req, res) => {
  const { resolutionNote } = req.body;
  const collectorId = req.collector._id;

  if (!resolutionNote || resolutionNote.trim().length === 0) {
    res.status(400);
    throw new Error("Resolution note is required");
  }

  const grievance = await Grievance.findOne({
    _id: req.params.id,
    assignedTo: collectorId
  });

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found or not assigned to you");
  }

  if (grievance.status === "Resolved" || grievance.status === "Closed") {
    res.status(400);
    throw new Error("Grievance is already resolved");
  }

  // Update status and add resolution note
  grievance.updateStatus("Resolved", collectorId, "Collector", "Resolved by collector");
  grievance.addNote(resolutionNote.trim(), collectorId, "Collector", "Resolution");
  
  await grievance.save();

  // Populate related data
  await grievance.populate("userId", "username email contact address");
  await grievance.populate("areaId", "name district");

  res.json({
    success: true,
    message: "Grievance resolved successfully",
    grievance
  });
});

/**
 * @route   POST /api/grievances/:id/collector-note
 * @desc    Add collector note to grievance
 * @access  Private (Authenticated Collector)
 * @param   {String} id - Grievance ID
 * @body    {String} content - Note content
 * @returns {Object} - Updated grievance
 */
const addCollectorNote = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const collectorId = req.collector._id;

  if (!content || content.trim().length === 0) {
    res.status(400);
    throw new Error("Note content is required");
  }

  const grievance = await Grievance.findOne({
    _id: req.params.id,
    assignedTo: collectorId
  });

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found or not assigned to you");
  }

  grievance.addNote(content.trim(), collectorId, "Collector", "Update");
  await grievance.save();

  await grievance.populate("userId", "username email contact address");
  await grievance.populate("areaId", "name district");

  res.json({
    success: true,
    message: "Note added successfully",
    grievance
  });
});

// ============ UTILITY FUNCTIONS ============

/**
 * @route   GET /api/grievances/statistics
 * @desc    Get overall grievance statistics
 * @access  Private (Admin)
 * @query   {String} areaId - Optional area filter
 * @query   {String} startDate - Optional start date filter
 * @query   {String} endDate - Optional end date filter
 * @returns {Object} - Comprehensive statistics
 */
const getGrievanceStatistics = asyncHandler(async (req, res) => {
  const { areaId, startDate, endDate } = req.query;

  const filters = {};
  if (areaId) filters.areaId = areaId;
  if (startDate) filters.startDate = new Date(startDate);
  if (endDate) filters.endDate = new Date(endDate);

  const stats = await Grievance.getStatistics(filters);

  // Get additional metrics
  const additionalStats = await Promise.all([
    // Top areas by grievance count
    Grievance.aggregate([
      { $match: filters.areaId ? { areaId: filters.areaId } : {} },
      { $group: { _id: "$areaId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: "areas", localField: "_id", foreignField: "_id", as: "area" } },
      { $unwind: "$area" },
      { $project: { areaName: "$area.name", district: "$area.district", count: 1 } }
    ]),
    
    // Average resolution time by severity
    Grievance.aggregate([
      { $match: { resolvedAt: { $ne: null }, ...filters } },
      {
        $group: {
          _id: "$severity",
          avgResolutionTime: { $avg: { $subtract: ["$resolvedAt", "$createdAt"] } },
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  res.json({
    success: true,
    statistics: {
      ...stats,
      topAreas: additionalStats[0],
      resolutionTimesBySeverity: additionalStats[1]
    }
  });
});

export {
  // User operations
  createGrievance,
  getUserGrievances,
  addUserNote,
  
  // Admin operations
  getAllGrievances,
  updateGrievanceStatus,
  assignGrievanceToCollector,
  addAdminNote,
  getGrievancesByArea,
  triggerRouteOptimization,
  getOptimizationRecommendations,
  
  // Collector operations
  getAssignedGrievances,
  resolveGrievance,
  addCollectorNote,
  
  // Utility
  getGrievanceStatistics
};
