import { useEffect } from "react";
import WMADrawer from "../components/WMADrawer";
import { useWMADashboardData } from "../../../hooks/useWMADashboardData";
import { ConfigurableMetricRenderer } from "./components/ConfigurableMetricRenderer";
import { initializeStrategies } from "./strategies";
import { dashboardConfig, getEnabledSections } from "./config/dashboardConfig";

/**
 * WMADashboard Component
 *
 * Main dashboard for Waste Management Authority operations.
 * Follows SOLID principles:
 * - Single Responsibility: Only handles layout composition and data flow
 * - Open/Closed: Extensible through configuration and strategy pattern
 * - Liskov Substitution: Components are interchangeable through strategies
 * - Interface Segregation: Clean component props
 * - Dependency Inversion: Depends on hooks and strategy abstractions
 *
 * NOW IMPLEMENTS:
 * - Strategy Pattern for metric rendering
 * - Configuration-driven component composition
 * - Open/Closed Principle - add new metrics via config, not code changes
 *
 * @component
 */
const WMADashboard = () => {
  const dashboardData = useWMADashboardData();

  // Initialize strategies on mount
  useEffect(() => {
    initializeStrategies();
  }, []);

  // Get enabled sections from configuration
  const sections = getEnabledSections(dashboardConfig);

  return (
    <WMADrawer>
      <div className={dashboardConfig.layout.container}>
        {/* Render header section separately */}
        {sections
          .filter((section) => section.type === "header")
          .map((section) => (
            <ConfigurableMetricRenderer
              key={section.id}
              section={section}
              data={dashboardData}
            />
          ))}

        <div className={dashboardConfig.layout.content}>
          {/* Render all non-header sections */}
          {sections
            .filter((section) => section.type !== "header")
            .map((section) => (
              <ConfigurableMetricRenderer
                key={section.id}
                section={section}
                data={dashboardData}
              />
            ))}
        </div>
      </div>
    </WMADrawer>
  );
};

export default WMADashboard;
