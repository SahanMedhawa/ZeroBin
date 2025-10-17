import { DashboardHeader } from "../../components/FleetManager/DashboardHeader";
import { KPICardsSection } from "../../components/FleetManager/KPICardsSection";
import { PerformanceMetricsSection } from "../../components/FleetManager/PerformanceMetricsSection";
import { ActiveVehiclesCard } from "../../components/FleetManager/ActiveVehiclesCard";
import { FleetSummaryCard } from "../../components/FleetManager/FleetSummaryCard";
import { ZonePerformanceTable } from "../../components/FleetManager/ZonePerformanceTable";
import { RecentRequestsTable } from "../../components/FleetManager/RecentRequestsTable";

/**
 * Metric Rendering Strategies
 *
 * Each strategy implements the render(data, props) method.
 * Following Open/Closed Principle - new strategies can be added without modifying existing ones.
 */

export const headerStrategy = {
  type: "header",
  render: (data, props = {}) => (
    <DashboardHeader
      activeVehicles={data.activeVehicles}
      totalFleetSize={data.totalFleetSize}
      {...props}
    />
  ),
};

export const kpiCardsStrategy = {
  type: "kpi-cards",
  render: (data, props = {}) => (
    <KPICardsSection
      totalIncome={data.totalIncome}
      inProgressGarbages={data.inProgressGarbages}
      pendingGarbages={data.pendingGarbages}
      collectedGarbages={data.collectedGarbages}
      completionRate={data.completionRate}
      {...props}
    />
  ),
};

export const performanceMetricsStrategy = {
  type: "performance-metrics",
  render: (data, props = {}) => (
    <PerformanceMetricsSection metrics={data.performanceMetrics} {...props} />
  ),
};

export const activeVehiclesStrategy = {
  type: "active-vehicles",
  render: (data, props = {}) => (
    <ActiveVehiclesCard vehicles={data.activeVehiclesList} {...props} />
  ),
};

export const fleetSummaryStrategy = {
  type: "fleet-summary",
  render: (data, props = {}) => (
    <FleetSummaryCard
      totalFleetSize={data.totalFleetSize}
      totalSchedules={data.totalSchedules}
      registeredCollectors={data.registeredCollectors}
      totalGarbageRequests={data.totalGarbageRequests}
      {...props}
    />
  ),
};

export const zonePerformanceStrategy = {
  type: "zone-performance",
  render: (data, props = {}) => (
    <ZonePerformanceTable areas={data.areaBreakdown} {...props} />
  ),
};

export const recentRequestsStrategy = {
  type: "recent-requests",
  render: (data, props = {}) => (
    <RecentRequestsTable requests={data.recentRequests} {...props} />
  ),
};

// Default fallback strategy
export const defaultStrategy = {
  type: "default",
  render: (data, props = {}) => (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800">Metric type not configured</p>
    </div>
  ),
};
