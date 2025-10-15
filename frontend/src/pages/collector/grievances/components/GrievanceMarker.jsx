import React, { useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { markBinCollected } from '../../../../api/garbageApi';
import { resolveGrievance } from '../../../../api/grievanceApi';
import { toast } from 'react-toastify';

// Create custom icon for grievance markers
const createGrievanceIcon = (severity, isFocused = false) => {
  const colors = {
    'Low': '#10B981',      // Green
    'Medium': '#F59E0B',  // Yellow
    'High': '#EF4444',     // Red
    'Critical': '#DC2626'   // Dark Red
  };

  const color = colors[severity] || '#6B7280'; // Default gray

  return L.divIcon({
    className: 'grievance-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, ${color}, ${color}dd);
        width: ${isFocused ? '36px' : '28px'};
        height: ${isFocused ? '36px' : '28px'};
        border-radius: 50%;
        border: ${isFocused ? '6px' : '4px'} solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 ${isFocused ? '6px' : '3px'} ${color}40;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isFocused ? '18px' : '14px'};
        font-weight: bold;
        color: white;
        animation: ${isFocused ? 'pulse 1s infinite' : 'pulse 2s infinite'};
        position: relative;
        z-index: ${isFocused ? '1000' : '1'};
      ">
        <div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background-color: #ff4444;
          border-radius: 50%;
          border: 2px solid white;
          animation: blink 1s infinite;
        "></div>
        !
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      </style>
    `,
    iconSize: [isFocused ? 36 : 28, isFocused ? 36 : 28],
    iconAnchor: [isFocused ? 18 : 14, isFocused ? 18 : 14],
    popupAnchor: [0, isFocused ? -18 : -14]
  });
};

const GrievanceMarker = ({ grievance, isFocused = false, onGrievanceResolved }) => {
  const [collecting, setCollecting] = useState(false);

  if (!grievance.garbageId?.latitude || !grievance.garbageId?.longitude) {
    return null; // Don't render if no coordinates
  }

  const lat = grievance.garbageId.latitude;
  const lng = grievance.garbageId.longitude;
  const icon = createGrievanceIcon(grievance.severity, isFocused);

  const handleCollectBin = async () => {
    try {
      setCollecting(true);
      
      // Mark the bin as collected
      await markBinCollected(grievance.garbageId._id);
      
      // Resolve the grievance
      await resolveGrievance(grievance._id, 'Bin collected and grievance resolved');
      
      toast.success('✅ Bin collected and grievance resolved successfully!');
      
      // Notify parent component to refresh data
      if (onGrievanceResolved) {
        onGrievanceResolved(grievance._id);
      }
    } catch (error) {
      console.error('Error collecting bin:', error);
      toast.error(error.response?.data?.message || 'Failed to collect bin and resolve grievance');
    } finally {
      setCollecting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Low": return "text-green-600";
      case "Medium": return "text-yellow-600";
      case "High": return "text-orange-600";
      case "Critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "bg-blue-100 text-blue-800";
      case "In Progress": return "bg-purple-100 text-purple-800";
      case "Resolved": return "bg-green-100 text-green-800";
      case "Closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Marker position={[lat, lng]} icon={icon}>
      <Popup maxWidth={300}>
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-800">Grievance Report</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(grievance.status)}`}>
              {grievance.status}
            </span>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Bin ID:</span> {grievance.binId}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">User:</span> {grievance.userId?.username || 'N/A'}
              </p>
            </div>
            
            <div>
              <p className="text-sm">
                <span className="font-medium">Severity:</span> 
                <span className={`ml-1 font-semibold ${getSeverityColor(grievance.severity)}`}>
                  {grievance.severity}
                </span>
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Description:</span>
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">
                {grievance.description}
              </p>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>Created: {formatDate(grievance.createdAt)}</p>
              {grievance.assignedTo && (
                <p>Assigned to: {grievance.assignedTo.collectorName}</p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
              <button
                onClick={() => {
                  const lat = grievance.garbageId.latitude;
                  const lng = grievance.garbageId.longitude;
                  // Navigate to collector map with grievance focus
                  window.location.href = `/collector/map?focus=${grievance._id}&lat=${lat}&lng=${lng}`;
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
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
                className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Start Navigation</span>
              </button>
              
              {grievance.status === 'In Progress' && (
                <button
                  onClick={handleCollectBin}
                  disabled={collecting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {collecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Collecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Collect Bin</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default GrievanceMarker;
