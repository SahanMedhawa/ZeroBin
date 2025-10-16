# 🧪 Quick Test Guide - Bug Fixes

## ⚡ Test the Fixes in 3 Minutes

---

## Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend server running on `http://localhost:5173`
- WMA account, User account, and Collector account created

---

## 🎯 Test Flow

### Step 1: WMA Creates Schedule (This Assigns Area to Collector)

1. **Login as WMA**
   - Go to: `http://localhost:5173/login`
   - Login with WMA credentials

2. **Create Schedule**
   - Navigate to: "Schedules" → "Create Schedule"
   - Fill form:
     - **Collector**: Select your collector (e.g., "John Doe")
     - **Area**: Select an area (e.g., "Colombo 3")
     - **Date**: Today or tomorrow
     - **Time**: Any time (e.g., "09:00")
   - Click "Create Schedule"
   - ✅ **Result**: Schedule created AND area assigned to collector

3. **Logout WMA**

---

### Step 2: User Registers Bin & Sets Sensor to High

1. **Login as User**
   - Login with user credentials

2. **Register Bin** (if not already)
   - Navigate to: "Smart Bin" (sidebar)
   - If no bin registered:
     - Fill registration form
     - **Important**: Select the SAME area as the schedule (e.g., "Colombo 3")
     - Click on map to set location
     - Click "Register Bin"

3. **Update Sensor to High**
   - In "Sensor Control Panel"
   - Select: **"High"** or **"Full"**
   - Click "Update Sensor"
   - ✅ **Result**: Alert shows "Bin is now visible to collectors!"

4. **Logout User**

---

### Step 3: Collector Sees Full Bin

1. **Login as Collector**
   - Go to: `http://localhost:5173/collector/login`
   - Login with NIC and Truck Number

2. **View Full Bins**
   - Navigate to: "Full Bins" (sidebar)
   - ✅ **Result**: You should now see the user's bin!
   
3. **Test Views**:
   - Click "List View" → See bin card
   - Click "Map View" → See bin marker on map
   
4. **Check Browser Console** (F12)
   - Should see logs:
     ```
     Full bins response: {success: true, count: 1, bins: [...]}
     Bins to display: [...]
     ```

---

### Step 4: Test Schedule Status Update

1. **While Still Logged in as Collector**
   
2. **View Schedules**
   - Navigate to: "Schedules" (sidebar)
   - See your schedule in "To Be Completed" section

3. **Start Route**
   - Click "Start Route" button
   - ✅ **Result**: 
     - Status changes to "In Progress"
     - Redirects to Map page
     - Success toast appears

4. **Go Back to Schedules**
   - Schedule now shows "In Progress" status

5. **Mark Complete**
   - Click "Mark as Complete" button
   - ✅ **Result**:
     - Status changes to "Completed"
     - Schedule moves to "Completed" section
     - Success toast appears

---

### Step 5: Collect the Bin

1. **Go Back to Full Bins**
   - Navigate to: "Full Bins"

2. **Collect Bin**
   - In List View: Click "Collect Bin" button
   - OR In Map View: Click marker → Click "Collect" in popup
   
3. **Fill Dialog**
   - Enter weight (optional, e.g., "25")
   - Click "Collect Bin"
   - ✅ **Result**:
     - Success message appears
     - Bin disappears from full bins list

4. **Logout Collector**

---

### Step 6: Verify User's Bin Reset

1. **Login as User Again**

2. **Check Bin Status**
   - Navigate to: "Smart Bin"
   - ✅ **Result**:
     - Sensor shows "Empty (0%)"
     - Status shows "Collected"
     - Last collection date updated

---

## 🔍 Troubleshooting

### Issue: Collector Still Can't See Bins

**Check 1: Collector's Assigned Areas**
```bash
# In MongoDB Compass or shell
db.collectors.find({ collectorName: "John Doe" })

# Should show:
{
  "assignedAreas": ["area_id_here"]
}
```

**Fix**: If empty, create a NEW schedule for that collector in that area

---

**Check 2: Bin's Area Matches**
```bash
# In MongoDB
db.garbages.find({ binId: "BIN-..." })

# Check:
{
  "area": "area_id_here",  // Should match collector's assignedAreas
  "isVisibleToCollectors": true,  // Should be true
  "sensorData": {
    "fillLevel": "High" or "Full"  // Should be High or Full
  }
}
```

---

**Check 3: Browser Console**
- Open console (F12)
- Go to Full Bins page
- Look for logs showing API response
- If empty array, check above MongoDB queries

---

### Issue: Schedule Status Not Updating

**Check Backend Logs**
- Look for errors in terminal where backend is running
- Should see: `PUT /api/schedule/:id/status`

**Check Network Tab**
- F12 → Network tab
- Click "Start Route"
- Look for `PUT` request to `/api/schedule/.../status`
- Check response status (should be 200)

---

### Issue: Map View Not Working

**Check Leaflet Loading**
- Internet connection required (uses OpenStreetMap)
- Check browser console for errors
- Should see map tiles loading

**Fallback**: Use List View instead

---

## ✅ Success Criteria

After completing all steps:

- [x] WMA created schedule
- [x] Collector has area in assignedAreas
- [x] User registered bin
- [x] User set sensor to High/Full
- [x] Collector sees bin in Full Bins list
- [x] Both List and Map views work
- [x] Collector started schedule route
- [x] Schedule status updated to "In Progress"
- [x] Collector marked schedule complete
- [x] Schedule moved to Completed section
- [x] Collector collected bin
- [x] Bin disappeared from list
- [x] User's bin sensor reset to Empty

---

## 📞 Still Having Issues?

1. **Restart Backend Server**
   ```powershell
   cd backend
   npm start
   ```

2. **Clear Browser Cache**
   - Ctrl+Shift+Delete → Clear cache

3. **Check MongoDB**
   - Ensure MongoDB is running
   - Check collections exist

4. **Check Console Logs**
   - Backend terminal for server errors
   - Browser console (F12) for frontend errors

---

## 🎉 Expected Result

✅ **Full Flow Working**:
```
WMA Schedule Created 
  → Collector Gets Area 
  → User Registers Bin in Area 
  → User Sets Sensor High 
  → Collector Sees Bin 
  → Collector Starts Schedule 
  → Collector Collects Bin 
  → User's Sensor Resets
```

---

**Test Time**: ~3 minutes
**Last Updated**: October 15, 2025
**Status**: Ready for Testing
