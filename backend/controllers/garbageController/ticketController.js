import asyncHandler from "../../middlewares/asyncHandler.js";
import Grievance from "../../models/grievanceModel.js";
import Garbage from "../../models/garbageModel.js";

/**
 * Create a maintenance ticket (grievance) for a bin
 * POST /api/garbage/:binId/ticket
 * Access: Authenticated User
 */
export const createBinTicket = asyncHandler(async (req, res) => {
  const { binId } = req.params;
  const { severity = "Medium", description } = req.body;

  // Validate inputs
  if (!description) {
    res.status(400);
    throw new Error("Description is required");
  }

  // Find bin in DB
  const bin = await Garbage.findOne({ binId });
  if (!bin) {
    res.status(404);
    throw new Error("Bin not found");
  }

  // Create grievance record
  const grievanceData = {
    binId: bin.binId,
    garbageId: bin._id,
    areaId: bin.area,
    description,
    severity,
    userId: req.user._id,
    status: "Open"
  };

  const grievance = new Grievance(grievanceData);
  const created = await grievance.save();

  // Populate references for response
  await created.populate([
    { path: "userId", select: "username email" },
    { path: "areaId", select: "name" }
  ]);

  res.status(201).json({
    success: true,
    message: "Maintenance ticket submitted successfully",
    grievance: created
  });
});