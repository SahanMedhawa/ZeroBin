import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getFullBinsForCollector, markBinCollected } from '../../../api/garbageApi';
import CollectorDrawer from '../components/CollectorDrawer';

// Constants
const FULL_WEIGHT_OF_BIN = 5; // 5KG capacity
const REFRESH_INTERVAL_MS = 30000; // 30 seconds
const MAP_ZOOM_LEVEL = 13;
const MAP_HEIGHT_PX = 600;
const ICON_SIZE = 30;
const ICON_ANCHOR_OFFSET = 15;
const FONT_SIZE_SMALL = 11;
const BORDER_WIDTH = 3;
const SHADOW_BLUR = 8;
const SHADOW_OPACITY = 0.15;
const NAVIGATION_DELAY_MS = 1000;

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (fillLevel) => {
  const colors = {
    Full: '#ef4444',
    High: '#f59e0b',
  };
  
  const color = colors[fillLevel] || '#ef4444';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${ICON_SIZE}px;
        height: ${ICON_SIZE}px;
        border-radius: 50%;
        border: ${BORDER_WIDTH}px solid white;
        box-shadow: 0 2px ${SHADOW_BLUR}px rgba(0,0,0,${SHADOW_OPACITY});
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${FONT_SIZE_SMALL}px;
      ">
        ${fillLevel === 'Full' ? '100' : '75'}%
      </div>
    `,
    iconSize: [ICON_SIZE, ICON_SIZE],
    iconAnchor: [ICON_ANCHOR_OFFSET, ICON_ANCHOR_OFFSET],
  });
};

// Calculate weight based on bin capacity and fill percentage
const calculateBinWeight = (bin) => {
  const fillPercentage = bin.sensorData?.fillPercentage || 0;
  return FULL_WEIGHT_OF_BIN * (fillPercentage / 100);
};

// Bin Card Component
const BinCard = ({ bin, onCollectClick, collectingBin }) => {
  const fillColor = bin.sensorData.fillLevel === 'Full' ? 'bg-red-500' : 'bg-orange-500';
  const calculatedWeight = calculateBinWeight(bin);
  const isCollecting = collectingBin === bin._id;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className={`${fillColor} text-white px-3 py-1 rounded-full text-sm font-medium`}>
          {bin.sensorData.fillLevel}
        </span>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">
            {bin.sensorData.fillPercentage}%
          </span>
          <div className="text-sm text-gray-500">
            Est. Weight: {calculatedWeight.toFixed(2)}kg
          </div>
        </div>
      </div>

      {/* Bin Details */}
      <div className="space-y-3 mb-6">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Bin ID</p>
          <p className="font-medium text-gray-900">{bin.binId}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            Address
          </p>
          <p className="font-medium text-gray-900">{bin.address}</p>
          <p className="text-sm text-gray-500">{bin.area?.name}, {bin.area?.district}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            User
          </p>
          <p className="font-medium text-gray-900">{bin.user?.username}</p>
        </div>

        {bin.user?.contact && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contact
            </p>
            <p className="font-medium text-gray-900">{bin.user.contact}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-gray-400">
            Last Updated: {new Date(bin.sensorData.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Collect Button */}
      <button
        onClick={() => onCollectClick(bin)}
        disabled={isCollecting}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isCollecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Collecting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Collect Bin
          </>
        )}
      </button>
    </div>
  );
};

// Main Component
const FullBinsCollector = () => {
  const [loading, setLoading] = useState(true);
  const [fullBins, setFullBins] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [collectingBin, setCollectingBin] = useState(null);
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]);

  useEffect(() => {
    loadFullBins();
    const interval = setInterval(loadFullBins, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const loadFullBins = async () => {
    try {
      setLoading(true);
      const response = await getFullBinsForCollector();
      const bins = response.bins || response || [];
      setFullBins(bins);
      
      if (bins.length > 0 && bins[0].latitude && bins[0].longitude) {
        setMapCenter([bins[0].latitude, bins[0].longitude]);
      }
    } catch (error) {
      console.error('Error loading full bins:', error);
      toast.error(error.response?.data?.message || 'Failed to load full bins');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectClick = async (bin) => {
    try {
      setCollectingBin(bin._id);
      
      // Calculate weight based on bin capacity and fill percentage
      const calculatedWeight = calculateBinWeight(bin);
      
      await markBinCollected(bin._id, calculatedWeight);
      toast.success(`✅ Bin collected successfully! Weight: ${calculatedWeight.toFixed(2)}kg`);
      
      // Refresh the bins data
      loadFullBins();
    } catch (error) {
      console.error('Error collecting bin:', error);
      toast.error(error.response?.data?.message || 'Failed to collect bin');
    } finally {
      setCollectingBin(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CollectorDrawer />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CollectorDrawer />
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h1 className="text-3xl font-bold text-gray-900">Bins Ready for Collection</h1>
            </div>
            <p className="text-gray-600">
              {fullBins.length} bin{fullBins.length !== 1 ? 's' : ''} need{fullBins.length === 1 ? 's' : ''} collection
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className="bg-white border border-gray-300 rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'map'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Map
              </button>
            </div>
            
            <button
              onClick={loadFullBins}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {fullBins.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">No bins ready for collection</h3>
            <p className="text-blue-700">All bins in your assigned areas are currently below High fill level.</p>
          </div>
        ) : (
          <>
            {/* List View */}
            {viewMode === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fullBins.map((bin) => (
                  <BinCard
                    key={bin._id}
                    bin={bin}
                    onCollectClick={handleCollectClick}
                    collectingBin={collectingBin}
                  />
                ))}
              </div>
            )}

            {/* Map View */}
            {viewMode === 'map' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className={`h-[${MAP_HEIGHT_PX}px] relative`}>
                  <MapContainer
                    center={mapCenter}
                    zoom={MAP_ZOOM_LEVEL}
                    style={{ height: '100%', width: '100%' }}
                    key={`map-${fullBins.length}`}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    {fullBins.map((bin) => (
                      <Marker
                        key={bin._id}
                        position={[bin.latitude, bin.longitude]}
                        icon={createCustomIcon(bin.sensorData.fillLevel)}
                      >
                        <Popup>
                          <div className="p-3 min-w-[200px]">
                            <div className="font-semibold text-lg mb-3">{bin.binId}</div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Fill Level:</span>
                                <span className={`font-medium ${
                                  bin.sensorData.fillLevel === 'Full' ? 'text-red-600' : 'text-orange-600'
                                }`}>
                                  {bin.sensorData.fillLevel} ({bin.sensorData.fillPercentage}%)
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Address:</span>
                                <div className="font-medium">{bin.address}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">User:</span>
                                <div className="font-medium">{bin.user?.username}</div>
                              </div>
                              {bin.user?.contact && (
                                <div>
                                  <span className="text-gray-600">Contact:</span>
                                  <div className="font-medium">{bin.user.contact}</div>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="text-center text-sm text-gray-600 mb-2">
                                Est. Weight: {calculateBinWeight(bin).toFixed(2)}kg
                              </div>
                              
                              <button
                                onClick={() => {
                                  const lat = bin.latitude;
                                  const lng = bin.longitude;
                                  
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
                                    }, NAVIGATION_DELAY_MS);
                                  } else {
                                    // Desktop - open in new tab
                                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                                    window.open(googleMapsUrl, '_blank');
                                  }
                                }}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Start Navigation</span>
                              </button>
                              
                              <button
                                onClick={() => handleCollectClick(bin)}
                                disabled={collectingBin === bin._id}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                              >
                                {collectingBin === bin._id ? (
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
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default FullBinsCollector;