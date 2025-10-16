import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CollectorDrawer from '../components/CollectorDrawer';
import {
  getCollectorSchedules,
  updateScheduleStatus,
} from '../../../api/collectorApi';
import { toast } from 'react-toastify';

const CollectorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [completedSchedules, setCompletedSchedules] = useState([]);
  const [inCompletedSchedules, setInCompletedSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    // Use cached data for instant paint
    const cached = localStorage.getItem('collectorSchedules');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSchedules(parsed);
      } catch {}
    }

    try {
      setLoading(true);
      const data = await getCollectorSchedules({ limit: 20, fields: 'area,date,time,status' });
      setSchedules(data);
      localStorage.setItem('collectorSchedules', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching schedules:', error);
      if (!cached) toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const sortByDateAndTime = (a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`).getTime();
    const dateB = new Date(`${b.date}T${b.time}`).getTime();
    return dateA - dateB;
  };

  useEffect(() => {
    const completed = schedules
      .filter((schedule) => schedule.status === 'Completed')
      .sort(sortByDateAndTime);

    const inCompleted = schedules
      .filter((schedule) => schedule.status !== 'Completed')
      .sort(sortByDateAndTime);

    setCompletedSchedules(completed);
    setInCompletedSchedules(inCompleted);
  }, [schedules]);

  const handleStartRoute = async (scheduleId) => {
    try {
      await updateScheduleStatus(scheduleId, 'In Progress');
      toast.success('Schedule started!');
      fetchSchedules();
      navigate('/collector/map');
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to start schedule');
    }
  };

  const handleMarkComplete = async (scheduleId) => {
    try {
      await updateScheduleStatus(scheduleId, 'Completed');
      toast.success('Schedule marked as completed!');
      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to complete schedule');
    }
  };

  const ScheduleCard = ({ schedule, isFirst, showActions }) => {
    const areaName =
      typeof schedule.area === 'string'
        ? schedule.area
        : schedule.area?.name || 'Unknown Area';

    const statusColors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
    };

    return (
      <div className="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{areaName}</h3>
            <p className="text-sm text-gray-500">
              {new Date(schedule.date).toLocaleDateString()} at {schedule.time}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[schedule.status]}`}>
            {schedule.status}
          </span>
        </div>

        {showActions && isFirst && schedule.status === 'Pending' && (
          <button
            onClick={() => handleStartRoute(schedule._id)}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            Start Route
          </button>
        )}

        {showActions && isFirst && schedule.status === 'In Progress' && (
          <button
            onClick={() => handleMarkComplete(schedule._id)}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            Mark as Complete
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CollectorDrawer />

      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Schedules</h1>

          {/* To Be Completed */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              To Be Completed
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              {loading ? (
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
              ) : inCompletedSchedules.length > 0 ? (
                inCompletedSchedules.map((schedule, index) => (
                  <ScheduleCard
                    key={schedule._id}
                    schedule={schedule}
                    isFirst={index === 0}
                    showActions={true}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No schedules to be completed</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Completed</h2>
            <div className="bg-white rounded-lg shadow p-6">
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-pulse border border-gray-200 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/5"></div>
                  </div>
                </div>
              ) : completedSchedules.length > 0 ? (
                completedSchedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule._id}
                    schedule={schedule}
                    isFirst={false}
                    showActions={false}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No completed schedules</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorSchedule;
