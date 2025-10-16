import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDrawer from "./components/AdminDrawer";
import AuthService from "../../api/userApi";
import { getAllGarbages } from "../../api/garbageApi";
import { getAllCollectors } from "../../api/collectorApi";
import { getAllTransactions } from "../../api/transactionApi";
import { getAllAreas } from "../../api/areaApi";
import WmaAuthService from "../../api/wmaApi";
import { getGrievanceStatistics } from "../../api/grievanceApi";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalGarbageRequests, setTotalGarbageRequests] = useState(0);
  const [totalCollectors, setTotalCollectors] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalWMAs, setTotalWMAs] = useState(0);
  const [totalAreas, setTotalAreas] = useState(0);
  const [grievanceStats, setGrievanceStats] = useState({
    total: 0,
    open: 0,
    critical: 0,
    escalated: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [usersRes, garbagesRes, collectorsRes, transactionsRes, wmasRes, areasRes, grievanceStatsRes] = await Promise.all([
          AuthService.getAllUsers(),
          getAllGarbages(),
          getAllCollectors(),
          getAllTransactions(),
          WmaAuthService.getAllWmas(),
          getAllAreas(),
          getGrievanceStatistics(),
        ]);

        setTotalUsers(usersRes?.length || 0);
        setTotalGarbageRequests(garbagesRes?.length || 0);
        setTotalCollectors(collectorsRes?.length || 0);
        setTotalTransactions(transactionsRes?.length || 0);
        setTotalWMAs(wmasRes?.length || 0);
        setTotalAreas(areasRes?.length || 0);
        
        // Set grievance statistics
        if (grievanceStatsRes?.success) {
          setGrievanceStats(grievanceStatsRes.statistics);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const metrics = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: "from-blue-900 to-blue-800",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      title: "Garbage Requests",
      value: totalGarbageRequests,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      gradient: "from-emerald-600 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      title: "Total Collectors",
      value: totalCollectors,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: "from-purple-600 to-indigo-600",
      bgGradient: "from-purple-50 to-indigo-50",
    },
    {
      title: "Total Transactions",
      value: totalTransactions,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      gradient: "from-orange-500 to-amber-600",
      bgGradient: "from-orange-50 to-amber-50",
    },
    {
      title: "WMA Partners",
      value: totalWMAs,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: "from-rose-500 to-pink-600",
      bgGradient: "from-rose-50 to-pink-50",
    },
    {
      title: "Service Areas",
      value: totalAreas,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-50 to-blue-50",
    },
    {
      title: "Total Grievances",
      value: grievanceStats.total,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      gradient: "from-yellow-500 to-orange-600",
      bgGradient: "from-yellow-50 to-orange-50",
    },
    {
      title: "Open Grievances",
      value: grievanceStats.open,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      href: "/admin/users",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Service Areas",
      description: "Configure geographical coverage",
      href: "/admin/areas",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "WMA Management",
      description: "Oversee waste management authorities",
      href: "/admin/wmas",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "from-purple-500 to-indigo-600",
    },
    {
      title: "Transactions",
      description: "Monitor financial activities",
      href: "/admin/transactions",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: "from-orange-500 to-amber-600",
    },
    {
      title: "Grievances",
      description: "Manage citizen complaints",
      href: "/admin/grievances",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      color: "from-red-500 to-pink-600",
    },
  ];

  const recentActivities = [
    {
      action: "New user registered",
      user: "John Doe",
      time: "2 minutes ago",
      type: "user",
      status: "success"
    },
    {
      action: "Critical grievance reported",
      user: "Sarah Wilson",
      time: "8 minutes ago",
      type: "grievance",
      status: "warning"
    },
    {
      action: "Garbage collection completed",
      user: "Collector #C001",
      time: "15 minutes ago",
      type: "garbage",
      status: "success"
    },
    {
      action: "Grievance resolved",
      user: "Collector #C003",
      time: "45 minutes ago",
      type: "grievance",
      status: "success"
    },
    {
      action: "New WMA partnership",
      user: "Green Solutions Ltd",
      time: "1 hour ago",
      type: "wma",
      status: "success"
    },
    {
      action: "Payment processed",
      user: "Jane Smith",
      time: "2 hours ago",
      type: "transaction",
      status: "success"
    },
    {
      action: "Route optimization triggered",
      user: "Admin",
      time: "2.5 hours ago",
      type: "grievance",
      status: "info"
    },
    {
      action: "Area coverage expanded",
      user: "Admin",
      time: "3 hours ago",
      type: "area",
      status: "info"
    },
  ];

  const systemStats = [
    { label: "System Uptime", value: "99.9%", status: "excellent" },
    { label: "API Response Time", value: "120ms", status: "good" },
    { label: "Database Health", value: "Optimal", status: "excellent" },
    { label: "Active Sessions", value: "1,247", status: "good" },
  ];

  return (
    <AdminDrawer>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome back! Here's your system overview for today.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-md animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            metrics.map((metric, index) => (
              <EnhancedMetricCard key={index} {...metric} />
            ))
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <QuickActionCard key={index} {...action} />
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              System Status
            </h3>
            <div className="space-y-4">
              {systemStats.map((stat, index) => (
                <SystemStatusItem key={index} {...stat} />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </div>
      </div>
    </AdminDrawer>
  );
};

const EnhancedMetricCard = ({ title, value, icon, gradient, bgGradient }) => (
  <div className={`bg-gradient-to-br ${bgGradient} p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-white/50 group`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} shadow-md group-hover:scale-105 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{title}</p>
      <p className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value}
      </p>
    </div>
  </div>
);

const QuickActionCard = ({ title, description, href, icon, color }) => (
  <a
    href={href}
    className="group p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 hover:border-gray-300"
  >
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg bg-gradient-to-r ${color} text-white group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </a>
);

const SystemStatusItem = ({ label, value, status }) => {
  const statusColors = {
    excellent: "bg-green-100 text-green-800",
    good: "bg-blue-100 text-blue-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {value}
      </span>
    </div>
  );
};

const ActivityItem = ({ action, user, time, type, status }) => {
  const typeIcons = {
    user: (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    garbage: (
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    wma: (
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    transaction: (
      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    area: (
      <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  };

  return (
    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
        {typeIcons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{action}</p>
        <p className="text-sm text-gray-600 truncate">{user}</p>
      </div>
      <div className="text-xs text-gray-500 whitespace-nowrap">{time}</div>
    </div>
  );
};

export default AdminDashboard;