import apiService from './ApiService';

export interface Match {
  id: number;
  seasonId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  homeTeamScore?: number;
  awayTeamScore?: number;
  date?: string;
  time?: string;
  status?: string;
  stadiumId?: number;
  stadiumName?: string;
  matchWeek?: number;
}

export interface MatchDetail extends Match {
  season?: any;
  homeTeam?: any;
  awayTeam?: any;
  stadium?: any;
}

export interface MatchFilter {
  seasonId?: number;
  teamId?: number;
  status?: string
  // Add other detailed properties as needed;
  fromDate?: string;
  toDate?: string;
  matchWeek?: number;
}

export interface CreateMatchDto {
  seasonId: number;
  homeTeamId: number;
  awayTeamId: number;
  date?: string;
  time?: string;
  stadiumId?: number;
  status?: 'Scheduled' | 'Live' | 'Completed' | 'Postponed' | 'Cancelled';
  homeTeamScore?: number;
  awayTeamScore?: number;
  matchWeek?: number;
}

export interface UpdateMatchDto {
  seasonId?: number;
  homeTeamId?: number;
  awayTeamId?: number;
  date?: string;
  time?: string;
  stadiumId?: number;
  status?: 'Scheduled' | 'Live' | 'Completed' | 'Postponed' | 'Cancelled';
  homeTeamScore?: number;
  awayTeamScore?: number;
  matchWeek?: number;
}
export interface MatchesResponse {
  matches: MatchResponse[];
  succeeded: boolean;
  error?: string;
}

export interface MatchResponse {
  id: number;
  seasonId: number;
  seasonName: string;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  scheduledDateTimeUtc: string;
  stadiumId: number;
  stadiumName: string;
  matchWeek: number;
  homeCoachId: number;
  awayCoachId: number;
  homeTeamScore: number;
  awayTeamScore: number;
  winningTeamId: number;
  losingTeamId: number;
  isDraw: boolean;
  matchStatus: string;
  homeTeamPossession: number;
  awayTeamPossession: number;
  homeTeamShots: number;
  awayTeamShots: number;
  homeTeamShotsOnTarget: number;
  awayTeamShotsOnTarget: number;
  homeTeamCorners: number;
  awayTeamCorners: number;
  homeTeamFouls: number;
  awayTeamFouls: number;
  homeTeamYellowCards: number;
  awayTeamYellowCards: number;
  homeTeamRedCards: number;
  awayTeamRedCards: number;
  modelSimulationStartTimeUtc: string;
}

class MatchService {
  /**
   * Get all matches with optional filtering
   */
  public async getMatches(filter?: MatchFilter): Promise<Match[]> {
    try {
      const matchesResponse=  await apiService.get<MatchesResponse>('/matches', {params: filter});
      return matchesResponse.matches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  }

  /**
   * Get match by ID
   */
  public async getMatchById(id: number): Promise<Match> {
    try {
      return await apiService.get<Match>(`/matches/${id}`);
    } catch (error) {
      console.error(`Error fetching match with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get match details by ID
   */
  public async getMatchDetails(id: number): Promise<MatchDetail> {
    try {
      return await apiService.get<MatchDetail>(`/matches/Details/${id}`);
    } catch (error) {
      console.error(`Error fetching match details with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new match (admin, manager only)
   */
  public async createMatch(matchData: CreateMatchDto): Promise<Match> {
    try {
      return await apiService.post<Match>('/matches', matchData);
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  }

  /**
   * Update a match (admin, manager only)
   */
  public async updateMatch(id: number, matchData: UpdateMatchDto): Promise<Match> {
    try {
      return await apiService.put<Match>(`/matches/${id}`, matchData);
    } catch (error) {
      console.error(`Error updating match with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a match (admin only)
   */
  public async deleteMatch(id: number): Promise<void> {
    try {
      await apiService.delete(`/matches/${id}`);
    } catch (error) {
      console.error(`Error deleting match with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get latest matches
   */
  public async getLatestMatches(userId: string): Promise<Match[]> {
    try {
      const latestMatches = await apiService.get<MatchesResponse>(`/matches/${userId}`);
      return latestMatches.matches;
    } catch (error) {
      console.error('Error fetching latest matches:', error);
      throw error;
    }

  }
}


// Create and export a singleton instance
const matchService = new MatchService();
export default matchService;
