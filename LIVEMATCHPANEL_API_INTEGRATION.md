# LiveMatchPanel API Integration - Implementation Guide

## Overview

The LiveMatchPanel component has been enhanced to integrate with the backend API endpoint `/matches/details/{matchId}` to display real-time match data and statistics.

## Features

### 🔄 **API Integration**

- Fetches live match data from `/matches/details/{matchId}`
- Automatic data refresh and caching through MatchService
- Fallback to props when no matchId is provided or API fails

### 📊 **Rich Match Statistics**

- Live score updates
- Possession percentages
- Shots and shots on target
- Corners, fouls, cards statistics
- Pass accuracy and completion rates
- All defensive and offensive stats from API

### 🎯 **Navigation Integration**

- Clickable panel navigates to match details page
- Supports URL parameters for match identification
- Seamless integration with existing routing

### 🛡️ **Error Handling**

- Loading states with spinner
- Error messages with retry options
- Graceful fallback to default data
- Image error handling with default logos

## Usage Examples

### 1. **Dashboard Usage (API-Driven)**

```tsx
// In dashboard/page.tsx
<LiveMatchPanel
  matchId="1" // Fetches data from API
  // Fallback props for when API fails
  homeTeam={{ name: 'Barcelona', logo: '/logos/barcelona.png' }}
  awayTeam={{ name: 'Real Madrid', logo: '/logos/real madrid.png' }}
  homeScore={2}
  awayScore={1}
  matchTime="65:23"
/>
```

### 2. **Static Usage (Props-Driven)**

```tsx
// When no matchId is provided, uses props
<LiveMatchPanel
  homeTeam={{ name: 'Team A', logo: '/logos/teamA.png' }}
  awayTeam={{ name: 'Team B', logo: '/logos/teamB.png' }}
  homeScore={1}
  awayScore={0}
  matchTime="45:00"
  stats={[
    { label: 'Possession', homeValue: 60, awayValue: 40 },
    { label: 'Shots', homeValue: 8, awayValue: 3 },
  ]}
/>
```

### 3. **Match Details Page Usage**

```tsx
// In matchdetails/page.tsx - automatically gets matchId from URL
const searchParams = useSearchParams();
const matchId = searchParams.get('matchId');

<LiveMatchPanel matchId={matchId || undefined} />;
```

## API Response Mapping

The component maps API response fields to display elements:

### **Team Information**

- `homeTeam.shortName` or `homeTeam.name` → Team display name
- `homeTeam.logo` → Team logo image
- `homeTeam.primaryColor` → Team color theming

### **Match Status**

- `scheduledDateTimeUtc` → Calculated match time
- `homeTeamScore` / `awayTeamScore` → Live score
- `matchStatus` → Match status indicator

### **Statistics**

- `homeTeamPossession` / `awayTeamPossession` → Possession bars
- `homeTeamShots` / `awayTeamShots` → Shot statistics
- `homeTeamShotsOnTarget` / `awayTeamShotsOnTarget` → Accuracy stats
- `homeTeamCorners` / `awayTeamCorners` → Corner kicks
- `homeTeamFouls` / `awayTeamFouls` → Foul counts
- `homeTeamYellowCards` / `awayTeamYellowCards` → Card statistics

## Component Props

```typescript
interface LiveMatchPanelProps {
  matchId?: string; // API match ID for live data
  homeTeam?: {
    // Fallback home team data
    name: string;
    logo: string;
  };
  awayTeam?: {
    // Fallback away team data
    name: string;
    logo: string;
  };
  homeScore?: number; // Fallback home score
  awayScore?: number; // Fallback away score
  stats?: Array<{
    // Fallback statistics
    label: string;
    homeValue: number;
    awayValue: number;
  }>;
  matchTime?: string; // Fallback match time
}
```

## Error Handling

### **Loading State**

```tsx
if (isLoading) {
  return (
    <div className="mx-auto w-full max-w-sm p-4 text-center">
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-[#4CAF50]"></div>
      </div>
      <p className="text-sm text-gray-500">Loading match details...</p>
    </div>
  );
}
```

### **Error State**

```tsx
if (error) {
  return (
    <div className="mx-auto w-full max-w-sm p-4 text-center">
      <div className="py-4">
        <div className="mb-2 text-red-500">⚠️</div>
        <p className="text-sm text-red-500">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );
}
```

## Match Time Calculation

The component calculates live match time from UTC timestamps:

```typescript
const formatMatchTime = (utcDate: string): string => {
  const now = new Date();
  const matchDate = new Date(utcDate);
  const diffMs = now.getTime() - matchDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 0) return 'Not Started';
  else if (diffMinutes <= 90) return `${diffMinutes}'`;
  else return 'Full Time';
};
```

## Navigation Integration

### **Click Handler**

```typescript
const handleMatchClick = () => {
  if (matchId || matchData?.id) {
    router.push(`/matchdetails?matchId=${matchId || matchData?.id}`);
  }
};
```

### **URL Structure**

- Dashboard: `/dashboard` (shows live match with ID)
- Match Details: `/matchdetails?matchId=1` (detailed view)

## Caching Strategy

- **Match Details**: 5 minutes TTL
- **Live Updates**: Automatic refresh through MatchService
- **Error Recovery**: Retry logic with exponential backoff

## Styling Features

### **Interactive Elements**

- Hover effects on clickable panel
- Loading spinners during API calls
- Color-coded statistics bars
- Team color integration from API

### **Responsive Design**

- Mobile-friendly layout
- Flexible team name truncation
- Adaptive logo sizing
- Responsive statistics display

## Integration Points

### **Services Used**

- `MatchService.getMatchDetails(id)` - API data fetching
- `useRouter()` - Navigation handling
- `useSearchParams()` - URL parameter parsing

### **Components Integrated**

- Dashboard right panel
- Match details page header
- Simulation view integration
- Admin panel displays

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live score updates
2. **Animation**: Smooth transitions for score changes
3. **Detailed Stats**: Expandable statistics panels
4. **Multi-language**: Internationalization support
5. **Accessibility**: Screen reader optimization
6. **Performance**: Virtual scrolling for large datasets

## Testing Scenarios

### **API Integration Testing**

1. Valid match ID → Should fetch and display API data
2. Invalid match ID → Should show error with retry option
3. Network failure → Should fall back to props or show error
4. Loading state → Should show spinner during API call

### **Navigation Testing**

1. Click on panel → Should navigate to match details
2. URL parameters → Should pass match ID correctly
3. Back navigation → Should maintain state

### **Data Display Testing**

1. All statistics → Should render correctly from API
2. Team logos → Should load or fallback to default
3. Match time → Should calculate correctly from UTC
4. Score updates → Should reflect real-time changes

The LiveMatchPanel is now a fully integrated, API-driven component that provides rich match information with excellent error handling and user experience!
