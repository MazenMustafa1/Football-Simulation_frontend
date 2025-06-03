import * as signalR from '@microsoft/signalr';
import authService from './AuthenticationService';

export interface SignalREvent {
  simulationId: string;
  eventType:
    | 'match-start'
    | 'match-event'
    | 'match-end'
    | 'simulation-progress';
  data: any;
  timestamp: string;
}

export interface MatchEventData {
  eventIndex: number;
  minute: number;
  second: number;
  team: string;
  player: string;
  action: string;
  position: [number, number];
  outcome: string;
  eventType: string;
  homeScore: number;
  awayScore: number;
}

export interface SimulationProgressData {
  simulationId: string;
  progress: number;
  status: 'running' | 'completed' | 'failed';
  currentEvent?: number;
  totalEvents?: number;
}

export interface NotificationData {
  id: string;
  userId: string;
  message: string;
  title?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

class SignalRService {
  private matchSimulationConnection: signalR.HubConnection | null = null;
  private notificationConnection: signalR.HubConnection | null = null;
  private readonly baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7082';
  private isMatchSimulationConnected = false;
  private isNotificationConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  constructor() {
    // Listen for logout events to disconnect SignalR
    authService.onLogout(() => {
      this.disconnectDueToAuth();
    });
  }

  /**
   * Initialize and start match simulation SignalR connection
   */
  public async connectMatchSimulation(): Promise<boolean> {
    try {
      if (this.matchSimulationConnection && this.isMatchSimulationConnected) {
        console.log('Match simulation SignalR already connected');
        return true;
      }

      // Get valid auth token for connection
      const token = await this.getAuthToken();
      if (!token) {
        console.warn(
          'No valid authentication token available for match simulation SignalR connection'
        );
        return false;
      }

      this.matchSimulationConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${this.baseUrl}/matchSimulationHub`, {
          accessTokenFactory: async () => {
            // Always get a fresh, valid token for each request
            const freshToken = await this.getAuthToken();
            return freshToken || '';
          },
          transport: signalR.HttpTransportType.WebSockets,
          skipNegotiation: true,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
              return Math.min(
                1000 * Math.pow(2, retryContext.previousRetryCount),
                30000
              );
            }
            return null; // Stop retrying
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event handlers for match simulation
      this.setupMatchSimulationEventHandlers();

      // Start connection
      await this.matchSimulationConnection.start();
      this.isMatchSimulationConnected = true;

      console.log('Match simulation SignalR connected successfully');
      return true;
    } catch (error) {
      console.error('Match simulation SignalR connection failed:', error);
      this.isMatchSimulationConnected = false;
      return false;
    }
  }

  /**
   * Initialize and start notification SignalR connection
   */
  public async connectNotifications(): Promise<boolean> {
    try {
      if (this.notificationConnection && this.isNotificationConnected) {
        console.log('Notification SignalR already connected');
        return true;
      }

      // Get valid auth token for connection
      const token = await this.getAuthToken();
      if (!token) {
        console.warn(
          'No valid authentication token available for notification SignalR connection'
        );
        return false;
      }

      this.notificationConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${this.baseUrl}/Notify`, {
          accessTokenFactory: async () => {
            // Always get a fresh, valid token for each request
            const freshToken = await this.getAuthToken();
            return freshToken || '';
          },
          transport: signalR.HttpTransportType.WebSockets,
          skipNegotiation: true,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
              return Math.min(
                1000 * Math.pow(2, retryContext.previousRetryCount),
                30000
              );
            }
            return null; // Stop retrying
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event handlers for notifications
      this.setupNotificationEventHandlers();

      // Start connection
      await this.notificationConnection.start();
      this.isNotificationConnected = true;

      console.log('Notification SignalR connected successfully');
      return true;
    } catch (error) {
      console.error('Notification SignalR connection failed:', error);
      this.isNotificationConnected = false;
      return false;
    }
  }

  /**
   * Initialize and start both SignalR connections
   */
  public async connect(): Promise<boolean> {
    const matchSimulationConnected = await this.connectMatchSimulation();
    const notificationConnected = await this.connectNotifications();

    // Reset reconnect attempts if at least one connection succeeded
    if (matchSimulationConnected || notificationConnected) {
      this.reconnectAttempts = 0;
    }

    return matchSimulationConnected && notificationConnected;
  }

  /**
   * Disconnect from match simulation SignalR hub
   */
  public async disconnectMatchSimulation(): Promise<void> {
    try {
      if (this.matchSimulationConnection) {
        await this.matchSimulationConnection.stop();
        this.matchSimulationConnection = null;
        this.isMatchSimulationConnected = false;
        console.log('Match simulation SignalR disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting match simulation SignalR:', error);
    }
  }

  /**
   * Disconnect from notification SignalR hub
   */
  public async disconnectNotifications(): Promise<void> {
    try {
      if (this.notificationConnection) {
        await this.notificationConnection.stop();
        this.notificationConnection = null;
        this.isNotificationConnected = false;
        console.log('Notification SignalR disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting notification SignalR:', error);
    }
  }

  /**
   * Disconnect from all SignalR hubs
   */
  public async disconnect(): Promise<void> {
    this.reconnectAttempts = 0; // Reset reconnect attempts on manual disconnect
    await Promise.all([
      this.disconnectMatchSimulation(),
      this.disconnectNotifications(),
    ]);
    console.log('All SignalR connections disconnected');
  }

  /**
   * Disconnect due to authentication failure
   */
  public async disconnectDueToAuth(): Promise<void> {
    console.log('Disconnecting SignalR due to authentication failure');
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnection
    await this.disconnect();
  }

  /**
   * Join a simulation room to receive real-time updates
   */
  public async joinSimulation(simulationId: string): Promise<boolean> {
    try {
      // Ensure we have an active authenticated connection
      const connected = await this.ensureConnection();
      if (!connected) return false;

      await this.connection!.invoke('JoinSimulation', simulationId);
      console.log(`Joined simulation: ${simulationId}`);
      return true;
    } catch (error) {
      console.error('Error joining simulation:', error);
      // If it's an auth error, handle it appropriately
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        await this.disconnectDueToAuth();
      }
      return false;
    }
  }

  /**
   * Leave a simulation room
   */
  public async leaveSimulation(simulationId: string): Promise<boolean> {
    try {
      if (!this.connection || !this.isConnected) {
        return false;
      }

      await this.connection.invoke('LeaveSimulation', simulationId);
      console.log(`Left simulation: ${simulationId}`);
      return true;
    } catch (error) {
      console.error('Error leaving simulation:', error);
      return false;
    }
  }

  /**
   * Subscribe to match events for a specific simulation
   */
  public onMatchEvent(callback: (data: MatchEventData) => void): void {
    if (this.connection) {
      this.connection.on('MatchEvent', callback);
    }
  }

  /**
   * Subscribe to simulation progress updates
   */
  public onSimulationProgress(
    callback: (data: SimulationProgressData) => void
  ): void {
    if (this.connection) {
      this.connection.on('SimulationProgress', callback);
    }
  }

  /**
   * Subscribe to simulation completion
   */
  public onSimulationComplete(
    callback: (
      simulationId: string,
      finalScore: { home: number; away: number }
    ) => void
  ): void {
    if (this.connection) {
      this.connection.on('SimulationComplete', callback);
    }
  }

  /**
   * Subscribe to simulation errors
   */
  public onSimulationError(
    callback: (simulationId: string, error: string) => void
  ): void {
    if (this.connection) {
      this.connection.on('SimulationError', callback);
    }
  }

  /**
   * Subscribe to notification events
   */
  public onNotification(callback: (data: NotificationData) => void): void {
    if (this.connection) {
      this.connection.on('Notify', callback);
    }
  }

  /**
   * Subscribe to notification update events
   */
  public onNotificationUpdated(
    callback: (data: NotificationData) => void
  ): void {
    if (this.connection) {
      this.connection.on('NotificationUpdated', callback);
    }
  }

  /**
   * Subscribe to notification deletion events
   */
  public onNotificationDeleted(
    callback: (notificationId: string) => void
  ): void {
    if (this.connection) {
      this.connection.on('NotificationDeleted', callback);
    }
  }

  /**
   * Join user notification group for real-time notifications
   */
  public async joinUserNotificationGroup(userId: string): Promise<boolean> {
    try {
      // Ensure we have an active authenticated connection
      const connected = await this.ensureConnection();
      if (!connected) return false;

      await this.connection!.invoke('JoinUserNotificationGroup', userId);
      console.log(`Joined user notification group: ${userId}`);
      return true;
    } catch (error) {
      console.error('Error joining user notification group:', error);
      // If it's an auth error, handle it appropriately
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        await this.disconnectDueToAuth();
      }
      return false;
    }
  }

  /**
   * Leave user notification group
   */
  public async leaveUserNotificationGroup(userId: string): Promise<boolean> {
    try {
      if (!this.connection || !this.isConnected) {
        return false;
      }

      await this.connection.invoke('LeaveUserNotificationGroup', userId);
      console.log(`Left user notification group: ${userId}`);
      return true;
    } catch (error) {
      console.error('Error leaving user notification group:', error);
      return false;
    }
  }

  /**
   * Remove all event listeners
   */
  public removeAllListeners(): void {
    if (this.connection) {
      this.connection.off('MatchEvent');
      this.connection.off('SimulationProgress');
      this.connection.off('SimulationComplete');
      this.connection.off('SimulationError');
      // Add notification event cleanup
      this.connection.off('Notify');
      this.connection.off('NotificationUpdated');
      this.connection.off('NotificationDeleted');
    }
  }

  /**
   * Check if currently connected
   */
  public isConnectionActive(): boolean {
    return (
      this.isConnected &&
      this.connection !== null &&
      this.connection.state === signalR.HubConnectionState.Connected
    );
  }

  /**
   * Get connection state
   */
  public getConnectionState(): string {
    if (!this.connection) return 'Disconnected';

    switch (this.connection.state) {
      case signalR.HubConnectionState.Connected:
        return 'Connected';
      case signalR.HubConnectionState.Connecting:
        return 'Connecting';
      case signalR.HubConnectionState.Disconnected:
        return 'Disconnected';
      case signalR.HubConnectionState.Disconnecting:
        return 'Disconnecting';
      case signalR.HubConnectionState.Reconnecting:
        return 'Reconnecting';
      default:
        return 'Unknown';
    }
  }

  /**
   * Set up SignalR event handlers with enhanced authentication handling
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.onreconnecting((error) => {
      console.log('SignalR attempting to reconnect:', error);
      this.isConnected = false;
    });

    this.connection.onreconnected(async (connectionId) => {
      console.log('SignalR reconnected with ID:', connectionId);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Verify authentication after reconnection
      if (!authService.isAuthenticated()) {
        console.warn(
          'User not authenticated after reconnection, disconnecting'
        );
        await this.disconnect();
      }
    });

    this.connection.onclose(async (error) => {
      console.log('SignalR connection closed:', error);
      this.isConnected = false;

      // Check if the connection was closed due to authentication issues
      const errorMessage =
        error instanceof Error ? error.message : String(error || '');
      if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        console.log('Connection closed due to authentication failure');
        return; // Don't attempt reconnection for auth failures
      }

      // Only attempt reconnection if user is still authenticated
      if (
        authService.isAuthenticated() &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        setTimeout(
          () => {
            this.attemptReconnection();
          },
          this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
        );
      }
    });
  }

  /**
   * Attempt manual reconnection with authentication check
   */
  private async attemptReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    // Check if user is still authenticated before attempting reconnection
    if (!authService.isAuthenticated()) {
      console.log('User not authenticated, skipping reconnection');
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
    );

    try {
      await this.connect();
    } catch (error) {
      console.error(
        `Reconnection attempt ${this.reconnectAttempts} failed:`,
        error
      );
    }
  }

  /**
   * Get authentication token for SignalR connection with automatic refresh
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      // Use authentication service to get a valid token with automatic refresh
      return await authService.getValidAccessToken();
    } catch (error) {
      console.error('Error getting auth token for SignalR:', error);
      return null;
    }
  }

  /**
   * Send a message to the hub (for testing purposes)
   */
  public async sendMessage(method: string, ...args: any[]): Promise<any> {
    try {
      if (!this.connection || !this.isConnected) {
        throw new Error('SignalR not connected');
      }

      return await this.connection.invoke(method, ...args);
    } catch (error) {
      console.error('Error sending SignalR message:', error);
      throw error;
    }
  }

  /**
   * Get connection statistics for debugging
   */
  public getConnectionStats(): any {
    return {
      isConnected: this.isConnected,
      connectionState: this.getConnectionState(),
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      hasConnection: this.connection !== null,
      isAuthenticated: authService.isAuthenticated(),
    };
  }

  /**
   * Ensure connection is active and authenticated
   */
  public async ensureConnection(): Promise<boolean> {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      console.warn(
        'User not authenticated, cannot establish SignalR connection'
      );
      await this.disconnectDueToAuth();
      return false;
    }

    // Check if connection is active
    if (this.isConnectionActive()) {
      return true;
    }

    // Try to connect
    return await this.connect();
  }

  /**
   * Reset connection state and force reconnection
   */
  public async resetConnection(): Promise<boolean> {
    console.log('Resetting SignalR connection');
    this.reconnectAttempts = 0;
    await this.disconnect();
    return await this.connect();
  }

  /**
   * Clean up SignalR service (remove event listeners, disconnect)
   */
  public async cleanup(): Promise<void> {
    console.log('Cleaning up SignalR service');
    await this.disconnect();
    this.removeAllListeners();
    // Note: In a real cleanup scenario, you'd want to remove the logout listener
    // but since we're using a singleton, we'll keep it for the lifetime of the app
  }
}

// Create and export singleton instance
const signalRService = new SignalRService();
export default signalRService;
