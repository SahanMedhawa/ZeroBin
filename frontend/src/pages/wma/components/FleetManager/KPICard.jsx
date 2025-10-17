import React from "react";

/**
 * KPI Card Component
 * Reusable card for displaying key metrics
 */
export const KPICard = ({ title, value, subtext, icon, trend, gradient }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all shadow-lg">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-md`}>
        <div className="text-white">{icon}</div>
      </div>
      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
        {trend}
      </span>
    </div>
    <h3 className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
      {title}
    </h3>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-xs text-gray-500">{subtext}</p>
  </div>
);
