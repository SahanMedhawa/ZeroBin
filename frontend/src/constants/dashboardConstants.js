/**
 * Dashboard Configuration Constants
 * Centralized configuration following DRY principle
 */

export const DASHBOARD_CONSTANTS = {
  TOTAL_FLEET_SIZE: 21,
  DEFAULT_TOTAL_INCOME: 156750,
  DEFAULT_TOTAL_SCHEDULES: 24,
  DEFAULT_REGISTERED_COLLECTORS: 42,
  DEFAULT_TOTAL_GARBAGE_REQUESTS: 487,
  DEFAULT_PENDING_GARBAGES: 34,
  DEFAULT_IN_PROGRESS_GARBAGES: 52,
  DEFAULT_COLLECTED_GARBAGES: 401,
  DEFAULT_ACTIVE_VEHICLES: 18,
};

export const STATUS_TYPES = {
  ACTIVE: "active",
  RETURNING: "returning",
  COLLECTED: "Collected",
  IN_PROGRESS: "In Progress",
  PENDING: "Pending",
};

export const WASTE_TYPES = {
  RECYCLABLE: "Recyclable",
  MIXED: "Mixed",
  ORGANIC: "Organic",
  NON_RECYCLABLE: "Non-Recyclable",
};

export const COLOR_THEMES = {
  EMERALD: "emerald",
  BLUE: "blue",
  PURPLE: "purple",
  ORANGE: "orange",
};

// Mock data - to be replaced with API calls
export const MOCK_AREA_BREAKDOWN = [
  {
    areaId: 1,
    name: "Central District",
    count: 145,
    pending: 8,
    inProgress: 18,
    collected: 119,
    income: 42500,
    vehicles: 5,
  },
  {
    areaId: 2,
    name: "North Zone",
    count: 118,
    pending: 12,
    inProgress: 15,
    collected: 91,
    income: 35600,
    vehicles: 4,
  },
  {
    areaId: 3,
    name: "South Commercial",
    count: 98,
    pending: 6,
    inProgress: 11,
    collected: 81,
    income: 31200,
    vehicles: 4,
  },
  {
    areaId: 4,
    name: "East Residential",
    count: 76,
    pending: 5,
    inProgress: 5,
    collected: 66,
    income: 23400,
    vehicles: 3,
  },
  {
    areaId: 5,
    name: "Industrial Hub",
    count: 50,
    pending: 3,
    inProgress: 3,
    collected: 44,
    income: 24050,
    vehicles: 2,
  },
];

export const MOCK_RECENT_REQUESTS = [
  {
    id: 1,
    user: "John Martinez",
    areaName: "Central District",
    type: WASTE_TYPES.RECYCLABLE,
    status: STATUS_TYPES.IN_PROGRESS,
    date: "2025-10-17T14:32:00",
    amount: 850,
    vehicle: "WM-001",
    collector: "Ahmed Hassan",
  },
  {
    id: 2,
    user: "Sarah Johnson",
    areaName: "North Zone",
    type: WASTE_TYPES.MIXED,
    status: STATUS_TYPES.COLLECTED,
    date: "2025-10-17T13:15:00",
    amount: 1200,
    vehicle: "WM-005",
    collector: "Maria Garcia",
  },
  {
    id: 3,
    user: "Robert Chen",
    areaName: "South Commercial",
    type: WASTE_TYPES.ORGANIC,
    status: STATUS_TYPES.PENDING,
    date: "2025-10-17T12:45:00",
    amount: 750,
    vehicle: "N/A",
    collector: "Pending",
  },
  {
    id: 4,
    user: "Lisa Wong",
    areaName: "Central District",
    type: WASTE_TYPES.RECYCLABLE,
    status: STATUS_TYPES.COLLECTED,
    date: "2025-10-17T11:20:00",
    amount: 920,
    vehicle: "WM-002",
    collector: "Carlos Rodriguez",
  },
  {
    id: 5,
    user: "Michael Brown",
    areaName: "East Residential",
    type: WASTE_TYPES.MIXED,
    status: STATUS_TYPES.IN_PROGRESS,
    date: "2025-10-17T10:55:00",
    amount: 680,
    vehicle: "WM-008",
    collector: "Priya Patel",
  },
  {
    id: 6,
    user: "Emma Davis",
    areaName: "Industrial Hub",
    type: WASTE_TYPES.NON_RECYCLABLE,
    status: STATUS_TYPES.COLLECTED,
    date: "2025-10-17T09:30:00",
    amount: 1450,
    vehicle: "WM-003",
    collector: "David Smith",
  },
];

export const MOCK_ACTIVE_VEHICLES_LIST = [
  {
    id: "WM-001",
    status: STATUS_TYPES.ACTIVE,
    area: "Central District",
    driver: "Ahmed Hassan",
    utilization: 92,
    lastUpdate: "2 min ago",
  },
  {
    id: "WM-002",
    status: STATUS_TYPES.ACTIVE,
    area: "South Commercial",
    driver: "Carlos Rodriguez",
    utilization: 85,
    lastUpdate: "5 min ago",
  },
  {
    id: "WM-003",
    status: STATUS_TYPES.RETURNING,
    area: "Industrial Hub",
    driver: "David Smith",
    utilization: 78,
    lastUpdate: "8 min ago",
  },
  {
    id: "WM-005",
    status: STATUS_TYPES.ACTIVE,
    area: "North Zone",
    driver: "Maria Garcia",
    utilization: 88,
    lastUpdate: "3 min ago",
  },
];

export const MOCK_PERFORMANCE_METRICS = [
  { label: "Collection Efficiency", value: "94%", color: COLOR_THEMES.EMERALD },
  { label: "On-Time Pickups", value: "97%", color: COLOR_THEMES.BLUE },
  { label: "Vehicle Utilization", value: "88%", color: COLOR_THEMES.PURPLE },
  { label: "Collector Productivity", value: "91%", color: COLOR_THEMES.ORANGE },
];
