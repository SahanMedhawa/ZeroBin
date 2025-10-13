# Collector Web Portal Implementation Guide

## Project Overview
This document outlines the implementation of a web-based collector portal that replicates all features from the mobile collector app (`cleanPathCollectorApp`) into the frontend web application.

## Mobile App Analysis - Feature Summary

### 1. **Dashboard** (`CollectorDashboard.screen.tsx`)
- **Features Implemented:**
  - Greeting message based on time of day (Good Morning/Afternoon/Evening)
  - Collector profile display (name, profile image)
  - Quick action buttons:
    - Switch On Location (navigate to map)
    - View Schedules
    - Scan QR Code (with camera permission handling)
  - Current Journey section showing in-progress schedules
  - Monthly earnings preview with "View More" button
  - Logout functionality
- **API Endpoints Used:**
  - GET `/api/collector/profile` - Fetch collector profile
  - GET `/api/schedule/collector-schedules` - Fetch schedules
  - POST `/api/collector/logout` - Logout

### 2. **Earnings** (`Earnings.screen.tsx`)
- **Features Implemented:**
  - Summary of total earnings
  - Wallet display showing current balance (Rs. 15,000.00)
  - Withdraw earnings button
  - Weekly earnings bar chart
  - Monthly earnings bar chart
  - Uses `react-native-chart-kit` (will use `react-chartjs-2` or `recharts` for web)

### 3. **Map** (`Map.screen.tsx`)
- **Features Implemented:**
  - Real-time location tracking using Expo Location
  - Leaflet map integration
  - Location service toggle (on/off)
  - Display garbage collection points with color-coded markers:
    - Red icon: Non-recyclable garbage
    - Green icon: Recyclable garbage
  - User location marker with animated blue dot
  - Current route display for in-progress schedule
- **API Endpoints Used:**
  - GET `/api/schedule/collector-schedules` - Get schedules
  - GET `/api/garbage/garbage-requests-area/{id}` - Get garbage requests by area

### 4. **Schedule** (`Schedule.screen.tsx`)
- **Features Implemented:**
  - Two sections: "To Be Completed" and "Completed"
  - Schedule cards showing:
    - Area name
    - Date and time
    - Status (Pending/In Progress/Completed)
  - Action buttons:
    - "Start Route" for first pending schedule
    - "Mark as Complete" for in-progress schedule
  - Sorted by date and time
- **API Endpoints Used:**
  - GET `/api/schedule/collector-schedules` - Fetch all schedules
  - PUT `/api/schedule/{id}` - Update schedule status

### 5. **Scanner** (`scanner/index.tsx`)
- **Features Implemented:**
  - QR code scanning using expo-camera
  - Scan QR code on smart bins
  - Navigate to update garbage page with scanned device ID
  - Camera overlay for scanning area indication
- **Flow:** Scan QR → Extract device ID → Navigate to `/updategarbage?id={deviceId}`

### 6. **Update Garbage** (`UpdateGarbage.screen.tsx`)
- **Features Implemented:**
  - Display smart bin details:
    - User information (name, contact, address)
    - Bin type (Recyclable/Non-recyclable)
    - Area details (name, rate, type: flat/weight-based)
  - Weight input field (for weight-based areas only)
  - Current garbage status display
  - "Mark as Collected" button
  - Transaction creation logic:
    - Calculate amount based on area type (flat or weight-based)
    - Apply 10% discount for recyclable garbage
    - Create transaction record
- **API Endpoints Used:**
  - GET `/api/smartDevices/{id}` - Fetch bin details
  - PUT `/api/smartDevices/device/{id}` - Update bin status and weight
  - POST `/api/transactions` - Create transaction

## Web Portal Implementation Status

### ✅ Completed Components

#### 1. **CollectorLogin** (`/collector/auth/CollectorLogin.jsx`)
- Login form with NIC and Truck Number fields
- Authentication using `/api/collector/auth`
- Stores collector info and token in localStorage
- Redirects to dashboard on success
- Beautiful UI with gradient background

#### 2. **CollectorDrawer** (`/collector/components/CollectorDrawer.jsx`)
- Sidebar navigation for all collector pages
- Profile section showing collector name and truck number
- Navigation items:
  - Dashboard
  - Schedules
  - Map
  - Scanner
  - Earnings
- Logout button
- Active route highlighting

#### 3. **CollectorDashboard** (`/collector/dashboard/CollectorDashboard.jsx`)
- Time-based greeting
- Collector profile display
- Quick action buttons (Location, Schedules, Scanner)
- Current journey section with in-progress schedules
- Monthly earnings card with "View More" button
- Responsive grid layout

#### 4. **CollectorSchedule** (`/collector/schedule/CollectorSchedule.jsx`)
- Two sections: "To Be Completed" and "Completed"
- Schedule cards with area, date, time, status
- "Start Route" button for first pending schedule
- "Mark as Complete" button for in-progress schedules
- Real-time status updates
- Sorted chronologically

### 🔄 Components Remaining to Implement

#### 5. **CollectorMap** - HIGH PRIORITY
```jsx
// Location: /collector/map/CollectorMap.jsx
// Features needed:
// - Leaflet map integration (already have leaflet in dependencies)
// - Real-time location toggle (simulated or using browser geolocation API)
// - Display garbage collection points with markers
// - Color-coded markers (red/green for non-recyclable/recyclable)
// - Route display for current schedule
// - Location service on/off toggle button
```

#### 6. **CollectorScanner** - MEDIUM PRIORITY
```jsx
// Location: /collector/scanner/CollectorScanner.jsx
// Features needed:
// - QR code scanner using react-qr-reader or html5-qrcode
// - Manual ID input option (for testing/backup)
// - Camera permission handling
// - Navigate to update garbage page with scanned ID
```

#### 7. **CollectorEarnings** - MEDIUM PRIORITY
```jsx
// Location: /collector/earnings/CollectorEarnings.jsx
// Features needed:
// - Total earnings display
// - Withdraw earnings button
// - Weekly earnings bar chart using recharts or react-chartjs-2
// - Monthly earnings bar chart
// - Earnings summary cards
```

#### 8. **CollectorUpdateGarbage** - HIGH PRIORITY
```jsx
// Location: /collector/updateGarbage/UpdateGarbage.jsx
// Features needed:
// - Accept device ID from URL params
// - Fetch and display bin details
// - Show user info, bin type, area details
// - Weight input (conditional on area type)
// - Calculate transaction amount with discount logic
// - Mark as collected button
// - Create transaction on collection
```

## Installation & Setup

### Frontend Dependencies to Install
```bash
cd frontend
npm install react-chartjs-2 chart.js recharts react-qr-reader html5-qrcode leaflet react-leaflet
```

### Routes Added to App.jsx
```jsx
// Collector Routes
<Route path="/collector/login" element={<CollectorLogin />} />
<Route path="/collector/dashboard" element={<ProtectedRoute><CollectorDashboard /></ProtectedRoute>} />
<Route path="/collector/schedule" element={<ProtectedRoute><CollectorSchedule /></ProtectedRoute>} />
<Route path="/collector/map" element={<ProtectedRoute><CollectorMap /></ProtectedRoute>} />
<Route path="/collector/scanner" element={<ProtectedRoute><CollectorScanner /></ProtectedRoute>} />
<Route path="/collector/earnings" element={<ProtectedRoute><CollectorEarnings /></ProtectedRoute>} />
<Route path="/collector/updateGarbage" element={<ProtectedRoute><CollectorUpdateGarbage /></ProtectedRoute>} />
```

## API Integration

### Collector API Helper (`/api/collectorApi.js`)
Already exists with all necessary endpoints:
- `loginCollector(collectorNIC, truckNumber)`
- `logoutCollector()`
- `getCollectorProfile()`
- `getCollectorSchedules()`
- `updateScheduleStatus(scheduleId, status)`
- `getSmartDeviceById(deviceId)`
- `updateSmartDevice(deviceId, data)`
- `getGarbageRequestsByArea(areaId)`
- `createTransaction(transactionData)`

## Backend Endpoints Summary

### Collector Endpoints
- POST `/api/collector/auth` - Login
- POST `/api/collector/logout` - Logout
- GET `/api/collector/profile` - Get profile
- GET `/api/collector` - Get all collectors (admin)
- GET `/api/collector/{id}` - Get by ID
- PUT `/api/collector/{id}` - Update collector
- DELETE `/api/collector/{id}` - Delete collector

### Schedule Endpoints
- GET `/api/schedule/collector-schedules` - Get collector's schedules
- PUT `/api/schedule/{id}` - Update schedule status

### Smart Device Endpoints
- GET `/api/smartDevices/{id}` - Get device by ID
- PUT `/api/smartDevices/device/{id}` - Update device status/weight

### Transaction Endpoints
- POST `/api/transactions` - Create transaction

### Garbage Endpoints
- GET `/api/garbage/garbage-requests-area/{areaId}` - Get garbage by area

## Key Features & Business Logic

### Transaction Calculation Logic
```javascript
// From UpdateGarbage.screen.tsx
const areaType = bin.area.type; // "flat" or "weightBased"
const garbageWeight = weight; // kg (only for weightBased)
const rate = bin.area.rate; // Rs per unit

// Calculate base amount
let amount = areaType === "weightBased" 
  ? garbageWeight * rate 
  : rate;

// Apply 10% discount for recyclable garbage
if (bin.type === "Recyclable") {
  amount *= 0.9;
}
```

### Schedule Status Flow
1. **Pending** → User clicks "Start Route" → **In Progress**
2. **In Progress** → User collects garbage → **Completed**

### Map Marker Colors
- **Red Marker**: Non-recyclable garbage
- **Green Marker**: Recyclable garbage
- **Blue Animated Dot**: Collector's current location

## Testing Checklist

### Authentication
- [ ] Login with valid NIC and truck number
- [ ] Login with invalid credentials (should show error)
- [ ] Logout functionality
- [ ] Protected routes redirect to login if not authenticated

### Dashboard
- [ ] Profile displays correctly
- [ ] Greeting changes based on time
- [ ] Quick action buttons navigate correctly
- [ ] Current journey shows in-progress schedules
- [ ] Earnings card displays and navigates to earnings page

### Schedules
- [ ] Fetch and display all schedules
- [ ] Sort by date and time
- [ ] Filter into "To Be Completed" and "Completed"
- [ ] "Start Route" changes status to "In Progress"
- [ ] "Mark as Complete" changes status to "Completed"
- [ ] Only first pending schedule shows "Start Route" button

### Map (To Be Tested)
- [ ] Map loads with correct center
- [ ] Toggle location service on/off
- [ ] Display garbage markers
- [ ] Color-coded markers work correctly
- [ ] Current location updates
- [ ] Route displays for in-progress schedule

### Scanner (To Be Tested)
- [ ] QR code scanning works
- [ ] Manual ID input works
- [ ] Navigates to update garbage page with correct ID
- [ ] Camera permissions handled

### Earnings (To Be Tested)
- [ ] Total earnings display
- [ ] Weekly chart renders
- [ ] Monthly chart renders
- [ ] Withdraw button (functionality TBD)

### Update Garbage (To Be Tested)
- [ ] Fetch bin details by ID
- [ ] Display all bin information
- [ ] Weight input shows only for weight-based areas
- [ ] Transaction calculation is correct
- [ ] 10% discount applied for recyclable
- [ ] Mark as collected updates status
- [ ] Transaction is created successfully

## Next Steps

1. **Install Dependencies**: Install chart libraries and QR scanner libraries
2. **Complete Map Component**: Implement Leaflet map with garbage markers
3. **Complete Scanner Component**: Implement QR code scanning
4. **Complete Earnings Component**: Implement charts for earnings
5. **Complete Update Garbage Component**: Implement garbage collection flow
6. **Testing**: Test all features end-to-end
7. **Styling**: Refine UI/UX to match mobile app design
8. **Mobile Responsiveness**: Ensure works on all screen sizes

## Notes

- The mobile app uses `react-native-chart-kit` for charts; web will use `recharts` or `react-chartjs-2`
- The mobile app uses `expo-camera` for QR scanning; web will use `react-qr-reader` or `html5-qrcode`
- The mobile app uses `expo-location` for GPS; web will use browser Geolocation API
- All existing API endpoints are compatible with the web portal
- Authentication uses JWT tokens stored in cookies (collector-specific cookie: `jwt_collector`)

## File Structure
```
frontend/src/pages/collector/
├── auth/
│   └── CollectorLogin.jsx ✅
├── dashboard/
│   └── CollectorDashboard.jsx ✅
├── schedule/
│   └── CollectorSchedule.jsx ✅
├── map/
│   └── CollectorMap.jsx ⏳
├── scanner/
│   └── CollectorScanner.jsx ⏳
├── earnings/
│   └── CollectorEarnings.jsx ⏳
├── updateGarbage/
│   └── UpdateGarbage.jsx ⏳
└── components/
    └── CollectorDrawer.jsx ✅
```

✅ = Completed
⏳ = To be implemented

---

**Created:** October 14, 2025
**Last Updated:** October 14, 2025
**Status:** In Progress (4/8 components completed)
