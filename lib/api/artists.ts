import { apiClient } from "./client"
import type { ApiResponse } from "@/lib/types/api"

export interface ArtistDetailsResponse {
  status: string
  data: {
    profile: {
      user: {
        id: string
        username: string
        role: string
        joinedDate?: string
        lastActive?: string
        verified?: boolean
        profileType?: string
      }
      extendedProfile?: {
        bio?: string
        website?: string
        socialLinks?: Record<string, string>
        specialties?: string[]
        verified?: boolean
        rating?: {
          average: number
          count: number
        }
      }
      stats?: {
        followers?: number
        totalArtworks?: number
        totalLikes?: number
        totalViews?: number
        soldArtworks?: number
        availableArtworks?: number
        salesRate?: string
        recentActivity?: {
          newArtworks?: number
          newLikes?: number
          newViews?: number
        }
      }
      artworks?: {
        forSale?: {
          _id: string
          title: string
          price?: number
          images?: string[]
          tags?: string[]
          medium?: string
          dimensions?: {
            width?: number
            height?: number
            unit?: string
          }
          year?: number
          createdAt?: string
          engagementStats?: {
            popularityScore?: number
            totalLikes?: number
            totalViews?: number
          }
        }[]
        sold?: {
          _id: string
          title: string
          images?: string[]
          engagementStats?: {
            lastLikedAt?: string
            popularityScore?: number
            totalLikes?: number
            totalViews?: number
          }
          createdAt?: string
          medium?: string
          tags?: string[]
          soldTo?: string
          wasListedFor?: number
        }[]
        popular?: {
          _id: string
          title: string
          price?: number
          images?: string[]
          tags?: string[]
          medium?: string
          createdAt?: string
          engagementStats?: {
            lastLikedAt?: string
            popularityScore?: number
            totalLikes?: number
            totalViews?: number
          }
        }[]
        counts?: {
          forSale?: number
          sold?: number
          total?: number
        }
      }
      engagement?: {
        isFollowing?: boolean
        canFollow?: boolean
        canMessage?: boolean
      }
      meta?: {
        profileCompleteness?: number
        responseTime?: string
        trustScore?: string
        memberSince?: number
        lastSeenStatus?: string
        profileType?: string
      }
    }
  }
}

export const artistsApi = {
  getArtistDetails: async (artistId: string): Promise<ApiResponse<ArtistDetailsResponse>> => {
    return apiClient.get(`/api/artists/${artistId}`)
  },
}
