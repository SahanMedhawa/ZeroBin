import React from 'react';

const GrievanceDetailsModal = ({ 
  isOpen, 
  onClose, 
  grievance, 
  onAddNote, 
  onResolve
}) => {
  if (!isOpen || !grievance) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "bg-blue-100 text-blue-800";
      case "In Progress": return "bg-purple-100 text-purple-800";
      case "Resolved": return "bg-green-100 text-green-800";
      case "Closed": return "bg-gray-100 text-gray-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Grievance Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Grievance ID</h3>
              <p className="text-sm text-gray-600">{grievance._id}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Bin ID</h3>
              <p className="text-sm text-gray-600">{grievance.binId}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Created</h3>
              <p className="text-sm text-gray-600">{formatDate(grievance.createdAt)}</p>
            </div>
          </div>

          {/* Status and Severity */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(grievance.severity)}`}>
              {grievance.severity}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(grievance.status)}`}>
              {grievance.status}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{grievance.description}</p>
          </div>

          {/* User Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">User Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><span className="font-medium">Name:</span> {grievance.userId?.username || 'N/A'}</p>
              <p><span className="font-medium">Email:</span> {grievance.userId?.email || 'N/A'}</p>
              <p><span className="font-medium">Contact:</span> {grievance.userId?.contact || 'N/A'}</p>
              <p><span className="font-medium">Address:</span> {grievance.userId?.address || 'N/A'}</p>
            </div>
          </div>

          {/* Area Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Area Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><span className="font-medium">Area:</span> {grievance.areaId?.name || 'N/A'}</p>
              <p><span className="font-medium">District:</span> {grievance.areaId?.district || 'N/A'}</p>
            </div>
          </div>

          {/* Garbage Bin Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Garbage Bin Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><span className="font-medium">Bin ID:</span> {grievance.binId}</p>
              <p><span className="font-medium">Location:</span> {grievance.garbageId?.location || 'N/A'}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  grievance.garbageId?.status === 'Full' ? 'bg-red-100 text-red-800' :
                  grievance.garbageId?.status === 'Empty' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {grievance.garbageId?.status || 'Unknown'}
                </span>
              </p>
              {grievance.garbageId?.coordinates && (
                <p><span className="font-medium">Coordinates:</span> {grievance.garbageId.coordinates.lat}, {grievance.garbageId.coordinates.lng}</p>
              )}
            </div>
          </div>

          {/* Notes History */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Notes History</h3>
            <div className="space-y-3">
              {grievance.notes && grievance.notes.length > 0 ? (
                grievance.notes.map((note, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {note.addedByModel} - {note.noteType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(note.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-600">{note.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No notes added yet</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {grievance.garbageId?.latitude && grievance.garbageId?.longitude && grievance.status !== 'Resolved' && (
              <>
                <button
                  onClick={() => {
                    // Navigate to collector map with grievance focus
                    window.location.href = `/collector/map?focus=${grievance._id}&lat=${grievance.garbageId.latitude}&lng=${grievance.garbageId.longitude}`;
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>View on Map</span>
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
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Start Navigation</span>
                </button>
              </>
            )}
            <button
              onClick={onAddNote}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrievanceDetailsModal;
