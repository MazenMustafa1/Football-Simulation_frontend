/**
 * Utility service for managing live match and simulation data in localStorage
 */
class LiveMatchStorageService {
  private readonly LIVE_MATCH_ID_KEY = 'live_match_id';
  private readonly LIVE_SIMULATION_ID_KEY = 'live_simulation_id';
  private readonly LIVE_MATCH_DATA_KEY = 'live_match_data';

  /**
   * Store live match ID
   */
  public setLiveMatchId(matchId: number): void {
    try {
      localStorage.setItem(this.LIVE_MATCH_ID_KEY, matchId.toString());
    } catch (error) {
      console.error('Failed to store live match ID:', error);
    }
  }

  /**
   * Get live match ID
   */
  public getLiveMatchId(): number | null {
    try {
      const matchId = localStorage.getItem(this.LIVE_MATCH_ID_KEY);
      return matchId ? parseInt(matchId, 10) : null;
    } catch (error) {
      console.error('Failed to get live match ID:', error);
      return null;
    }
  }

  /**
   * Store live simulation ID
   */
  public setLiveSimulationId(simulationId: string): void {
    try {
      localStorage.setItem(this.LIVE_SIMULATION_ID_KEY, simulationId);
    } catch (error) {
      console.error('Failed to store live simulation ID:', error);
    }
  }

  /**
   * Get live simulation ID
   */
  public getLiveSimulationId(): string | null {
    try {
      return localStorage.getItem(this.LIVE_SIMULATION_ID_KEY);
    } catch (error) {
      console.error('Failed to get live simulation ID:', error);
      return null;
    }
  }

  /**
   * Store basic live match data for quick access
   */
  public setLiveMatchData(data: {
    matchId: number;
    simulationId?: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    status: string;
  }): void {
    try {
      localStorage.setItem(this.LIVE_MATCH_DATA_KEY, JSON.stringify(data));
      this.setLiveMatchId(data.matchId);
      if (data.simulationId) {
        this.setLiveSimulationId(data.simulationId);
      }
    } catch (error) {
      console.error('Failed to store live match data:', error);
    }
  }

  /**
   * Get basic live match data
   */
  public getLiveMatchData(): any | null {
    try {
      const data = localStorage.getItem(this.LIVE_MATCH_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get live match data:', error);
      return null;
    }
  }

  /**
   * Clear all live match data
   */
  public clearLiveMatchData(): void {
    try {
      localStorage.removeItem(this.LIVE_MATCH_ID_KEY);
      localStorage.removeItem(this.LIVE_SIMULATION_ID_KEY);
      localStorage.removeItem(this.LIVE_MATCH_DATA_KEY);
    } catch (error) {
      console.error('Failed to clear live match data:', error);
    }
  }

  /**
   * Check if current match ID matches stored live match ID
   */
  public isCurrentLiveMatch(matchId: number): boolean {
    const storedMatchId = this.getLiveMatchId();
    return storedMatchId === matchId;
  }

  /**
   * Get navigation URL for simulation view
   */
  public getSimulationViewUrl(): string | null {
    const simulationId = this.getLiveSimulationId();
    const matchId = this.getLiveMatchId();

    if (simulationId) {
      return `/simulationview/${simulationId}`;
    } else if (matchId) {
      // Fallback to match-based simulation URL
      return `/simulationview/${matchId}`;
    }

    return null;
  }
}

// Export singleton instance
const liveMatchStorageService = new LiveMatchStorageService();
export default liveMatchStorageService;
