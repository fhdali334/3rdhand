import type { Artwork } from "./artwork"
import type { PaginationMeta } from "./api"

export interface PopularArtworksResponse {
  artworks: Artwork[]
}

export interface TrendingArtistsResponse {
  artists: {
    _id: string
    username: string
    createdAt: string
    profile?: {
      bio?: string
      website?: string
      socialLinks?: {
        instagram?: string
        twitter?: string
      }
    }
    engagementStats: {
      lastActivityAt: string
      totalFollowers: number
      totalFollowing: number
      totalLikes: number
    }
  }[]
}

export interface UserEngagementStatsResponse {
  stats: {
    engagementStats: {
      lastActivityAt: string
      totalFollowers: number
      totalFollowing: number
      totalLikes: number
    }
  }
}

export interface MyFavoritesResponse {
  favorites: Artwork[]
  stats: {
    lastActivityAt: string
    totalFollowers: number
    totalFollowing: number
    totalLikes: number
  }
  pagination: PaginationMeta
}

export interface MyFollowingResponse {
  followedArtists: {
    _id: string
    username: string
    createdAt: string
    profile?: {
      bio?: string
      website?: string
      socialLinks?: {
        instagram?: string
        twitter?: string
      }
    }
    engagementStats: {
      lastActivityAt: string
      totalFollowers: number
      totalFollowing: number
      totalLikes: number
    }
  }[]
  stats: {
    lastActivityAt: string
    totalFollowers: number
    totalFollowing: number
    totalLikes: number
  }
  pagination: PaginationMeta
}
