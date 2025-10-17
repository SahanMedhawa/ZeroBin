import { STATUS_TYPES } from "../constants/dashboardConstants";

/**
 * Get CSS classes for status badges
 * @param {string} status - Status type
 * @returns {string} Tailwind CSS classes
 */
export const getStatusBadgeClass = (status) => {
  const statusClasses = {
    [STATUS_TYPES.COLLECTED]: "bg-emerald-100 text-emerald-800",
    [STATUS_TYPES.IN_PROGRESS]: "bg-blue-100 text-blue-800",
    [STATUS_TYPES.PENDING]: "bg-amber-100 text-amber-800",
    [STATUS_TYPES.ACTIVE]: "bg-emerald-100 text-emerald-800",
    [STATUS_TYPES.RETURNING]: "bg-blue-100 text-blue-800",
  };
  return statusClasses[status] || "bg-gray-100 text-gray-800";
};

/**
 * Get CSS class for vehicle status indicator dot
 * @param {string} status - Vehicle status
 * @returns {string} Tailwind CSS class
 */
export const getVehicleStatusDotClass = (status) => {
  return status === STATUS_TYPES.ACTIVE ? "bg-emerald-500" : "bg-blue-500";
};
