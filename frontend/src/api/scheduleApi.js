import API from "../helpers/apiHelper";

const createSchedule = async (schedule) => {
  try {
    const createdSchedule = await new API().post("schedule", schedule);
    return createdSchedule;
  } catch (error) {
    console.error("Error creating schedule:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getAllSchedules = async () => {
  try {
    const schedules = await new API().get("schedule", {});
    // console.log("garbagesINjs => ", garbages);
    return schedules;
  } catch (error) {
    console.error("Error fetching schedules:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getAllSchedulesInWma = async (id) => {
  try {
    const schedule = await new API().get(`schedule/wma-schedules/${id}`, {});
    return schedule;
  } catch (error) {
    console.error("Error fetching schedule:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

// const getAllDriverGarbages = async () => {
//   try {
//     const garbages = await new API().get("garbage/driver-garbage", {});
//     // console.log("garbagesINjs => ", garbages);
//     return garbages;
//   } catch (error) {
//     console.error("Error fetching garbages:", error.message);
//     throw error; // Rethrow the error for the component to handle
//   }
// };

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

// const updateSchedule = async (id, data) => {
//   // Ensure the body only contains the status
//   const body = { status };

//   try {
//     const updatedSchedule = await new API().put(
//       `schedules/${id}`, // Make sure this URL matches your API endpoint for garbage requests
//       body
//     );
//     // console.log(updatedGarbage);
//     return updatedSchedule;
//   } catch (error) {
//     console.error("Error updating schedule:", error.message);
//     throw error; // Rethrow the error for the component to handle
//   }
// };

  const updateSchedule = async (data, id) => {
    try {
      const updatedSchedule = await new API().put(`schedule/${id}`, data); 
      // console.log(updatedSchedule);
      return updatedSchedule;
    } catch (error) {
      console.error("Error updating Schedule:", error.message);
      throw error;
    }
};

const deleteSchedule = async (id) => {
  try {
    const deletedSchedule = await new API().delete(`schedule/${id}`);
    return deletedSchedule.data;
  } catch (error) {
    console.error("Error deleting Schedule:", error.message);
    throw error; 
  }
};

export {
    createSchedule,
    getAllSchedules,
    updateSchedule,
    deleteSchedule,
    getAllSchedulesInWma
};
