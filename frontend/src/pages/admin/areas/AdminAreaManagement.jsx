import React, { useState, useEffect } from "react";
import AdminDrawer from "../components/AdminDrawer";
import { getAllAreas, createArea, updateArea, deleteArea } from "../../../api/areaApi";
import { ToastContainer, toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { SRI_LANKAN_DISTRICTS } from "../../../constants/districts";

/**
 * AdminAreaManagement Component
 * 
 * Manages CRUD operations for areas in the admin portal.
 * Follows Single Responsibility Principle - handles area management only.
 * 
 * @component
 */
const AdminAreaManagement = () => {
  // State management - separated by concern
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState(""); // District filter
  
  // Modal states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    district: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    isActive: true,
  });
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch areas on component mount
  useEffect(() => {
    fetchAreas();
  }, []);

  /**
   * Fetches all areas from the API
   * Implements error handling and user feedback
   */
  const fetchAreas = async () => {
    setLoading(true);
    try {
      const response = await getAllAreas();
      setAreas(response);
    } catch (error) {
      toast.error("Failed to fetch areas: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens the form dialog for creating a new area
   * Dependency Inversion - depends on abstraction (dialog state)
   */
  const handleOpenCreateDialog = () => {
    setIsEditMode(false);
    setFormData({
      name: "",
      district: "",
      postalCode: "",
      latitude: "",
      longitude: "",
      isActive: true,
    });
    setFormDialogOpen(true);
  };

  /**
   * Opens the form dialog for editing an existing area
   * @param {Object} area - The area to edit
   */
  const handleOpenEditDialog = (area) => {
    setIsEditMode(true);
    setSelectedAreaId(area._id);
    setFormData({
      name: area.name || "",
      district: area.district || "",
      postalCode: area.postalCode || "",
      latitude: area.coordinates?.latitude || "",
      longitude: area.coordinates?.longitude || "",
      isActive: area.isActive !== undefined ? area.isActive : true,
    });
    setFormDialogOpen(true);
  };

  /**
   * Handles form input changes
   * @param {Event} e - Input change event
   */
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Validates form data before submission
   * Single Responsibility - validation logic separated
   * @returns {boolean} Whether the form is valid
   */
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Area name is required", { position: "bottom-right" });
      return false;
    }
    if (!formData.district.trim()) {
      toast.error("District is required", { position: "bottom-right" });
      return false;
    }
    return true;
  };

  /**
   * Handles form submission for create/update
   * Open/Closed Principle - open for extension via isEditMode
   */
  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const areaData = {
        name: formData.name.trim(),
        district: formData.district.trim(),
        postalCode: formData.postalCode.trim() || undefined,
        coordinates: {
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        },
        isActive: formData.isActive,
      };

      // Remove undefined coordinates if not provided
      if (!areaData.coordinates.latitude && !areaData.coordinates.longitude) {
        delete areaData.coordinates;
      }

      if (isEditMode) {
        await updateArea(areaData, selectedAreaId);
        toast.success("Area updated successfully!", {
          position: "bottom-right",
          autoClose: 2000,
        });
      } else {
        await createArea(areaData);
        toast.success("Area created successfully!", {
          position: "bottom-right",
          autoClose: 2000,
        });
      }

      setFormDialogOpen(false);
      fetchAreas();
    } catch (error) {
      toast.error(error.message || "Operation failed", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens the delete confirmation dialog
   * @param {string} areaId - ID of the area to delete
   */
  const handleOpenDeleteDialog = (areaId) => {
    setSelectedAreaId(areaId);
    setDeleteDialogOpen(true);
  };

  /**
   * Handles area deletion
   * Implements proper error handling and user feedback
   */
  const handleDeleteArea = async () => {
    setLoading(true);
    try {
      await deleteArea(selectedAreaId);
      toast.success("Area deleted successfully!", {
        position: "bottom-right",
        autoClose: 2000,
      });
      setDeleteDialogOpen(false);
      fetchAreas();
    } catch (error) {
      toast.error("Failed to delete area: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filters areas based on search query and district filter
   * Interface Segregation - clean filtering interface
   */
  const filteredAreas = areas.filter((area) => {
    const matchesSearch =
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (area.postalCode && area.postalCode.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDistrict = !districtFilter || area.district === districtFilter;
    
    return matchesSearch && matchesDistrict;
  });

  return (
    <AdminDrawer>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Area Management</h1>
          <button
            onClick={handleOpenCreateDialog}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <AddIcon />
            Add New Area
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Areas"
            value={areas.length}
            color="bg-blue-500"
            icon="📍"
          />
          <StatCard
            title="Districts Covered"
            value={new Set(areas.map((a) => a.district)).size}
            color="bg-purple-500"
            icon="🗺️"
          />
          <StatCard
            title="Active Areas"
            value={areas.filter((a) => a.isActive).length}
            color="bg-green-500"
            icon="✓"
          />
          <StatCard
            title="Inactive Areas"
            value={areas.filter((a) => !a.isActive).length}
            color="bg-gray-500"
            icon="✗"
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search by area name, district, or postal code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            {/* District Filter Dropdown */}
            <div>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="">All Districts</option>
                {SRI_LANKAN_DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(searchQuery || districtFilter) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-800">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-2 hover:text-emerald-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {districtFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  District: {districtFilter}
                  <button
                    onClick={() => setDistrictFilter("")}
                    className="ml-2 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Areas Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Area Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">District</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Postal Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Coordinates</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      Loading areas...
                    </td>
                  </tr>
                ) : filteredAreas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      {searchQuery ? "No areas found matching your search" : "No areas available"}
                    </td>
                  </tr>
                ) : (
                  filteredAreas.map((area) => (
                    <tr
                      key={area._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{area.name}</td>
                      <td className="px-6 py-4 text-gray-600">{area.district}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {area.postalCode || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {area.coordinates?.latitude && area.coordinates?.longitude
                          ? `${area.coordinates.latitude.toFixed(4)}, ${area.coordinates.longitude.toFixed(4)}`
                          : "Not set"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            area.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {area.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditDialog(area)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Area"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteDialog(area._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Area"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog
          open={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            {isEditMode ? "Edit Area" : "Create New Area"}
          </DialogTitle>
          <DialogContent className="mt-4">
            <div className="space-y-4">
              <TextField
                autoFocus
                name="name"
                label="Area Name"
                type="text"
                fullWidth
                required
                value={formData.name}
                onChange={handleFormChange}
                variant="outlined"
              />
              <TextField
                select
                name="district"
                label="District"
                fullWidth
                required
                value={formData.district}
                onChange={handleFormChange}
                variant="outlined"
                helperText="Select the district for this area"
              >
                {SRI_LANKAN_DISTRICTS.map((district) => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                name="postalCode"
                label="Postal Code (Optional)"
                type="text"
                fullWidth
                value={formData.postalCode}
                onChange={handleFormChange}
                variant="outlined"
              />
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  name="latitude"
                  label="Latitude (Optional)"
                  type="number"
                  fullWidth
                  value={formData.latitude}
                  onChange={handleFormChange}
                  variant="outlined"
                  inputProps={{ step: "any" }}
                />
                <TextField
                  name="longitude"
                  label="Longitude (Optional)"
                  type="number"
                  fullWidth
                  value={formData.longitude}
                  onChange={handleFormChange}
                  variant="outlined"
                  inputProps={{ step: "any" }}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active Area
                </label>
              </div>
            </div>
          </DialogContent>
          <DialogActions className="p-4">
            <Button onClick={() => setFormDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              variant="contained"
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600"
            >
              {loading ? "Processing..." : isEditMode ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this area? This action cannot be undone and may
              affect users and collectors assigned to this area.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteArea}
              color="error"
              variant="contained"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>

        <ToastContainer />
      </div>
    </AdminDrawer>
  );
};

/**
 * StatCard Component
 * Reusable stat card following DRY principle
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {number} props.value - Card value
 * @param {string} props.color - Background color class
 * @param {string} props.icon - Icon emoji
 */
const StatCard = ({ title, value, color, icon }) => (
  <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow duration-200">
    <div>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
    <div className={`${color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
      {icon}
    </div>
  </div>
);

export default AdminAreaManagement;
