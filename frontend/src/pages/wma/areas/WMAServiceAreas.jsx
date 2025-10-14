import React, { useState, useEffect } from "react";
import WMADrawer from "../components/WMADrawer";
import WmaAuthService from "../../../api/wmaApi";
import { getAllAreas } from "../../../api/areaApi";
import { ToastContainer, toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

/**
 * WMAServiceAreas Component
 * 
 * Allows WMA to manage their service areas by adding or removing areas.
 * Follows SOLID principles:
 * - Single Responsibility: Manages WMA service areas only
 * - Open/Closed: Extensible for future features
 * - Liskov Substitution: Component interfaces are consistent
 * - Interface Segregation: Clean API interactions
 * - Dependency Inversion: Depends on abstractions (API services)
 * 
 * @component
 */
const WMAServiceAreas = () => {
  // State management - separated by concern
  const [allAreas, setAllAreas] = useState([]);
  const [servicedAreas, setServicedAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Fetches all areas and WMA's serviced areas
   * Implements parallel data fetching for better performance
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [areas, wmaAreas] = await Promise.all([
        getAllAreas(),
        WmaAuthService.getWMAServiceAreas(),
      ]);
      
      setAllAreas(areas.filter(area => area.isActive)); // Only show active areas
      setServicedAreas(wmaAreas);
    } catch (error) {
      toast.error("Failed to fetch data: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens the add area dialog
   * @param {Object} area - The area to add
   */
  const handleOpenAddDialog = (area) => {
    setSelectedArea(area);
    setAddDialogOpen(true);
  };

  /**
   * Opens the remove area dialog
   * @param {Object} area - The area to remove
   */
  const handleOpenRemoveDialog = (area) => {
    setSelectedArea(area);
    setRemoveDialogOpen(true);
  };

  /**
   * Adds an area to WMA's service areas
   * Implements optimistic UI updates with rollback on error
   */
  const handleAddArea = async () => {
    if (!selectedArea) return;

    setLoading(true);
    const previousServicedAreas = [...servicedAreas];
    
    try {
      // Optimistic update
      setServicedAreas([...servicedAreas, selectedArea]);
      setAddDialogOpen(false);
      
      const response = await WmaAuthService.addServiceArea(selectedArea._id);
      
      // Update with server response
      setServicedAreas(response.servicedAreas);
      
      toast.success(`${selectedArea.name} added to your service areas!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      // Rollback on error
      setServicedAreas(previousServicedAreas);
      toast.error(error.message || "Failed to add service area", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Removes an area from WMA's service areas
   * Implements proper error handling and user feedback
   */
  const handleRemoveArea = async () => {
    if (!selectedArea) return;

    setLoading(true);
    const previousServicedAreas = [...servicedAreas];
    
    try {
      // Optimistic update
      setServicedAreas(servicedAreas.filter(area => area._id !== selectedArea._id));
      setRemoveDialogOpen(false);
      
      const response = await WmaAuthService.removeServiceArea(selectedArea._id);
      
      // Update with server response
      setServicedAreas(response.servicedAreas);
      
      toast.success(`${selectedArea.name} removed from your service areas!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      // Rollback on error
      setServicedAreas(previousServicedAreas);
      toast.error(error.message || "Failed to remove service area", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Checks if an area is already serviced by WMA
   * @param {string} areaId - The area ID to check
   * @returns {boolean}
   */
  const isAreaServiced = (areaId) => {
    return servicedAreas.some(area => area._id === areaId);
  };

  /**
   * Gets available areas (not yet serviced)
   * Interface Segregation - clean filtering interface
   */
  const availableAreas = allAreas.filter(
    area => !isAreaServiced(area._id) &&
      (area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       area.district.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  /**
   * Filters serviced areas based on search query
   */
  const filteredServicedAreas = servicedAreas.filter(
    area =>
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <WMADrawer>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Service Areas</h1>
            <p className="text-gray-600 mt-1">Manage the areas your WMA services</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Service Areas"
            value={servicedAreas.length}
            color="bg-purple-500"
            icon={<LocationOnIcon className="text-white" style={{ fontSize: 32 }} />}
          />
          <StatCard
            title="Available Areas"
            value={availableAreas.length}
            color="bg-blue-500"
            icon={<AddIcon className="text-white" style={{ fontSize: 32 }} />}
          />
          <StatCard
            title="All Active Areas"
            value={allAreas.length}
            color="bg-green-500"
            icon={<CheckCircleIcon className="text-white" style={{ fontSize: 32 }} />}
          />
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <input
            type="text"
            placeholder="Search areas by name or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* My Service Areas Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">My Service Areas</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filteredServicedAreas.length === 0 ? (
              <div className="text-center py-12">
                <LocationOnIcon className="text-gray-300 mx-auto mb-4" style={{ fontSize: 64 }} />
                <p className="text-gray-500">
                  {searchQuery
                    ? "No service areas found matching your search"
                    : "You haven't added any service areas yet"}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Add areas from the available areas section below
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServicedAreas.map((area) => (
                  <AreaCard
                    key={area._id}
                    area={area}
                    actionButton={
                      <button
                        onClick={() => handleOpenRemoveDialog(area)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                      >
                        <DeleteIcon fontSize="small" />
                        Remove
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Areas Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Available Areas</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : availableAreas.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="text-gray-300 mx-auto mb-4" style={{ fontSize: 64 }} />
                <p className="text-gray-500">
                  {searchQuery
                    ? "No available areas found matching your search"
                    : "All areas are already in your service areas"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableAreas.map((area) => (
                  <AreaCard
                    key={area._id}
                    area={area}
                    actionButton={
                      <button
                        onClick={() => handleOpenAddDialog(area)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                      >
                        <AddIcon fontSize="small" />
                        Add to Service
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Area Dialog */}
        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
          <DialogTitle className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
            Add Service Area
          </DialogTitle>
          <DialogContent className="mt-4">
            <DialogContentText>
              Are you sure you want to add <strong>{selectedArea?.name}</strong> to your
              service areas? You will be responsible for waste collection in this area.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleAddArea}
              variant="contained"
              disabled={loading}
              style={{ backgroundColor: "#7c3aed" }}
            >
              {loading ? "Adding..." : "Add Area"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Remove Area Dialog */}
        <Dialog open={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)}>
          <DialogTitle>Remove Service Area</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to remove <strong>{selectedArea?.name}</strong> from your
              service areas? This will affect your operations in this area.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRemoveDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleRemoveArea}
              color="error"
              variant="contained"
              disabled={loading}
            >
              {loading ? "Removing..." : "Remove Area"}
            </Button>
          </DialogActions>
        </Dialog>

        <ToastContainer />
      </div>
    </WMADrawer>
  );
};

/**
 * StatCard Component
 * Reusable statistic card following DRY principle
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {number} props.value - Card value
 * @param {string} props.color - Background color class
 * @param {React.ReactNode} props.icon - Icon component
 */
const StatCard = ({ title, value, color, icon }) => (
  <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow duration-200">
    <div>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
    <div className={`${color} w-16 h-16 rounded-full flex items-center justify-center`}>
      {icon}
    </div>
  </div>
);

/**
 * AreaCard Component
 * Displays area information with action button
 * Follows Single Responsibility Principle
 * 
 * @param {Object} props - Component props
 * @param {Object} props.area - Area object
 * @param {React.ReactNode} props.actionButton - Action button component
 */
const AreaCard = ({ area, actionButton }) => (
  <div className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:border-purple-300">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <LocationOnIcon className="text-purple-600" />
        <h3 className="font-bold text-lg text-gray-800">{area.name}</h3>
      </div>
      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
        Active
      </span>
    </div>
    
    <div className="space-y-2 mb-4">
      <div className="flex items-center text-sm text-gray-600">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-medium">District:</span>
        <span className="ml-1">{area.district}</span>
      </div>
      
      {area.postalCode && (
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Postal Code:</span>
          <span className="ml-1">{area.postalCode}</span>
        </div>
      )}
      
      {area.coordinates?.latitude && area.coordinates?.longitude && (
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-xs">
            {area.coordinates.latitude.toFixed(4)}, {area.coordinates.longitude.toFixed(4)}
          </span>
        </div>
      )}
    </div>
    
    <div className="pt-3 border-t border-gray-200">
      {actionButton}
    </div>
  </div>
);

export default WMAServiceAreas;
