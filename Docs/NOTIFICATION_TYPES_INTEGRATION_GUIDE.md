# Notification Types Integration Guide

## Overview

The NotificationService has been enhanced to handle different notification types from the backend, with special handling for match-related notifications that require user navigation.

## Backend Notification Types

```csharp
public enum NotificationType
{
    MatchStart,        // Special: Redirects to simulation page
    MatchEnd,
    SimulationStart,   // Special: Similar to MatchStart
    SimulationEnd,
    MatchUpdate,
    SimulationUpdate,
    SystemAlert,
    UserMessage,
    Info,
    Warning,
    Error,
    Success,
}
```

## Frontend Implementation

### 1. Notification Interface

```typescript
export interface Notification {
  id: string;
  message: string;
  title?: string;
  type: NotificationType;
  isread: boolean;
  time: string;
  matchId?: number; // For match-related notifications
}

export enum NotificationType {
  MatchStart = 'MatchStart',
  MatchEnd = 'MatchEnd',
  SimulationStart = 'SimulationStart',
  SimulationEnd = 'SimulationEnd',
  MatchUpdate = 'MatchUpdate',
  SimulationUpdate = 'SimulationUpdate',
  SystemAlert = 'SystemAlert',
  UserMessage = 'UserMessage',
  Info = 'Info',
  Warning = 'Warning',
  Error = 'Error',
  Success = 'Success',
}
```

### 2. Special Notification Handling

#### MatchStart Notifications

- **Purpose**: Alert users when a simulated match begins
- **Behavior**:
  - Shows toast notification with football emoji (⚽)
  - Automatically redirects to simulation page: `/simulationview/{matchId}`
  - Emits `matchStartNotification` event for custom handling
  - Respects user auto-redirect preferences

#### Backend Method

```csharp
Task SendMatchStartNotificationAsync(Notification notification, int MatchId);
```

#### Frontend Usage

```typescript
// Subscribe to match start notifications
notificationService.onMatchStart((data) => {
  console.log('Match started:', data.notification);
  console.log('Redirect to:', data.redirectTo);
  console.log('Match ID:', data.matchId);

  // Custom handling (optional)
  // The service already handles auto-redirect
});

// Set user preference for auto-redirect
notificationService.setAutoRedirectPreference(true);

// Check current preference
const autoRedirect = notificationService.getAutoRedirectPreference();

// Manually navigate to simulation
notificationService.navigateToSimulation(matchId);
```

### 3. Toast Notification Styling

Each notification type has custom styling:

- **MatchStart**: Blue theme with ⚽ icon
- **SimulationStart/Update**: Gaming theme with 🎮 icon
- **MatchEnd/SimulationEnd**: Gray theme with 🏁 icon
- **Success**: Green success toast
- **Error**: Red error toast
- **Warning/SystemAlert**: Orange warning with ⚠️ icon
- **Info/UserMessage**: Default blue info toast

### 4. Component Integration

#### In React Components

```typescript
import notificationService, { NotificationType } from '@/Services/NotificationService';
import { useRouter } from 'next/navigation';

const MyComponent = () => {
  const router = useRouter();

  useEffect(() => {
    // Handle navigation requests from notification service
    const handleNavigation = (url: string) => {
      router.push(url);
    };

    // Subscribe to navigation events
    notificationService.onNavigationRequest(handleNavigation);

    // Handle match start specifically
    notificationService.onMatchStart((data) => {
      // Show custom UI or confirmation
      if (confirm(`Match started! Go to simulation?`)) {
        router.push(data.redirectTo);
      }
    });

    // Cleanup
    return () => {
      notificationService.off('requestNavigation', handleNavigation);
    };
  }, [router]);

  return (
    // Your component JSX
  );
};
```

#### In Layout/App Component

```typescript
// Initialize notification service in your main layout
useEffect(() => {
  const initNotifications = async () => {
    await notificationService.initialize();
  };

  if (user?.isAuthenticated) {
    initNotifications();
  }

  return () => {
    notificationService.cleanup();
  };
}, [user?.isAuthenticated]);
```

### 5. Testing Different Notification Types

```typescript
// Send test notifications
await notificationService.sendTestNotification(NotificationType.MatchStart);
await notificationService.sendTestNotification(NotificationType.Success);
await notificationService.sendTestNotification(NotificationType.Warning);
```

### 6. Backend Integration Points

#### For Regular Notifications

Use the standard method:

```csharp
await SendNotificationAsync(notification);
```

#### For Match Start Notifications

Use the special method with match ID:

```csharp
await SendMatchStartNotificationAsync(notification, matchId);
```

- The backend should include the `matchId` in the notification metadata
- The frontend will automatically extract it and handle navigation

### 7. User Preferences

Users can control auto-redirect behavior:

```typescript
// Enable auto-redirect to simulation page
notificationService.setAutoRedirectPreference(true);

// Disable auto-redirect (show notification only)
notificationService.setAutoRedirectPreference(false);
```

When auto-redirect is disabled, users will only see the toast notification and can manually navigate if desired.

### 8. Event Flow for MatchStart

1. Backend sends `MatchStart` notification with `matchId`
2. Frontend NotificationService receives via SignalR
3. Service converts `NotificationData` to `Notification` format
4. Special handling is triggered for `MatchStart` type
5. Toast notification is shown with football emoji
6. `matchStartNotification` event is emitted
7. If auto-redirect is enabled, user is redirected to `/simulationview/{matchId}`
8. Components can listen to events for custom behavior

This implementation ensures a smooth user experience where users are automatically notified and redirected when their simulated matches begin, while maintaining flexibility for custom handling.
