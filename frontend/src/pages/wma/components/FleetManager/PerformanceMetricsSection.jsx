import React from "react";
import { TrendingUp } from "lucide-react";

/**
 * Performance Metrics Section Component
 */
export const PerformanceMetricsSection = ({ metrics }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    {metrics.map((metric, idx) => (
      <div
        key={idx}
        className="bg-white border border-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
      >
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">
          {metric.label}
        </p>
        <div className="flex items-end gap-2">
          <span
            className={`text-3xl font-bold bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-700 bg-clip-text text-transparent`}
          >
            {metric.value}
          </span>
          <TrendingUp className={`h-4 w-4 text-${metric.color}-500 mb-1`} />
        </div>
      </div>
    ))}
  </div>
);
