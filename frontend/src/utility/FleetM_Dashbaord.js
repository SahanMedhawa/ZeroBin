/**
 * Dashboard calculation utilities
 * Pure functions following functional programming principles
 */

/**
 * Format currency with LKR prefix
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "LKR 0";
  }
  return `LKR ${amount.toLocaleString()}`;
};

/**
 * Calculate completion percentage
 * @param {number} completed - Completed count
 * @param {number} total - Total count
 * @returns {number} Percentage (0-100)
 */
export const calculateCompletionPercentage = (completed, total) => {
  if (!total || total === 0) return 0;
  if (completed > total) return 100;
  return Math.round((completed / total) * 100);
};

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (typeof num !== "number" || isNaN(num)) {
    return "0";
  }
  return num.toLocaleString();
};
