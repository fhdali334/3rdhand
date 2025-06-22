import type { PaginatedResponse, BaseFilters } from "./api"

export interface Artwork {
  _id: string
  title: string
  description: string
  price: number
  images: string[]
  artist: {
    _id: string
    username: string
    email?: string
    profile?: {
      bio?: string
      website?: string
      socialLinks?: {
        instagram?: string
        twitter?: string
      }
    }
  }
  status: "pending" | "approved" | "rejected"
  currentOwner:
    | string
    | {
        _id: string
        username: string
        profile?: {
          bio?: string
          website?: string
          socialLinks?: {
            instagram?: string
            twitter?: string
          }
        }
      }
  createdAt: string
  updatedAt: string
  approvedAt?: string
  tags: string[]
  medium?: string
  dimensions: {
    width?: number
    height?: number
    unit: "cm" | "in"
  }
  year?: number
  isOriginal: boolean
  edition?: {
    number: number
    total: number
  }
  soldAt?: string
  listingFeePaid?: boolean
  __v?: number
  id?: string
}

export interface ArtworkFilters extends BaseFilters {
  status?: "pending" | "approved" | "rejected"
  minPrice?: number
  maxPrice?: number
  medium?: string
  tags?: string[]
  artist?: string
  isOriginal?: boolean
  soldAt?: boolean
  q?: string // Add search query parameter
}

export interface CreateArtworkData {
  title: string
  description: string
  price: number
  medium?: string
  dimensions: {
    width?: number
    height?: number
    unit: "cm" | "in"
  }
  year?: number
  isOriginal: boolean
  tags: string[]
  edition?: {
    number: number
    total: number
  }
}

export interface UpdateArtworkData extends Partial<CreateArtworkData> {
  status?: "pending" | "approved" | "rejected"
}

export interface ArtworkStats {
  _id: null
  totalArtworks: number
  approvedArtworks: number
  pendingArtworks: number
  rejectedArtworks: number
  soldArtworks: number
  averagePrice: number
  totalValue: number
}

export type ArtworksPaginated = PaginatedResponse<Artwork>
