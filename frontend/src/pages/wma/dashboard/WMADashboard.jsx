import WMADrawer from "../components/WMADrawer";
import { useWMADashboardData } from "../../../hooks/useWMADashboardData";
import { DashboardHeader } from "../components/FleetManager/DashboardHeader";
import { KPICardsSection } from "../components/FleetManager/KPICardsSection";
import { PerformanceMetricsSection } from "../components/FleetManager/PerformanceMetricsSection";
import { ActiveVehiclesCard } from "../components/FleetManager/ActiveVehiclesCard";
import { FleetSummaryCard } from "../components/FleetManager/FleetSummaryCard";
import { ZonePerformanceTable } from "../components/FleetManager/ZonePerformanceTable";
import { RecentRequestsTable } from "../components/FleetManager/RecentRequestsTable";

/**
 * WMADashboard Component
 *
 * Main dashboard for Waste Management Authority operations.
 * Follows SOLID principles:
 * - Single Responsibility: Only handles layout composition
 * - Open/Closed: Extensible through new components
 * - Liskov Substitution: Components are interchangeable
 * - Interface Segregation: Clean component props
 * - Dependency Inversion: Depends on hooks abstraction
 *
 * @component
 */
const WMADashboard = () => {
  const dashboardData = useWMADashboardData();

  return (
    <WMADrawer>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
        <DashboardHeader
          activeVehicles={dashboardData.activeVehicles}
          totalFleetSize={dashboardData.totalFleetSize}
        />

        <div className="px-8 pb-8">
          <KPICardsSection
            totalIncome={dashboardData.totalIncome}
            inProgressGarbages={dashboardData.inProgressGarbages}
            pendingGarbages={dashboardData.pendingGarbages}
            collectedGarbages={dashboardData.collectedGarbages}
            completionRate={dashboardData.completionRate}
          />

          <PerformanceMetricsSection
            metrics={dashboardData.performanceMetrics}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ActiveVehiclesCard vehicles={dashboardData.activeVehiclesList} />

            <FleetSummaryCard
              totalFleetSize={dashboardData.totalFleetSize}
              totalSchedules={dashboardData.totalSchedules}
              registeredCollectors={dashboardData.registeredCollectors}
              totalGarbageRequests={dashboardData.totalGarbageRequests}
            />
          </div>

          <ZonePerformanceTable areas={dashboardData.areaBreakdown} />

          <RecentRequestsTable requests={dashboardData.recentRequests} />
        </div>
      </div>
    </WMADrawer>
  );
};

export default WMADashboard;
