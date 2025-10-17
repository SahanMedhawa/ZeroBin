import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDrawer from '../components/AdminDrawer';
import { useAnalytics } from './hooks/useAnalytics';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import AnalyticsMetrics from './components/AnalyticsMetrics';
import ExportReports from './components/ExportReports';
import { VIEW_MODES, DISPLAY_LIMITS } from './constants/analyticsConstants';

const AdminAnalytics = () => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.ANALYTICS);
  const navigate = useNavigate();
  
  const {
    loading,
    selectedDistrict,
    setSelectedDistrict,
    analytics,
    areaAnalytics,
    timeAnalytics,
    timeSeriesData,
    districts,
    fillLevelChartData,
    areaPerformanceData,
    statusDistributionData
  } = useAnalytics();


  if (loading) {
    return (
      <AdminDrawer>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminDrawer>
    );
  }

  return (
    <AdminDrawer>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode(VIEW_MODES.ANALYTICS)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === VIEW_MODES.ANALYTICS 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Analytics Board
                </button>
                <button
                  onClick={() => setViewMode(VIEW_MODES.GRAPHS)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === VIEW_MODES.GRAPHS 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Graph View
                </button>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent mb-2">
              KPI Analytics
            </h1>
            <p className="text-gray-600">Sensor data insights and system performance metrics</p>
          </div>
        </div>

        {/* Conditional Content Based on View Mode */}
        {viewMode === VIEW_MODES.ANALYTICS ? (
          <>
            {/* Key Metrics */}
            <AnalyticsMetrics analytics={analytics} timeAnalytics={timeAnalytics} />

        {/* Fill Level Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Fill Level Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-700">Critical (90%+)</span>
                </div>
                <span className="font-semibold text-red-600">{analytics.criticalBins}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-gray-700">High (75-89%)</span>
                </div>
                <span className="font-semibold text-orange-600">{analytics.highFillBins}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-gray-700">Medium (50-74%)</span>
                </div>
                <span className="font-semibold text-yellow-600">{analytics.mediumFillBins}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-700">Low (&lt;50%)</span>
                </div>
                <span className="font-semibold text-green-600">{analytics.lowFillBins}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Area Performance</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {areaAnalytics.slice(0, DISPLAY_LIMITS.MAX_AREAS_DISPLAY).map((area, index) => (
                <div key={area._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{area.name}</h4>
                    <p className="text-sm text-gray-600">{area.sensorBins} sensors</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      area.priority === 'High' ? 'bg-red-100 text-red-800' :
                      area.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {area.averageFill}%
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{area.priority} Priority</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


            {/* Export Reports */}
            <ExportReports analytics={analytics} areaAnalytics={areaAnalytics} />
          </>
        ) : (
          /* Graphs Only View */
          <div className="space-y-8">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fill Level Distribution Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Fill Level Distribution</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={fillLevelChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fillLevelChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Area Performance Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Area Performance</h3>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Districts</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={areaPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, name === 'averageFill' ? 'Avg Fill %' : name]}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                    />
                    <Legend />
                    <Bar dataKey="averageFill" fill="#3b82f6" name="Average Fill %" />
                    <Bar dataKey="criticalBins" fill="#ef4444" name="Critical Bins" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time Series Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fill Level Trends */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Fill Level Trends (7 Days)</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="averageFill" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                      name="Average Fill %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Collection Status Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Collection Status</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Critical Bins Trend */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Critical Bins Trend (7 Days)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="criticalBins" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Critical Bins"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalUpdates" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Total Updates"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </AdminDrawer>
  );
};

export default AdminAnalytics;
