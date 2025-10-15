import Schedule from "../models/scheduleModel.js";
import Collector from "../models/collectorModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

/**
 * @route   POST /api/schedule
 * @desc    Create a new schedule request
 * @access  Private
 * @param   {Object} wmaId - The id of the wast management authority (required)
 * @param   {Object} collectorId - The id of the collector (required)
 * @param   {String} area - The area of the collection (required)
 * @param   {String} time - the time of schedule (required)
 * @param   {String} date - the date of schedule (required)
 * @returns {Object} - A JSON object containing the newly created schedule data
 */
const createSchedule = asyncHandler(async (req, res) => {
  const { wmaId, collectorId, area, date, time} = req.body;

  if (!wmaId || !collectorId || !area || !date || !time ) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  // Create schedule
  const schedule = new Schedule({
    wmaId,
    collectorId,
    area,
    date,
    time,
    longitude: null,
    latitude: null,
    status: 'Pending'
  });

  const createdSchedule = await schedule.save();

  // Update collector's assignedAreas if not already assigned
  const collector = await Collector.findById(collectorId);
  if (collector && !collector.assignedAreas.includes(area)) {
    collector.assignedAreas.push(area);
    await collector.save();
  }

  res.status(201).json(createdSchedule);
});

/**
 * @route   GET /api/schedule
 * @desc    Get all schedules for the authenticated WMA
 * @access  Private/WMA
 * @returns {Array} - A list of schedules for the WMA
 */
const getAllSchedules = asyncHandler(async (req, res) => {
  // Get schedules only for the authenticated WMA
  const schedules = await Schedule.find({ wmaId: req.wma._id })
    .populate("wmaId", "wmaname")
    .populate("collectorId", "collectorName")
    .populate("area", "name");
  res.json(schedules);
});

/**
 * @route   GET /api/schedules/my-schedules
 * @desc    Get all schedules assingd to the truck
 * @access  Private (Authenticated Truck)
 * @returns {Array} - A list of schedules assingd to the truck
 */
const getTruckSchedules = asyncHandler(async (req, res) => {
  const schedule = await Schedule.find({ collectorId: req.collector._id }).populate("area", "name")

  res.json(schedule);
});

/**
 * @route   GET /api/schedules/wma-schedules
 * @desc    Get all schedules assingd to the wma
 * @access  Private (Authenticated WMA)
 * @returns {Array} - A list of schedules assingd to the truck
 */
const getSchedulesByWma = asyncHandler(async (req, res) => {
  const schedule = await Schedule.find({ wmaId: req.params.id })
  .populate("wmaId", "wmaname")
  .populate("collectorId", "collectorName")
  .populate("area", "name");
  res.json(schedule);
});

/**
 * @route   GET /api/schedule/:id
 * @desc    Get a single schedule by ID
 * @access  Private
 * @returns {Object} - A single schedule
 */
const getScheduleById = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
  if (schedule) {
    res.json(schedule);
  } else {
    res.status(404);
    throw new Error("Schedule request not found");
  }
});

/**
 * @route   PUT /api/schedule/:id
 * @desc    Update a schedule (WMA only)
 * @access  Private/WMA
 * @param   {Object} wmaId - The id of the WMA (required)
 * @param   {Object} collectorId - The id of the collector (required)
 * @param   {String} area - The area of the collection (required)
 * @param   {String} time - the time of schedule (required)
 * @param   {String} date - the date of schedule (required)
 * @returns {Object} - The updated schedule
 */
const updateSchedule = asyncHandler(async (req, res) => {
  const { wmaId, collectorId, area, date, time, longitude, latitude, status} = req.body;

  const schedule = await Schedule.findById(req.params.id);

  if (schedule) {
    schedule.wmaId = wmaId || schedule.wmaId;
    schedule.collectorId = collectorId || schedule.collectorId;
    schedule.area = area || schedule.area;
    schedule.date = date || schedule.date;
    schedule.time = time || schedule.time;
    schedule.longitude = longitude || schedule.longitude;
    schedule.latitude = latitude || schedule.latitude;
    schedule.status = status || schedule.status;

    const updatedSchedule = await schedule.save();
    res.json(updatedSchedule);
  } else {
    res.status(404);
    throw new Error("Schedule request not found");
  }
});

/**
 * @route   PUT /api/schedule/:id/status
 * @desc    Update schedule status (Collector only - can only update status field)
 * @access  Private/Collector
 * @param   {String} status - The new status (Pending, In Progress, Completed)
 * @returns {Object} - The updated schedule
 */
const updateScheduleStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    res.status(404);
    throw new Error("Schedule not found");
  }

  // Verify collector is assigned to this schedule
  if (schedule.collectorId.toString() !== req.collector._id.toString()) {
    res.status(403);
    throw new Error("You are not assigned to this schedule");
  }

  schedule.status = status;
  const updatedSchedule = await schedule.save();

  await updatedSchedule.populate("wmaId", "wmaname");
  await updatedSchedule.populate("collectorId", "collectorName");
  await updatedSchedule.populate("area", "name");

  res.json(updatedSchedule);
});

/**
 * @route   DELETE /api/schedule/:id
 * @desc    Delete a schedule (WMA only)
 * @access  Private/WMA
 * @returns {Object} - A JSON object confirming deletion
 */
const deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);

  if (schedule) {
    res.json({ message: "Schedule removed successfully!" });
  } else {
    res.status(404);
    throw new Error("Schedule not found!");
  }
});

/**
 * @route   GET /api/schedule/active
 * @desc    Get all active schedules (In Progress status)
 * @access  Private
 * @returns {Object} - Active schedules with populated collector and area data
 */
const getActiveSchedules = asyncHandler(async (req, res) => {
  const activeSchedules = await Schedule.find({ status: "In Progress" })
    .populate("collectorId", "collectorName truckNumber contactNo statusOfCollector")
    .populate("area", "name district postalCode")
    .populate("wmaId", "wmaName contactNo")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    schedules: activeSchedules,
    count: activeSchedules.length
  });
});

export {
  createSchedule,
  getAllSchedules,
  getTruckSchedules,
  getScheduleById,
  updateSchedule,
  updateScheduleStatus,
  deleteSchedule,
  getSchedulesByWma,
  getActiveSchedules,
};
