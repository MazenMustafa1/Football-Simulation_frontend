# SignalR Real-Time Match Statistics Testing Guide

## ⚠️ **IMPORTANT UPDATE** ⚠️

**Match Status Independence**: SignalR statistics work for **ANY** match status (Live, Scheduled, Completed, etc.). The backend sends statistics whenever match events occur, regardless of the current match status.

## Prerequisites ✅

1. **Backend Running**: Ensure the backend API with SignalR hub is running
2. **Frontend Running**: Development server should be running (`pnpm dev`)
3. **Authentication**: User must be logged in for SignalR authentication
4. **Live Match**: A live match must be available for testing

## Testing Steps 🧪

### 1. Basic SignalR Connection Test

```bash
# Open browser developer console (F12)
# Navigate to the application
# Login to get authentication token
# Check console for SignalR connection messages:
```

**Expected Console Output:**

```
Match simulation SignalR connected successfully
Notification SignalR connected successfully
```

### 2. Join Match Statistics Group Test

```bash
# Navigate to dashboard or page with LiveMatchPanel
# If live match exists, check console for:
```

**Expected Console Output:**

```
Joined match statistics for match: [matchId]
```

### 3. Real-Time Statistics Reception Test

```bash
# While on a page with LiveMatchPanel during a live match
# Backend should send match statistics updates
# Check console for:
```

**Expected Console Output:**

```
📊 Received real-time match statistics: {
  matchId: 123,
  timeStamp: "2025-06-10T...",
  homeTeam: { name: "Team A", score: 1, ... },
  awayTeam: { name: "Team B", score: 0, ... },
  matchInfo: { status: "Live", currentMinute: 45, ... }
}
```

### 4. UI Update Test

**Visual Checks:**

- ✅ Match scores update in real-time
- ✅ Statistics bars animate with new values
- ✅ Green pulsing dot appears when receiving real-time data
- ✅ Match time updates with current minute
- ✅ Team names display correctly

### 5. Storage Integration Test

```bash
# Open browser developer tools
# Go to Application > Local Storage
# Check for key: 'liveMatchData'
```

**Expected LocalStorage Data:**

```json
{
  "matchId": 123,
  "homeTeam": "Team A",
  "awayTeam": "Team B",
  "homeScore": 1,
  "awayScore": 0,
  "status": "Live"
}
```

### 6. Navigation Test

**Steps:**

1. Click "Live Simulation" button in LiveMatchPanel
2. OR click "View Live Simulation" in Match Details
3. Should navigate to `/simulationview/[matchId]`

### 7. Reduced Polling Test

**Check API Network Requests:**

- Before: Match details API called every 30 seconds
- After: Match details API called every 2 minutes (120 seconds)
- Real-time data comes via SignalR instead

## Browser Developer Tools Monitoring 🔍

### Console Tab

Monitor for:

- SignalR connection messages
- Match statistics reception logs
- Error messages or warnings

### Network Tab

Monitor for:

- WebSocket connection to SignalR hub
- Reduced frequency of API polling
- Successful authentication headers

### Application Tab (Local Storage)

Monitor for:

- `liveMatchData` key updates
- Data structure matches expected format

## Troubleshooting 🔧

### SignalR Not Connecting

```bash
# Check console for errors like:
"No valid authentication token available for match simulation SignalR connection"

# Solution: Ensure user is logged in and token is valid
```

### No Real-Time Updates

```bash
# Check if joined match statistics group:
"Joined match statistics for match: [matchId]"

# If not, check:
# 1. User authentication
# 2. Live match availability
# 3. Backend SignalR hub status
```

### UI Not Updating

```bash
# Check if statistics received in console
# If yes, check React state updates in React DevTools
# Verify component re-rendering with new props
```

### Navigation Not Working

```bash
# Check console for router errors
# Verify router is initialized: `const router = useRouter();`
# Check route exists: `/simulationview/[matchId]`
```

## Performance Testing 📊

### Metrics to Monitor

1. **API Request Frequency**: Should be ~75% reduction
2. **Real-time Latency**: Statistics should appear within 1-2 seconds
3. **Memory Usage**: Check for memory leaks with extended usage
4. **WebSocket Stability**: Monitor connection reliability

### Load Testing

1. **Multiple Tabs**: Open multiple tabs with live match
2. **Connection Recovery**: Temporarily disconnect internet, reconnect
3. **Authentication Expiry**: Test behavior when token expires
4. **Extended Usage**: Leave application open for extended periods

## Expected Results ✅

### Successful Implementation

- ✅ Real-time statistics display instantly
- ✅ Smooth animations and transitions
- ✅ Reduced network bandwidth usage
- ✅ Reliable navigation to simulation view
- ✅ Persistent data across browser sessions
- ✅ Graceful fallback to API when SignalR unavailable

### Success Indicators

1. **Green pulsing dot** appears during real-time updates
2. **Statistics update** without page refresh
3. **API polling** reduced from every 30s to every 2 minutes
4. **Navigation buttons** work correctly
5. **LocalStorage** contains current match data
6. **Console shows** successful SignalR messages

## Test Scenarios 🎭

### Scenario 1: Normal Live Match

- User logged in
- Live match in progress
- SignalR connected
- **Expected**: Real-time statistics, smooth updates

### Scenario 2: SignalR Unavailable

- SignalR hub down or connection failed
- **Expected**: Fallback to API polling every 2 minutes

### Scenario 3: Authentication Issues

- Token expired or invalid
- **Expected**: SignalR disconnects, API continues working

### Scenario 4: No Live Match

- No current live matches
- **Expected**: Panel shows appropriate message, no SignalR joining

### Scenario 5: Network Interruption

- Internet connection lost and restored
- **Expected**: SignalR auto-reconnects, data resumes

## Manual Testing Checklist ☑️

- [ ] SignalR connections establish successfully
- [ ] Real-time statistics are received and logged
- [ ] UI updates reflect real-time data changes
- [ ] LocalStorage contains correct match data
- [ ] Navigation buttons work from both panels
- [ ] API polling frequency reduced to 2 minutes
- [ ] Green real-time indicator appears during updates
- [ ] Statistics bars animate smoothly
- [ ] Team names and scores display correctly
- [ ] Match time updates in real-time
- [ ] Graceful handling of SignalR disconnections

---

**Note**: This implementation is ready for production testing with the backend SignalR hub. All frontend components are properly configured to handle the exact data structure sent by the backend.
