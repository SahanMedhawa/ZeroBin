import API from "../helpers/apiHelper";

const createSmartDeviceRequest = async (deviceRequest) => {
  try {
    const createdRequest = await new API().post("smartDevices", deviceRequest);
    return createdRequest;
  } catch (error) {
    console.error("Error creating smart device request:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getAllSmartDeviceRequests = async () => {
  try {
    const deviceRequests = await new API().get("smartDevices", {});
    return deviceRequests;
  } catch (error) {
    console.error("Error fetching smart device requests:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getUserAllSmartDeviceRequests = async () => {
  try {
    const userDeviceRequests = await new API().get(
      "smartDevices/my-devices",
      {}
    );
    return userDeviceRequests;
  } catch (error) {
    console.error("Error fetching user smart device requests:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const updateSmartDeviceRequest = async (status, id) => {
  // Ensure the body only contains the status
  const body = { status };

  try {
    const updatedRequest = await new API().put(`smartDevices/${id}`, body);
    return updatedRequest;
  } catch (error) {
    console.error("Error updating smart device request:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const deleteSmartDeviceRequest = async (id) => {
  try {
    const deletedRequest = await new API().delete(`smartDevices/${id}`);
    return deletedRequest.data;
  } catch (error) {
    console.error("Error deleting smart device request:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

export {
  createSmartDeviceRequest,
  getAllSmartDeviceRequests,
  getUserAllSmartDeviceRequests,
  updateSmartDeviceRequest,
  deleteSmartDeviceRequest,
};
