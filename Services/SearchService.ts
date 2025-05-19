import apiService from './ApiService';
import { Team } from './TeamService';
import { Match } from './MatchService';
import { Player } from './PlayerService';
import { Coach } from './CoachService';

export interface SearchResult {
  teams: Team[];
  matches: Match[];
  players: Player[];
  coaches: Coach[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

export interface SearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}

class SearchService {
  /**
   * Search across multiple entity types (teams, matches, players, coaches)
   * @param params Search parameters (query string, pagination)
   */
  public async search(params: SearchParams): Promise<SearchResult> {
    try {
      if (!params.query || params.query.length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }

      return await apiService.get<SearchResult>('/search', {
        params: {
          query: params.query,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      });
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const searchService = new SearchService();
export default searchService;
