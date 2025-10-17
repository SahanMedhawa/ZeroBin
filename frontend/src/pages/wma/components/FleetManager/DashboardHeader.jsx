import React from "react";
import { Truck } from "lucide-react";

/**
 * Dashboard header component
 * @param {Object} props
 * @param {number} props.activeVehicles - Number of active vehicles
 * @param {number} props.totalFleetSize - Total fleet size
 */
export const DashboardHeader = ({ activeVehicles, totalFleetSize }) => (
  <div className="bg-white shadow-md border-b border-gray-200 mb-6">
    <div className="px-8 py-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl shadow-lg">
          <Truck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-800 bg-clip-text text-transparent">
            Fleet Manager
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Waste Management Operations Center
          </p>
        </div>
      </div>
      <div className="text-right bg-gradient-to-br from-purple-50 to-indigo-50 px-6 py-3 rounded-xl border border-purple-200">
        <p className="text-sm text-gray-600 font-medium">Active Fleet</p>
        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
          {activeVehicles}/{totalFleetSize}
        </p>
      </div>
    </div>
  </div>
);
