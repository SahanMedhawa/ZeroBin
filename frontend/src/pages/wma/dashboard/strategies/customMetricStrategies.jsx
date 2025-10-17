/**
 * Example: Custom Metric Strategies
 *
 * This demonstrates how to add new metric types WITHOUT modifying existing code.
 * Simply create new strategy and register it.
 */

// Example: Environmental Impact Card
export const environmentalImpactStrategy = {
  type: "environmental-impact",
  render: (data, props = {}) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Environmental Impact
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">CO2 Saved</p>
          <p className="text-2xl font-bold text-green-600">
            {data.co2Saved || 0} kg
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Waste Recycled</p>
          <p className="text-2xl font-bold text-blue-600">
            {data.wasteRecycled || 0}%
          </p>
        </div>
      </div>
    </div>
  ),
};

// Example: Real-time Alerts Card
export const alertsStrategy = {
  type: "alerts",
  render: (data, props = {}) => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <h3 className="text-xl font-bold text-red-800 mb-4">Active Alerts</h3>
      <div className="space-y-2">
        {(data.alerts || []).map((alert, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-sm">{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
