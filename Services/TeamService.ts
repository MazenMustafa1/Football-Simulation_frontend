import apiService from './ApiService';
import {Stadium} from "@/Services/StadiumService";
import {Coach} from "@/Services/CoachService";

export interface Team {
  id: number;
  name: string;
  shortName?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  city?: string;
  country?: string;
  foundedYear?: number;
  stadiumId?: number;
  stadium?: Stadium;
  coachId?: number;
  coach?: Coach;
  league?: string;
}

export interface CreateTeamRequest {
  name: string;
  shortName?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  city?: string;
  country?: string;
  foundedYear?: number;
  stadiumId?: number;
  coachId?: number;
}

export interface UpdateTeamRequest {
  name?: string;
  shortName?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  city?: string;
  country?: string;
  foundedYear?: number;
  stadiumId?: number;
  coachId?: number;
}

class TeamService {
  /**
   * Get all teams
   */
  public async getAllTeams(): Promise<Team[]> {
    try {
      const response : any = await apiService.get<Team[]>('/teams');
      return response.teams;
    } catch (error) {
      console.error('Error fetching all teams:', error);
      throw error;
    }
  }

  /**
   * Get team by ID
   */
  public async getTeamById(id: number): Promise<Team> {
    try {
      return await apiService.get<Team>(`/teams/${id}`);
    } catch (error) {
      console.error(`Error fetching team with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new team (admin only)
   */
  public async createTeam(teamData: CreateTeamRequest): Promise<Team> {
    try {
      return await apiService.post<Team>('/teams', teamData);
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  /**
   * Update a team (admin only)
   */
  public async updateTeam(id: number, teamData: UpdateTeamRequest): Promise<Team> {
    try {
      return await apiService.put<Team>(`/teams/${id}`, teamData);
    } catch (error) {
      console.error(`Error updating team with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a team (admin only)
   */
  public async deleteTeam(id: number): Promise<void> {
    try {
      await apiService.delete(`/teams/${id}`);
    } catch (error) {
      console.error(`Error deleting team with ID ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const teamService = new TeamService();
export default teamService;
