import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WMADrawer from "../components/WMADrawer"
import WmaAuthService from "../../../api/wmaApi"
import { ToastContainer, toast } from "react-toastify";
import CloseIcon from '@mui/icons-material/Close';
import { updateCollector } from '../../../api/collectorApi';

const WmaCollectorUpdate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentWma, setCurrentWma] = useState([]);
  const [truckNumber, setTruckNumber] = useState(location.state.collector.truckNumber);
  const [collectorName, setCollectorName] = useState(location.state.collector.collectorName);
  const [collectorNIC, setCollectorNIC] = useState(location.state.collector.collectorNIC);
  const [contactNo, setContactNo] = useState(location.state.collector.contactNo);
  const [statusOfCollector, setStatusOfCollector] = useState(location.state.collector.statusOfCollector);
  const [valideForm, setValideForm] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCurrentWma = async () => {
    try {
      const res = await WmaAuthService.getCurrentWmaDetails();
      setCurrentWma(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching WMAs: ", error.message);
    }
  };

  useEffect(() => {
    fetchCurrentWma();
  }, [])

  useEffect(() => {
    let isValid = true;

    // Check if all required fields are filled
    if (!collectorName || collectorName.trim().length === 0) {
      setFormError('Collector Name is required');
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(collectorName)) {
      setFormError('Invalid Collector Name (only letters and spaces allowed)');
      isValid = false;
    } else if (!collectorNIC || collectorNIC.trim().length === 0) {
      setFormError('Collector NIC is required');
      isValid = false;
    } else if (!/^\d{12}$|^\d{9}V$/.test(collectorNIC)) {
      setFormError('Invalid Collector NIC (12 digits or 9 digits with V)');
      isValid = false;
    } else if (!contactNo || contactNo.length === 0) {
      setFormError('Contact Number is required');
      isValid = false;
    } else if (contactNo.length !== 10) {
      setFormError('Contact Number must be 10 digits');
      isValid = false;
    } else if (!truckNumber || truckNumber.trim().length === 0) {
      setFormError('Truck Number is required');
      isValid = false;
    } else if (!/^[a-zA-Z0-9]+$/.test(truckNumber)) {
      setFormError('Invalid Truck Number (alphanumeric only)');
      isValid = false;
    } else {
      setFormError('');
    }

    setValideForm(isValid);
  }, [contactNo, collectorNIC, collectorName, truckNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        truckNumber, collectorName, collectorNIC, statusOfCollector, contactNo
      }
      await updateCollector(body, location.state.collector._id);
      toast.success("✓ Collector updated successfully!", {
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
        navigate("/wma/collectors");
      }, 2000);
    } catch (error) {
      console.error("Error updating collector status:", error.message);
      toast.error("✕ Failed to update collector status", {
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
            Update Collector Details
          </h1>
          <p className="text-gray-600 mt-2">Modify collector information and status</p>
        </div>

        {/* Form Section */}
        <div className="bg-white shadow-xl rounded-2xl p-8 relative">
        <div className="absolute top-6 right-6 cursor-pointer hover:bg-purple-100 rounded-full p-2 transition-all" onClick={() => navigate("/wma/collectors")}>
            <CloseIcon className="text-purple-600" />
        </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Collector Information
          </h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Waste Management Authority</label>
                <input
                type="text"
                value={currentWma.wmaname} 
                readOnly
                className="block w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"/>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Collector Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={collectorName} 
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^[a-zA-Z\s]*$/.test(input)) {
                      setCollectorName(input);
                    }
                  }}
                  placeholder="Enter collector name"
                  className="block w-full p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"/>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Collector NIC <span className="text-red-500">*</span></label>
                <input
                value={collectorNIC} 
                onChange={(e) => {
                  const input = e.target.value.toUpperCase();
                  // Allow: up to 12 digits, or up to 9 digits followed by V
                  if (/^\d{0,12}$/.test(input) || /^\d{0,9}V?$/.test(input)) {
                    setCollectorNIC(input);
                  }
                }}
                placeholder="Enter NIC (12 digits or 9 digits with V)"
                className="block w-full p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"/>
              </div>
              <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactNo}
                onChange={(e) => {
                  const input = e.target.value;
                  if (/^\d*$/.test(input) && input.length <= 10) {
                    setContactNo(input);
                  }
                }}
                placeholder="Enter 10-digit contact number"
                className="block w-full p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Truck Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={truckNumber}
                  onChange={(e) => {
                    const input = e.target.value
                    if (/^[a-zA-Z0-9]*$/.test(input) && input.length <8) {
                      setTruckNumber(input);
                    }
                  }}
                  placeholder="Enter truck registration number"
                  className="block w-full p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-700"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={statusOfCollector}
                  onChange={(e) => setStatusOfCollector(e.target.value)}
                  className="block w-full p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-700"
                >
                  <option value="Available">Available</option>
                  <option value="Not-Available">Not-Available</option>
                  </select>
              </div>
            </div>
            {formError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <span className="text-red-700 font-medium">{formError}</span>
              </div>
            )}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/wma/collectors")}
                className="px-6 py-3 border-2 border-purple-500 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={valideForm ? handleSubmit : null}
                disabled={!valideForm}
                className={`px-8 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                  valideForm 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white hover:shadow-xl hover:scale-105' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                Update Details
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

export default WmaCollectorUpdate;
