# 🚀 Quick Start Guide - Sensor-Based Garbage Collection System

## ⚡ Fast Setup & Testing (5 Minutes)

---

## Prerequisites

- Node.js installed
- MongoDB running
- Backend and Frontend servers ready

---

## 🏃 Quick Start

### Step 1: Start Backend (if not running)
```powershell
cd backend
npm start
```
Backend should be running on `http://localhost:5000`

### Step 2: Start Frontend (if not running)
```powershell
cd frontend
npm run dev
```
Frontend should be running on `http://localhost:5173` (or similar)

---

## 🧪 Test the System (User Side)

### 1. Login as User
- Navigate to: `http://localhost:5173/login`
- Login with your user credentials

### 2. Register Your Bin (One-Time)
- Click **"Smart Bin"** in the sidebar (or navigate to `/user/my-bin`)
- You'll see the registration form (first time only)
- Fill in the form:
  - **Area**: Select your area from dropdown
  - **Address**: Enter your address
  - **Bin Type**: Choose Recyclable or Non-Recyclable
  - **Location**: Click on the map to select your bin location
- Click **"Register Bin"**
- Success! Your bin is now registered

### 3. Simulate Sensor (Change Fill Level)
- After registration, you'll see the Bin Management Dashboard
- Find the **"Sensor Control Panel"** card
- Select a fill level from dropdown:
  - Empty (0%)
  - Low (25%)
  - Medium (50%)
  - High (75%) - ⚠️ Becomes visible to collectors
  - Full (100%) - ⚠️ Becomes visible to collectors
- Click **"Update Sensor"**
- Watch the circular indicator update in real-time!

### 4. View Sensor History
- Check the **"Sensor History"** card
- See all your sensor updates with timestamps
- Trends shown with ↑ ↓ indicators

---

## 🚚 Test the System (Collector Side)

### 1. Login as Collector
- Navigate to: `http://localhost:5173/collector/login`
- Login with collector NIC and Truck Number

### 2. View Full Bins
- Click **"Full Bins"** in the sidebar (or navigate to `/collector/full-bins`)
- You'll see all bins that are Full or High in your assigned areas

### 3. Switch Views
- **List View**: Grid of cards showing bin details
- **Map View**: Interactive map with color-coded markers (click toggle buttons)

### 4. Collect a Bin
- In List View: Click **"Collect Bin"** button on any bin card
- In Map View: Click on a marker, then click **"Collect"** in popup
- Enter weight (optional)
- Click **"Collect Bin"** in dialog
- ✅ Bin marked as collected
- ✅ Sensor reset to Empty
- ✅ Bin removed from full bins list

---

## 🎯 Quick Test Scenario

### Complete Flow (2 minutes):

1. **User**: Register bin → Set fill level to "Full"
2. **Collector**: See bin appear in Full Bins list
3. **Collector**: Click "Collect Bin" → Confirm
4. **User**: Refresh your bin page → See sensor reset to "Empty"
5. **Collector**: Bin disappears from Full Bins list

---

## 📍 Important URLs

| Role | URL | Description |
|------|-----|-------------|
| User Login | `/login` | User authentication |
| User Bin Management | `/user/my-bin` | Register & manage bin |
| Collector Login | `/collector/login` | Collector authentication |
| Collector Full Bins | `/collector/full-bins` | View & collect full bins |

---

## 🔑 Key Features to Test

### User Features:
- ✅ One-time bin registration
- ✅ Interactive map location picker
- ✅ Sensor fill level simulation (5 levels)
- ✅ Real-time percentage display
- ✅ Sensor update history with timeline
- ✅ Auto-visibility alert when Full/High
- ✅ Circular progress indicator

### Collector Features:
- ✅ List view of full bins
- ✅ Map view with custom markers
- ✅ Area-based filtering (only assigned areas)
- ✅ Priority sorting (fullest first)
- ✅ One-click collection
- ✅ Optional weight entry
- ✅ Auto-refresh every 30 seconds

---

## 🐛 Troubleshooting

### "No bin found" error?
- Make sure you registered a bin first
- Only one bin per user allowed

### Bin not visible to collectors?
- Set fill level to "High" or "Full"
- Refresh collector page

### Map not loading?
- Check internet connection (uses OpenStreetMap)
- Check browser console for errors

### Collector sees no bins?
- Make sure collector is assigned to areas
- Make sure bins in those areas are Full/High
- Try refreshing the page

---

## 📊 Expected Behavior

### User Flow:
```
Register Bin (One-time) 
  → Sensor: Empty (0%) 
  → Update to Medium (50%) 
  → Update to Full (100%) 
  → Alert: "Bin is visible to collectors!"
```

### Collector Flow:
```
View Full Bins 
  → See bins at Full/High 
  → Select bin 
  → Collect 
  → Bin disappears from list
```

### System Flow:
```
User updates sensor to Full 
  → isVisibleToCollectors: true 
  → Collector sees in Full Bins list 
  → Collector collects bin 
  → Sensor resets to Empty 
  → isVisibleToCollectors: false
```

---

## 🎨 Visual Indicators

### Fill Level Colors:
- 🟢 **Empty** (0%): Green
- 🟢 **Low** (25%): Light Green
- 🟡 **Medium** (50%): Yellow
- 🟠 **High** (75%): Orange (Visible to collectors)
- 🔴 **Full** (100%): Red (Visible to collectors)

### Map Markers (Collector View):
- 🔴 Red circle: Full bin (100%)
- 🟠 Orange circle: High bin (75%)

---

## 📱 Mobile Responsive

All components are fully responsive:
- ✅ Works on desktop
- ✅ Works on tablet
- ✅ Works on mobile

---

## 🚀 Next Actions

### For Demo/Presentation:
1. Show user registration with map picker
2. Demonstrate sensor updates with real-time visual feedback
3. Switch to collector view and show full bins appearing
4. Demonstrate bin collection and sensor reset
5. Show sensor history timeline

### For Development:
1. Add real IoT sensor integration
2. Implement WebSocket for real-time updates
3. Add push notifications
4. Create analytics dashboard
5. Add route optimization for collectors

---

## 💡 Pro Tips

1. **Test with Multiple Users**: Register bins in different areas to test collector area filtering
2. **Use Map View**: Collector map view is great for demos - shows visual representation
3. **Check History**: Sensor history shows complete audit trail of all updates
4. **Auto-Refresh**: Collector page auto-refreshes every 30 seconds
5. **One Bin Only**: Each user can only register one bin (enforced at DB level)

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check backend server logs
3. Verify MongoDB is running
4. Check network tab for failed API requests
5. Refer to `SENSOR_SYSTEM_FINAL_SUMMARY.md` for detailed documentation

---

## ✅ Quick Checklist

Before demonstrating:
- [ ] Backend server running
- [ ] Frontend server running
- [ ] MongoDB running
- [ ] User account created
- [ ] Collector account created
- [ ] Areas created with WMA assignment
- [ ] Collector assigned to areas

---

**Ready to test!** 🚀

Follow the steps above and you'll have the sensor-based garbage collection system up and running in 5 minutes!

---

**Last Updated**: October 15, 2025
**Status**: ✅ Ready for Production
