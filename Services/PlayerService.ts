import apiService from './ApiService';

export interface Player {
  id: number;
  name: string;
  position: string;
  number?: number;
  nationality?: string;
  dateOfBirth?: string;
  image?: string;
  preferredFoot?: 'Left' | 'Right' | 'Both';
  height?: number;
  weight?: number;
  teamId?: number;
}

export interface CreatePlayerDto {
  name: string;
  position: string;
  number?: number;
  nationality?: string;
  dateOfBirth?: string;
  preferredFoot?: 'Left' | 'Right' | 'Both';
  height?: number;
  weight?: number;
  teamId?: number;
  image?: File;
}

export interface UpdatePlayerDto {
  name?: string;
  position?: string;
  number?: number;
  nationality?: string;
  dateOfBirth?: string;
  preferredFoot?: 'Left' | 'Right' | 'Both';
  height?: number;
  weight?: number;
  teamId?: number;
  image?: File;
}

export interface PlayerFilter {
  nationality?: string;
  preferredFoot?: 'Left' | 'Right' | 'Both';
  teamId?: number;
}

class PlayerService {
  /**
   * Get all players with optional filtering
   */
  public async getPlayers(filter?: PlayerFilter): Promise<Player[]> {
    try {
      return await apiService.get<Player[]>('/players', { params: filter });
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  }

  /**
   * Get player by ID
   */
  public async getPlayerById(id: number): Promise<Player> {
    try {
      return await apiService.get<Player>(`/players/${id}`);
    } catch (error) {
      console.error(`Error fetching player with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new player (admin only)
   * Uses FormData for image upload
   */
  public async createPlayer(playerData: CreatePlayerDto): Promise<Player> {
    try {
      const formData = new FormData();

      // Add all fields to form data
      Object.entries(playerData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'image' && value instanceof File) {
            formData.append(key, value);
          } else if (key !== 'image') {
            formData.append(key, String(value));
          }
        }
      });

      return await apiService.uploadForm<Player>('/players', formData);
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  }

  /**
   * Update a player (admin only)
   * Uses FormData for image upload
   */
  public async updatePlayer(id: number, playerData: UpdatePlayerDto): Promise<Player> {
    try {
      const formData = new FormData();

      // Add all fields to form data
      Object.entries(playerData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'image' && value instanceof File) {
            formData.append(key, value);
          } else if (key !== 'image') {
            formData.append(key, String(value));
          }
        }
      });

      return await apiService.uploadForm<Player>(`/players/${id}`, formData, 'put');
    } catch (error) {
      console.error(`Error updating player with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a player (admin only)
   */
  public async deletePlayer(id: number): Promise<void> {
    try {
      await apiService.delete(`/players/${id}`);
    } catch (error) {
      console.error(`Error deleting player with ID ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const playerService = new PlayerService();
export default playerService;
