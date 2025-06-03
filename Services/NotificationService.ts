// NotificationService - Handles real-time notifications from SignalR and API
// Note: matchId from notifications is used as simulationId for redirection to /simulationview/{simulationId}
import axios from 'axios';
import toast from 'react-hot-toast';
import signalRService from './SignalRService';
import authService from './AuthenticationService';

export interface Notification {
  id: string;
  message: string;
  title?: string;
  type: NotificationType;
  isread: boolean;
  time: string; // ISO 8601 format
  matchId?: number; // For match-related notifications
  simulationId?: string; // For simulation-related notifications (from backend SimulationId)
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

export interface NotificationServiceConfig {
  baseUrl: string;
  enableToasts: boolean;
  toastDuration: number;
}

class NotificationService {
  private readonly baseUrl: string;
  private readonly enableToasts: boolean;
  private readonly toastDuration: number;
  private isSignalRConnected: boolean = false;
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor(config?: Partial<NotificationServiceConfig>) {
    this.baseUrl =
      config?.baseUrl ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'https://localhost:7082';
    this.enableToasts = config?.enableToasts ?? true;
    this.toastDuration = config?.toastDuration || 4000;
  }

  /**
   * Initialize real-time notification service
   */
  public async initialize(): Promise<boolean> {
    try {
      if (!authService.isAuthenticated()) {
        console.log(
          'User not authenticated, skipping notification service initialization'
        );
        return false;
      }

      // Connect to SignalR if not already connected
      if (!this.isSignalRConnected) {
        const connected = await this.connectToSignalR();
        if (!connected) {
          console.warn(
            'Failed to connect to SignalR, notifications will work in polling mode only'
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }

  /**
   * Connect to SignalR for real-time notifications
   */
  private async connectToSignalR(): Promise<boolean> {
    try {
      // Connect to both SignalR hubs (match simulation and notifications)
      const connected = await signalRService.connectNotifications();
      if (connected) {
        this.isSignalRConnected = true;
        await this.setupSignalRListeners();
        console.log('SignalR notification service connected');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error connecting to SignalR notification service:', error);
      return false;
    }
  }

  /**
   * Setup SignalR event listeners for notifications
   */
  private async setupSignalRListeners(): Promise<void> {
    if (!signalRService.isNotificationActive()) return;

    // Listen for new notifications
    signalRService.onNotification((notificationData: any) => {
      // Convert NotificationData to Notification format
      const notification: Notification =
        this.convertNotificationData(notificationData);
      this.handleNewNotification(notification);
    });

    // Listen for notification updates (mark as read, etc.)
    signalRService.onNotificationUpdated((notificationData: any) => {
      const notification: Notification =
        this.convertNotificationData(notificationData);
      this.handleNotificationUpdate(notification);
    });

    // Listen for notification deletions
    signalRService.onNotificationDeleted((notificationId: string) => {
      this.handleNotificationDeletion(notificationId);
    });
  }

  /**
   * Convert SignalR NotificationData to our Notification format
   */
  private convertNotificationData(data: any): Notification {
    return {
      id: data.id,
      message: data.message,
      title: data.title,
      type: data.type as NotificationType,
      isread: data.read || data.isread || false,
      time: data.createdAt || data.time || new Date().toISOString(),
      matchId: data.metadata?.matchId || data.matchId,
      simulationId:
        data.metadata?.simulationId ||
        data.simulationId ||
        data.metadata?.SimulationId ||
        data.SimulationId,
    };
  }

  /**
   * Handle new notification received via SignalR
   */
  private handleNewNotification(notification: Notification): void {
    // Handle special notification types that require navigation
    this.handleSpecialNotifications(notification);

    // Show toast notification if enabled
    if (this.enableToasts) {
      this.showToast(notification);
    }

    // Emit event to listeners
    this.emit('notificationReceived', notification);
  }

  /**
   * Handle special notification types that require specific actions
   */
  private handleSpecialNotifications(notification: Notification): void {
    switch (notification.type) {
      case NotificationType.MatchStart:
        this.handleMatchStartNotification(notification);
        break;
      case NotificationType.SimulationStart:
        this.handleSimulationStartNotification(notification);
        break;
      case NotificationType.MatchEnd:
      case NotificationType.SimulationEnd:
        // Could add special handling for match/simulation end if needed
        break;
      default:
        // No special handling required for other types
        break;
    }
  }

  /**
   * Handle match start notification - redirect to simulation page
   */
  private handleMatchStartNotification(notification: Notification): void {
    if (notification.simulationId) {
      // Emit specific event for match start with navigation data
      this.emit('matchStartNotification', {
        notification,
        redirectTo: `/simulationview/${notification.simulationId}`,
        simulationId: notification.simulationId,
      });

      // Auto-redirect if in browser environment and user wants immediate navigation
      if (typeof window !== 'undefined') {
        // Optional: Show confirmation before redirect
        const shouldRedirect = this.shouldAutoRedirectToMatch();
        if (shouldRedirect) {
          this.redirectToSimulation(notification.simulationId);
        }
      }
    }
  }

  /**
   * Handle simulation start notification
   */
  private handleSimulationStartNotification(notification: Notification): void {
    // Similar to match start but maybe different behavior
    this.emit('simulationStartNotification', {
      notification,
      simulationId: notification.simulationId,
    });
  }

  /**
   * Check if user prefers auto-redirect to match simulation
   */
  private shouldAutoRedirectToMatch(): boolean {
    // Check user preferences or settings
    const autoRedirect = localStorage.getItem('autoRedirectToMatch');
    return autoRedirect === 'true';
  }

  /**
   * Redirect user to simulation page
   */
  private redirectToSimulation(simulationId: string): void {
    try {
      const redirectUrl = `/simulationview/${simulationId}`;

      // Use Next.js router if available, otherwise fallback to window.location
      if (typeof window !== 'undefined') {
        // Emit event for components to handle navigation
        this.emit('requestNavigation', redirectUrl);

        // Fallback to direct navigation after short delay
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      }
    } catch (error) {
      console.error('Error redirecting to simulation:', error);
    }
  }

  /**
   * Handle notification update received via SignalR
   */
  private handleNotificationUpdate(notification: Notification): void {
    this.emit('notificationUpdated', notification);
  }

  /**
   * Handle notification deletion received via SignalR
   */
  private handleNotificationDeletion(notificationId: string): void {
    this.emit('notificationDeleted', notificationId);
  }

  /**
   * Show toast notification based on type
   */
  private showToast(notification: Notification): void {
    const message = notification.title
      ? `${notification.title}: ${notification.message}`
      : notification.message;

    const toastOptions = {
      duration: this.toastDuration,
      position: 'top-right' as const,
    };

    switch (notification.type) {
      case NotificationType.Success:
        toast.success(message, toastOptions);
        break;
      case NotificationType.Error:
        toast.error(message, toastOptions);
        break;
      case NotificationType.Warning:
      case NotificationType.SystemAlert:
        toast(message, {
          ...toastOptions,
          icon: '⚠️',
          style: {
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #F59E0B',
          },
        });
        break;
      case NotificationType.MatchStart:
        toast(message, {
          ...toastOptions,
          icon: '⚽',
          style: {
            background: '#DBEAFE',
            color: '#1E40AF',
            border: '1px solid #3B82F6',
          },
        });
        break;
      case NotificationType.SimulationStart:
      case NotificationType.MatchUpdate:
      case NotificationType.SimulationUpdate:
        toast(message, {
          ...toastOptions,
          icon: '🎮',
          style: {
            background: '#F0F9FF',
            color: '#0C4A6E',
            border: '1px solid #0284C7',
          },
        });
        break;
      case NotificationType.MatchEnd:
      case NotificationType.SimulationEnd:
        toast(message, {
          ...toastOptions,
          icon: '🏁',
          style: {
            background: '#F3F4F6',
            color: '#374151',
            border: '1px solid #6B7280',
          },
        });
        break;
      case NotificationType.Info:
      case NotificationType.UserMessage:
      default:
        toast(message, toastOptions);
        break;
    }
  }

  /**
   * Fetch user-specific notifications from API
   */
  public async getUserNotifications(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    notifications: Notification[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const userId = authService.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await axios.get(
        `${this.baseUrl}/api/notifications/user/${userId}`,
        {
          params: { page, limit },
          headers: this.getAuthHeaders(),
        }
      );

      const { notifications, total, hasMore } = response.data;
      return { notifications, total, hasMore };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for user
   */
  public async getUnreadCount(): Promise<number> {
    try {
      const userId = authService.getCurrentUserId();
      if (!userId) {
        return 0; // No user authenticated
      }

      const response = await axios.get(
        `${this.baseUrl}/api/notifications/user/${userId}/unread-count`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data || 0;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      return 0;
    }
  }

  /**
   * Mark a specific notification as read
   */
  public async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await axios.patch(
        `${this.baseUrl}/api/notifications/mark-as-read/${notificationId}`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all user notifications as read
   */
  public async markAllAsRead(): Promise<boolean> {
    try {
      const userId = authService.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await axios.patch(
        `${this.baseUrl}/api/notifications/user/${userId}/mark-all-read`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete a specific notification
   */
  public async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await axios.delete(
        `${this.baseUrl}/api/notifications/${notificationId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Delete all user notifications
   */
  public async deleteAllNotifications(): Promise<boolean> {
    try {
      const userId = authService.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await axios.delete(
        `${this.baseUrl}/api/notifications/user/${userId}/all`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return false;
    }
  }

  /**
   * Send a test notification (for development/testing)
   */
  public async sendTestNotification(
    type: NotificationType = NotificationType.Info
  ): Promise<boolean> {
    try {
      const userId = authService.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await axios.post(
        `${this.baseUrl}/api/notifications/test`,
        {
          userId,
          type,
          message: `Test ${type} notification`,
          title: 'Test Notification',
        },
        {
          headers: this.getAuthHeaders(),
        }
      );

      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }

  /**
   * Set user preference for auto-redirect to match simulation
   */
  public setAutoRedirectPreference(enabled: boolean): void {
    localStorage.setItem('autoRedirectToMatch', enabled.toString());
  }

  /**
   * Get user preference for auto-redirect to match simulation
   */
  public getAutoRedirectPreference(): boolean {
    return localStorage.getItem('autoRedirectToMatch') === 'true';
  }

  /**
   * Manually trigger navigation to simulation page
   */
  public navigateToSimulation(simulationId: string): void {
    this.redirectToSimulation(simulationId);
  }

  /**
   * Subscribe to match start notifications specifically
   */
  public onMatchStart(
    callback: (data: {
      notification: Notification;
      redirectTo: string;
      simulationId: string;
    }) => void
  ): void {
    this.on('matchStartNotification', callback);
  }

  /**
   * Subscribe to navigation requests
   */
  public onNavigationRequest(callback: (url: string) => void): void {
    this.on('requestNavigation', callback);
  }

  /**
   * Event listener management
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error('Error in notification event listener:', error);
        }
      });
    }
  }
  /**
   * Get authorization headers for API requests
   */
  private getAuthHeaders(): Record<string, string> {
    // Use the same token retrieval logic as AuthenticationService
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Cleanup service
   */
  public async cleanup(): Promise<void> {
    try {
      // Clear event listeners
      this.eventListeners.clear();

      // Disconnect from SignalR
      if (this.isSignalRConnected) {
        await signalRService.disconnect();
        this.isSignalRConnected = false;
      }

      console.log('Notification service cleaned up');
    } catch (error) {
      console.error('Error cleaning up notification service:', error);
    }
  }

  /**
   * Get service status
   */
  public getStatus(): {
    isInitialized: boolean;
    isSignalRConnected: boolean;
    toastsEnabled: boolean;
  } {
    return {
      isInitialized: true,
      isSignalRConnected: this.isSignalRConnected,
      toastsEnabled: this.enableToasts,
    };
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();
export default notificationService;
