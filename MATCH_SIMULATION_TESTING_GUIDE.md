# Match Simulation System - Testing Guide

## Overview

The Football Simulation frontend now includes a complete match simulation system with real-time visualization and SignalR integration.

## System Components

### 1. Dashboard Enhancement

- **Location**: `/app/dashboard/page.tsx`
- **Feature**: "Simulate New Matches" button added to the dashboard
- **Purpose**: Entry point to the match simulation system

### 2. Match Simulation Page

- **Location**: `/app/matchsimulation/page.tsx`
- **Route**: `/matchsimulation`
- **Features**:
  - Team selection for home/away teams
  - Season selection for each team
  - Real-time validation (teams can't play themselves)
  - Dynamic season loading
  - Simulation initiation
  - Status tracking and error handling

### 3. Simulation View Page

- **Location**: `/app/simulationview/[simulationId]/page.tsx`
- **Route**: `/simulationview/[simulationId]`
- **Features**:
  - Real-time and replay mode toggle
  - Interactive football pitch visualization
  - Playback controls (play, pause, stop, speed adjustment)
  - Live score and match progress
  - Event timeline and navigation
  - SignalR integration for real-time events

### 4. Football Pitch Component

- **Location**: `/app/Components/FootballPitch/FootballPitch.tsx`
- **Features**:
  - SVG-based football field with proper markings
  - Real-time event visualization
  - Color-coded event markers
  - Event trails and animations
  - Pass and shot trajectory visualization
  - Live score overlay

## Services

### 1. MatchSimulationService

- **Location**: `/Services/MatchSimulationService.ts`
- **Methods**:
  - `getTeamSeasons(teamId)` - Fetch team seasons
  - `simulateMatch(userId, matchData)` - Start simulation
  - `trackSimulation(simulationId)` - Track progress
  - `getSimulationResult(simulationId)` - Get results
- **Features**: Intelligent caching, retry logic, error handling

### 2. SignalRService

- **Location**: `/Services/SignalRService.ts`
- **Features**:
  - Real-time connection management
  - Automatic reconnection
  - Event handlers for match events
  - Room management (join/leave simulation)
  - Connection state monitoring

## API Endpoints Expected

### Backend Requirements

The frontend expects the following API endpoints:

1. **Team Seasons**: `GET /teams/seasons/{teamId}`
2. **Start Simulation**: `POST /simulatematch/{userId}`
3. **Track Simulation**: `GET /match/simulation/track/{simulationId}`
4. **Get Results**: `GET /match/simulation/result/{simulationId}`
5. **SignalR Hub**: `/matchSimulationHub`

## Testing Steps

### 1. Basic Navigation Test

1. Start the application: `npm run dev`
2. Navigate to `/dashboard`
3. Verify "Simulate New Matches" button is visible
4. Click the button to navigate to `/matchsimulation`

### 2. Match Simulation Setup Test

1. On `/matchsimulation` page:
   - Select home team from dropdown
   - Select away team from dropdown (different from home team)
   - Verify seasons load for both teams
   - Select seasons for both teams
   - Click "Start Simulation"

### 3. Real-time Simulation Test

1. After starting simulation:
   - Verify redirect to `/simulationview/[simulationId]`
   - Check real-time toggle is ON by default
   - Verify SignalR connection status
   - Watch for real-time events on the pitch
   - Check live score updates

### 4. Replay Mode Test

1. On simulation view page:
   - Toggle to "Replay Mode"
   - Use playback controls (play, pause, stop)
   - Adjust playback speed
   - Navigate through events manually

### 5. Football Pitch Visualization Test

1. Verify football pitch renders correctly
2. Check event markers appear on the pitch
3. Verify different event types have different colors
4. Check event trails and animations
5. Verify live score display

## Error Handling Tests

### 1. Network Errors

- Disconnect network and verify error messages
- Test retry mechanisms

### 2. SignalR Connection Tests

- Test connection failure scenarios
- Verify automatic reconnection

### 3. Invalid Data Tests

- Try selecting same team for home/away
- Test with invalid simulation IDs

## Performance Considerations

### 1. Caching Strategy

- Team data: 10 minutes TTL
- Simulation tracking: 2 seconds TTL
- Results: 30 minutes TTL

### 2. Real-time Optimization

- Event batching for performance
- Efficient SVG rendering
- Memory management for long simulations

## Browser Compatibility

- Modern browsers with WebSocket support
- SignalR fallbacks for older browsers
- Responsive design for mobile devices

## Environment Variables Required

```
NEXT_PUBLIC_API_BASE_URL=https://localhost:7082
```

## Security Considerations

- JWT tokens for API authentication
- SignalR authentication with access tokens
- Input validation on all forms

## Monitoring and Debugging

### 1. Console Logs

- SignalR connection status
- API request/response logging
- Error tracking

### 2. Performance Monitoring

- Component render times
- API response times
- Memory usage tracking

## Known Limitations

1. Maximum event count for visualization performance
2. SignalR connection limit considerations
3. Mobile touch interactions for playback controls

## Future Enhancements

1. Sound effects for different event types
2. Match statistics dashboard
3. Export functionality for simulation results
4. Simulation history and replay system
5. Multi-language support
6. Advanced analytics and heat maps
