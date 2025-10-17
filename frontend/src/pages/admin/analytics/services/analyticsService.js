import { FILL_LEVEL_THRESHOLDS, TIME_CONSTANTS, PRIORITY_LEVELS } from '../constants/analyticsConstants';

export class AnalyticsService {
  static calculateSensorAnalytics(garbages) {
    const totalBins = garbages.length;
    const binsWithSensors = garbages.filter(g => g.sensorData?.fillPercentage !== undefined);
    
    const fillLevels = binsWithSensors.map(g => g.sensorData.fillPercentage);
    const averageFill = fillLevels.length > 0 
      ? fillLevels.reduce((a, b) => a + b, 0) / fillLevels.length 
      : 0;
    
    const criticalBins = binsWithSensors.filter(g => 
      g.sensorData.fillPercentage >= FILL_LEVEL_THRESHOLDS.CRITICAL
    ).length;
    
    const highFillBins = binsWithSensors.filter(g => 
      g.sensorData.fillPercentage >= FILL_LEVEL_THRESHOLDS.HIGH && 
      g.sensorData.fillPercentage < FILL_LEVEL_THRESHOLDS.CRITICAL
    ).length;
    
    const mediumFillBins = binsWithSensors.filter(g => 
      g.sensorData.fillPercentage >= FILL_LEVEL_THRESHOLDS.MEDIUM && 
      g.sensorData.fillPercentage < FILL_LEVEL_THRESHOLDS.HIGH
    ).length;
    
    const lowFillBins = binsWithSensors.filter(g => 
      g.sensorData.fillPercentage < FILL_LEVEL_THRESHOLDS.MEDIUM
    ).length;

    return {
      totalBins,
      binsWithSensors: binsWithSensors.length,
      averageFill: Math.round(averageFill),
      criticalBins,
      highFillBins,
      mediumFillBins,
      lowFillBins,
      fillLevels
    };
  }

  static calculateAreaAnalytics(areas, garbages) {
    return areas.map(area => {
      const areaGarbages = garbages.filter(g => {
        const garbageAreaId = typeof g.area === 'string' ? g.area : g.area?._id;
        return garbageAreaId === area._id;
      });
      
      const areaSensors = areaGarbages.filter(g => g.sensorData?.fillPercentage !== undefined);
      const avgFill = areaSensors.length > 0 
        ? Math.round(areaSensors.reduce((sum, g) => sum + g.sensorData.fillPercentage, 0) / areaSensors.length)
        : 0;
      
      const criticalCount = areaSensors.filter(g => 
        g.sensorData.fillPercentage >= FILL_LEVEL_THRESHOLDS.CRITICAL
      ).length;
      
      return {
        ...area,
        totalBins: areaGarbages.length,
        sensorBins: areaSensors.length,
        averageFill: avgFill,
        criticalBins: criticalCount,
        priority: this.calculatePriority(criticalCount, avgFill)
      };
    }).sort((a, b) => b.averageFill - a.averageFill);
  }

  static calculateTimeAnalytics(garbages) {
    const now = new Date();
    const last24h = new Date(now.getTime() - TIME_CONSTANTS.MILLISECONDS_IN_DAY);
    const lastWeek = new Date(now.getTime() - TIME_CONSTANTS.DAYS_IN_WEEK * TIME_CONSTANTS.MILLISECONDS_IN_DAY);
    
    const recentUpdates = garbages.filter(g => {
      const updateTime = new Date(g.sensorData?.lastUpdated || g.updatedAt);
      return updateTime > last24h;
    });
    
    const weeklyUpdates = garbages.filter(g => {
      const updateTime = new Date(g.sensorData?.lastUpdated || g.updatedAt);
      return updateTime > lastWeek;
    });

    return {
      recentUpdates: recentUpdates.length,
      weeklyUpdates: weeklyUpdates.length,
      updateFrequency: Math.round((recentUpdates.length / TIME_CONSTANTS.HOURS_IN_DAY) * 100) / 100
    };
  }

  static generateTimeSeriesData(garbages) {
    const now = new Date();
    const data = [];
    
    for (let i = TIME_CONSTANTS.DAYS_IN_WEEK - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * TIME_CONSTANTS.MILLISECONDS_IN_DAY);
      const dayGarbages = garbages.filter(g => {
        const updateTime = new Date(g.sensorData?.lastUpdated || g.updatedAt);
        return updateTime.toDateString() === date.toDateString();
      });
      
      const avgFill = dayGarbages.length > 0 
        ? Math.round(dayGarbages.reduce((sum, g) => sum + (g.sensorData?.fillPercentage || 0), 0) / dayGarbages.length)
        : 0;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        averageFill: avgFill,
        totalUpdates: dayGarbages.length,
        criticalBins: dayGarbages.filter(g => g.sensorData?.fillPercentage >= FILL_LEVEL_THRESHOLDS.CRITICAL).length
      });
    }
    return data;
  }

  static calculatePriority(criticalCount, avgFill) {
    if (criticalCount > 0) return PRIORITY_LEVELS.HIGH;
    if (avgFill >= FILL_LEVEL_THRESHOLDS.HIGH) return PRIORITY_LEVELS.MEDIUM;
    return PRIORITY_LEVELS.LOW;
  }

  static getUniqueDistricts(areas) {
    return [...new Set(areas.map(area => area.district))].filter(Boolean);
  }

  static filterAreasByDistrict(areaAnalytics, selectedDistrict) {
    return selectedDistrict 
      ? areaAnalytics.filter(area => area.district === selectedDistrict)
      : areaAnalytics;
  }
}
