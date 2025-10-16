import React, { useState, useEffect } from "react";
import AdminDrawer from "../components/AdminDrawer";
import { getAllAreas, createArea, updateArea, deleteArea } from "../../../api/areaApi";
import { ToastContainer, toast } from "react-toastify";
import { SRI_LANKAN_DISTRICTS } from "../../../constants/districts";

const AdminAreaManagement = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  
  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
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

  useEffect(() => {
    fetchAreas();
  }, []);

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

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setFormData({
      name: "",
      district: "",
      postalCode: "",
      latitude: "",
      longitude: "",
      isActive: true,
    });
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (area) => {
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
    setFormModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

      setFormModalOpen(false);
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

  const handleOpenDeleteModal = (areaId) => {
    setSelectedAreaId(areaId);
    setDeleteModalOpen(true);
  };

  const handleDeleteArea = async () => {
    setLoading(true);
    try {
      await deleteArea(selectedAreaId);
      toast.success("Area deleted successfully!", {
        position: "bottom-right",
        autoClose: 2000,
      });
      setDeleteModalOpen(false);
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

  const filteredAreas = areas.filter((area) => {
    const matchesSearch =
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (area.postalCode && area.postalCode.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDistrict = !districtFilter || area.district === districtFilter;
    
    return matchesSearch && matchesDistrict;
  });

  const metrics = [
    {
      title: "Total Areas",
      value: areas.length,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      gradient: "from-blue-900 to-blue-800",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      title: "Districts Covered",
      value: new Set(areas.map((a) => a.district)).size,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-emerald-600 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      title: "Active Areas",
      value: areas.filter((a) => a.isActive).length,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-green-600 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
    },
  ];

  return (
    <AdminDrawer>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent mb-2">
            Area Management
          </h1>
          <p className="text-gray-600">Manage service areas and geographical coverage</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Actions and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by area name, district, or postal code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
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
            <button
              onClick={handleOpenCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-xl font-semibold hover:from-blue-800 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Area
            </button>
          </div>

          {/* Active Filters */}
          {(searchQuery || districtFilter) && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-2 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {districtFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-800">
                  District: {districtFilter}
                  <button
                    onClick={() => setDistrictFilter("")}
                    className="ml-2 hover:text-emerald-600"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Areas Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Service Areas ({filteredAreas.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Area Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">District</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Postal Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Coordinates</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-500">Loading areas...</span>
                      </div>
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
                            onClick={() => handleOpenEditModal(area)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Area"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(area._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Area"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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

        {/* Create/Edit Modal */}
        {formModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isEditMode ? "Edit Area" : "Create New Area"}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter area name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <select
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select District</option>
                    {SRI_LANKAN_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    name="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter postal code"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      name="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      name="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.0000"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active Area
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setFormModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFormSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    isEditMode ? "Update Area" : "Create Area"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this area? This action cannot be undone and may
                affect users and collectors assigned to this area.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteArea}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete Area"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </AdminDrawer>
  );
};

const MetricCard = ({ title, value, icon, gradient, bgGradient }) => (
  <div className={`bg-gradient-to-br ${bgGradient} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">{title}</p>
        <p className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

export default AdminAreaManagement;