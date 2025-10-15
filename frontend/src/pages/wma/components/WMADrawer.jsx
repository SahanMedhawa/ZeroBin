import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import WmaAuthService from "../../../api/wmaApi";
import { toast } from "react-toastify";

const WMADrawer = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wmaInfo, setWmaInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const wmaData = localStorage.getItem('wmaInfo');
    if (wmaData) {
      setWmaInfo(JSON.parse(wmaData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await WmaAuthService.logoutCurrentWma();
      WmaAuthService.logout();
      toast.success("Logged out successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      WmaAuthService.logout();
      navigate("/login");
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: '/wma/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Dashboard',
    },
    {
      path: '/wma/service-areas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      label: 'Service Areas',
    },
    {
      path: '/wma/collectors',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      label: 'Collectors',
    },
    {
      path: '/wma/schedules',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Schedules',
    },
    {
      path: '/wma/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Profile',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-purple-700 to-indigo-800 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Header with Logo */}
        <div className="p-6 border-b border-purple-600">
          <Link to="/wma/dashboard" className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-teal-400 rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">0</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold">ZeroBin</h1>
              <p className="text-xs text-purple-300">WMA Portal</p>
            </div>
          </Link>
        </div>

        {/* Profile Section */}
        {wmaInfo && (
          <div className="p-6 border-b border-purple-600">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-indigo-600/30 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-purple-500/20">
                <span className="text-lg font-bold text-purple-300">
                  {wmaInfo.organization?.charAt(0)?.toUpperCase() || 'W'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white truncate">{wmaInfo.organization}</p>
                <p className="text-xs text-purple-300">WMA Account</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg'
                  : 'text-purple-200 hover:bg-white/10 hover:backdrop-blur-sm hover:text-white'
              }`}
            >
              <div className={isActive(item.path) ? 'text-purple-300' : 'text-purple-400 group-hover:text-purple-300'}>
                {item.icon}
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-purple-600">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-purple-200 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 group-hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-purple-700 text-white rounded-xl shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default WMADrawer;
