import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminDrawer from "../components/AdminDrawer";
import GrievanceDetailsModal from "./components/GrievanceDetailsModal";
import AddNoteModal from "./components/AddNoteModal";
import AssignModal from "./components/AssignModal";
import {
  getAllGrievances,
  updateGrievanceStatus,
  assignGrievance,
  addAdminNote,
  triggerRouteOptimization,
  getOptimizationRecommendations,
  getSeverityColor,
  getStatusColor,
  formatGrievanceAge,
  getPriorityDisplay,
  CACHE_KEYS,
  getCachedData,
  setCachedData,
  clearCache
} from "../../../api/grievanceApi";
import { getAllCollectors } from "../../../api/collectorApi";
import { getAllAreas } from "../../../api/areaApi";
import { toast } from "react-toastify";

const AdminGrievances = () => {
  // State management
  const [grievances, setGrievances] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [collectors, setCollectors] = useState([]);
  const [areas, setAreas] = useState([]);
  const navigate = useNavigate();

  // Filter and pagination state
  const [filters, setFilters] = useState({
    status: 'Open', // Default to show Open grievances
    severity: '',
    areaId: '',
    assignedTo: '',
    escalated: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Modal and UI state
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [optimizationData, setOptimizationData] = useState({ areaId: '', urgent: false });
  const [recommendations, setRecommendations] = useState(null);
  
  // Loading states for modals
  const [assigning, setAssigning] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadGrievances();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [collectorsRes, areasRes] = await Promise.all([
        getAllCollectors(),
        getAllAreas()
      ]);
      console.log("Loaded collectors:", collectorsRes); // Debug log
      console.log("Loaded areas:", areasRes); // Debug log
      setCollectors(collectorsRes || []);
      setAreas(areasRes || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load initial data");
    }
  };

  const loadGrievances = async () => {
    try {
      setLoading(true);
      
      // Try to load from cache first for better UX
      const cacheKey = `${CACHE_KEYS.ADMIN_GRIEVANCES}_${JSON.stringify(filters)}`;
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        setGrievances(cachedData.grievances);
        setStatistics(cachedData.statistics);
        setPagination(cachedData.pagination);
      }

      const response = await getAllGrievances(filters);
      
      if (response.success) {
        setGrievances(response.grievances);
        setStatistics(response.statistics);
        setPagination(response.pagination);
        
        // Cache the fresh data
        setCachedData(cacheKey, {
          grievances: response.grievances,
          statistics: response.statistics,
          pagination: response.pagination
        });
      }
    } catch (error) {
      console.error("Error loading grievances:", error);
      toast.error("Failed to load grievances");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleStatusUpdate = async (grievanceId, status, reason = '') => {
    try {
      const response = await updateGrievanceStatus(grievanceId, status, reason);
      if (response.success) {
        toast.success("Status updated successfully");
        clearCache(CACHE_KEYS.ADMIN_GRIEVANCES);
        loadGrievances();
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleAssignment = async (assignmentData) => {
    try {
      if (!assignmentData.collectorId) {
        toast.error("Please select a collector");
        return;
      }

      setAssigning(true);
      const response = await assignGrievance(
        selectedGrievance._id,
        assignmentData.collectorId,
        assignmentData.reason
      );

      if (response.success) {
        toast.success("Grievance assigned successfully");
        clearCache(CACHE_KEYS.ADMIN_GRIEVANCES);
        loadGrievances();
        setShowAssignModal(false);
      }
    } catch (error) {
      console.error("Error assigning grievance:", error);
      toast.error(error.response?.data?.message || "Failed to assign grievance");
    } finally {
      setAssigning(false);
    }
  };

  const handleAddNote = async (noteData) => {
    try {
      if (!noteData.content.trim()) {
        toast.error("Please enter note content");
        throw new Error("Please enter note content");
      }

      setAddingNote(true);
      const response = await addAdminNote(
        selectedGrievance._id,
        noteData.content,
        noteData.noteType
      );

      if (response.success) {
        toast.success("Note added successfully");
        clearCache(CACHE_KEYS.ADMIN_GRIEVANCES);
        loadGrievances();
        setShowNoteModal(false);
        return response;
      } else {
        throw new Error("Failed to add note");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error(error.response?.data?.message || "Failed to add note");
      throw error;
    } finally {
      setAddingNote(false);
    }
  };

  const handleRouteOptimization = async () => {
    try {
      if (!optimizationData.areaId) {
        toast.error("Please select an area");
        return;
      }

      const response = await triggerRouteOptimization(optimizationData.areaId, {
        urgent: optimizationData.urgent
      });

      if (response.success) {
        toast.success(`Route optimization completed. ${response.optimizationResults.reassignedCount} grievances reassigned.`);
        clearCache(CACHE_KEYS.ADMIN_GRIEVANCES);
        loadGrievances();
        setShowOptimizationModal(false);
        setOptimizationData({ areaId: '', urgent: false });
      }
    } catch (error) {
      console.error("Error triggering optimization:", error);
      toast.error(error.response?.data?.message || "Failed to trigger optimization");
    }
  };

  const loadOptimizationRecommendations = async (areaId) => {
    try {
      const response = await getOptimizationRecommendations(areaId);
      if (response.success) {
        setRecommendations(response.recommendations);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
    }
  };

  const StatCard = ({ title, value, color, icon }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const GrievanceCard = ({ grievance }) => {
    const priorityDisplay = getPriorityDisplay(grievance.priorityScore);
    
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(grievance.severity)}`}>
              {grievance.severity}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(grievance.status)}`}>
              {grievance.status}
            </span>
            {grievance.isEscalated && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                Escalated
              </span>
            )}
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${priorityDisplay.color} ${priorityDisplay.bgColor}`}>
            Priority: {priorityDisplay.level}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Bin ID:</span>
            <span className="text-sm font-medium">{grievance.binId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">User:</span>
            <span className="text-sm font-medium">{grievance.userId?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Area:</span>
            <span className="text-sm font-medium">{grievance.areaId?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Assigned To:</span>
            <span className="text-sm font-medium">
              {grievance.assignedTo?.collectorName || 'Unassigned'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Created:</span>
            <span className="text-sm font-medium">{formatGrievanceAge(grievance.createdAt)}</span>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{grievance.description}</p>

        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedGrievance(grievance);
              setShowDetailsModal(true);
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            View Details
          </button>
          {grievance.status !== 'Resolved' && (
            <button
              onClick={() => {
                setSelectedGrievance(grievance);
                setShowAssignModal(true);
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Assign
            </button>
          )}
          {grievance.status === 'Resolved' && (
            <button
              onClick={() => {
                setSelectedGrievance(grievance);
                setShowAddNoteModal(true);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Add Note
            </button>
          )}
        </div>
      </div>
    );
  };


  return (
    <AdminDrawer>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Grievance Management</h1>
          <p className="text-gray-600">Manage citizen grievances and optimize collection routes</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Grievances"
            value={statistics.total || 0}
            color="text-blue-600"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
          />
          <StatCard
            title="Open Grievances"
            value={statistics.open || 0}
            color="text-red-600"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="In Progress"
            value={statistics.inProgress || 0}
            color="text-yellow-600"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Critical Issues"
            value={statistics.critical || 0}
            color="text-red-600"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
          />
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            <select
              value={filters.areaId}
              onChange={(e) => handleFilterChange('areaId', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Areas</option>
              {areas.map(area => (
                <option key={area._id} value={area._id}>{area.name}</option>
              ))}
            </select>

            <button
              onClick={() => setShowOptimizationModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Route Optimization
            </button>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {grievances.length} of {pagination.totalItems} grievances
            </p>
            <button
              onClick={loadGrievances}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12m0 8h5.582m.582-8a8.001 8.001 0 0015.356-2m-1.88-4H5.118" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Grievances Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : grievances.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-gray-500 text-lg">No grievances found</p>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grievances.map(grievance => (
              <GrievanceCard key={grievance._id} grievance={grievance} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handleFilterChange('page', page)}
                    className={`px-3 py-2 border rounded-lg ${
                      filters.page === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handleFilterChange('page', Math.min(pagination.totalPages, filters.page + 1))}
                disabled={filters.page === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <GrievanceDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          grievance={selectedGrievance}
          onAddNote={() => setShowNoteModal(true)}
          onAssign={() => setShowAssignModal(true)}
          onResolve={() => handleStatusUpdate(selectedGrievance._id, 'Resolved')}
          onOptimizeRoute={() => setShowOptimizationModal(true)}
        />
        <AssignModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignment}
          collectors={collectors}
          selectedGrievance={selectedGrievance}
          assigning={assigning}
        />
        <AddNoteModal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          onAddNote={handleAddNote}
          addingNote={addingNote}
        />
      </div>
    </AdminDrawer>
  );
};

export default AdminGrievances;
