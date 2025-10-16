import API from "../helpers/apiHelper";

const createCollector = async (collector) => {
  try {
    console.log("API call: Creating collector with data:", collector);
    const createdCollector = await new API().post("collector", collector);
    console.log("API response:", createdCollector);
    return createdCollector;
  } catch (error) {
    console.error("Error creating collector in API:", error);
    console.error("Error message:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getAllCollectors = async () => {
  try {
    const collectors = await new API().get("collector", {});
    // console.log("garbagesINjs => ", garbages);
    return collectors;
  } catch (error) {
    console.error("Error fetching collectors:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getAllCollectorsInWma = async (id) => {
  try {
    const collectors = await new API().get(`collector/wma-collectors/${id}`, {});
    return collectors;
  } catch (error) {
    console.error("Error fetching collectors:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

// const getUserAllGarbages = async () => {
//   try {
//     const garbages = await new API().get("garbage/garbage-requests", {});
//     // console.log("garbagesINjs => ", garbages);
//     return garbages;
//   } catch (error) {
//     console.error("Error fetching garbages:", error.message);
//     throw error; // Rethrow the error for the component to handle
//   }
// };

const updateCollector = async (status, id) => {
  // Ensure the body only contains the status
  try {
    const updatedCollector = await new API().put(
      `collector/${id}`, // Make sure this URL matches your API endpoint for garbage requests
      status
    );
    // console.log(updatedGarbage);
    return updatedCollector;
  } catch (error) {
    console.error("Error updating collector:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const deleteCollector = async (id) => {
  try {
    const deletedCollector = await new API().delete(`collector/${id}`);
    // console.log("deletedGarbage => ", deletedGarbage);
    return deletedCollector.data;
  } catch (error) {
    console.error("Error deleting Collector:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

// Collector Portal Authentication APIs
const loginCollector = async (collectorNIC, truckNumber) => {
  try {
    const response = await new API().post("collector/auth", {
      collectorNIC,
      truckNumber,
    });
    return response;
  } catch (error) {
    console.error("Error logging in collector:", error.message);
    throw error;
  }
};

const getCollectorProfile = async () => {
  try {
    const profile = await new API().get("collector/profile");
    return profile;
  } catch (error) {
    console.error("Error fetching collector profile:", error.message);
    throw error;
  }
};

const logoutCollector = async () => {
  try {
    const response = await new API().post("collector/logout", {});
    return response;
  } catch (error) {
    console.error("Error logging out collector:", error.message);
    throw error;
  }
};

// Schedule APIs
const getCollectorSchedules = async (options = {}) => {
  try {
    // options can include: { limit, fields, status }
    const schedules = await new API().get("schedule/collector-schedules", options);
    return schedules;
  } catch (error) {
    console.error("Error fetching collector schedules:", error.message);
    throw error;
  }
};

const updateScheduleStatus = async (scheduleId, status) => {
  try {
    const updated = await new API().put(`schedule/${scheduleId}/status`, { status });
    return updated;
  } catch (error) {
    console.error("Error updating schedule status:", error.message);
    throw error;
  }
};

// Transaction APIs
const createTransaction = async (transactionData) => {
  try {
    const transaction = await new API().post("transaction", transactionData);
    return transaction;
  } catch (error) {
    console.error("Error creating transaction:", error.message);
    throw error;
  }
};

// Area APIs
const getAreaById = async (areaId) => {
  try {
    const area = await new API().get(`area/${areaId}`);
    return area;
  } catch (error) {
    console.error("Error fetching area:", error.message);
    throw error;
  }
};

export {
    createCollector,
    getAllCollectors,
    deleteCollector,
    getAllCollectorsInWma,
    updateCollector,
    // Collector Portal APIs
    loginCollector,
    getCollectorProfile,
    logoutCollector,
    getCollectorSchedules,
    updateScheduleStatus,
    // Removed: Smart Device APIs - Dead code (replaced by Smart Bin system)
    createTransaction,
    getAreaById
};
