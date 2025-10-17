import { useState, useEffect, useMemo } from "react";
import {
  DASHBOARD_CONSTANTS,
  MOCK_AREA_BREAKDOWN,
  MOCK_RECENT_REQUESTS,
  MOCK_ACTIVE_VEHICLES_LIST,
  MOCK_PERFORMANCE_METRICS,
} from "../constants/dashboardConstants";
import { calculateCompletionPercentage } from "../utility/FleetM_Dashbaord";

/**
 * Custom hook for WMA Dashboard data management
 * Follows Single Responsibility Principle - handles only data logic
 *
 * @returns {Object} Dashboard data and computed values
 */
export const useWMADashboardData = () => {
  // State management
  const [totalIncome] = useState(DASHBOARD_CONSTANTS.DEFAULT_TOTAL_INCOME);
  const [totalSchedules] = useState(
    DASHBOARD_CONSTANTS.DEFAULT_TOTAL_SCHEDULES
  );
  const [registeredCollectors] = useState(
    DASHBOARD_CONSTANTS.DEFAULT_REGISTERED_COLLECTORS
  );
  const [totalGarbageRequests] = useState(
    DASHBOARD_CONSTANTS.DEFAULT_TOTAL_GARBAGE_REQUESTS
  );
  const [pendingGarbages] = useState(
    DASHBOARD_CONSTANTS.DEFAULT_PENDING_GARBAGES
  );
  const [inProgressGarbages] = useState(
    DASHBOARD_CONSTANTS.DEFAULT_IN_PROGRESS_GARBAGES
  );
  const [collectedGarbages] = useState(
    DASHBOARD_CONSTANTS.DEFAULT_COLLECTED_GARBAGES
  );
  const [activeVehicles] = useState(
    DASHBOARD_CONSTANTS.DEFAULT_ACTIVE_VEHICLES
  );

  // Computed values using useMemo for performance
  const completionRate = useMemo(
    () =>
      calculateCompletionPercentage(inProgressGarbages, totalGarbageRequests),
    [inProgressGarbages, totalGarbageRequests]
  );

  // Future: Replace with actual API calls
  useEffect(() => {
    // TODO: Fetch real-time data from backend
    // fetchDashboardData();
  }, []);

  return {
    // Basic metrics
    totalIncome,
    totalSchedules,
    registeredCollectors,
    totalGarbageRequests,
    pendingGarbages,
    inProgressGarbages,
    collectedGarbages,
    activeVehicles,
    totalFleetSize: DASHBOARD_CONSTANTS.TOTAL_FLEET_SIZE,

    // Computed values
    completionRate,

    // Mock data (replace with API data in future)
    areaBreakdown: MOCK_AREA_BREAKDOWN,
    recentRequests: MOCK_RECENT_REQUESTS,
    activeVehiclesList: MOCK_ACTIVE_VEHICLES_LIST,
    performanceMetrics: MOCK_PERFORMANCE_METRICS,
  };
};
