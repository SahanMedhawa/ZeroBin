import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getActiveSchedules } from '../../../../api/scheduleApi';

const AssignModal = ({ 
  isOpen, 
  onClose, 
  onAssign, 
  collectors = [], 
  selectedGrievance,
  assigning = false 
}) => {
  const [assignmentData, setAssignmentData] = useState({ collectorId: '', reason: '' });
  const [activeSchedules, setActiveSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const reasonTextareaRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAssignmentData({ collectorId: '', reason: '' });
      loadActiveSchedules();
    }
  }, [isOpen]);

  // Load active schedules
  const loadActiveSchedules = useCallback(async () => {
    try {
      setLoadingSchedules(true);
      const response = await getActiveSchedules();
      setActiveSchedules(response.schedules || []);
    } catch (error) {
      console.error('Error loading active schedules:', error);
      setActiveSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  }, []);

  // Focus reason textarea when modal opens
  useEffect(() => {
    if (isOpen && reasonTextareaRef.current) {
      setTimeout(() => {
        reasonTextareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Memoized onChange handlers to prevent re-renders
  const handleCollectorChange = useCallback((e) => {
    const newValue = e.target.value;
    setAssignmentData(prevData => ({
      collectorId: newValue,
      reason: prevData.reason
    }));
  }, []);

  const handleReasonChange = useCallback((e) => {
    const newValue = e.target.value;
    setAssignmentData(prevData => ({
      collectorId: prevData.collectorId,
      reason: newValue
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (assignmentData.collectorId) {
      onAssign(assignmentData);
    }
  }, [assignmentData, onAssign]);

  const handleClose = useCallback(() => {
    setAssignmentData({ collectorId: '', reason: '' });
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  // Filter collectors based on active schedules in the grievance's area
  const getFilteredCollectors = () => {
    if (!selectedGrievance || loadingSchedules) return [];
    
    const grievanceAreaId = selectedGrievance.areaId?._id || selectedGrievance.areaId;
    
    // Find active schedules for this specific area
    const areaSchedules = activeSchedules.filter(schedule => 
      schedule.area && schedule.area._id.toString() === grievanceAreaId.toString()
    );
    
    // Get collectors from active schedules in this area
    const activeCollectors = areaSchedules.map(schedule => schedule.collectorId).filter(Boolean);
    
    // Remove duplicates and filter for available collectors
    const uniqueCollectors = activeCollectors.filter((collector, index, self) => 
      index === self.findIndex(c => c._id.toString() === collector._id.toString()) &&
      collector.statusOfCollector === "Available"
    );
    
    return uniqueCollectors;
  };

  const filteredCollectors = getFilteredCollectors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Assign Collector</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Collector</label>
              <select
                value={assignmentData.collectorId}
                onChange={handleCollectorChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">
                  {loadingSchedules 
                    ? "Loading active collectors..." 
                    : filteredCollectors.length === 0 
                      ? "No active collectors in this area" 
                      : "Choose a collector"
                  }
                </option>
                {filteredCollectors.map(collector => (
                  <option key={collector._id} value={collector._id}>
                    {collector.collectorName} - {collector.truckNumber}
                  </option>
                ))}
              </select>
              {selectedGrievance && (
                <div className="text-xs text-gray-500 mt-1">
                  <p><strong>Area:</strong> {selectedGrievance.areaId?.name || 'Unknown Area'}</p>
                  <p><strong>Active Collectors:</strong> {filteredCollectors.length}</p>
                  <p><strong>Total Active Schedules:</strong> {activeSchedules.length}</p>
                  {loadingSchedules && (
                    <p className="text-blue-500 mt-1">🔄 Loading active schedules...</p>
                  )}
                  {!loadingSchedules && filteredCollectors.length === 0 && (
                    <p className="text-red-500 mt-1">
                      ⚠️ No active collectors found in this area. Check if there are any "In Progress" schedules for this area.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Reason</label>
              <textarea
                ref={reasonTextareaRef}
                value={assignmentData.reason}
                onChange={handleReasonChange}
                placeholder="Optional reason for assignment"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                style={{ direction: 'ltr', textAlign: 'left' }}
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={assigning}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigning || !assignmentData.collectorId || filteredCollectors.length === 0 || loadingSchedules}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {loadingSchedules 
                ? 'Loading...' 
                : assigning 
                  ? 'Assigning...' 
                  : filteredCollectors.length === 0 
                    ? 'No Active Collectors' 
                    : 'Assign'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignModal;
