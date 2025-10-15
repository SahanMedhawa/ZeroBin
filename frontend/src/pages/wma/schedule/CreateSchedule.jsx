import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WMADrawer from "../components/WMADrawer";
import WmaAuthService from "../../../api/wmaApi";
import { ToastContainer, toast } from "react-toastify";
import { getAllCollectorsInWma } from "../../../api/collectorApi";
import { getAllAreas } from "../../../api/areaApi";
import { createSchedule } from "../../../api/scheduleApi";
import CloseIcon from '@mui/icons-material/Close';

/**
 * CreateSchedule Component
 * 
 * Allows WMA to create new collection schedules.
 * Follows SOLID principles and clean code practices.
 * 
 * @component
 */
const CreateSchedule = () => {
  const navigate = useNavigate();
  const [currentWma, setCurrentWma] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    collector: "",
    area: "",
    date: new Date().toISOString().split("T")[0],
    time: (() => {
      const currentTime = new Date();
      const hours = currentTime.getHours().toString().padStart(2, '0');
      const minutes = currentTime.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    })(),
  });

  /**
   * Fetch current WMA details
   */
  const fetchCurrentWma = async () => {
    try {
      const res = await WmaAuthService.getCurrentWmaDetails();
      setCurrentWma(res);
      return res;
    } catch (error) {
      toast.error("Failed to fetch WMA details: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
      throw error;
    }
  };

  /**
   * Fetch collectors for the current WMA
   */
  const fetchCollectors = async (wmaId) => {
    try {
      const res = await getAllCollectorsInWma(wmaId);
      setCollectors(res);
    } catch (error) {
      toast.error("Failed to fetch collectors: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  /**
   * Fetch WMA's service areas only
   */
  const fetchWMAServiceAreas = async (wmaData) => {
    try {
      console.log("WMA Data:", wmaData);
      console.log("Serviced Areas:", wmaData.servicedAreas);
      
      // Get all areas
      const allAreas = await getAllAreas();
      
      // servicedAreas might be populated objects or just IDs
      const wmaServiceAreaIds = (wmaData.servicedAreas || []).map(area => 
        typeof area === 'object' ? area._id : area
      );
      
      console.log("WMA Service Area IDs:", wmaServiceAreaIds);
      
      // Filter to only include areas in WMA's servicedAreas array and are active
      const filteredAreas = allAreas.filter(area => 
        area.isActive && wmaServiceAreaIds.includes(area._id)
      );
      
      console.log("Filtered Areas:", filteredAreas);
      
      setAreas(filteredAreas);
    } catch (error) {
      toast.error("Failed to fetch service areas: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        const wmaData = await fetchCurrentWma();
        await Promise.all([
          fetchCollectors(wmaData._id),
          fetchWMAServiceAreas(wmaData)
        ]);
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };
    initializeData();
  }, []);

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    if (!formData.collector) {
      toast.error("Please select a collector", { position: "bottom-right" });
      return false;
    }
    if (!formData.area) {
      toast.error("Please select an area", { position: "bottom-right" });
      return false;
    }
    if (!formData.date) {
      toast.error("Please select a date", { position: "bottom-right" });
      return false;
    }
    if (!formData.time) {
      toast.error("Please select a time", { position: "bottom-right" });
      return false;
    }
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!currentWma) {
      toast.error("WMA information not loaded", { position: "bottom-right" });
      return;
    }

    setLoading(true);
    try {
      const newSchedule = {
        wmaId: currentWma._id,
        collectorId: formData.collector,
        area: formData.area,
        date: formData.date,
        time: formData.time,
      };

      await createSchedule(newSchedule);
      
      toast.success("Schedule created successfully!", {
        position: "bottom-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/wma/schedules");
      }, 2000);
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error(error.message || "Failed to create schedule", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    navigate("/wma/schedules");
  };

  return (
    <WMADrawer>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 p-6">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-800 bg-clip-text text-transparent">
              Create New Schedule
            </h1>
            <p className="text-gray-600 mt-2">Schedule a new collection</p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Close"
          >
            <CloseIcon className="text-gray-600" />
          </button>
        </div>

        {/* Form Section */}
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Collector and Area Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Collector Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Collector <span className="text-red-500">*</span>
                </label>
                <select
                  name="collector"
                  value={formData.collector}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select Collector</option>
                  {collectors.map((collector) => (
                    <option key={collector._id} value={collector._id}>
                      {collector.collectorName} - {collector.truckNumber}
                    </option>
                  ))}
                </select>
                {collectors.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    No collectors available. Please add collectors first.
                  </p>
                )}
              </div>

              {/* Area Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Area <span className="text-red-500">*</span>
                </label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select Service Area</option>
                  {areas.map((area) => (
                    <option key={area._id} value={area._id}>
                      {area.name} - {area.district}
                    </option>
                  ))}
                </select>
                {areas.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    No service areas available. Please add service areas first.
                  </p>
                )}
              </div>
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scheduled Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  max={new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Schedule within the next 30 days
                </p>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scheduled Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  min="06:00"
                  max="18:00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Operating hours: 6:00 AM - 6:00 PM
                </p>
              </div>
            </div>

            {/* Schedule Information Card */}
            {currentWma && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                <h3 className="text-sm font-semibold text-purple-900 mb-2">Schedule Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                  <div>
                    <span className="font-medium">WMA:</span> {currentWma.wmaname}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> <span className="text-amber-600">Pending</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || collectors.length === 0 || areas.length === 0}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Schedule"
                )}
              </button>
            </div>
          </form>
        </div>

        <ToastContainer />
      </div>
    </WMADrawer>
  );
};

export default CreateSchedule;
