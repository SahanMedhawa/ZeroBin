import React from "react";
import { Clock } from "lucide-react";
import { formatCurrency } from "../../../../utility/FleetM_Dashbaord";
import { getStatusBadgeClass } from "../../../../utility/VehicleStatus";

/**
 * Recent Requests Table Component
 */
export const RecentRequestsTable = ({ requests }) => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Recent Pickup Requests
      </h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Customer
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Zone
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Vehicle
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Collector
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-purple-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">
                {req.user}
              </td>
              <td className="px-4 py-4 text-gray-700">{req.areaName}</td>
              <td className="px-4 py-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                  {req.type}
                </span>
              </td>
              <td className="px-4 py-4 text-gray-700 font-mono text-xs">
                {req.vehicle}
              </td>
              <td className="px-4 py-4 text-gray-700">{req.collector}</td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                    req.status
                  )}`}
                >
                  {req.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                {formatCurrency(req.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
