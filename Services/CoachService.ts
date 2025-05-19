import apiService from './ApiService';

export interface Coach {
  id: number;
  name: string;
  nationality?: string;
  dateOfBirth?: string;
  image?: string;
  teamId?: number;
}

export interface CreateCoachDto {
  name: string;
  nationality?: string;
  dateOfBirth?: string;
  teamId?: number;
  image?: File;
}

export interface UpdateCoachDto {
  name?: string;
  nationality?: string;
  dateOfBirth?: string;
  teamId?: number;
  image?: File;
}

export interface CoachFilter {
  nationality?: string;
  teamId?: number;
}

class CoachService {
  /**
   * Get all coaches with optional filtering
   */
  public async getCoaches(filter?: CoachFilter): Promise<Coach[]> {
    try {
      return await apiService.get<Coach[]>('/coaches/filter', { params: filter });
    } catch (error) {
      console.error('Error fetching coaches:', error);
      throw error;
    }
  }

  /**
   * Get coach by ID
   */
  public async getCoachById(id: number): Promise<Coach> {
    try {
      return await apiService.get<Coach>(`/coaches/${id}`);
    } catch (error) {
      console.error(`Error fetching coach with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new coach (admin only)
   * Uses FormData for image upload
   */
  public async createCoach(coachData: CreateCoachDto): Promise<Coach> {
    try {
      const formData = new FormData();

      // Add all fields to form data
      Object.entries(coachData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'image' && value instanceof File) {
            formData.append(key, value);
          } else if (key !== 'image') {
            formData.append(key, String(value));
          }
        }
      });

      return await apiService.uploadForm<Coach>('/coaches', formData);
    } catch (error) {
      console.error('Error creating coach:', error);
      throw error;
    }
  }

  /**
   * Update a coach (admin only)
   * Uses FormData for image upload
   */
  public async updateCoach(id: number, coachData: UpdateCoachDto): Promise<Coach> {
    try {
      const formData = new FormData();

      // Add all fields to form data
      Object.entries(coachData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'image' && value instanceof File) {
            formData.append(key, value);
          } else if (key !== 'image') {
            formData.append(key, String(value));
          }
        }
      });

      return await apiService.uploadForm<Coach>(`/coaches/${id}`, formData, 'put');
    } catch (error) {
      console.error(`Error updating coach with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a coach (admin only)
   */
  public async deleteCoach(id: number): Promise<void> {
    try {
      await apiService.delete(`/coaches/${id}`);
    } catch (error) {
      console.error(`Error deleting coach with ID ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const coachService = new CoachService();
export default coachService;
