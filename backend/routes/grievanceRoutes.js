import express from "express";
import mongoose from "mongoose";
import {
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
} from "../controllers/grievanceController.js";

// Import authentication middleware
import { authenticate } from "../middlewares/authMiddleware.js";
import { authenticateCollector } from "../middleware/collectorAuthMiddleware.js";

/**
 * Grievance Routes
 * Organized by user role and functionality
 * Follows RESTful conventions and proper authentication
 */

const router = express.Router();

// ============ USER ROUTES (Authenticated Users) ============

/**
 * User Grievance Management
 * Users can create grievances for their bins and track progress
 */

// Create a new grievance
router.post("/create", authenticate, createGrievance);

// Get user's own grievances with pagination and filtering
router.get("/user/my-grievances", authenticate, getUserGrievances);

// Add a note to user's own grievance
router.post("/:id/user-note", authenticate, addUserNote);

// ============ ADMIN ROUTES (Admin Authentication Required) ============

/**
 * Admin Grievance Management
 * Admins have full access to all grievances and can manage assignments
 * 
 * Note: Using authenticate middleware for now
 * TODO: Replace with authenticateAdmin when admin auth is implemented
 */

// Get all grievances with advanced filtering and pagination
router.get("/all", authenticate, getAllGrievances);

// Get comprehensive grievance statistics
router.get("/statistics", authenticate, getGrievanceStatistics);

// Update grievance status (Open, In Progress, Resolved, Closed)
router.put("/:id/status", authenticate, updateGrievanceStatus);

// Assign grievance to a collector
router.put("/:id/assign", authenticate, assignGrievanceToCollector);

// Add admin note to grievance
router.post("/:id/notes", authenticate, addAdminNote);

// Get grievances by specific area
router.get("/area/:areaId", authenticate, getGrievancesByArea);

// Trigger route optimization for an area
router.post("/area/:areaId/optimize", authenticate, triggerRouteOptimization);

// Get optimization recommendations for an area
router.get("/area/:areaId/recommendations", authenticate, getOptimizationRecommendations);

// ============ COLLECTOR ROUTES (Collector Authentication Required) ============

/**
 * Collector Grievance Operations
 * Collectors can view assigned grievances and update their status
 */

// Get grievances assigned to the authenticated collector
router.get("/assigned", authenticateCollector, getAssignedGrievances);

// Mark grievance as resolved with resolution note
router.put("/:id/resolve", authenticateCollector, resolveGrievance);

// Add collector note to assigned grievance
router.post("/:id/collector-note", authenticateCollector, addCollectorNote);

// ============ MIXED ACCESS ROUTES ============

/**
 * Routes that can be accessed by multiple user types
 * These use conditional authentication based on the request
 */

// Get single grievance details (accessible by owner, assigned collector, or admin)
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const grievanceId = req.params.id;
    const userId = req.user?._id;
    const collectorId = req.collector?._id;
    
    // Build query based on user type
    let query = { _id: grievanceId };
    
    // If regular user, can only see their own grievances
    if (userId && !req.user.isAdmin) {
      query.userId = userId;
    }
    
    // If collector, can only see assigned grievances
    if (collectorId) {
      query.assignedTo = collectorId;
    }
    
    const Grievance = (await import("../models/grievanceModel.js")).default;
    
    const grievance = await Grievance.findOne(query)
      .populate("userId", "username email contact")
      .populate("areaId", "name district postalCode")
      .populate("assignedTo", "collectorName truckNumber contactNo");
    
    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "Grievance not found or you don't have permission to view it"
      });
    }
    
    res.json({
      success: true,
      grievance
    });
    
  } catch (error) {
    next(error);
  }
});

// ============ ROUTE VALIDATION MIDDLEWARE ============

/**
 * Middleware to validate ObjectId parameters
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

// Apply ObjectId validation to routes that need it
router.param('id', (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid grievance ID format"
    });
  }
  next();
});

router.param('areaId', (req, res, next, areaId) => {
  if (!mongoose.Types.ObjectId.isValid(areaId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid area ID format"
    });
  }
  next();
});

// ============ ERROR HANDLING MIDDLEWARE ============

/**
 * Grievance-specific error handler
 * Provides user-friendly error messages for common grievance operations
 */
router.use((error, req, res, next) => {
  console.error(`Grievance Route Error: ${error.message}`);
  
  // Handle specific grievance errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format"
    });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry detected"
    });
  }
  
  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ============ ROUTE DOCUMENTATION ============

/**
 * API Documentation Route
 * Provides endpoint documentation for developers
 */
router.get("/docs", (req, res) => {
  const documentation = {
    title: "Grievance Management API",
    version: "1.0.0",
    description: "API endpoints for managing citizen grievances in the waste collection system",
    baseUrl: "/api/grievances",
    endpoints: {
      user: {
        "POST /create": {
          description: "Create a new grievance",
          auth: "User token required",
          body: {
            binId: "string (required) - Bin ID from user's registered bin",
            severity: "string (required) - Low, Medium, High, Critical",
            description: "string (required) - Issue description (10-500 chars)"
          }
        },
        "GET /user/my-grievances": {
          description: "Get user's grievances",
          auth: "User token required",
          query: {
            status: "string (optional) - Filter by status",
            page: "number (optional) - Page number (default: 1)",
            limit: "number (optional) - Items per page (default: 10)"
          }
        },
        "POST /:id/user-note": {
          description: "Add note to user's grievance",
          auth: "User token required",
          body: {
            content: "string (required) - Note content"
          }
        }
      },
      admin: {
        "GET /all": {
          description: "Get all grievances with filtering",
          auth: "Admin token required",
          query: {
            status: "string (optional) - Filter by status",
            severity: "string (optional) - Filter by severity",
            areaId: "string (optional) - Filter by area",
            assignedTo: "string (optional) - Filter by collector",
            escalated: "boolean (optional) - Filter escalated grievances",
            page: "number (optional) - Page number",
            limit: "number (optional) - Items per page",
            sortBy: "string (optional) - Sort field",
            sortOrder: "string (optional) - asc or desc"
          }
        },
        "PUT /:id/assign": {
          description: "Assign grievance to collector",
          auth: "Admin token required",
          body: {
            collectorId: "string (required) - Collector ID",
            reason: "string (optional) - Assignment reason"
          }
        },
        "POST /area/:areaId/optimize": {
          description: "Trigger route optimization",
          auth: "Admin token required",
          body: {
            urgent: "boolean (optional) - Urgent optimization",
            excludeCollectorId: "string (optional) - Collector to exclude"
          }
        }
      },
      collector: {
        "GET /assigned": {
          description: "Get assigned grievances",
          auth: "Collector token required",
          query: {
            status: "string (optional) - Filter by status"
          }
        },
        "PUT /:id/resolve": {
          description: "Mark grievance as resolved",
          auth: "Collector token required",
          body: {
            resolutionNote: "string (required) - Resolution details"
          }
        }
      }
    },
    statusCodes: {
      200: "Success",
      201: "Created successfully",
      400: "Bad request - validation error",
      401: "Unauthorized - invalid or missing token",
      403: "Forbidden - insufficient permissions",
      404: "Not found",
      500: "Internal server error"
    }
  };
  
  res.json(documentation);
});

export default router;
