import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AdminDrawer from '../components/AdminDrawer';
import { getAllAreas } from '../../../api/areaApi';
import { getAllGarbages } from '../../../api/garbageApi';
import { toast } from 'react-toastify';

// Constants to replace magic numbers
const DENSITY_THRESHOLDS = {
  FULL: 90,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25,
  EMPTY: 0
};

const DENSITY_POINTS = {
  FULL: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25,
  EMPTY: 0
};

const DENSITY_COLORS = {
  VERY_HIGH: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-green-500',
  VERY_LOW: 'bg-blue-500',
  NO_DATA: 'bg-gray-500'
};

const DENSITY_INTENSITY = {
  VERY_HIGH: 'Very High',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  VERY_LOW: 'Very Low',
  NO_DATA: 'No Data'
};

const MAP_CONFIG = {
  DEFAULT_CENTER: [6.9271, 79.8612], // Colombo coordinates
  DEFAULT_ZOOM: 13,
  MAP_HEIGHT: 'h-96'
};

const VIEW_MODES = {
  HEATMAP: 'heatmap',
  INDIVIDUAL: 'individual'
};

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Marker icon configuration
const MARKER_ICON_CONFIG = {
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
};

// Create marker icons for different fill levels
const createMarkerIcon = (color) => new L.Icon({
  iconUrl: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  ...MARKER_ICON_CONFIG
});

const BIN_ICONS = {
  low: createMarkerIcon('green'),
  medium: createMarkerIcon('yellow'),
  high: createMarkerIcon('orange'),
  full: createMarkerIcon('red')
};

// Component to update map center
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Utility functions for density calculations
const calculateBinStatistics = (areaGarbages) => {
  const totalBins = areaGarbages.length;
  const fullBins = areaGarbages.filter(g => 
    g.sensorData?.fillLevel === 'Full' || g.sensorData?.fillPercentage >= DENSITY_THRESHOLDS.FULL
  ).length;
  const highFillBins = areaGarbages.filter(g => 
    g.sensorData?.fillPercentage >= DENSITY_THRESHOLDS.HIGH && g.sensorData?.fillPercentage < DENSITY_THRESHOLDS.FULL
  ).length;
  const mediumFillBins = areaGarbages.filter(g => 
    g.sensorData?.fillPercentage >= DENSITY_THRESHOLDS.MEDIUM && g.sensorData?.fillPercentage < DENSITY_THRESHOLDS.HIGH
  ).length;
  const lowFillBins = areaGarbages.filter(g => 
    g.sensorData?.fillPercentage >= DENSITY_THRESHOLDS.LOW && g.sensorData?.fillPercentage < DENSITY_THRESHOLDS.MEDIUM
  ).length;
  const emptyBins = areaGarbages.filter(g => 
    g.sensorData?.fillPercentage < DENSITY_THRESHOLDS.LOW
  ).length;

  return {
    totalBins,
    fullBins,
    highFillBins,
    mediumFillBins,
    lowFillBins,
    emptyBins
  };
};

const calculateDensityScore = (binStats) => {
  const { totalBins, fullBins, highFillBins, mediumFillBins, lowFillBins, emptyBins } = binStats;
  
  if (totalBins === 0) return 0;
  
  const totalPoints = (
    fullBins * DENSITY_POINTS.FULL +
    highFillBins * DENSITY_POINTS.HIGH +
    mediumFillBins * DENSITY_POINTS.MEDIUM +
    lowFillBins * DENSITY_POINTS.LOW +
    emptyBins * DENSITY_POINTS.EMPTY
  );
  
  return Math.round(totalPoints / totalBins);
};

const getAreaColor = (densityScore) => {
  if (densityScore >= 80) return DENSITY_COLORS.VERY_HIGH;
  if (densityScore >= 60) return DENSITY_COLORS.HIGH;
  if (densityScore >= 40) return DENSITY_COLORS.MEDIUM;
  if (densityScore >= 20) return DENSITY_COLORS.LOW;
  if (densityScore >= 0) return DENSITY_COLORS.VERY_LOW;
  return DENSITY_COLORS.NO_DATA;
};

const getAreaIntensity = (densityScore) => {
  if (densityScore >= 80) return DENSITY_INTENSITY.VERY_HIGH;
  if (densityScore >= 60) return DENSITY_INTENSITY.HIGH;
  if (densityScore >= 40) return DENSITY_INTENSITY.MEDIUM;
  if (densityScore >= 20) return DENSITY_INTENSITY.LOW;
  if (densityScore >= 0) return DENSITY_INTENSITY.VERY_LOW;
  return DENSITY_INTENSITY.NO_DATA;
};

const getBinIcon = (fillPercentage) => {
  if (fillPercentage >= DENSITY_THRESHOLDS.FULL) return BIN_ICONS.full;
  if (fillPercentage >= DENSITY_THRESHOLDS.HIGH) return BIN_ICONS.high;
  if (fillPercentage >= DENSITY_THRESHOLDS.MEDIUM) return BIN_ICONS.medium;
  return BIN_ICONS.low;
};

const AdminMap = () => {
  const [areas, setAreas] = useState([]);
  const [garbages, setGarbages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState(null);
  const [mapCenter, setMapCenter] = useState(MAP_CONFIG.DEFAULT_CENTER);
  const [viewMode, setViewMode] = useState(VIEW_MODES.HEATMAP);
  const [areaStats, setAreaStats] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [areasData, garbagesData] = await Promise.all([
        getAllAreas(),
        getAllGarbages()
      ]);

      console.log('Fetched areas data:', areasData);
      console.log('Fetched garbages data:', garbagesData);

      setAreas(areasData || []);
      setGarbages(garbagesData || []);
      
      // Calculate area statistics
      calculateAreaStats(areasData || [], garbagesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const filterGarbagesByArea = (garbagesData, areaId) => {
    return garbagesData.filter(garbage => {
      const garbageAreaId = typeof garbage.area === 'string' 
        ? garbage.area 
        : garbage.area?._id;
      return garbageAreaId === areaId;
    });
  };

  const processAreaStatistics = (area, areaGarbages) => {
    const binStats = calculateBinStatistics(areaGarbages);
    const densityScore = calculateDensityScore(binStats);
    
    console.log('Area', area.name, 'density score:', densityScore, 'total bins:', binStats.totalBins, 'empty bins:', binStats.emptyBins);

    return {
      ...area,
      ...binStats,
      densityScore,
      garbages: areaGarbages
    };
  };

  const calculateAreaStats = (areasData, garbagesData) => {
    console.log('Calculating area stats for:', areasData.length, 'areas and', garbagesData.length, 'garbages');
    
    const stats = areasData.map(area => {
      console.log('Processing area:', area.name, 'with coordinates:', area.coordinates);
      
      const areaGarbages = filterGarbagesByArea(garbagesData, area._id);
      console.log('Area', area.name, 'has', areaGarbages.length, 'garbages');

      return processAreaStatistics(area, areaGarbages);
    });

    // Sort by density score (highest first)
    const sortedStats = stats.sort((a, b) => b.densityScore - a.densityScore);
    console.log('Sorted area stats:', sortedStats);
    setAreaStats(sortedStats);
  };


  const handleAreaClick = (area) => {
    setSelectedArea(area);
    if (area.coordinates?.latitude && area.coordinates?.longitude) {
      setMapCenter([area.coordinates.latitude, area.coordinates.longitude]);
    }
  };

  const getAreaPosition = (areaStat) => {
    if (areaStat.coordinates?.latitude && areaStat.coordinates?.longitude) {
      return [areaStat.coordinates.latitude, areaStat.coordinates.longitude];
    }
    
    if (areaStat.garbages?.length > 0) {
      const validGarbages = areaStat.garbages.filter(g => g.latitude && g.longitude);
      if (validGarbages.length > 0) {
        const avgLat = validGarbages.reduce((sum, g) => sum + g.latitude, 0) / validGarbages.length;
        const avgLng = validGarbages.reduce((sum, g) => sum + g.longitude, 0) / validGarbages.length;
        return [avgLat, avgLng];
      }
    }
    
    return null;
  };

  if (loading) {
    return (
      <AdminDrawer>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminDrawer>
    );
  }

  return (
    <AdminDrawer>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent mb-2">
                Garbage Heat Map
              </h1>
              <p className="text-gray-600">View garbage density across service areas</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode(viewMode === VIEW_MODES.HEATMAP ? VIEW_MODES.INDIVIDUAL : VIEW_MODES.HEATMAP)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {viewMode === VIEW_MODES.HEATMAP ? 'Individual Bins' : 'Heat Map'}
              </button>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm">
                Mode: {viewMode} | Areas: {areaStats.length} | Garbages: {garbages.length}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Area Statistics Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Area Statistics</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {areaStats.map((area, index) => (
                  <div
                    key={area._id}
                    onClick={() => handleAreaClick(area)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedArea?._id === area._id 
                        ? 'bg-blue-100 border-2 border-blue-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{area.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getAreaColor(area.densityScore)}`}>
                        #{index + 1}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Density Score:</span>
                        <span className="font-medium">{area.densityScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Bins:</span>
                        <span className="font-medium">{area.totalBins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Full Bins:</span>
                        <span className="font-medium text-red-600">{area.fullBins}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Intensity: {getAreaIntensity(area.densityScore)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className={MAP_CONFIG.MAP_HEIGHT}>
                <MapContainer
                  center={mapCenter}
                  zoom={MAP_CONFIG.DEFAULT_ZOOM}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}
                >
                  <MapUpdater center={mapCenter} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Area Markers (Heat Map View) */}
                  {viewMode === 'heatmap' && areaStats.length === 0 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white p-4 rounded-lg shadow-lg text-center">
                      <p className="text-gray-600">No area data available for heat map</p>
                    </div>
                  )}
                  {viewMode === VIEW_MODES.HEATMAP && areaStats.map((areaStat) => {
                    console.log('Rendering heat map marker for area:', areaStat.name, 'with coordinates:', areaStat.coordinates, 'density score:', areaStat.densityScore);
                    
                    const position = getAreaPosition(areaStat);
                    if (!position) {
                      console.log('Area', areaStat.name, 'has no coordinates and no garbages, skipping');
                      return null;
                    }

                    console.log('Rendering marker for area', areaStat.name, 'at position:', position, 'with density score:', areaStat.densityScore);

                    return (
                      <Marker
                        key={areaStat._id}
                        position={position}
                        icon={new L.DivIcon({
                          className: 'custom-div-icon',
                          html: `<div class="w-8 h-8 rounded-full ${getAreaColor(areaStat.densityScore)} border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">${areaStat.densityScore}</div>`,
                          iconSize: [32, 32],
                          iconAnchor: [16, 16]
                        })}
                      >
                        <Popup>
                          <div className="p-3 min-w-[250px]">
                            <div className="font-semibold text-lg mb-3">{areaStat.name}</div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Density Score:</span>
                                <span className={`font-medium ${getAreaColor(areaStat.densityScore)} text-white px-2 py-1 rounded`}>
                                  {areaStat.densityScore}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Bins:</span>
                                <span className="font-medium">{areaStat.totalBins}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Full Bins:</span>
                                <span className="font-medium text-red-600">{areaStat.fullBins}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">High Fill:</span>
                                <span className="font-medium text-orange-600">{areaStat.highFillBins}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Medium Fill:</span>
                                <span className="font-medium text-yellow-600">{areaStat.mediumFillBins}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Low Fill:</span>
                                <span className="font-medium text-green-600">{areaStat.lowFillBins}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Empty:</span>
                                <span className="font-medium text-gray-600">{areaStat.emptyBins}</span>
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-500">
                              <strong>Intensity:</strong> {getAreaIntensity(areaStat.densityScore)}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Individual Bin Markers (Individual View) */}
                  {viewMode === VIEW_MODES.INDIVIDUAL && garbages.map((bin) => {
                    if (!bin.latitude || !bin.longitude) return null;
                    
                    const fillPercentage = bin.sensorData?.fillPercentage || 0;
                    const areaName = typeof bin.area === 'string'
                      ? bin.area
                      : bin.area?.name || 'Unknown';
                    
                    return (
                      <Marker
                        key={bin._id}
                        position={[bin.latitude, bin.longitude]}
                        icon={getBinIcon(fillPercentage)}
                      >
                        <Popup>
                          <div className="p-3 min-w-[250px]">
                            <div className="font-semibold text-lg mb-3">{bin.binId}</div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Fill Level:</span>
                                <span className={`font-medium ${
                                  fillPercentage >= 90 ? 'text-red-600' : 
                                  fillPercentage >= 75 ? 'text-orange-600' : 
                                  fillPercentage >= 50 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {bin.sensorData?.fillLevel} ({fillPercentage}%)
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Address:</span>
                                <div className="font-medium">{bin.address}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Area:</span>
                                <div className="font-medium">{areaName}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">User:</span>
                                <div className="font-medium">{bin.user?.username}</div>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Legend</h3>
              {viewMode === VIEW_MODES.HEATMAP ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Very High Density (80%+)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">High Density (60-79%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Medium Density (40-59%)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Low Density (20-39%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Very Low Density (0-19%)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Full Bin (90%+)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">High Fill (75-89%)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Medium Fill (50-74%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Low Fill (0-49%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminDrawer>
  );
};

export default AdminMap;
