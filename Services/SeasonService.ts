import apiService from './ApiService';

export interface Season {
  id: number;
  name: string;
  leagueName?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  currentRound?: number;
  totalRounds?: number;
  isCompleted?: boolean;
  matchCount?: number;
  teamStandings?: any;
}

export interface CreateSeasonDto {
  name: string;
  leagueName?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface UpdateSeasonDto {
  name?: string;
  leagueName?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface SeasonFilter {
  leagueName?: string;
  country?: string;
  isActive?: boolean;
}

interface SeasonResponse {
  succeeded: boolean;
  seasons: Season[];
  error: string | null;
}

class SeasonService {
  /**
   * Get all seasons with optional filtering
   */
  public async getSeasons(filter?: SeasonFilter): Promise<Season[]> {
    try {
      const response = await apiService.get<SeasonResponse>('/seasons', { params: filter });
      if (!response.succeeded) {
        throw new Error(response.error || 'Failed to fetch seasons');
      }
      return response.seasons;
    } catch (error) {
      console.error('Error fetching seasons:', error);
      throw error;
    }
  }

  /**
   * Get season by ID
   */
  public async getSeasonById(id: number): Promise<Season> {
    try {
      const response = await apiService.get<{ succeeded: boolean; season: Season; error: string | null }>(`/seasons/${id}`);
      if (!response.succeeded) {
        throw new Error(response.error || `Failed to fetch season with ID ${id}`);
      }
      return response.season;
    } catch (error) {
      console.error(`Error fetching season with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new season (admin only)
   */
  public async createSeason(seasonData: CreateSeasonDto): Promise<Season> {
    try {
      const response = await apiService.post<{ succeeded: boolean; season: Season; error: string | null }>('/seasons', seasonData);
      if (!response.succeeded) {
        throw new Error(response.error || 'Failed to create season');
      }
      return response.season;
    } catch (error) {
      console.error('Error creating season:', error);
      throw error;
    }
  }

  /**
   * Update a season (admin only)
   */
  public async updateSeason(id: number, seasonData: UpdateSeasonDto): Promise<Season> {
    try {
      const response = await apiService.put<{ succeeded: boolean; season: Season; error: string | null }>(`/seasons/${id}`, seasonData);
      if (!response.succeeded) {
        throw new Error(response.error || `Failed to update season with ID ${id}`);
      }
      return response.season;
    } catch (error) {
      console.error(`Error updating season with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a season (admin only)
   */
  public async deleteSeason(id: number): Promise<void> {
    try {
      const response = await apiService.delete<{ succeeded: boolean; error: string | null }>(`/seasons/${id}`);
      if (!response.succeeded) {
        throw new Error(response.error || `Failed to delete season with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error deleting season with ID ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const seasonService = new SeasonService();
export default seasonService;
