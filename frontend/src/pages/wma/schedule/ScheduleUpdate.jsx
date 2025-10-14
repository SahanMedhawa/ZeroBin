import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WMADrawer from "../components/WMADrawer"
import WmaAuthService from "../../../api/wmaApi";
import { ToastContainer, toast } from "react-toastify";
import { getAllCollectors, getAllCollectorsInWma } from "../../../api/collectorApi";
import { getAllAreas } from "../../../api/areaApi";
import { updateSchedule } from "../../../api/scheduleApi";
import CloseIcon from '@mui/icons-material/Close';

const ScheduleUpdate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collectors, setCollectors] = useState([]);
  const [filteredCollectors, setFilteredCollectors] = useState([]);
  const [wma, setWma] = useState(location.state.schedule.wmaId);
  const [collector, setCollector] = useState(location.state.schedule.collectorId);
  const [area, setArea] = useState(location.state.schedule.area.name);
  const [date, setDate] = useState(location.state.schedule.date);
  const [time, setTime] = useState(location.state.schedule.time);
  const [status, setStatus] = useState(location.state.schedule.status);

  const fetchAllCollectorsInWma = async (currentWma) => {
    try {
      const res = await getAllCollectorsInWma(currentWma._id);
      setCollectors(res);
      setFilteredCollectors(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching collectors: ", error.message);
    }
  };

  useEffect(() => {
    if (wma) {
      fetchAllCollectorsInWma(wma);
    }
  }, [wma])

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        collectorId:collector, status 
      }
      await updateSchedule(body, location.state.schedule._id);
      toast.success("✓ Schedule updated successfully!", {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setTimeout(() => {
        navigate("/wma/schedules");
      }, 2000);
    } catch (error) {
      console.error("Error updating schedule:", error.message);
      toast.error("✕ Failed to update schedule", {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
  };

  return (
    <WMADrawer>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-800 bg-clip-text text-transparent">
            Update Schedule
          </h1>
          <p className="text-gray-600 mt-2">Modify schedule details and status</p>
        </div>

        {/* Form Section */}
        <div className="bg-white shadow-xl rounded-2xl p-8 relative">
        <div className="absolute top-6 right-6 cursor-pointer hover:bg-purple-100 rounded-full p-2 transition-all" onClick={() => navigate("/wma/schedules")}>
            <CloseIcon className="text-purple-600" />
        </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Schedule Information
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Waste Management Authority</label>
                <input
                type="text"
                value={wma.wmaname} 
                readOnly
                className="block w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"/>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Collector <span className="text-red-500">*</span>
                </label>
                <select
                  value={collector._id} 
                  onChange={(e) => setCollector(e.target.value)}
                  className="block w-full p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-700">
                    <option value="" disabled>Select Waste Collector</option>
                    {filteredCollectors.map((collector)=>{
                      return(
                        <option key={collector._id} value={collector._id}>{collector.truckNumber}</option>
                      );
                    })}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Area</label>
                <input
                type="text"
                value={area} 
                readOnly
                className="block w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"/>
              </div>
              <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Scheduled Date
              </label>
              <input
                type="date"
                value={new Date(date).toISOString().split("T")[0]}
                readOnly
                min={new Date().toISOString().split("T")[0]} 
                max={new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split("T")[0]}
                className="block w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Scheduled Time
                </label>
                <input
                  type="time"
                  value={time}
                  readOnly
                  min="09:00"
                  max="17:00" 
                  className="block w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e)=> setStatus(e.target.value)}                  
                  className="block w-full p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-700"
                >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select> 
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/wma/schedules")}
                className="px-6 py-3 border-2 border-purple-500 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all shadow-lg"
              >
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="!bg-white !shadow-2xl !rounded-2xl !border-l-4 !border-purple-500"
        bodyClassName="text-gray-800 font-medium"
        progressClassName="!bg-gradient-to-r !from-purple-600 !to-indigo-700"
        closeButton={
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            ✕
          </button>
        }
      />
    </WMADrawer>
  );
};

export default ScheduleUpdate;
