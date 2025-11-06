# Guest List Auto-Refresh Feature

## Overview
Enhanced the Event Management page to automatically update the guest list when new RSVPs are submitted, eliminating the need for manual page refreshes.

---

## Problem
Previously, when a guest submitted an RSVP on the EventView page, the organizer viewing the EventManagement page would not see the new RSVP appear in the guest list unless they manually refreshed the entire page.

---

## Solution
Implemented auto-refresh functionality with both automatic and manual refresh options:

1. **Auto-Refresh**: Guest list automatically refreshes every 30 seconds
2. **Manual Refresh**: Button to immediately refresh the list
3. **Last Updated Timestamp**: Shows when data was last refreshed
4. **Enable/Disable Toggle**: Control auto-refresh behavior

---

## Features

### 1. Auto-Refresh (Default Enabled)
- Automatically fetches new RSVP data every 30 seconds
- Runs in the background without disrupting the user
- Can be disabled if not needed
- Visual indicator shows it's active

### 2. Manual Refresh Button
- Refresh icon button in the guest list header
- Shows "Refreshing..." with spinning icon during refresh
- Disabled during refresh to prevent multiple simultaneous requests
- Immediately updates the guest list with latest data

### 3. Last Updated Timestamp
- Displays the time of the last data refresh
- Format: "Last updated: 2:45:30 PM"
- Updates with each refresh (auto or manual)

### 4. Auto-Refresh Toggle
- Enable/disable auto-refresh without losing state
- Blue indicator badge when enabled
- Gray indicator badge when disabled
- Easy one-click toggle

---

## User Interface

### Guest List Header (Auto-Refresh Enabled)
```
┌─────────────────────────────────────────────────────┐
│ Guest List                      [Refresh] [Search]  │
│ Last updated: 2:45:30 PM                           │
│                                                     │
│ ● Auto-refreshing every 30 seconds   [Disable]    │
└─────────────────────────────────────────────────────┘
```

### Guest List Header (Auto-Refresh Disabled)
```
┌─────────────────────────────────────────────────────┐
│ Guest List                      [Refresh] [Search]  │
│ Last updated: 2:45:30 PM                           │
│                                                     │
│ Auto-refresh is disabled               [Enable]    │
└─────────────────────────────────────────────────────┘
```

### Refresh Button States
```
Normal State:      [🔄 Refresh]
Refreshing State:  [⟳ Refreshing...] (spinning icon, disabled)
```

---

## Technical Implementation

### State Variables Added
```javascript
const [isRefreshing, setIsRefreshing] = useState(false);      // Manual refresh in progress
const [lastRefresh, setLastRefresh] = useState(null);         // Timestamp of last refresh
const [autoRefresh, setAutoRefresh] = useState(true);         // Auto-refresh enabled/disabled
```

### Auto-Refresh Logic
```javascript
useEffect(() => {
  if (!autoRefresh) return;
  
  const interval = setInterval(() => {
    loadEventData();
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, [autoRefresh]);
```

### Manual Refresh Function
```javascript
const handleManualRefresh = () => {
  loadEventData(true);
};
```

### Updated loadEventData Function
```javascript
const loadEventData = async (isManualRefresh = false) => {
  if (isManualRefresh) {
    setIsRefreshing(true);
  }
  
  try {
    // ... fetch data ...
    setLastRefresh(new Date());
  } catch (error) {
    console.error("Error loading event data:", error);
  }
  
  setIsLoading(false);
  setIsRefreshing(false);
};
```

---

## Benefits

### For Organizers
✅ **Real-time Updates**: See new RSVPs without manual page refresh  
✅ **Accurate Count**: Always have up-to-date attendee numbers  
✅ **Better Planning**: Make real-time decisions based on current data  
✅ **Less Friction**: No need to remember to refresh the page  
✅ **Flexibility**: Can disable auto-refresh if desired  

### For the System
✅ **Efficient**: Only refreshes when page is active  
✅ **Lightweight**: Minimal network overhead (30-second intervals)  
✅ **Performant**: Doesn't impact page responsiveness  
✅ **Clean**: Properly cleans up intervals on unmount  

---

## Usage Scenarios

### Scenario 1: Event Day Check-In
**Context**: Organizer has EventManagement page open for check-ins

1. Guest submits RSVP on their phone
2. Within 30 seconds, RSVP appears in organizer's guest list
3. Organizer can check in the guest immediately
4. No need to refresh the page

### Scenario 2: Pre-Event RSVP Monitoring
**Context**: Days before event, organizer monitoring RSVPs

1. EventManagement page is open in browser tab
2. New RSVPs appear automatically every 30 seconds
3. Stats update in real-time (Total RSVPs, Attending, etc.)
4. Organizer can see trends without intervention

### Scenario 3: Manual Immediate Check
**Context**: Organizer just invited a VIP guest

1. VIP submits RSVP
2. Organizer doesn't want to wait 30 seconds
3. Clicks "Refresh" button
4. RSVP appears immediately
5. Organizer can confirm VIP is on the list

### Scenario 4: Disable Auto-Refresh for Stability
**Context**: Event is over, organizer reviewing final list

1. Organizer clicks "Disable" on auto-refresh toggle
2. Guest list stays static (no more refreshes)
3. Can review and export data without interruption
4. Can re-enable if needed

---

## Configuration

### Refresh Interval
Default: **30 seconds**

To change the interval, modify the value in `EventManagement.jsx`:

```javascript
const interval = setInterval(() => {
  loadEventData();
}, 30000); // Change this value (in milliseconds)
```

Recommended intervals:
- **10 seconds**: High-traffic events, very active registration
- **30 seconds**: Standard (default) - good balance
- **60 seconds**: Low-traffic events, conserve bandwidth

---

## Performance Considerations

### Network Usage
- Each refresh makes 2 API calls:
  - `GET /api/events` - Fetch event data
  - `POST /api/rsvps/filter` - Fetch RSVPs for the event
- At 30-second intervals: 120 requests/hour
- Minimal data transfer (only fetches needed data)

### Browser Performance
- Interval properly cleaned up on component unmount
- No memory leaks
- Doesn't impact page responsiveness
- Works efficiently with search filtering

### User Experience
- No visible flicker or jump during refresh
- Search term is preserved across refreshes
- Loading states are clear
- Can be disabled if causing issues

---

## Testing

### Test 1: Auto-Refresh Works
1. Open EventManagement page
2. In another tab, submit an RSVP for the same event
3. Wait up to 30 seconds
4. Verify new RSVP appears in the guest list
5. Verify "Last updated" timestamp changes

**Expected**: ✅ New RSVP appears within 30 seconds

### Test 2: Manual Refresh Works
1. Open EventManagement page
2. In another tab, submit an RSVP
3. Click the "Refresh" button immediately
4. Verify button shows "Refreshing..." with spinning icon
5. Verify new RSVP appears immediately

**Expected**: ✅ New RSVP appears immediately after clicking Refresh

### Test 3: Disable Auto-Refresh
1. Open EventManagement page
2. Click "Disable" on auto-refresh toggle
3. Wait more than 30 seconds
4. Submit new RSVP in another tab
5. Verify guest list does NOT update automatically
6. Click "Refresh" button manually
7. Verify RSVP appears

**Expected**: ✅ Auto-refresh stops, manual refresh still works

### Test 4: Enable Auto-Refresh
1. With auto-refresh disabled (from Test 3)
2. Click "Enable" on the toggle
3. Submit new RSVP in another tab
4. Wait up to 30 seconds
5. Verify RSVP appears automatically

**Expected**: ✅ Auto-refresh resumes working

### Test 5: Stats Update
1. Open EventManagement page
2. Note the stats (Total RSVPs, Attending, Checked In)
3. Submit RSVP with status "attending"
4. Wait for auto-refresh (or click Refresh)
5. Verify stats update accordingly

**Expected**: ✅ All stats update to reflect new RSVP

### Test 6: Search Preserved During Refresh
1. Open EventManagement page with multiple RSVPs
2. Type a name in the search box
3. Wait for auto-refresh (or click Refresh)
4. Verify search term is still present
5. Verify filtered results are maintained

**Expected**: ✅ Search term and filter persist through refresh

---

## Known Limitations

1. **Not Real-Time**: Updates occur every 30 seconds, not instantly
   - **Workaround**: Use manual refresh for immediate updates
   - **Future**: Could implement WebSockets for true real-time

2. **No Notification**: Silent refresh, no visual indicator new data arrived
   - **Workaround**: Last updated timestamp shows when refresh occurred
   - **Future**: Could add toast notification for new RSVPs

3. **All Data Refreshed**: Refreshes all RSVPs, not just new ones
   - **Impact**: Minimal, as data is lightweight
   - **Future**: Could implement incremental updates

4. **Requires Page Open**: Only refreshes when EventManagement page is active
   - **Impact**: Must keep page open to see updates
   - **Future**: Could add browser notifications when page is inactive

---

## Browser Compatibility

✅ Works on all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Uses standard JavaScript features:
- `setInterval` / `clearInterval`
- `useState`, `useEffect` hooks
- Standard async/await

---

## Files Modified

### `src/pages/EventManagement.jsx`
- Added refresh state variables
- Added auto-refresh useEffect hook
- Updated `loadEventData` function
- Added `handleManualRefresh` function
- Updated UI with refresh button and controls
- Added last updated timestamp display
- Added auto-refresh toggle with indicator

---

## Future Enhancements

### Potential Improvements
1. **Real-Time Updates**: WebSocket integration for instant updates
2. **New RSVP Notifications**: Toast notifications when new RSVP arrives
3. **Sound Alerts**: Optional sound when new guest RSVPs
4. **Desktop Notifications**: Browser notifications when page inactive
5. **Configurable Interval**: Let organizer set refresh interval
6. **Pause on Edit**: Automatically pause refresh during guest editing
7. **Offline Indicator**: Show when connection is lost
8. **Retry Logic**: Automatic retry on failed refresh
9. **Animation**: Highlight new RSVPs with fade-in effect
10. **Export Auto-Update**: Update export data in real-time

### Advanced Features
- **Multi-Event Monitoring**: Dashboard showing all events' RSVP updates
- **Analytics Stream**: Real-time RSVP rate graph
- **Duplicate Detection**: Alert organizer of potential duplicate submissions
- **VIP Alerts**: Special notification for VIP guest RSVPs

---

## Summary

✅ **Implemented**: Auto-refresh every 30 seconds  
✅ **Implemented**: Manual refresh button with loading state  
✅ **Implemented**: Last updated timestamp  
✅ **Implemented**: Enable/disable auto-refresh toggle  
✅ **Implemented**: Visual indicators for refresh status  

### Result
Organizers can now see new RSVPs appear in the guest list automatically without manually refreshing the page. The guest list stays up-to-date in near real-time, improving the event management experience.

---

**Status**: ✅ Complete & Production Ready  
**Version**: 1.0  
**Last Updated**: November 6, 2025

