import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import {
  Sensors as SensorsIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { updateBinSensor } from '../../../api/garbageApi';

/**
 * SensorControl Component
 * Allows users to manually simulate sensor fill level
 * Follows Single Responsibility Principle: Only handles sensor updates
 */
const SensorControl = ({ bin, onUpdate }) => {
  const [fillLevel, setFillLevel] = useState(bin?.sensorData?.fillLevel || 'Empty');
  const [updating, setUpdating] = useState(false);

  /**
   * Fill level options with descriptions
   */
  const fillLevels = [
    { value: 'Empty', percentage: 0, color: '#4caf50', description: 'Bin is empty' },
    { value: 'Low', percentage: 25, color: '#8bc34a', description: 'Bin is 25% full' },
    { value: 'Medium', percentage: 50, color: '#ffc107', description: 'Bin is half full' },
    { value: 'High', percentage: 75, color: '#ff9800', description: 'Bin is 75% full' },
    { value: 'Full', percentage: 100, color: '#f44336', description: 'Bin is completely full' },
  ];

  /**
   * Get fill level details
   */
  const getFillLevelInfo = (level) => {
    return fillLevels.find(fl => fl.value === level) || fillLevels[0];
  };

  /**
   * Handle sensor update
   */
  const handleUpdateSensor = async () => {
    if (!bin?.binId) {
      toast.error('Bin ID not found');
      return;
    }

    if (fillLevel === bin?.sensorData?.fillLevel) {
      toast.info('Fill level is already set to this value');
      return;
    }

    try {
      setUpdating(true);

      const result = await updateBinSensor(bin.binId, fillLevel);

      // Show success message based on visibility change
      if (result.isVisibleToCollectors && fillLevel === 'Full') {
        toast.success('🎯 Bin marked as FULL! Collectors will be notified soon.');
      } else if (result.isVisibleToCollectors && fillLevel === 'High') {
        toast.success('⚠️ Bin marked as HIGH! Collectors can now see your bin.');
      } else {
        toast.success(`✅ Sensor updated to ${fillLevel}`);
      }

      // Refresh parent component
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating sensor:', error);
      toast.error(error.response?.data?.message || 'Failed to update sensor');
    } finally {
      setUpdating(false);
    }
  };

  const currentInfo = getFillLevelInfo(fillLevel);
  const currentBinInfo = getFillLevelInfo(bin?.sensorData?.fillLevel);

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          <SensorsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Sensor Control Panel
        </Typography>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Manually simulate your bin's fill level
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* Current Status */}
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Current Status
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={bin?.sensorData?.fillLevel || 'Unknown'}
              sx={{
                backgroundColor: currentBinInfo.color,
                color: 'white',
                fontWeight: 'bold',
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {currentBinInfo.percentage}%
            </Typography>
          </Box>
        </Box>

        {/* Fill Level Selector */}
        <FormControl fullWidth margin="normal">
          <InputLabel>New Fill Level</InputLabel>
          <Select
            value={fillLevel}
            onChange={(e) => setFillLevel(e.target.value)}
            label="New Fill Level"
          >
            {fillLevels.map((level) => (
              <MenuItem key={level.value} value={level.value}>
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                  <span>{level.value}</span>
                  <Chip
                    label={`${level.percentage}%`}
                    size="small"
                    sx={{
                      backgroundColor: level.color,
                      color: 'white',
                      ml: 1,
                    }}
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Selected Level Description */}
        <Box mt={2} mb={2}>
          <Typography variant="caption" color="text.secondary">
            {currentInfo.description}
          </Typography>
        </Box>

        {/* Visibility Warning */}
        {(fillLevel === 'Full' || fillLevel === 'High') && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Note:</strong> Setting fill level to {fillLevel} will make your bin visible to collectors.
          </Alert>
        )}

        {/* Update Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          startIcon={<UpdateIcon />}
          onClick={handleUpdateSensor}
          disabled={updating || fillLevel === bin?.sensorData?.fillLevel}
        >
          {updating ? 'Updating...' : 'Update Sensor'}
        </Button>

        {/* Info Box */}
        <Box mt={3} p={2} bgcolor="#f5f5f5" borderRadius={2}>
          <Typography variant="caption" color="text.secondary">
            <strong>How it works:</strong> Select a fill level and click "Update Sensor" to simulate
            your bin's current status. When your bin reaches High or Full, it becomes visible to
            collectors in your area for pickup.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SensorControl;
