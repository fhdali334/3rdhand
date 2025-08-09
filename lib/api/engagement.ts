import { apiClient } from "./client"
import type { ApiResponse } from "@/lib/types/api"
import type {
  PopularArtworksResponse,
  TrendingArtistsResponse,
  UserEngagementStatsResponse,
  MyFavoritesResponse,
  MyFollowingResponse,
} from "@/lib/types/engagement"

export const engagementApi = {
  // Artwork Like/Unlike
  likeArtwork: async (artworkId: string): Promise<ApiResponse<any>> => {
    console.log(`❤️ Liking artwork with ID: ${artworkId}`)
    return apiClient.post(`/api/engagement/artwork/${artworkId}/like`)
  },

  // Artist Follow/Unfollow
  followArtist: async (artistId: string): Promise<ApiResponse<any>> => {
    console.log(`👤 Following artist with ID: ${artistId}`)
    return apiClient.post(`/api/engagement/artist/${artistId}/follow`)
  },

  // Get User's Liked Artworks
  getMyFavorites: async (page = 1, limit = 10): Promise<ApiResponse<MyFavoritesResponse>> => {
    console.log(`⭐ Fetching user's liked artworks (favorites) - Page: ${page}, Limit: ${limit}`)
    return apiClient.get(`/api/engagement/my/favorites?page=${page}&limit=${limit}`)
  },

  // Get User Following (Followed Artists)
  getMyFollowing: async (page = 1, limit = 10): Promise<ApiResponse<MyFollowingResponse>> => {
    console.log(`➕ Fetching user's followed artists (following) - Page: ${page}, Limit: ${limit}`)
    return apiClient.get(`/api/engagement/my/following?page=${page}&limit=${limit}`)
  },

  // Get Popular Artworks (General)
  getPopularArtworks: async (limit = 10): Promise<ApiResponse<PopularArtworksResponse>> => {
    console.log(`🔥 Fetching popular artworks - Limit: ${limit}`)
    return apiClient.get(`/api/engagement/popular/artworks?limit=${limit}`)
  },

  // Get Trending Artists (General)
  getTrendingArtists: async (limit = 10): Promise<ApiResponse<TrendingArtistsResponse>> => {
    console.log(`✨ Fetching trending artists - Limit: ${limit}`)
    return apiClient.get(`/api/engagement/trending/artists?limit=${limit}`)
  },

  // Get User Engagement Statistics
  getMyStats: async (): Promise<ApiResponse<UserEngagementStatsResponse>> => {
    console.log("📊 Fetching user engagement statistics")
    return apiClient.get(`/api/engagement/my/stats`)
  },

  // Record Artwork View
  recordArtworkView: async (artworkId: string): Promise<ApiResponse<any>> => {
    console.log(`👁️ Recording view for artwork with ID: ${artworkId}`)
    return apiClient.post(`/api/engagement/artwork/${artworkId}/view`)
  },
}
