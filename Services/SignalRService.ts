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

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private readonly baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7082';
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  /**
   * Initialize and start SignalR connection
   */
  public async connect(): Promise<boolean> {
    try {
      if (this.connection && this.isConnected) {
        console.log('SignalR already connected');
        return true;
      }

      // Get auth token for connection
      const token = this.getAuthToken();

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${this.baseUrl}/matchSimulationHub`, {
          accessTokenFactory: () => token || '',
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

      // Set up event handlers
      this.setupEventHandlers();

      // Start connection
      await this.connection.start();
      this.isConnected = true;
      this.reconnectAttempts = 0;

      console.log('SignalR connected successfully');
      return true;
    } catch (error) {
      console.error('SignalR connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from SignalR hub
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.stop();
        this.connection = null;
        this.isConnected = false;
        console.log('SignalR disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting SignalR:', error);
    }
  }

  /**
   * Join a simulation room to receive real-time updates
   */
  public async joinSimulation(simulationId: string): Promise<boolean> {
    try {
      if (!this.connection || !this.isConnected) {
        const connected = await this.connect();
        if (!connected) return false;
      }

      await this.connection!.invoke('JoinSimulation', simulationId);
      console.log(`Joined simulation: ${simulationId}`);
      return true;
    } catch (error) {
      console.error('Error joining simulation:', error);
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
   * Remove all event listeners
   */
  public removeAllListeners(): void {
    if (this.connection) {
      this.connection.off('MatchEvent');
      this.connection.off('SimulationProgress');
      this.connection.off('SimulationComplete');
      this.connection.off('SimulationError');
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
   * Set up SignalR event handlers
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.onreconnecting((error) => {
      console.log('SignalR attempting to reconnect:', error);
      this.isConnected = false;
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected with ID:', connectionId);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.connection.onclose((error) => {
      console.log('SignalR connection closed:', error);
      this.isConnected = false;

      // Attempt manual reconnection if automatic reconnection fails
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
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
   * Attempt manual reconnection
   */
  private async attemptReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
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
   * Get authentication token for SignalR connection
   */
  private getAuthToken(): string | null {
    try {
      return (
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken')
      );
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
    };
  }
}

// Create and export singleton instance
const signalRService = new SignalRService();
export default signalRService;
