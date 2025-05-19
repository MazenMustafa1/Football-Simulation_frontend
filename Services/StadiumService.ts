import apiService from './ApiService';

export interface Stadium {
  id: number;
  name: string;
  capacity?: number;
  city?: string;
  country?: string;
  image?: string;
  builtYear?: number;
  pitchSize?: string;
}

export interface CreateStadiumDto {
  name: string;
  capacity?: number;
  city?: string;
  country?: string;
  image?: File;
  builtYear?: number;
  pitchSize?: string;
}

export interface UpdateStadiumDto {
  name?: string;
  capacity?: number;
  city?: string;
  country?: string;
  image?: File;
  builtYear?: number;
  pitchSize?: string;
}

export interface StadiumFilter {
  country?: string;
  city?: string;
}

class StadiumService {
  /**
   * Get all stadiums with optional filtering
   */
  public async getStadiums(filter?: StadiumFilter): Promise<Stadium[]> {
    try {
      return await apiService.get<Stadium[]>('/stadiums', { params: filter });
    } catch (error) {
      console.error('Error fetching stadiums:', error);
      throw error;
    }
  }

  /**
   * Get stadium by ID
   */
  public async getStadiumById(id: number): Promise<Stadium> {
    try {
      return await apiService.get<Stadium>(`/stadiums/${id}`);
    } catch (error) {
      console.error(`Error fetching stadium with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new stadium (admin only)
   * Uses FormData for image upload
   */
  public async createStadium(stadiumData: CreateStadiumDto): Promise<Stadium> {
    try {
      const formData = new FormData();

      // Add all fields to form data
      Object.entries(stadiumData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'image' && value instanceof File) {
            formData.append(key, value);
          } else if (key !== 'image') {
            formData.append(key, String(value));
          }
        }
      });

      return await apiService.uploadForm<Stadium>('/stadiums', formData);
    } catch (error) {
      console.error('Error creating stadium:', error);
      throw error;
    }
  }

  /**
   * Update a stadium (admin only)
   * Uses FormData for image upload
   */
  public async updateStadium(id: number, stadiumData: UpdateStadiumDto): Promise<Stadium> {
    try {
      const formData = new FormData();

      // Add all fields to form data
      Object.entries(stadiumData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'image' && value instanceof File) {
            formData.append(key, value);
          } else if (key !== 'image') {
            formData.append(key, String(value));
          }
        }
      });

      return await apiService.uploadForm<Stadium>(`/stadiums/${id}`, formData, 'put');
    } catch (error) {
      console.error(`Error updating stadium with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a stadium (admin only)
   */
  public async deleteStadium(id: number): Promise<void> {
    try {
      await apiService.delete(`/stadiums/${id}`);
    } catch (error) {
      console.error(`Error deleting stadium with ID ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const stadiumService = new StadiumService();
export default stadiumService;
