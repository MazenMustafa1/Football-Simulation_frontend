import apiService from './ApiService';

export interface Coach {
  id: number;
  firstName: string;
  lastName: string;
  name?: string; // Keep for backward compatibility
  nationality?: string;
  dateOfBirth?: string;
  Photo?: string;
  photoUrl?: string;
  teamId?: number;
  preferredFormation?: string;
  coachingStyle?: string;
  role?: string;
  yearsOfExperience?: number;
  biography?: string;
}

export interface CreateCoachDto {
  firstName: string;
  lastName: string;
  nationality?: string;
  dateOfBirth?: string;
  teamId?: number;
  Photo?: File;
  preferredFormation?: string;
  coachingStyle?: string;
  role?: string;
  yearsOfExperience?: number;
  biography?: string;
}

export interface UpdateCoachDto {
  firstName?: string;
  lastName?: string;
  nationality?: string;
  dateOfBirth?: string;
  teamId?: number;
  Photo?: File;
  preferredFormation?: string;
  coachingStyle?: string;
  role?: string;
  yearsOfExperience?: number;
  biography?: string;
}

export interface CoachFilter {
  nationality?: string;
  teamId?: number;
  role?: string;
}

class CoachService {
  /**
   * Get all coaches with optional filtering
   */
  public async getCoaches(filter?: CoachFilter): Promise<Coach[]> {
    try {
      const response: any = await apiService.get<{
        succeeded: boolean;
        coaches: Coach[];
        error: string | null;
      }>('/coaches/filter', { params: filter });

      if (response && response.succeeded && Array.isArray(response.coaches)) {
        return response.coaches;
      }

      return [];
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
            formData.append('Photo', value); // Changed to 'Photo' to match API
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
            formData.append('Photo', value); // Changed to 'Photo' to match API
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
