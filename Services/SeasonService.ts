import apiService from './ApiService';

export interface Season {
  id: number;
  name: string;
  leagueName?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
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

class SeasonService {
  /**
   * Get all seasons with optional filtering
   */
  public async getSeasons(filter?: SeasonFilter): Promise<Season[]> {
    try {
      return await apiService.get<Season[]>('/seasons', { params: filter });
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
      return await apiService.get<Season>(`/seasons/${id}`);
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
      return await apiService.post<Season>('/seasons', seasonData);
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
      return await apiService.put<Season>(`/seasons/${id}`, seasonData);
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
      await apiService.delete(`/seasons/${id}`);
    } catch (error) {
      console.error(`Error deleting season with ID ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const seasonService = new SeasonService();
export default seasonService;
