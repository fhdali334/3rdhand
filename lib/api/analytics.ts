import { apiClient } from "./client"
import type { ApiResponse } from "@/lib/types/api"
import type { TopArtist, TopArtwork, TopCategory, AnalyticsParams, AnalyticsReport } from "@/lib/types/analytics"

export const analyticsApi = {
  // Get top artists
  getTopArtists: (
    params?: AnalyticsParams,
  ): Promise<
    ApiResponse<{
      topArtists: TopArtist[]
      period: string
      totalFound: number
    }>
  > => {
    const queryParams = new URLSearchParams()
    if (params?.period) queryParams.append("period", params.period)
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.startDate) queryParams.append("startDate", params.startDate)
    if (params?.endDate) queryParams.append("endDate", params.endDate)

    return apiClient.get(`/api/analytics/top-artists?${queryParams.toString()}`)
  },

  // Get top artworks
  getTopArtworks: (
    params?: AnalyticsParams,
  ): Promise<
    ApiResponse<{
      topArtworks: TopArtwork[]
      period: string
      category?: string
      totalFound: number
    }>
  > => {
    const queryParams = new URLSearchParams()
    if (params?.period) queryParams.append("period", params.period)
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.startDate) queryParams.append("startDate", params.startDate)
    if (params?.endDate) queryParams.append("endDate", params.endDate)

    return apiClient.get(`/api/analytics/top-artworks?${queryParams.toString()}`)
  },

  // Get top categories
  getTopCategories: (
    params?: AnalyticsParams,
  ): Promise<
    ApiResponse<{
      topCategories: TopCategory[]
      period: string
      totalFound: number
    }>
  > => {
    const queryParams = new URLSearchParams()
    if (params?.period) queryParams.append("period", params.period)
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.startDate) queryParams.append("startDate", params.startDate)
    if (params?.endDate) queryParams.append("endDate", params.endDate)

    return apiClient.get(`/api/analytics/top-categories?${queryParams.toString()}`)
  },

  // Generate comprehensive report
  generateReport: (period?: "week" | "month" | "quarter" | "year"): Promise<ApiResponse<{ report: AnalyticsReport }>> =>
    apiClient.get(`/api/analytics/report?period=${period || "month"}`),
}
