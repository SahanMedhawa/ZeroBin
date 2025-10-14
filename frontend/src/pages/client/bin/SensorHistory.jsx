import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { getSensorHistory } from '../../../api/garbageApi';

/**
 * SensorHistory Component
 * Displays the complete sensor update history
 * Follows Single Responsibility Principle: Only displays history
 */
const SensorHistory = ({ bin }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bin?.binId) {
      loadHistory();
    }
  }, [bin]);

  /**
   * Load sensor history
   */
  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await getSensorHistory(bin.binId);
      setHistory(historyData.slice(0, 10)); // Show last 10 updates
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory(bin?.sensorData?.updateHistory || []);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get fill level color
   */
  const getFillColor = (level) => {
    const colors = {
      Empty: '#4caf50',
      Low: '#8bc34a',
      Medium: '#ffc107',
      High: '#ff9800',
      Full: '#f44336',
    };
    return colors[level] || '#9e9e9e';
  };

  /**
   * Get method badge color
   */
  const getMethodColor = (method) => {
    const colors = {
      manual: 'primary',
      sensor: 'success',
      system: 'default',
    };
    return colors[method] || 'default';
  };

  /**
   * Determine trend (increasing or decreasing)
   */
  const getTrend = (index) => {
    if (index === history.length - 1) return null; // No previous item
    const current = history[index].percentage;
    const previous = history[index + 1].percentage;
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return null;
  };

  if (loading) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Sensor History
        </Typography>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Last {Math.min(history.length, 10)} sensor updates
        </Typography>
        <Divider sx={{ my: 2 }} />

        {history.length === 0 ? (
          <Alert severity="info">No sensor history available yet.</Alert>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {history.map((item, index) => {
              const trend = getTrend(index);
              return (
                <React.Fragment key={index}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Chip
                            label={item.level}
                            size="small"
                            sx={{
                              backgroundColor: getFillColor(item.level),
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          />
                          <Chip
                            label={`${item.percentage}%`}
                            size="small"
                            variant="outlined"
                          />
                          {trend === 'up' && (
                            <TrendingUpIcon fontSize="small" color="error" />
                          )}
                          {trend === 'down' && (
                            <TrendingDownIcon fontSize="small" color="success" />
                          )}
                          <Chip
                            label={item.method}
                            size="small"
                            color={getMethodColor(item.method)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box mt={1}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {new Date(item.timestamp).toLocaleString()}
                          </Typography>
                          {item.updatedBy && (
                            <Typography variant="caption" color="text.secondary">
                              Updated by: {item.updatedBy.username || 'System'}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < history.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}

        {/* Statistics Summary */}
        {history.length > 0 && (
          <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={2}>
            <Typography variant="caption" color="text.secondary">
              <strong>Total Updates:</strong> {history.length}
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              <strong>First Update:</strong>{' '}
              {new Date(history[history.length - 1].timestamp).toLocaleDateString()}
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              <strong>Latest Update:</strong>{' '}
              {new Date(history[0].timestamp).toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SensorHistory;
