// Analytics Constants
export const FILL_LEVEL_THRESHOLDS = {
  CRITICAL: 90,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 0
};

export const TIME_CONSTANTS = {
  HOURS_IN_DAY: 24,
  DAYS_IN_WEEK: 7,
  MILLISECONDS_IN_HOUR: 60 * 60 * 1000,
  MILLISECONDS_IN_DAY: 24 * 60 * 60 * 1000
};

export const DISPLAY_LIMITS = {
  MAX_AREAS_DISPLAY: 5,
  MAX_AREAS_CHART: 6,
  MAX_NAME_LENGTH: 10,
  TIME_SERIES_DAYS: 6
};

export const PRIORITY_LEVELS = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

export const CHART_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
  COLLECTED: '#22c55e',
  IN_PROGRESS: '#3b82f6',
  PENDING: '#eab308'
};

export const VIEW_MODES = {
  ANALYTICS: 'analytics',
  GRAPHS: 'graphs'
};
