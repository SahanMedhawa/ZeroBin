import React from "react";
import { Users } from "lucide-react";
import { COLOR_THEMES } from "../../../../constants/dashboardConstants";

const SummaryItem = ({ label, value, color }) => (
  <div className="flex justify-between items-center p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
    <span className="text-sm text-gray-700 font-medium">{label}</span>
    <span className={`text-lg font-bold text-${color}-600`}>{value}</span>
  </div>
);

/**
 * Fleet Summary Card Component
 */
export const FleetSummaryCard = ({
  totalFleetSize,
  totalSchedules,
  registeredCollectors,
  totalGarbageRequests,
}) => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Users className="h-5 w-5" />
        Fleet Summary
      </h2>
    </div>
    <div className="p-6 space-y-4">
      <SummaryItem
        label="Total Vehicles"
        value={totalFleetSize.toString()}
        color={COLOR_THEMES.BLUE}
      />
      <SummaryItem
        label="Active Routes"
        value={totalSchedules}
        color={COLOR_THEMES.EMERALD}
      />
      <SummaryItem
        label="Team Members"
        value={registeredCollectors}
        color={COLOR_THEMES.PURPLE}
      />
      <SummaryItem
        label="Total Requests"
        value={totalGarbageRequests}
        color={COLOR_THEMES.ORANGE}
      />
    </div>
  </div>
);
