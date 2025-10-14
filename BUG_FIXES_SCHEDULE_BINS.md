# 🔧 BUG FIXES - Sensor System & Schedule Management

## Issues Fixed

### ✅ Issue 1: Collector Can't See Full Bins
**Problem**: Collector registered a smart bin and set sensor to "High", but it doesn't appear in `/collector/full-bins`

**Root Cause**: Collector wasn't assigned to the area where the bin was located

**Solution**: When WMA creates a schedule for a collector in a specific area, that area is now automatically added to the collector's `assignedAreas`

**Files Modified**:
1. `backend/controllers/scheduleController.js` - Added logic to assign area to collector when schedule is created

---

### ✅ Issue 2: Schedule Status Update Not Working
**Problem**: Collector tries to "Start Route" or "Mark as Complete" but schedule status doesn't update

**Root Cause**: 
- The schedule update route (`PUT /api/schedule/:id`) was restricted to WMA only
- Collectors couldn't update their own schedule status

**Solution**: 
- Created new route `PUT /api/schedule/:id/status` specifically for collectors
- Collectors can now update only the `status` field
- Added authorization check to ensure collector is assigned to the schedule

**Files Modified**:
1. `backend/controllers/scheduleController.js` - Added `updateScheduleStatus()` method
2. `backend/routes/scheduleRoutes.js` - Added collector status update route
3. `frontend/src/api/collectorApi.js` - Updated API endpoint to use `/status` path

---

## How It Works Now

### Flow 1: Schedule Creation Auto-Assigns Area
```
WMA creates schedule:
  → Collector: John
  → Area: Colombo 3
  
Backend automatically:
  → Adds "Colombo 3" to John's assignedAreas
  
Result:
  → John can now see bins in Colombo 3 when they're Full/High
```

### Flow 2: Collector Updates Schedule Status
```
Collector views schedule:
  → Status: Pending
  → Clicks "Start Route"
  
Backend:
  → Verifies collector is assigned to schedule
  → Updates status to "In Progress"
  
Result:
  → Schedule status updated successfully
```

---

## Testing Steps

### Test 1: Area Assignment Through Schedule

1. **Login as WMA**
2. **Create a Schedule**:
   - Collector: Select a collector
   - Area: Select an area (e.g., "Colombo 3")
   - Date & Time: Set schedule
   - Click "Create Schedule"

3. **Verify Area Assignment**:
   ```bash
   # Check in MongoDB
   db.collectors.findOne({ collectorName: "John" })
   # Should show "Colombo 3" in assignedAreas
   ```

4. **Login as User (in that same area)**:
   - Register a bin in "Colombo 3"
   - Update sensor to "High" or "Full"

5. **Login as Collector**:
   - Navigate to "Full Bins"
   - You should now see the user's bin!

---

### Test 2: Schedule Status Update

1. **Login as Collector**
2. **View Schedules** (`/collector/schedule`)
3. **For Pending Schedule**:
   - Click "Start Route"
   - Status should change to "In Progress"
   - Should redirect to Map

4. **For In Progress Schedule**:
   - Click "Mark as Complete"
   - Status should change to "Completed"
   - Schedule moves to "Completed" section

---

## API Changes

### New Endpoint: Collector Schedule Status Update

```javascript
PUT /api/schedule/:id/status
Headers: { Cookie: jwt_collector=<token> }
Body: { "status": "In Progress" }

Response:
{
  "_id": "...",
  "status": "In Progress",
  "wmaId": {...},
  "collectorId": {...},
  "area": {...}
}
```

**Authorization**:
- ✅ Collector must be authenticated
- ✅ Collector must be assigned to the schedule
- ✅ Only `status` field can be updated

---

## Database Changes

### Collector Model
**Field**: `assignedAreas` (Array of Area ObjectIds)

**Auto-Population**:
- When WMA creates schedule → Area added to collector's assignedAreas
- Prevents duplicates (checks if area already exists)

**Example**:
```javascript
{
  "_id": "collector123",
  "collectorName": "John Doe",
  "assignedAreas": [
    "area1_colombo3",
    "area2_nugegoda"
  ]
}
```

---

## Debugging

### If Full Bins Still Not Showing:

1. **Check Collector's Assigned Areas**:
   ```javascript
   // In backend
   const collector = await Collector.findById(collectorId);
   console.log('Assigned Areas:', collector.assignedAreas);
   ```

2. **Check Bin's Area**:
   ```javascript
   const bin = await Garbage.findOne({ binId: 'BIN-123-456' });
   console.log('Bin Area:', bin.area);
   console.log('Is Visible:', bin.isVisibleToCollectors);
   console.log('Fill Level:', bin.sensorData.fillLevel);
   ```

3. **Check Full Bins Query**:
   - Open browser console
   - Navigate to `/collector/full-bins`
   - Look for console logs showing API response

4. **Manual Area Assignment** (if needed):
   ```javascript
   // In MongoDB or backend script
   const collector = await Collector.findById('collectorId');
   collector.assignedAreas.push('areaId');
   await collector.save();
   ```

---

## Important Notes

### ⚠️ Existing Schedules
- Schedules created BEFORE this fix won't auto-assign areas
- **Solution**: 
  1. Delete old schedules and recreate them, OR
  2. Manually assign areas to collectors in WMA portal

### ⚠️ Multiple Areas
- A collector can be assigned to multiple areas
- Each schedule in a new area adds that area to assignedAreas
- Duplicate areas are prevented

### ⚠️ Schedule Deletion
- Deleting a schedule does NOT remove the area from assignedAreas
- This is intentional - collector might have multiple schedules in same area

---

## Quick Fix Script

If you need to manually assign areas to existing collectors:

```javascript
// Run in MongoDB shell or backend script
const Collector = require('./models/collectorModel');
const Schedule = require('./models/scheduleModel');

async function fixExistingCollectorAreas() {
  const schedules = await Schedule.find({});
  
  for (const schedule of schedules) {
    const collector = await Collector.findById(schedule.collectorId);
    if (collector && !collector.assignedAreas.includes(schedule.area)) {
      collector.assignedAreas.push(schedule.area);
      await collector.save();
      console.log(`Assigned area ${schedule.area} to collector ${collector.collectorName}`);
    }
  }
  
  console.log('Done!');
}

fixExistingCollectorAreas();
```

---

## Files Modified Summary

### Backend (3 files):
1. ✅ `backend/controllers/scheduleController.js`
   - Added `updateScheduleStatus()` method
   - Modified `createSchedule()` to assign areas

2. ✅ `backend/routes/scheduleRoutes.js`
   - Added `PUT /:id/status` route for collectors

3. ✅ `frontend/src/api/collectorApi.js`
   - Updated `updateScheduleStatus()` to use `/status` endpoint

### Frontend (1 file):
4. ✅ `frontend/src/pages/collector/bins/FullBinsCollector.jsx`
   - Added debug logging for troubleshooting

---

## Expected Behavior After Fix

### ✅ WMA Creates Schedule
- Collector automatically gets area assigned
- Collector can see bins in that area

### ✅ Collector Starts Route
- Status updates to "In Progress"
- Can mark as complete later

### ✅ User Registers Bin
- Bin created with Empty sensor
- Updates to High/Full
- Collector sees it immediately

### ✅ Collector Collects Bin
- Bin marked as Collected
- Sensor reset to Empty
- Bin removed from full bins list

---

## Testing Checklist

- [ ] WMA creates schedule
- [ ] Collector's assignedAreas includes schedule area
- [ ] User registers bin in same area
- [ ] User sets sensor to High/Full
- [ ] Collector sees bin in Full Bins list
- [ ] Collector can toggle List/Map views
- [ ] Collector clicks "Start Route" on schedule
- [ ] Schedule status changes to "In Progress"
- [ ] Collector clicks "Mark as Complete"
- [ ] Schedule status changes to "Completed"
- [ ] Collector collects bin
- [ ] Bin disappears from full bins list
- [ ] User's bin sensor resets to Empty

---

**Last Updated**: October 15, 2025
**Status**: ✅ Fixed and Ready for Testing
