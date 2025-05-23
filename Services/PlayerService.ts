import apiService from './ApiService';

export interface Player {
  id: number;
  fullName: string;
  knownName?: string;
  position: string;
  shirtNumber?: number;
  nationality?: string;
  image?: string;
  preferredFoot?: 'Left' | 'Right' | 'Both';
  teamId?: number;
  photoUrl:string
}

export interface CreatePlayerDto {
  fullName: string;
  knownName?: string;
  position: string;
  shirtNumber?: number;
  nationality?: string;
  preferredFoot?: 'Left' | 'Right' | 'Both';
  teamId?: number | null;
  photo?: File;
}

export interface UpdatePlayerDto {
  fullName?: string;
  knownName?: string;
  position?: string;
  shirtNumber?: number;
  nationality?: string;
  preferredFoot?: 'Left' | 'Right' | 'Both';
  teamId?: number | null;
  photo?: File;
}

export interface PlayerFilter {
  nationality?: string;
  preferredFoot?: 'Left' | 'Right' | 'Both';
  teamId?: number;
}

interface PlayerResponse {
  succeeded: boolean;
  players: Player[];
  error: string | null;
}

class PlayerService {
  /**
   * Get all players with optional filtering
   */
  public async getPlayers(filter?: PlayerFilter): Promise<Player[]> {
    try {
      const response = await apiService.get<PlayerResponse>('/players', { params: filter });
      if (!response.succeeded) {
        throw new Error(response.error || 'Failed to fetch players');
      }
      return response.players;
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
      const response = await apiService.get<{succeeded: boolean; player: Player; error: string | null}>(`/players/${id}`);
      if (!response.succeeded) {
        throw new Error(response.error || `Failed to fetch player with ID ${id}`);
      }
      return response.player;
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
          if (key === 'photo' && value instanceof File) {
            formData.append(key, value);
          } else if (key !== 'photo') {
            // Handle null value for teamId explicitly
            if (key === 'teamId' && value === null) {
              formData.append(key, '');
            } else {
              formData.append(key, String(value));
            }
          }
        }
      });

      const response = await apiService.uploadForm<{succeeded: boolean; player: Player; error: string | null}>('/players', formData);
      if (!response.succeeded) {
        throw new Error(response.error || 'Failed to create player');
      }
      return response.player;
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
          if (key === 'photo' && value instanceof File) {
            formData.append(key, value);
          } else if (key !== 'photo') {
            // Handle null value for teamId explicitly
            if (key === 'teamId' && value === null) {
              formData.append(key, '');
            } else {
              formData.append(key, String(value));
            }
          }
        }
      });

      const response = await apiService.uploadForm<{succeeded: boolean; player: Player; error: string | null}>(`/players/${id}`, formData, 'put');
      if (!response.succeeded) {
        throw new Error(response.error || `Failed to update player with ID ${id}`);
      }
      return response.player;
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
      const response = await apiService.delete<{succeeded: boolean; error: string | null}>(`/players/${id}`);
      if (!response.succeeded) {
        throw new Error(response.error || `Failed to delete player with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error deleting player with ID ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const playerService = new PlayerService();
export default playerService;
