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
   * Implements intelligent caching for search results
   * @param params Search parameters (query string, pagination)
   */
  public async search(params: SearchParams): Promise<SearchResult> {
    try {
      if (!params.query || params.query.length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }

      // Create cache key for search query
      const cacheKey = `search-${params.query}-page-${params.page || 1}-size-${params.pageSize || 10}`;

      return await apiService.getWithCache<SearchResult>('/search', {
        params: {
          query: params.query,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
        },
        cacheKey,
        cacheTtl: 2 * 60 * 1000, // 2 minutes cache for search results
      });
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  }

  /**
   * Clear search cache
   */
  public clearSearchCache(): void {
    apiService.clearCache('^search-');
  }

  /**
   * Quick search with minimal caching for autocomplete/suggestions
   * @param query Quick search query
   */
  public async quickSearch(query: string): Promise<SearchResult> {
    try {
      if (!query || query.length < 1) {
        return {
          teams: [],
          matches: [],
          players: [],
          coaches: [],
          totalResults: 0,
          currentPage: 1,
          totalPages: 0,
        };
      }

      const cacheKey = `quick-search-${query}`;

      return await apiService.getWithCache<SearchResult>('/search', {
        params: {
          query,
          page: 1,
          pageSize: 5, // Smaller page size for quick search
        },
        cacheKey,
        cacheTtl: 30 * 1000, // 30 seconds cache for quick search
      });
    } catch (error) {
      console.error('Error performing quick search:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const searchService = new SearchService();
export default searchService;
