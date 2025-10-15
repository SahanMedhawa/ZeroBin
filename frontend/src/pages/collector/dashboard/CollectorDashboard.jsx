import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CollectorDrawer from '../components/CollectorDrawer';
import {
  getCollectorProfile,
  getCollectorSchedules,
} from '../../../api/collectorApi';
import { toast } from 'react-toastify';

const CollectorDashboard = () => {
  const [greeting, setGreeting] = useState('Good Morning');
  const [collector, setCollector] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [progressSchedules, setProgressSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good Morning');
    } else if (currentHour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  useEffect(() => {
    fetchCollectorProfile();
    fetchSchedules();
  }, []);

  const fetchCollectorProfile = async () => {
    try {
      const data = await getCollectorProfile();
      setCollector(data);
    } catch (error) {
      console.error('Error fetching collector profile:', error);
      toast.error('Failed to fetch profile');
    }
  };

  const fetchSchedules = async () => {
    // Use cached schedules first for instant UI
    const cached = localStorage.getItem('collectorDashboardSchedules');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSchedules(parsed);
        const inProgressCached = parsed.filter((s) => s.status === 'In Progress');
        setProgressSchedules(inProgressCached);
      } catch {}
    }

    try {
      setLoadingSchedules(true);
      // Request only what we need and limit the results
      const data = await getCollectorSchedules({ limit: 5, fields: 'area,date,time,status' });
      setSchedules(data);
      localStorage.setItem('collectorDashboardSchedules', JSON.stringify(data));

      const inProgress = data.filter((schedule) => schedule.status === 'In Progress');
      setProgressSchedules(inProgress);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      if (!cached) toast.error('Failed to fetch schedules');
    } finally {
      setLoadingSchedules(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CollectorDrawer />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-white">
                {collector?.collectorName?.charAt(0) || 'C'}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-600">{greeting}</p>
              <h1 className="text-3xl font-bold text-gray-900">
                {collector?.collectorName || 'Collector'}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => navigate('/collector/map')}
              className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 p-6 rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-lg font-bold">Switch On Location</span>
            </button>

            <button
              onClick={() => navigate('/collector/schedule')}
              className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 p-6 rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-lg font-bold">Schedules</span>
            </button>

            <button
              onClick={() => navigate('/collector/scanner')}
              className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 p-6 rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span className="text-lg font-bold">Scan Code</span>
            </button>
          </div>

          {/* Current Journey */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Journey</h2>
            {loadingSchedules ? (
              <div className="space-y-4">
                <div className="animate-pulse border border-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                </div>
                <div className="animate-pulse border border-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                </div>
              </div>
            ) : progressSchedules.length > 0 ? (
              <div className="space-y-4">
                {progressSchedules.map((schedule) => {
                  const areaName =
                    typeof schedule.area === 'string'
                      ? schedule.area
                      : schedule.area?.name || 'Unknown Area';

                  return (
                    <div
                      key={schedule._id}
                      className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-gray-100 p-3 rounded-full">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{areaName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(schedule.date).toLocaleDateString()} at {schedule.time}
                          </p>
                          <span className="inline-block mt-1 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                            {schedule.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/collector/map')}
                        className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        View Route
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No schedules in progress</p>
              </div>
            )}
          </div>

          {/* Monthly Earnings */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl shadow p-6 text-white">
            <p className="text-blue-100 text-sm mb-2">Monthly Earning so far</p>
            <h3 className="text-4xl font-bold mb-4">Rs. 15,000.00</h3>
            <button
              onClick={() => navigate('/collector/earnings')}
              className="bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View More Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;
