import React from "react";
import { MapPin } from "lucide-react";
import { formatCurrency } from "../../../../utility/FleetM_Dashbaord";

/**
 * Zone Performance Table Component
 */
export const ZonePerformanceTable = ({ areas }) => (
  <div className="mb-8">
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Zone Performance
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Zone
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Requests
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Pending
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Active
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Completed
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Vehicles
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {areas.map((area) => (
              <tr
                key={area.areaId}
                className="hover:bg-purple-50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {area.name}
                </td>
                <td className="px-4 py-4 text-center text-gray-700">
                  {area.count}
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                    {area.pending}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {area.inProgress}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                    {area.collected}
                  </span>
                </td>
                <td className="px-4 py-4 text-center text-gray-700 font-semibold">
                  {area.vehicles}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                  {formatCurrency(area.income)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
