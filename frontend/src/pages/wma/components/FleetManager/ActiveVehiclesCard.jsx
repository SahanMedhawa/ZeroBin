import React from "react";
import { Truck, MapPin } from "lucide-react";
import {
  getStatusBadgeClass,
  getVehicleStatusDotClass,
} from "../../../../utility/VehicleStatus";

/**
 * Active Vehicles Card Component
 */
export const ActiveVehiclesCard = ({ vehicles }) => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Truck className="h-5 w-5" />
        Active Vehicles
      </h2>
    </div>
    <div className="p-4 space-y-3">
      {vehicles.map((vehicle) => (
        <div
          key={vehicle.id}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3 hover:border-purple-400 transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-gray-900">{vehicle.id}</p>
              <p className="text-xs text-gray-600">{vehicle.driver}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                vehicle.status
              )}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${getVehicleStatusDotClass(
                  vehicle.status
                )}`}
              ></span>
              {vehicle.status}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gray-500" />
            {vehicle.area}
          </p>
          <div className="bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full transition-all"
              style={{ width: `${vehicle.utilization}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span className="font-medium">{vehicle.utilization}% capacity</span>
            <span>{vehicle.lastUpdate}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
