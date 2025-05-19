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
  status?: 'Scheduled' | 'Live' | 'Completed' | 'Postponed' | 'Cancelled';
  stadiumId?: number;
  stadiumName?: string;
  matchWeek?: number;
}

export interface MatchDetail extends Match {
  season?: any;
  homeTeam?: any;
  awayTeam?: any;
  stadium?: any;
  // Add other detailed properties as needed
}

export interface MatchFilter {
  seasonId?: number;
  teamId?: number;
  status?: 'Scheduled' | 'Live' | 'Completed' | 'Postponed' | 'Cancelled';
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

class MatchService {
  /**
   * Get all matches with optional filtering
   */
  public async getMatches(filter?: MatchFilter): Promise<Match[]> {
    try {
      return await apiService.get<Match[]>('/matches', { params: filter });
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
}

// Create and export a singleton instance
const matchService = new MatchService();
export default matchService;
