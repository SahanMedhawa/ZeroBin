import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CollectorDrawer from "../components/CollectorDrawer";
import GrievanceDetailsModal from "./components/GrievanceDetailsModal";
import AddNoteModal from "./components/AddNoteModal";
import ResolveModal from "./components/ResolveModal";
import {
  getAssignedGrievances,
  resolveGrievance,
  addCollectorNote,
  getSeverityColor,
  getStatusColor,
  formatGrievanceAge,
  getPriorityDisplay
} from "../../../api/grievanceApi";

const CollectorGrievances = () => {
  const navigate = useNavigate();
  
  // State management
  const [grievances, setGrievances] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
    high: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);


  // Filter state
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadGrievances();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(loadGrievances, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const loadGrievances = async () => {
    try {
      setLoading(true);
      const response = await getAssignedGrievances(statusFilter || null);
      
      if (response.success) {
        setGrievances(response.grievances);
        setStatistics(response.statistics);
      }
    } catch (error) {
      console.error("Error loading grievances:", error);
      toast.error("Failed to load assigned grievances");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (resolutionNote) => {
    if (!resolutionNote.trim()) {
      toast.error("Please provide resolution details");
      return;
    }

    try {
      setResolving(true);
      const response = await resolveGrievance(selectedGrievance._id, resolutionNote);
      
      if (response.success) {
        toast.success("Grievance resolved successfully!");
        loadGrievances();
        setShowResolveModal(false);
      }
    } catch (error) {
      console.error("Error resolving grievance:", error);
      toast.error(error.response?.data?.message || "Failed to resolve grievance");
    } finally {
      setResolving(false);
    }
  };

  const handleAddNote = async (noteContent) => {
    if (!noteContent.trim()) {
      toast.error("Please enter a note");
      throw new Error("Please enter a note");
    }

    try {
      setAddingNote(true);
      const response = await addCollectorNote(selectedGrievance._id, noteContent);
      
      if (response.success) {
        toast.success("Note added successfully");
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

  const StatCard = ({ title, value, color, icon }) => (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const GrievanceCard = ({ grievance }) => {
    const priorityDisplay = getPriorityDisplay(grievance.priorityScore);
    
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(grievance.severity)}`}>
              {grievance.severity}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(grievance.status)}`}>
              {grievance.status}
            </span>
            {grievance.isEscalated && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                Escalated
              </span>
            )}
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${priorityDisplay.color} ${priorityDisplay.bgColor}`}>
            {priorityDisplay.level}
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
            <span className="text-sm text-gray-500">Created:</span>
            <span className="text-sm font-medium">{formatGrievanceAge(grievance.createdAt)}</span>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{grievance.description}</p>

        <div className="space-y-2">
          {/* Primary Actions Row */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSelectedGrievance(grievance);
                setShowDetailsModal(true);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              View Details
            </button>
            <button
              onClick={() => {
                setSelectedGrievance(grievance);
                setShowNoteModal(true);
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Add Note
            </button>
          </div>
          
          {/* Navigation Actions Row - Only show if coordinates available and not resolved */}
          {grievance.garbageId?.latitude && grievance.garbageId?.longitude && grievance.status !== 'Resolved' && (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Navigate to collector map with grievance focus
                  navigate('/collector/map', { 
                    state: { 
                      focusGrievance: grievance._id,
                      center: [grievance.garbageId.latitude, grievance.garbageId.longitude]
                    }
                  });
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="whitespace-nowrap">View on Map</span>
              </button>
              
              <button
                onClick={() => {
                  const lat = grievance.garbageId.latitude;
                  const lng = grievance.garbageId.longitude;
                  
                  // Detect if user is on mobile device
                  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                  
                  if (isMobile) {
                    // Try to open in Google Maps app first, fallback to web
                    const googleMapsAppUrl = `google.navigation:q=${lat},${lng}`;
                    const googleMapsWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                    
                    // Try to open in app, if it fails, open in browser
                    window.location.href = googleMapsAppUrl;
                    setTimeout(() => {
                      window.open(googleMapsWebUrl, '_blank');
                    }, 1000);
                  } else {
                    // Desktop - open in new tab
                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                    window.open(googleMapsUrl, '_blank');
                  }
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="whitespace-nowrap">Start Navigation</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };




  return (
    <div className="flex h-screen bg-gray-50">
      <CollectorDrawer />
      
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Grievances</h1>
          <p className="text-gray-600">Manage and resolve assigned collection issues</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Assigned"
            value={statistics.total}
            color="text-blue-600"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
          />
          <StatCard
            title="In Progress"
            value={statistics.inProgress}
            color="text-yellow-600"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Resolved"
            value={statistics.resolved}
            color="text-green-600"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Critical"
            value={statistics.critical}
            color="text-red-600"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="High Priority"
            value={statistics.high}
            color="text-orange-600"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              
              <button
                onClick={loadGrievances}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12m0 8h5.582m.582-8a8.001 8.001 0 0015.356-2m-1.88-4H5.118" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
            
            <p className="text-sm text-gray-600">
              {grievances.length} grievance{grievances.length !== 1 ? 's' : ''} assigned
            </p>
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
            <p className="text-gray-500 text-lg">No grievances assigned</p>
            <p className="text-gray-400">Check back later for new assignments</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grievances.map(grievance => (
              <GrievanceCard key={grievance._id} grievance={grievance} />
            ))}
          </div>
        )}

        {/* Modals */}
        <GrievanceDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          grievance={selectedGrievance}
          onAddNote={() => setShowNoteModal(true)}
          onResolve={() => setShowResolveModal(true)}
        />
        <ResolveModal
          isOpen={showResolveModal}
          onClose={() => setShowResolveModal(false)}
          onResolve={handleResolve}
          grievance={selectedGrievance}
          resolving={resolving}
        />
        <AddNoteModal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          onAddNote={handleAddNote}
          addingNote={addingNote}
        />
      </div>
    </div>
  );
};

export default CollectorGrievances;
