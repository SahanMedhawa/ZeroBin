import { useState, useEffect } from 'react';
import { getAllGarbages } from '../../../../api/garbageApi';
import { getAllAreas } from '../../../../api/areaApi';
import { AnalyticsService } from '../services/analyticsService';
import { CHART_COLORS, DISPLAY_LIMITS } from '../constants/analyticsConstants';

export const useAnalytics = () => {
  const [garbages, setGarbages] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [garbagesData, areasData] = await Promise.all([
        getAllGarbages(),
        getAllAreas()
      ]);
      setGarbages(garbagesData || []);
      setAreas(areasData || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const analytics = AnalyticsService.calculateSensorAnalytics(garbages);
  const areaAnalytics = AnalyticsService.calculateAreaAnalytics(areas, garbages);
  const timeAnalytics = AnalyticsService.calculateTimeAnalytics(garbages);
  const timeSeriesData = AnalyticsService.generateTimeSeriesData(garbages);
  const districts = AnalyticsService.getUniqueDistricts(areas);
  const filteredAreaAnalytics = AnalyticsService.filterAreasByDistrict(areaAnalytics, selectedDistrict);

  const fillLevelChartData = [
    { name: 'Critical (90%+)', value: analytics.criticalBins, color: CHART_COLORS.CRITICAL },
    { name: 'High (75-89%)', value: analytics.highFillBins, color: CHART_COLORS.HIGH },
    { name: 'Medium (50-74%)', value: analytics.mediumFillBins, color: CHART_COLORS.MEDIUM },
    { name: 'Low (<50%)', value: analytics.lowFillBins, color: CHART_COLORS.LOW }
  ];

  const areaPerformanceData = filteredAreaAnalytics.slice(0, DISPLAY_LIMITS.MAX_AREAS_CHART).map(area => ({
    name: area.name.length > DISPLAY_LIMITS.MAX_NAME_LENGTH 
      ? area.name.substring(0, DISPLAY_LIMITS.MAX_NAME_LENGTH) + '...' 
      : area.name,
    fullName: area.name,
    averageFill: area.averageFill,
    totalBins: area.totalBins,
    criticalBins: area.criticalBins
  }));

  const statusDistributionData = [
    { name: 'Collected', value: garbages.filter(g => g.status === 'Collected').length, color: CHART_COLORS.COLLECTED },
    { name: 'In Progress', value: garbages.filter(g => g.status === 'In Progress').length, color: CHART_COLORS.IN_PROGRESS },
    { name: 'Pending', value: garbages.filter(g => g.status === 'Pending').length, color: CHART_COLORS.PENDING }
  ];

  return {
    garbages,
    areas,
    loading,
    selectedDistrict,
    setSelectedDistrict,
    analytics,
    areaAnalytics,
    timeAnalytics,
    timeSeriesData,
    districts,
    filteredAreaAnalytics,
    fillLevelChartData,
    areaPerformanceData,
    statusDistributionData
  };
};
