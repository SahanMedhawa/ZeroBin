import API from "../helpers/apiHelper";

// ============ BIN REGISTRATION & MANAGEMENT ============

/**
 * Register a new garbage bin (one-time per user)
 * @param {Object} binData - { area, address, longitude, latitude, type }
 * @returns {Promise<Object>} Registered bin with sensor data
 */
const registerBin = async (binData) => {
  try {
    const response = await new API().post("garbage/register-bin", binData);
    return response;
  } catch (error) {
    console.error("Error registering bin:", error.message);
    throw error;
  }
};

/**
 * Get user's registered bin
 * @returns {Promise<Object>} User's bin with sensor data
 */
const getUserBin = async () => {
  try {
    const response = await new API().get("garbage/user/my-bin");
    return response.bin;
  } catch (error) {
    console.error("Error fetching user bin:", error.message);
    throw error;
  }
};

/**
 * Check if user has a registered bin
 * @returns {Promise<Object>} { hasBin: Boolean, binId: String }
 */
const checkUserHasBin = async () => {
  try {
    const response = await new API().get("garbage/user/check-bin");
    return response;
  } catch (error) {
    console.error("Error checking user bin:", error.message);
    throw error;
  }
};

// ============ SENSOR DATA MANAGEMENT ============

/**
 * Update bin sensor fill level
 * @param {String} binId - Unique bin identifier
 * @param {String} fillLevel - Empty, Low, Medium, High, Full
 * @returns {Promise<Object>} Updated bin with new sensor data
 */
const updateBinSensor = async (binId, fillLevel) => {
  try {
    const response = await new API().put(`garbage/sensor/${binId}`, {
      fillLevel,
    });
    return response;
  } catch (error) {
    console.error("Error updating sensor:", error.message);
    throw error;
  }
};

/**
 * Get sensor update history for a bin
 * @param {String} binId - Unique bin identifier
 * @returns {Promise<Array>} Sensor update history
 */
const getSensorHistory = async (binId) => {
  try {
    const response = await new API().get(`garbage/sensor-history/${binId}`);
    return response.history;
  } catch (error) {
    console.error("Error fetching sensor history:", error.message);
    throw error;
  }
};

// ============ COLLECTOR OPERATIONS ============

/**
 * Get full bins for collector (based on assigned areas)
 * @returns {Promise<Array>} List of bins needing collection
 */
const getFullBinsForCollector = async () => {
  try {
    const response = await new API().get("garbage/collector/full-bins");
    return response.bins;
  } catch (error) {
    console.error("Error fetching full bins:", error.message);
    throw error;
  }
};

/**
 * Mark bin as collected and reset sensor
 * @param {String} binId - Garbage bin ID
 * @param {Number} weight - Collected weight in kg (optional)
 * @returns {Promise<Object>} Updated bin with reset sensor
 */
const markBinCollected = async (binId, weight = null) => {
  try {
    const body = weight ? { weight } : {};
    const response = await new API().put(`garbage/${binId}/collect`, body);
    return response;
  } catch (error) {
    console.error("Error marking bin collected:", error.message);
    throw error;
  }
};

// ============ LEGACY FUNCTIONS (EXISTING) ============

const createGarbage = async (garbage) => {
  try {
    const createdGarbage = await new API().post("garbage", garbage);
    return createdGarbage;
  } catch (error) {
    console.error("Error creating inquiry:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getAllGarbages = async () => {
  try {
    const garbages = await new API().get("garbage", {});
    // console.log("garbagesINjs => ", garbages);
    return garbages;
  } catch (error) {
    console.error("Error fetching garbages:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getAllDriverGarbages = async () => {
  try {
    const garbages = await new API().get("garbage/driver-garbage", {});
    // console.log("garbagesINjs => ", garbages);
    return garbages;
  } catch (error) {
    console.error("Error fetching garbages:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getUserAllGarbages = async () => {
  try {
    const garbages = await new API().get("garbage/garbage-requests", {});
    // console.log("garbagesINjs => ", garbages);
    return garbages;
  } catch (error) {
    console.error("Error fetching garbages:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const updateGarbage = async (status, id) => {
  // Ensure the body only contains the status
  const body = { status };

  try {
    const updatedGarbage = await new API().put(
      `garbage/${id}`, // Make sure this URL matches your API endpoint for garbage requests
      body
    );
    // console.log(updatedGarbage);
    return updatedGarbage;
  } catch (error) {
    console.error("Error updating garbage:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const deleteGarbage = async (id) => {
  try {
    const deletedGarbage = await new API().delete(`garbage/${id}`);
    // console.log("deletedGarbage => ", deletedGarbage);
    return deletedGarbage.data;
  } catch (error) {
    console.error("Error deleting Inquiry:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

export {
  // New Bin Registration & Sensor Management
  registerBin,
  getUserBin,
  checkUserHasBin,
  updateBinSensor,
  getSensorHistory,
  getFullBinsForCollector,
  markBinCollected,
  // Legacy functions
  createGarbage,
  getAllGarbages,
  getUserAllGarbages,
  getAllDriverGarbages,
  updateGarbage,
  deleteGarbage,
};
