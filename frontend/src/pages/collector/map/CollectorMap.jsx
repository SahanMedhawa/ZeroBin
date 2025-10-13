import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CollectorDrawer from '../components/CollectorDrawer';
import {
  getCollectorSchedules,
  getAllSmartDevices,
} from '../../../api/collectorApi';
import { toast } from 'react-toastify';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const redIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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

const CollectorMap = () => {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [garbages, setGarbages] = useState([]);
  const [inProgressSchedule, setInProgressSchedule] = useState(null);
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]); // Default: Colombo
  const watchIdRef = useRef(null);

  useEffect(() => {
    fetchSchedules();
    return () => {
      // Cleanup: stop watching location
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await getCollectorSchedules();
      setSchedules(data);
      
      // Find in-progress schedule
      const inProgress = data.find((s) => s.status === 'In Progress');
      setInProgressSchedule(inProgress);
      
      // Fetch garbage for in-progress schedule area
      if (inProgress && inProgress.area) {
        const areaId = typeof inProgress.area === 'string' 
          ? inProgress.area 
          : inProgress.area._id;
        fetchGarbageByArea(areaId);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to fetch schedules');
    }
  };

  const fetchGarbageByArea = async (areaId) => {
    try {
      const data = await getAllSmartDevices();
      // Filter devices by area and status
      const filteredDevices = data.filter(
        (device) => {
          const deviceAreaId = typeof device.area === 'string' 
            ? device.area 
            : device.area?._id;
          return deviceAreaId === areaId && device.garbageStatus === 'Pending';
        }
      );
      setGarbages(filteredDevices);
    } catch (error) {
      console.error('Error fetching smart devices:', error);
      toast.error('Unable to load garbage locations. You may need admin access.');
    }
  };

  const toggleLocation = () => {
    if (locationEnabled) {
      // Turn off location tracking
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setLocationEnabled(false);
      toast.info('Location tracking disabled');
    } else {
      // Turn on location tracking
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentLocation(newLocation);
            setMapCenter([newLocation.lat, newLocation.lng]);
            setLocationEnabled(true);
          },
          (error) => {
            console.error('Error getting location:', error);
            toast.error('Failed to get location. Please check permissions.');
            setLocationEnabled(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } else {
        toast.error('Geolocation is not supported by your browser');
      }
    }
  };

  const areaName = inProgressSchedule?.area?.name || 'No Active Route';

  return (
    <div className="flex h-screen bg-gray-50">
      <CollectorDrawer />

      <div className="flex-1 relative">
        {/* Map Container */}
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <MapUpdater center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Current Location Marker */}
          {locationEnabled && currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={blueIcon}>
              <Popup>Your Current Location</Popup>
            </Marker>
          )}

          {/* Smart Device Collection Points */}
          {locationEnabled && garbages.map((device) => {
            // Skip devices without location
            if (!device.latitude || !device.longitude) return null;
            
            const icon = device.type === 'Recyclable' ? greenIcon : redIcon;
            const areaName = typeof device.area === 'string'
              ? device.area
              : device.area?.name || 'Unknown';
            
            return (
              <Marker
                key={device._id}
                position={[device.latitude, device.longitude]}
                icon={icon}
              >
                <Popup>
                  <div className="p-2">
                    <p className="font-semibold">Smart Device</p>
                    <p className="text-sm text-gray-600">Type: {device.type}</p>
                    <p className="text-sm text-gray-600">Status: {device.garbageStatus}</p>
                    <p className="text-sm text-gray-600">Area: {areaName}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Location Toggle Button */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
          <button
            onClick={toggleLocation}
            className={`px-6 py-3 rounded-xl shadow-lg font-semibold text-white flex items-center space-x-3 transition-colors ${
              locationEnabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <span className="text-lg">
              {locationEnabled ? 'Location Service is On' : 'Location Service is Off'}
            </span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {locationEnabled ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </button>
        </div>

        {/* Current Route Info */}
        {locationEnabled && inProgressSchedule && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
            <div className="bg-green-600 px-6 py-3 rounded-xl shadow-lg flex items-center space-x-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-xl text-white font-semibold">{areaName}</span>
            </div>
          </div>
        )}

        {/* Legend */}
        {locationEnabled && (
          <div className="absolute bottom-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Your Location</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Recyclable Bin</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Non-Recyclable Bin</span>
              </div>
            </div>
          </div>
        )}

        {/* No Active Route Message */}
        {!locationEnabled && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white p-8 rounded-xl shadow-2xl text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Location Service Disabled</h2>
            <p className="text-gray-600 mb-4">Enable location to view collection routes</p>
            <button
              onClick={toggleLocation}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Enable Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectorMap;
