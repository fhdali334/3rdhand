import { apiClient } from "./client"
import type { ApiResponse } from "@/lib/types/api"
import type {
  ArtworkHistoryResponse,
  OwnershipCertificateResponse,
  OwnershipVerificationResponse,
  UserOwnershipHistoryResponse,
  AdminTraceabilityOverviewResponse,
  SearchTraceabilityRecordsResponse,
} from "@/lib/types/traceability"

export const traceabilityApi = {
  // Get Artwork History
  getArtworkHistory: async (artworkId: string): Promise<ApiResponse<ArtworkHistoryResponse>> => {
    console.log(`📜 Fetching artwork history for ID: ${artworkId}`)
    return apiClient.get(`/api/traceability/artwork/${artworkId}/history`)
  },

  // Generate Ownership Certificate
  generateOwnershipCertificate: async (artworkId: string): Promise<ApiResponse<OwnershipCertificateResponse>> => {
    console.log(` 🔒 Generating ownership certificate for ID: ${artworkId}`)
    return apiClient.get(`/api/traceability/artwork/${artworkId}/certificate`)
  },

  // Verify Ownership
  verifyOwnership: async (artworkId: string): Promise<ApiResponse<OwnershipVerificationResponse>> => {
    console.log(`✅ Verifying ownership for ID: ${artworkId}`)
    return apiClient.get(`/api/traceability/artwork/${artworkId}/verify`)
  },

  // Get User Ownership History
  getUserOwnershipHistory: async (page = 1, limit = 10): Promise<ApiResponse<UserOwnershipHistoryResponse>> => {
    console.log(`👤 Fetching user ownership history - Page: ${page}, Limit: ${limit}`)
    return apiClient.get(`/api/traceability/my/history?page=${page}&limit=${limit}`)
  },

  // Get Traceability Statistics (Admin)
  getTraceabilityStats: async (): Promise<ApiResponse<AdminTraceabilityOverviewResponse>> => {
    console.log("📊 Fetching traceability statistics (Admin)")
    return apiClient.get(`/api/traceability/stats`)
  },

  // Search Traceability Records (Admin)
  searchTraceabilityRecords: async (page = 1, limit = 10): Promise<ApiResponse<SearchTraceabilityRecordsResponse>> => {
    console.log(`🔍 Searching traceability records (Admin) - Page: ${page}, Limit: ${limit}`)
    return apiClient.get(`/api/traceability/search?page=${page}&limit=${limit}`)
  },
}
