import type { BaseFilters } from "./api"

export interface TopArtist {
  _id: string
  username: string
  email: string
  totalSales: number
  totalRevenue: number
  averagePrice: number
  artworkCount: number
  rating: {
    average: number
    count: number
  }
}

export interface TopArtwork {
  _id: string
  title: string
  description: string
  price: number
  images: string[]
  artist: {
    _id: string
    username: string
  }
  views: number
  likes: number
  soldAt?: string
}

export interface TopCategory {
  category: string
  count: number
  totalRevenue: number
  averagePrice: number
}

export interface AnalyticsParams extends BaseFilters {
  period?: "week" | "month" | "quarter" | "year"
  startDate?: string
  endDate?: string
}

export interface AnalyticsReport {
  period: string
  startDate: string
  endDate: string
  overview: {
    totalUsers: number
    totalArtworks: number
    totalSales: number
    totalRevenue: number
  }
  growth: {
    usersGrowth: number
    artworksGrowth: number
    salesGrowth: number
    revenueGrowth: number
  }
  topArtists: TopArtist[]
  topArtworks: TopArtwork[]
  topCategories: TopCategory[]
}
