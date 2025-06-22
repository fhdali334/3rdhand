import { apiClient } from "./client"
import type { ApiResponse } from "@/lib/types/api"
import type {
  PlatformOverview,
  PendingArtworksParams,
  UsersParams,
  TransactionsParams,
  ArtworksParams,
  PendingArtworksPaginated,
  AdminUsersPaginated,
  AdminTransactionsPaginated,
  AllArtworksPaginated,
  ArtworkStats,
  UserStats,
} from "@/lib/types/admin"

export const adminApi = {
  // Platform Overview
  getOverview: (): Promise<ApiResponse<{ overview: PlatformOverview; revenue: any; recentActivity: any }>> => {
    console.log("📊 Fetching platform overview...")
    return apiClient.get("/api/admin/overview")
  },

  // Artwork Management
  getPendingArtworks: (params?: PendingArtworksParams): Promise<ApiResponse<PendingArtworksPaginated>> => {
    console.log("🎨 Fetching pending artworks with params:", params)

    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.search) queryParams.append("search", params.search)
    if (params?.minPrice) queryParams.append("minPrice", params.minPrice.toString())
    if (params?.maxPrice) queryParams.append("maxPrice", params.maxPrice.toString())

    const queryString = queryParams.toString()
    const endpoint = `/api/admin/artworks/pending${queryString ? `?${queryString}` : ""}`

    console.log("🔗 Pending artworks endpoint:", endpoint)
    return apiClient.get(endpoint)
  },

  approveArtwork: (
    artworkId: string,
  ): Promise<ApiResponse<{ artwork: { id: string; title: string; status: string; approvedAt: string } }>> => {
    console.log("✅ Approving artwork:", artworkId)
    return apiClient.patch(`/api/admin/artworks/${artworkId}/approve`)
  },

  rejectArtwork: (
    artworkId: string,
    rejectionReason: string,
  ): Promise<
    ApiResponse<{ artwork: { id: string; title: string; status: string; rejectedAt: string; rejectionReason: string } }>
  > => {
    console.log("❌ Rejecting artwork:", artworkId, "Reason:", rejectionReason)
    return apiClient.patch(`/api/admin/artworks/${artworkId}/reject`, { rejectionReason })
  },

  getAllArtworks: (params?: ArtworksParams): Promise<ApiResponse<AllArtworksPaginated>> => {
    console.log("🖼️ Fetching all artworks with params:", params)

    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.status) queryParams.append("status", params.status)
    if (params?.search) queryParams.append("search", params.search)
    if (params?.artist) queryParams.append("artist", params.artist)
    if (params?.sort) queryParams.append("sort", params.sort)

    const queryString = queryParams.toString()
    const endpoint = `/api/admin/artworks${queryString ? `?${queryString}` : ""}`

    console.log("🔗 All artworks endpoint:", endpoint)
    return apiClient.get(endpoint)
  },

  // User Management
  getUsers: (params?: UsersParams): Promise<ApiResponse<AdminUsersPaginated>> => {
    console.log("👥 Fetching users with params:", params)

    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.role) queryParams.append("role", params.role)
    if (params?.isVerified !== undefined) queryParams.append("isVerified", params.isVerified.toString())
    if (params?.search) queryParams.append("search", params.search)
    if (params?.sort) queryParams.append("sort", params.sort)

    const queryString = queryParams.toString()
    const endpoint = `/api/admin/users${queryString ? `?${queryString}` : ""}`

    console.log("🔗 Users endpoint:", endpoint)
    return apiClient.get(endpoint)
  },

  // Transaction Management
  getTransactions: (params?: TransactionsParams): Promise<ApiResponse<AdminTransactionsPaginated>> => {
    console.log("💰 Fetching transactions with params:", params)

    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.type) queryParams.append("type", params.type)
    if (params?.status) queryParams.append("status", params.status)
    if (params?.sort) queryParams.append("sort", params.sort)

    const queryString = queryParams.toString()
    const endpoint = `/api/admin/transactions${queryString ? `?${queryString}` : ""}`

    console.log("🔗 Transactions endpoint:", endpoint)
    return apiClient.get(endpoint)
  },

  // Statistics
  getArtworkStats: (): Promise<ApiResponse<{ stats: ArtworkStats }>> => {
    console.log("📈 Fetching artwork stats...")
    return apiClient.get("/api/admin/stats/artworks")
  },

  getUserStats: (): Promise<ApiResponse<{ stats: UserStats }>> => {
    console.log("👤 Fetching user stats...")
    return apiClient.get("/api/admin/stats/users")
  },
}
