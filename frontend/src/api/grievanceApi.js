import ApiHelper from "../helpers/apiHelper";

/**
 * Grievance API Functions
 * Handles all frontend-backend communication for grievance management
 * Follows consistent error handling and response patterns
 */

const API = new ApiHelper();

// ============ USER GRIEVANCE OPERATIONS ============

/**
 * Create a new grievance
 * @param {Object} grievanceData - Grievance details
 * @param {String} grievanceData.binId - Bin ID
 * @param {String} grievanceData.severity - Low, Medium, High, Critical
 * @param {String} grievanceData.description - Issue description
 * @returns {Promise<Object>} Created grievance
 */
export const createGrievance = async (grievanceData) => {
  try {
    const response = await API.post("grievances/create", grievanceData);
    return response;
  } catch (error) {
    console.error("Error creating grievance:", error.message);
    throw error;
  }
};

/**
 * Get user's grievances with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {String} params.status - Optional status filter
 * @param {Number} params.page - Page number
 * @param {Number} params.limit - Items per page
 * @returns {Promise<Object>} User's grievances with pagination
 */
export const getUserGrievances = async (params = {}) => {
  try {
    const response = await API.get("grievances/user/my-grievances", params);
    return response;
  } catch (error) {
    console.error("Error fetching user grievances:", error.message);
    throw error;
  }
};

/**
 * Add a note to user's grievance
 * @param {String} grievanceId - Grievance ID
 * @param {String} content - Note content
 * @returns {Promise<Object>} Updated grievance
 */
export const addUserNote = async (grievanceId, content) => {
  try {
    const response = await API.post(`grievances/${grievanceId}/user-note`, { content });
    return response;
  } catch (error) {
    console.error("Error adding user note:", error.message);
    throw error;
  }
};

// ============ ADMIN GRIEVANCE OPERATIONS ============

/**
 * Get all grievances with advanced filtering and pagination
 * @param {Object} filters - Filter parameters
 * @param {String} filters.status - Status filter
 * @param {String} filters.severity - Severity filter
 * @param {String} filters.areaId - Area filter
 * @param {String} filters.assignedTo - Collector filter
 * @param {Boolean} filters.escalated - Escalated filter
 * @param {Number} filters.page - Page number
 * @param {Number} filters.limit - Items per page
 * @param {String} filters.sortBy - Sort field
 * @param {String} filters.sortOrder - Sort order (asc/desc)
 * @returns {Promise<Object>} Filtered grievances with pagination and statistics
 */
export const getAllGrievances = async (filters = {}) => {
  try {
    const response = await API.get("grievances/all", filters);
    return response;
  } catch (error) {
    console.error("Error fetching all grievances:", error.message);
    throw error;
  }
};

/**
 * Update grievance status
 * @param {String} grievanceId - Grievance ID
 * @param {String} status - New status
 * @param {String} reason - Reason for status change
 * @returns {Promise<Object>} Updated grievance
 */
export const updateGrievanceStatus = async (grievanceId, status, reason = "") => {
  try {
    const response = await API.put(`grievances/${grievanceId}/status`, { status, reason });
    return response;
  } catch (error) {
    console.error("Error updating grievance status:", error.message);
    throw error;
  }
};

/**
 * Assign grievance to collector
 * @param {String} grievanceId - Grievance ID
 * @param {String} collectorId - Collector ID
 * @param {String} reason - Assignment reason
 * @returns {Promise<Object>} Updated grievance
 */
export const assignGrievance = async (grievanceId, collectorId, reason = "") => {
  try {
    const response = await API.put(`grievances/${grievanceId}/assign`, { collectorId, reason });
    return response;
  } catch (error) {
    console.error("Error assigning grievance:", error.message);
    throw error;
  }
};

/**
 * Add admin note to grievance
 * @param {String} grievanceId - Grievance ID
 * @param {String} content - Note content
 * @param {String} noteType - Note type (Update, Resolution, Assignment, System)
 * @returns {Promise<Object>} Updated grievance
 */
export const addAdminNote = async (grievanceId, content, noteType = "Update") => {
  try {
    const response = await API.post(`grievances/${grievanceId}/notes`, { content, noteType });
    return response;
  } catch (error) {
    console.error("Error adding admin note:", error.message);
    throw error;
  }
};

/**
 * Get grievances by area
 * @param {String} areaId - Area ID
 * @param {String} status - Optional status filter
 * @returns {Promise<Object>} Area grievances and statistics
 */
export const getGrievancesByArea = async (areaId, status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await API.get(`grievances/area/${areaId}`, params);
    return response;
  } catch (error) {
    console.error("Error fetching grievances by area:", error.message);
    throw error;
  }
};

/**
 * Trigger route optimization for an area
 * @param {String} areaId - Area ID
 * @param {Object} options - Optimization options
 * @param {Boolean} options.urgent - Whether this is urgent optimization
 * @param {String} options.excludeCollectorId - Collector to exclude
 * @returns {Promise<Object>} Optimization results
 */
export const triggerRouteOptimization = async (areaId, options = {}) => {
  try {
    const response = await API.post(`grievances/area/${areaId}/optimize`, options);
    return response;
  } catch (error) {
    console.error("Error triggering route optimization:", error.message);
    throw error;
  }
};

/**
 * Get optimization recommendations for an area
 * @param {String} areaId - Area ID
 * @returns {Promise<Object>} Optimization recommendations
 */
export const getOptimizationRecommendations = async (areaId) => {
  try {
    const response = await API.get(`grievances/area/${areaId}/recommendations`);
    return response;
  } catch (error) {
    console.error("Error fetching optimization recommendations:", error.message);
    throw error;
  }
};

// ============ COLLECTOR GRIEVANCE OPERATIONS ============

/**
 * Get grievances assigned to collector
 * @param {String} status - Optional status filter
 * @returns {Promise<Object>} Assigned grievances and statistics
 */
export const getAssignedGrievances = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await API.get("grievances/assigned", params);
    return response;
  } catch (error) {
    console.error("Error fetching assigned grievances:", error.message);
    throw error;
  }
};

/**
 * Mark grievance as resolved
 * @param {String} grievanceId - Grievance ID
 * @param {String} resolutionNote - Resolution details
 * @returns {Promise<Object>} Updated grievance
 */
export const resolveGrievance = async (grievanceId, resolutionNote) => {
  try {
    const response = await API.put(`grievances/${grievanceId}/resolve`, { resolutionNote });
    return response;
  } catch (error) {
    console.error("Error resolving grievance:", error.message);
    throw error;
  }
};

/**
 * Add collector note to grievance
 * @param {String} grievanceId - Grievance ID
 * @param {String} content - Note content
 * @returns {Promise<Object>} Updated grievance
 */
export const addCollectorNote = async (grievanceId, content) => {
  try {
    const response = await API.post(`grievances/${grievanceId}/collector-note`, { content });
    return response;
  } catch (error) {
    console.error("Error adding collector note:", error.message);
    throw error;
  }
};

// ============ UTILITY FUNCTIONS ============

/**
 * Get single grievance details
 * @param {String} grievanceId - Grievance ID
 * @returns {Promise<Object>} Grievance details
 */
export const getGrievanceById = async (grievanceId) => {
  try {
    const response = await API.get(`grievances/${grievanceId}`);
    return response;
  } catch (error) {
    console.error("Error fetching grievance details:", error.message);
    throw error;
  }
};

/**
 * Get comprehensive grievance statistics
 * @param {Object} filters - Optional filters
 * @param {String} filters.areaId - Area filter
 * @param {String} filters.startDate - Start date filter
 * @param {String} filters.endDate - End date filter
 * @returns {Promise<Object>} Comprehensive statistics
 */
export const getGrievanceStatistics = async (filters = {}) => {
  try {
    const response = await API.get("grievances/statistics", filters);
    return response;
  } catch (error) {
    console.error("Error fetching grievance statistics:", error.message);
    throw error;
  }
};

// ============ HELPER FUNCTIONS ============

/**
 * Get severity color for UI display
 * @param {String} severity - Severity level
 * @returns {String} Tailwind color class
 */
export const getSeverityColor = (severity) => {
  const colorMap = {
    'Low': 'text-green-600 bg-green-100',
    'Medium': 'text-yellow-600 bg-yellow-100',
    'High': 'text-orange-600 bg-orange-100',
    'Critical': 'text-red-600 bg-red-100'
  };
  return colorMap[severity] || 'text-gray-600 bg-gray-100';
};

/**
 * Get status color for UI display
 * @param {String} status - Status
 * @returns {String} Tailwind color class
 */
export const getStatusColor = (status) => {
  const colorMap = {
    'Open': 'text-red-600 bg-red-100',
    'In Progress': 'text-blue-600 bg-blue-100',
    'Resolved': 'text-green-600 bg-green-100',
    'Closed': 'text-gray-600 bg-gray-100'
  };
  return colorMap[status] || 'text-gray-600 bg-gray-100';
};

/**
 * Format grievance age for display
 * @param {String} createdAt - Creation timestamp
 * @returns {String} Formatted age string
 */
export const formatGrievanceAge = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
};

/**
 * Validate grievance form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with errors array
 */
export const validateGrievanceForm = (formData) => {
  const errors = [];
  
  if (!formData.binId) {
    errors.push("Please select a bin");
  }
  
  if (!formData.severity) {
    errors.push("Please select a severity level");
  }
  
  if (!formData.description || formData.description.trim().length < 10) {
    errors.push("Description must be at least 10 characters long");
  }
  
  if (formData.description && formData.description.length > 500) {
    errors.push("Description cannot exceed 500 characters");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get priority score display
 * @param {Number} priorityScore - Priority score
 * @returns {Object} Priority display info
 */
export const getPriorityDisplay = (priorityScore) => {
  if (priorityScore >= 80) {
    return { level: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100' };
  } else if (priorityScore >= 60) {
    return { level: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' };
  } else if (priorityScore >= 40) {
    return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  } else {
    return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' };
  }
};

// ============ CACHE MANAGEMENT ============

/**
 * Cache keys for localStorage
 */
export const CACHE_KEYS = {
  USER_GRIEVANCES: 'userGrievances',
  ADMIN_GRIEVANCES: 'adminGrievances',
  GRIEVANCE_STATS: 'grievanceStats',
  COLLECTOR_GRIEVANCES: 'collectorGrievances'
};

/**
 * Get cached data
 * @param {String} key - Cache key
 * @returns {Object|null} Cached data or null
 */
export const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is less than 5 minutes old
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        return parsed.data;
      } else {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error("Error reading cache:", error);
    localStorage.removeItem(key);
  }
  return null;
};

/**
 * Set cached data
 * @param {String} key - Cache key
 * @param {Object} data - Data to cache
 */
export const setCachedData = (key, data) => {
  try {
    const cacheObject = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheObject));
  } catch (error) {
    console.error("Error setting cache:", error);
  }
};

/**
 * Clear specific cache
 * @param {String} key - Cache key to clear
 */
export const clearCache = (key) => {
  localStorage.removeItem(key);
};

/**
 * Clear all grievance-related cache
 */
export const clearAllGrievanceCache = () => {
  Object.values(CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
