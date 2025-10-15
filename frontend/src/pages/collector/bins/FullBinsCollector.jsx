import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Map as MapIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getFullBinsForCollector, markBinCollected } from '../../../api/garbageApi';
import CollectorDrawer from '../components/CollectorDrawer';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Custom marker icons based on fill level
 */
const createCustomIcon = (fillLevel) => {
  const colors = {
    Full: '#f44336',
    High: '#ff9800',
  };
  
  const color = colors[fillLevel] || '#f44336';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${fillLevel === 'Full' ? '100' : '75'}%
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

/**
 * CollectBinDialog Component
 * Dialog for marking a bin as collected
 */
const CollectBinDialog = ({ open, onClose, bin, onCollected }) => {
  const [weight, setWeight] = useState('');
  const [collecting, setCollecting] = useState(false);

  const handleCollect = async () => {
    try {
      setCollecting(true);
      await markBinCollected(bin._id, weight ? parseFloat(weight) : undefined);
      toast.success('✅ Bin collected successfully! Sensor reset to Empty.');
      onCollected();
      onClose();
    } catch (error) {
      console.error('Error collecting bin:', error);
      toast.error(error.response?.data?.message || 'Failed to collect bin');
    } finally {
      setCollecting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Collect Bin</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Bin ID: <strong>{bin?.binId}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Address: <strong>{bin?.address}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill Level: <Chip label={bin?.sensorData?.fillLevel} size="small" color="error" />
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Weight (kg) - Optional"
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          margin="normal"
          helperText="Enter the collected garbage weight if known"
        />

        <Alert severity="info" sx={{ mt: 2 }}>
          Marking this bin as collected will reset its sensor to "Empty" status.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={collecting}>
          Cancel
        </Button>
        <Button
          onClick={handleCollect}
          variant="contained"
          color="primary"
          disabled={collecting}
          startIcon={collecting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
        >
          {collecting ? 'Collecting...' : 'Collect Bin'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * FullBinsCollector Component
 * Shows all full bins in collector's assigned areas with map and list view
 * Follows Single Responsibility Principle: Only displays and manages full bins collection
 */
const FullBinsCollector = () => {
  const [loading, setLoading] = useState(true);
  const [fullBins, setFullBins] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [selectedBin, setSelectedBin] = useState(null);
  const [collectDialogOpen, setCollectDialogOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]); // Default: Colombo

  useEffect(() => {
    loadFullBins();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadFullBins, 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Load full bins from API
   */
  const loadFullBins = async () => {
    try {
      setLoading(true);
      const response = await getFullBinsForCollector();
      console.log('Full bins response:', response); // Debug log
      
      // Handle both response formats
      const bins = response.bins || response || [];
      console.log('Bins to display:', bins); // Debug log
      
      setFullBins(bins);
      
      // Set map center to first bin if available
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

  /**
   * Handle collect bin click
   */
  const handleCollectClick = (bin) => {
    setSelectedBin(bin);
    setCollectDialogOpen(true);
  };

  /**
   * After bin collected, refresh list
   */
  const handleBinCollected = () => {
    loadFullBins();
  };

  /**
   * Get fill level color
   */
  const getFillColor = (fillLevel) => {
    return fillLevel === 'Full' ? '#f44336' : '#ff9800';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CollectorDrawer />
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', ml: { sm: '240px' } }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <CollectorDrawer />
      <Box sx={{ flexGrow: 1, ml: { sm: '240px' }, p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            <DeleteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Bins Ready for Collection
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fullBins.length} bin{fullBins.length !== 1 ? 's' : ''} need{fullBins.length === 1 ? 's' : ''} collection
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'map' ? 'contained' : 'outlined'}
            startIcon={<MapIcon />}
            onClick={() => setViewMode('map')}
          >
            Map View
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadFullBins}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {fullBins.length === 0 ? (
        <Alert severity="info">
          <strong>No bins ready for collection.</strong> All bins in your assigned areas are currently below High fill level.
        </Alert>
      ) : (
        <>
          {/* List View */}
          {viewMode === 'list' && (
            <Grid container spacing={3}>
              {fullBins.map((bin) => (
                <Grid item xs={12} md={6} lg={4} key={bin._id}>
                  <Card elevation={3}>
                    <CardContent>
                      {/* Bin Header */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Chip
                          label={bin.sensorData.fillLevel}
                          sx={{
                            backgroundColor: getFillColor(bin.sensorData.fillLevel),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                        <Typography variant="h5" fontWeight="bold">
                          {bin.sensorData.fillPercentage}%
                        </Typography>
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      {/* Bin Info */}
                      <Box mb={2}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Bin ID
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {bin.binId}
                        </Typography>
                      </Box>

                      <Box mb={2}>
                        <Typography variant="subtitle2" color="text.secondary">
                          <LocationIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                          Address
                        </Typography>
                        <Typography variant="body2">{bin.address}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {bin.area?.name}, {bin.area?.district}
                        </Typography>
                      </Box>

                      <Box mb={2}>
                        <Typography variant="subtitle2" color="text.secondary">
                          <PersonIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                          User
                        </Typography>
                        <Typography variant="body2">{bin.user?.username}</Typography>
                      </Box>

                      {bin.user?.contact && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" color="text.secondary">
                            <PhoneIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                            Contact
                          </Typography>
                          <Typography variant="body2">{bin.user.contact}</Typography>
                        </Box>
                      )}

                      <Box mb={2}>
                        <Typography variant="caption" color="text.secondary">
                          Last Updated: {new Date(bin.sensorData.lastUpdated).toLocaleString()}
                        </Typography>
                      </Box>

                      {/* Collect Button */}
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleCollectClick(bin)}
                      >
                        Collect Bin
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Map View */}
          {viewMode === 'map' && (
            <Card className="shadow-2xl rounded-xl overflow-hidden border-t-4 border-purple-500">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
                  <div className="flex items-center gap-3">
                    <MapIcon sx={{ fontSize: 32 }} />
                    <div>
                      <Typography variant="h6" className="font-bold">
                        Interactive Map View
                      </Typography>
                      <Typography variant="body2" className="text-purple-100">
                        Click on markers to view bin details and collect
                      </Typography>
                    </div>
                  </div>
                </div>
                <Box className="h-[600px] relative">
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
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
                          <div className="min-w-[240px] p-2">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg mb-3 shadow-lg">
                              <Typography variant="subtitle1" className="font-bold">
                                {bin.binId}
                              </Typography>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between bg-red-50 rounded p-2">
                                <Typography variant="body2" className="text-gray-600 font-medium">
                                  Fill Level:
                                </Typography>
                                <span className="font-bold text-red-600">
                                  {bin.sensorData.fillLevel} ({bin.sensorData.fillPercentage}%)
                                </span>
                              </div>
                              <div className="bg-blue-50 rounded p-2">
                                <Typography variant="body2" className="text-gray-600 font-medium mb-1">
                                  Address:
                                </Typography>
                                <Typography variant="body2" className="text-gray-800">
                                  {bin.address}
                                </Typography>
                              </div>
                              <div className="bg-purple-50 rounded p-2">
                                <Typography variant="body2" className="text-gray-600 font-medium mb-1">
                                  User:
                                </Typography>
                                <Typography variant="body2" className="text-gray-800">
                                  {bin.user?.username}
                                </Typography>
                              </div>
                              {bin.user?.contact && (
                                <div className="bg-orange-50 rounded p-2">
                                  <Typography variant="body2" className="text-gray-600 font-medium mb-1">
                                    Contact:
                                  </Typography>
                                  <Typography variant="body2" className="text-gray-800">
                                    {bin.user.contact}
                                  </Typography>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="contained"
                              size="small"
                              fullWidth
                              onClick={() => handleCollectClick(bin)}
                              className="mt-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg text-white font-bold py-2"
                            >
                              Collect Bin
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Collect Dialog */}
      {selectedBin && (
        <CollectBinDialog
          open={collectDialogOpen}
          onClose={() => setCollectDialogOpen(false)}
          bin={selectedBin}
          onCollected={handleBinCollected}
        />
      )}
      </Box>
    </Box>
  );
};

export default FullBinsCollector;
