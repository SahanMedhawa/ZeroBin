import { metricStrategyRegistry } from "./MetricStrategyRegistry";
import {
  headerStrategy,
  kpiCardsStrategy,
  performanceMetricsStrategy,
  activeVehiclesStrategy,
  fleetSummaryStrategy,
  zonePerformanceStrategy,
  recentRequestsStrategy,
  defaultStrategy,
} from "./metricStrategies.jsx";
import {
  environmentalImpactStrategy,
  alertsStrategy,
} from "./customMetricStrategies.jsx";

/**
 * Initialize and register all metric strategies
 *
 * Following Open/Closed Principle:
 * - To add new strategies, simply import and register them here
 * - No need to modify existing strategy implementations
 */
export const initializeStrategies = () => {
  metricStrategyRegistry
    .register("default", defaultStrategy)
    .register("header", headerStrategy)
    .register("kpi-cards", kpiCardsStrategy)
    .register("performance-metrics", performanceMetricsStrategy)
    .register("active-vehicles", activeVehiclesStrategy)
    .register("fleet-summary", fleetSummaryStrategy)
    .register("zone-performance", zonePerformanceStrategy)
    .register("recent-requests", recentRequestsStrategy)
    .register("environmental-impact", environmentalImpactStrategy)
    .register("alerts", alertsStrategy);
};

export { metricStrategyRegistry };
