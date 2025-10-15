import React from 'react';

const GrievanceDetailsModal = ({ 
  isOpen, 
  onClose, 
  grievance, 
  onAddNote
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Grievance Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
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

          {/* Area Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Area Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><span className="font-medium">Area:</span> {grievance.areaId?.name || 'N/A'}</p>
              <p><span className="font-medium">District:</span> {grievance.areaId?.district || 'N/A'}</p>
            </div>
          </div>

          {/* Notes History */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Communication History</h3>
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
                <p className="text-gray-500 italic">No communication yet</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {grievance.status === 'Open' || grievance.status === 'In Progress' ? (
              <button
                onClick={onAddNote}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Update
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrievanceDetailsModal;
