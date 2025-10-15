import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Sensors as SensorsIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getUserBin, checkUserHasBin } from '../../../api/garbageApi';
import RegisterBin from './RegisterBin';
import SensorControl from './SensorControl';
import SensorHistory from './SensorHistory';
import UserDrawer from '../components/UserDrawer';

/**
 * BinManagement Component
 * Main hub for user's registered bin - shows bin info and sensor status
 * Follows Single Responsibility Principle: Only manages bin display and coordination
 */
const BinManagement = () => {
  const [loading, setLoading] = useState(true);
  const [hasBin, setHasBin] = useState(false);
  const [binData, setBinData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAndLoadBin();
  }, [refreshKey]);

  /**
   * Check if user has a bin and load its data
   */
  const checkAndLoadBin = async () => {
    try {
      setLoading(true);
      const checkResult = await checkUserHasBin();
      
      if (checkResult.hasBin) {
        const bin = await getUserBin();
        setBinData(bin);
        setHasBin(true);
      } else {
        setHasBin(false);
      }
    } catch (error) {
      console.error('Error loading bin:', error);
      setHasBin(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh bin data after sensor updates
   */
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.info('Refreshing bin data...');
  };

  /**
   * Get color based on fill level
   */
  const getFillColor = (fillLevel) => {
    const colors = {
      Empty: '#4caf50',
      Low: '#8bc34a',
      Medium: '#ffc107',
      High: '#ff9800',
      Full: '#f44336',
    };
    return colors[fillLevel] || '#9e9e9e';
  };

  /**
   * Get status chip color
   */
  const getStatusColor = (status) => {
    const colors = {
      Pending: 'warning',
      'In Progress': 'info',
      Collected: 'success',
      Cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  // Loading state
  if (loading) {
    return (
      <UserDrawer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </UserDrawer>
    );
  }

  // No bin registered - show registration form
  if (!hasBin) {
    return (
      <UserDrawer>
        <RegisterBin onBinRegistered={handleRefresh} />
      </UserDrawer>
    );
  }

  // Bin registered - show management interface
  return (
    <UserDrawer>
      <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          <SensorsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          My Smart Bin
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {/* Visibility Alert */}
      {binData?.isVisibleToCollectors && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <strong>Your bin is visible to collectors!</strong> It will be collected soon.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Bin Information Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Bin Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Bin ID
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {binData?.binId}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Type
                </Typography>
                <Chip 
                  label={binData?.type} 
                  color={binData?.type === 'Recyclable' ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip 
                  label={binData?.status} 
                  color={getStatusColor(binData?.status)}
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  <LocationIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                  Location
                </Typography>
                <Typography variant="body2">{binData?.address}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Area: {binData?.area?.name || 'N/A'}
                </Typography>
              </Box>

              {binData?.collectionDate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    <CalendarIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Last Collection
                  </Typography>
                  <Typography variant="body2">
                    {new Date(binData.collectionDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              {binData?.assignedCollector && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Assigned Collector
                  </Typography>
                  <Typography variant="body2">
                    {binData.assignedCollector.collectorName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Truck: {binData.assignedCollector.truckNumber}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sensor Status Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Sensor Status
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Fill Level Indicator */}
              <Box textAlign="center" mb={3}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    border: `8px solid ${getFillColor(binData?.sensorData?.fillLevel)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 auto',
                    mb: 2,
                  }}
                >
                  <Typography variant="h3" fontWeight="bold">
                    {binData?.sensorData?.fillPercentage}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {binData?.sensorData?.fillLevel}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Last Updated: {' '}
                  {binData?.sensorData?.lastUpdated
                    ? new Date(binData.sensorData.lastUpdated).toLocaleString()
                    : 'N/A'}
                </Typography>
              </Box>

              {/* Linear Progress Bar */}
              <Box mb={2}>
                <LinearProgress
                  variant="determinate"
                  value={binData?.sensorData?.fillPercentage || 0}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getFillColor(binData?.sensorData?.fillLevel),
                    },
                  }}
                />
              </Box>

              {/* Update History Count */}
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Total Updates: {binData?.sensorData?.updateHistory?.length || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sensor Control */}
        <Grid item xs={12} md={6}>
          <SensorControl bin={binData} onUpdate={handleRefresh} />
        </Grid>

        {/* Sensor History */}
        <Grid item xs={12} md={6}>
          <SensorHistory bin={binData} />
        </Grid>
      </Grid>
    </Box>
    </UserDrawer>
  );
};

export default BinManagement;
