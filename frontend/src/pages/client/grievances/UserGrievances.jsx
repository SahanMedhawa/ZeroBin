import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import UserDrawer from "../components/UserDrawer";
import GrievanceDetailsModal from "./components/GrievanceDetailsModal";
import AddNoteModal from "./components/AddNoteModal";
import { 
  getUserGrievances, 
  addUserNote,
  getSeverityColor, 
  getStatusColor, 
  formatGrievanceAge,
  CACHE_KEYS,
  getCachedData,
  setCachedData,
  clearCache
} from "../../../api/grievanceApi";
import { toast } from "react-toastify";

const UserGrievances = () => {
  const navigate = useNavigate();
  
  // State management
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  // Filter and pagination
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  useEffect(() => {
    loadGrievances();
  }, [filters]);

  const loadGrievances = async () => {
    try {
      setLoading(true);
      
      // Try cache first for better UX
      const cacheKey = `${CACHE_KEYS.USER_GRIEVANCES}_${JSON.stringify(filters)}`;
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        setGrievances(cachedData.grievances);
        setPagination(cachedData.pagination);
      }

      const response = await getUserGrievances(filters);
      
      if (response.success) {
        setGrievances(response.grievances);
        setPagination(response.pagination);
        
        // Cache fresh data
        setCachedData(cacheKey, {
          grievances: response.grievances,
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

  const handleAddNote = async (noteContent) => {
    if (!noteContent.trim()) {
      toast.error("Please enter a note");
      throw new Error("Please enter a note");
    }

    try {
      setAddingNote(true);
      const response = await addUserNote(selectedGrievance._id, noteContent);
      
      if (response.success) {
        toast.success("Note added successfully");
        clearCache(CACHE_KEYS.USER_GRIEVANCES);
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page
    }));
  };

  const GrievanceCard = ({ grievance }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(grievance.severity)}`}>
            {grievance.severity}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(grievance.status)}`}>
            {grievance.status}
          </span>
        </div>
        <span className="text-sm text-gray-500">{formatGrievanceAge(grievance.createdAt)}</span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Bin ID:</span>
          <span className="text-sm font-medium">{grievance.binId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Area:</span>
          <span className="text-sm font-medium">{grievance.areaId?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Assigned To:</span>
          <span className="text-sm font-medium">
            {grievance.assignedTo?.collectorName || 'Not assigned yet'}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-4 line-clamp-3">{grievance.description}</p>

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
        {(grievance.status === 'Open' || grievance.status === 'In Progress') && (
          <button
            onClick={() => {
              setSelectedGrievance(grievance);
              setShowNoteModal(true);
            }}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            Add Note
          </button>
        )}
      </div>
    </div>
  );



  return (
    <UserDrawer>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Grievances</h1>
              <p className="text-gray-600">Track and manage your collection issue reports</p>
            </div>
            <button
              onClick={() => navigate("/user/grievances/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
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

            <button
              onClick={loadGrievances}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12m0 8h5.582m.582-8a8.001 8.001 0 0015.356-2m-1.88-4H5.118" />
              </svg>
              <span>Refresh</span>
            </button>

            <div className="ml-auto text-sm text-gray-600">
              {pagination.totalItems} total grievance{pagination.totalItems !== 1 ? 's' : ''}
            </div>
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
            <p className="text-gray-500 text-lg mb-4">No grievances found</p>
            <button
              onClick={() => navigate("/user/grievances/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Report Your First Issue
            </button>
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
        />
        <AddNoteModal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          onAddNote={handleAddNote}
          addingNote={addingNote}
        />
        </div>
      </div>
    </UserDrawer>
  );
};

export default UserGrievances;
