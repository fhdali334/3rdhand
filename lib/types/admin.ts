import type { PaginatedResponse, BaseFilters } from "./api"

export interface PlatformOverview {
  totalUsers: number
  totalArtists: number
  totalBuyers: number
  totalArtworks: number
  pendingApprovals: number
  totalRevenue: number
  totalSales: number
}

export interface RevenueData {
  listingFees: {
    total: number
    count: number
  }
  sales: {
    total: number
    count: number
  }
}

export interface RecentActivity {
  usersLastWeek: number
  artworksLastWeek: number
  pendingLastWeek: number
  listingFeesLastWeek: {
    amount: number
    count: number
  }
  salesLastWeek: {
    amount: number
    count: number
  }
}

export interface PendingArtwork {
  _id: string
  id?: string
  title: string
  description: string
  price: number
  images: string[]
  artist: {
    _id: string
    id?: string
    username: string
    email: string
    createdAt: string
    profile?: {
      bio?: string
      website?: string
      socialLinks?: {
        facebook?: string
        twitter?: string
        instagram?: string
      }
    }
  }
  status: "pending" | "approved" | "rejected"
  currentOwner:
    | string
    | {
        _id: string
        username: string
        email: string
      }
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
  listingFeePaid: boolean
  createdAt: string
  updatedAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
}

export interface AdminUser {
  _id: string
  id?: string
  username: string
  email: string
  role: "artist" | "buyer" | "admin"
  isVerified: boolean
  credits: number
  profile?: {
    bio?: string
    website?: string
    socialLinks?: {
      facebook?: string
      twitter?: string
      instagram?: string
    }
  }
  createdAt: string
  lastActive: string
  updatedAt: string
}

export interface AdminTransaction {
  _id: string
  id?: string
  buyer?: {
    _id: string
    id?: string
    username: string
    email: string
  }
  seller: {
    _id: string
    id?: string
    username: string
    email: string
  }
  artwork: {
    _id: string
    id?: string
    title: string
    images: string[]
    price: number
  }
  amount: number
  paymentIntent: string
  status: "pending" | "completed" | "failed" | "refunded"
  transactionType: "listing_fee" | "sale"
  timestamp: string
  metadata: {
    stripe_session_id?: string
    stripe_payment_method?: string
    stripe_receipt_url?: string | null
    platform_commission?: number
    artist_amount?: number
    artwork_title?: string
  }
  createdAt: string
  updatedAt: string
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
  recentActivity: {
    artworksLastMonth: number
    artworksLastWeek: number
    pendingLastWeek: number
  }
}

export interface UserStats {
  _id: null
  totalUsers: number
  totalArtists: number
  totalBuyers: number
  verifiedUsers: number
  unverifiedUsers: number
  recentActivity: {
    usersLastMonth: number
    usersLastWeek: number
    artistsLastWeek: number
  }
}

export interface PendingArtworksParams extends BaseFilters {
  minPrice?: number
  maxPrice?: number
}

export interface UsersParams extends BaseFilters {
  role?: "artist" | "buyer" | "admin"
  isVerified?: boolean
}

export interface TransactionsParams extends BaseFilters {
  type?: "listing_fee" | "sale"
  status?: "pending" | "completed" | "failed" | "refunded"
}

export interface ArtworksParams extends BaseFilters {
  status?: "pending" | "approved" | "rejected"
  artist?: string
}

export type PendingArtworksPaginated = PaginatedResponse<PendingArtwork> & {
  artworks?: PendingArtwork[]
}
export type AdminUsersPaginated = PaginatedResponse<AdminUser> & {
  users?: AdminUser[]
}
export type AdminTransactionsPaginated = PaginatedResponse<AdminTransaction> & {
  transactions?: AdminTransaction[]
}
export type AllArtworksPaginated = PaginatedResponse<PendingArtwork> & {
  artworks?: PendingArtwork[]
}
