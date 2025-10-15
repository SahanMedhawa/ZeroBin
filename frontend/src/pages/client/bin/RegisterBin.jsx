import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AddLocation as AddLocationIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { registerBin } from '../../../api/garbageApi';
import { getAllAreas } from '../../../api/areaApi';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * LocationPicker Component
 * Allows user to select location on map
 */
const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

/**
 * RegisterBin Component
 * One-time bin registration form with map picker
 * Follows Single Responsibility Principle: Only handles bin registration
 */
const RegisterBin = ({ onBinRegistered }) => {
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const [formData, setFormData] = useState({
    area: '',
    address: '',
    type: 'Recyclable',
  });
  const [position, setPosition] = useState([6.9271, 79.8612]); // Default: Colombo
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadAreas();
  }, []);

  /**
   * Load available areas
   */
  const loadAreas = async () => {
    try {
      const areasData = await getAllAreas();
      setAreas(areasData);
    } catch (error) {
      console.error('Error loading areas:', error);
      toast.error('Failed to load areas');
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }));
  };

  /**
   * Validate form
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.area) {
      newErrors.area = 'Please select an area';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.type) {
      newErrors.type = 'Please select bin type';
    }
    if (!position || position.length !== 2) {
      newErrors.location = 'Please select a location on the map';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      const binData = {
        area: formData.area,
        address: formData.address,
        type: formData.type,
        latitude: position[0],
        longitude: position[1],
      };

      const result = await registerBin(binData);

      toast.success('Bin registered successfully!');
      
      // Notify parent component
      if (onBinRegistered) {
        onBinRegistered();
      }
    } catch (error) {
      console.error('Error registering bin:', error);
      toast.error(error.response?.data?.message || 'Failed to register bin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          <AddLocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Register Your Smart Bin
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Register your bin once to start using the smart garbage collection system.
          You can only register one bin per account.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>One-time Registration:</strong> You can only register one bin. Choose your location carefully.
      </Alert>

      <Grid container spacing={3}>
        {/* Form */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Bin Details
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  select
                  label="Area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  error={!!errors.area}
                  helperText={errors.area}
                  margin="normal"
                  required
                >
                  {areas.map((area) => (
                    <MenuItem key={area._id} value={area._id}>
                      {area.name} - {area.district}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  margin="normal"
                  multiline
                  rows={3}
                  required
                />

                <TextField
                  fullWidth
                  select
                  label="Bin Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  error={!!errors.type}
                  helperText={errors.type}
                  margin="normal"
                  required
                >
                  <MenuItem value="Recyclable">Recyclable</MenuItem>
                  <MenuItem value="Non-Recyclable">Non-Recyclable</MenuItem>
                </TextField>

                <Box mt={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Selected Location
                  </Typography>
                  <Typography variant="body2">
                    Latitude: {position[0].toFixed(6)}
                  </Typography>
                  <Typography variant="body2">
                    Longitude: {position[1].toFixed(6)}
                  </Typography>
                  {errors.location && (
                    <Typography variant="caption" color="error">
                      {errors.location}
                    </Typography>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={loading}
                  sx={{ mt: 3 }}
                >
                  {loading ? 'Registering...' : 'Register Bin'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Map */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Select Location on Map
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block" mb={2}>
                Click on the map to select your bin location
              </Typography>

              <Box sx={{ height: 400, borderRadius: 2, overflow: 'hidden' }}>
                <MapContainer
                  center={position}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterBin;
