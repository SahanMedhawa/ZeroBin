import asyncHandler from "express-async-handler";
import wmaDashboardService from "../services/WMADashboardService.js";

/**
 * WMA Dashboard Controller
 *
 * Single Responsibility: Handle HTTP requests for dashboard endpoints
 * Open/Closed: New endpoints can be added without modifying existing ones
 *
 * Design Pattern: Controller Pattern
 * Justification: Separates request handling from business logic (Service Layer)
 *
 * SOLID Adherence:
 * - SRP: Only handles request/response logic, delegates to service
 * - DIP: Depends on WMADashboardService abstraction
 *
 * @module wmaDashboardController
 */

/**
 * @route   GET /api/wmas/dashboard/overview
 * @desc    Get comprehensive dashboard overview for WMA
 * @access  Private (WMA only)
 * @returns {Object} Complete dashboard data
 *
 * Performance: O(n) where n = total entities (areas, requests, vehicles)
 * Optimization: Parallel service calls reduce latency
 *
 * @example
 * Response:
 * {
 *   totalIncome: 156750,
 *   areaBreakdown: [...],
 *   recentRequests: [...],
 *   activeVehicles: [...],
 *   performanceMetrics: {...}
 * }
 */
const getDashboardOverview = asyncHandler(async (req, res) => {
  const wmaId = req.wma._id;

  try {
    // Parallel execution for optimal performance (reduces time from O(5n) to O(n))
    const [
      totalIncome,
      areaBreakdown,
      recentRequests,
      activeVehicles,
      performanceMetrics,
    ] = await Promise.all([
      wmaDashboardService.calculateTotalIncome(wmaId),
      wmaDashboardService.getAreaBreakdown(wmaId),
      wmaDashboardService.getRecentRequests(wmaId),
      wmaDashboardService.getActiveVehicles(wmaId),
      wmaDashboardService.calculatePerformanceMetrics(wmaId),
    ]);

    res.json({
      success: true,
      data: {
        totalIncome,
        areaBreakdown,
        recentRequests,
        activeVehicles,
        performanceMetrics,
        totalSchedules: await Schedule.countDocuments({ wmaId }),
        registeredCollectors: await Collector.countDocuments({ wmaId }),
        totalGarbageRequests: await Garbage.countDocuments({ wmaId }),
        pendingGarbages: await Garbage.countDocuments({
          wmaId,
          status: "Pending",
        }),
        inProgressGarbages: await Garbage.countDocuments({
          wmaId,
          status: "In Progress",
        }),
        collectedGarbages: await Garbage.countDocuments({
          wmaId,
          status: "Collected",
        }),
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Dashboard data fetch failed: ${error.message}`);
  }
});

/**
 * @route   GET /api/wmas/dashboard/income
 * @desc    Get total income for date range
 * @access  Private (WMA only)
 * @query   {Date} startDate - Optional start date
 * @query   {Date} endDate - Optional end date
 * @returns {Object} Income data
 */
const getTotalIncome = asyncHandler(async (req, res) => {
  const wmaId = req.wma._id;
  const { startDate, endDate } = req.query;

  const income = await wmaDashboardService.calculateTotalIncome(
    wmaId,
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined
  );

  res.json({ success: true, totalIncome: income });
});

/**
 * @route   GET /api/wmas/dashboard/areas
 * @desc    Get area-wise breakdown
 * @access  Private (WMA only)
 * @returns {Array} Area breakdown data
 */
const getAreaBreakdown = asyncHandler(async (req, res) => {
  const wmaId = req.wma._id;
  const breakdown = await wmaDashboardService.getAreaBreakdown(wmaId);
  res.json({ success: true, areaBreakdown: breakdown });
});

/**
 * @route   GET /api/wmas/dashboard/requests
 * @desc    Get recent garbage collection requests
 * @access  Private (WMA only)
 * @query   {Number} limit - Max number of requests
 * @returns {Array} Recent requests
 */
const getRecentRequests = asyncHandler(async (req, res) => {
  const wmaId = req.wma._id;
  const limit = parseInt(req.query.limit) || 50;

  const requests = await wmaDashboardService.getRecentRequests(wmaId, limit);
  res.json({ success: true, recentRequests: requests });
});

/**
 * @route   GET /api/wmas/dashboard/vehicles
 * @desc    Get active vehicles status
 * @access  Private (WMA only)
 * @returns {Array} Active vehicles data
 */
const getActiveVehicles = asyncHandler(async (req, res) => {
  const wmaId = req.wma._id;
  const vehicles = await wmaDashboardService.getActiveVehicles(wmaId);
  res.json({ success: true, activeVehicles: vehicles });
});

/**
 * @route   GET /api/wmas/dashboard/metrics
 * @desc    Get performance metrics
 * @access  Private (WMA only)
 * @returns {Object} Performance metrics
 */
const getPerformanceMetrics = asyncHandler(async (req, res) => {
  const wmaId = req.wma._id;
  const metrics = await wmaDashboardService.calculatePerformanceMetrics(wmaId);
  res.json({ success: true, performanceMetrics: metrics });
});

export {
  getDashboardOverview,
  getTotalIncome,
  getAreaBreakdown,
  getRecentRequests,
  getActiveVehicles,
  getPerformanceMetrics,
};
