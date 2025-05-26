import axios from 'axios';
import toast from 'react-hot-toast';
import signalRService from './SignalRService';
import authService from './AuthenticationService';

export interface Notification {
  id: string;
  message: string;
  title?: string;
  type: string; // 'info' | 'success' | 'error' | 'warning'
  isread: boolean;
  time : string; // ISO 8601 format
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
      const connected = await signalRService.connect();
      if (connected) {
        this.isSignalRConnected = true;
        await this.setupSignalRListeners();
        await this.joinUserNotificationGroup();
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
    if (!signalRService.isConnectionActive()) return;

    // Listen for new notifications
    signalRService.onNotification((notification: Notification) => {
      this.handleNewNotification(notification);
    });

    // Listen for notification updates (mark as read, etc.)
    signalRService.onNotificationUpdated((notification: Notification) => {
      this.handleNotificationUpdate(notification);
    });

    // Listen for notification deletions
    signalRService.onNotificationDeleted((notificationId: string) => {
      this.handleNotificationDeletion(notificationId);
    });
  }

  /**
   * Join user-specific notification group
   */
  private async joinUserNotificationGroup(): Promise<void> {
    try {
      const userId = authService.getCurrentUserId();
      if (userId && signalRService.isConnectionActive()) {
        await signalRService.sendNotificationMessage('JoinUserNotificationGroup', userId);
        console.log(`Joined notification group for user: ${userId}`);
      }
    } catch (error) {
      console.error('Error joining user notification group:', error);
    }
  }

  /**
   * Handle new notification received via SignalR
   */
  private handleNewNotification(notification: Notification): void {
    // Show toast notification if enabled
    if (this.enableToasts) {
      this.showToast(notification);
    }

    // Emit event to listeners
    this.emit('notificationReceived', notification);
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
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
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
        return 0;
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
        `${this.baseUrl}/api/notifications/${notificationId}/read`,
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
    type: Notification['type'] = 'info'
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
