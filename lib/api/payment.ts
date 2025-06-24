import { apiClient } from "./client"
import type { ApiResponse } from "@/lib/types/api"
import type {
  PaymentSession,
  Transaction,
  PaymentFilters,
  PaymentStats,
  TransactionsPaginated,
} from "@/lib/types/payment"

export const paymentApi = {
  // Create listing payment session
  createListingSession: async (artworkId: string): Promise<ApiResponse<PaymentSession>> => {
    try {
      const response = await apiClient.post("/api/payments/create-listing-session", { artworkId })
      return response as unknown as ApiResponse<PaymentSession>
    } catch (error) {
      throw error
    }
  },

  // Create purchase payment session
  createPurchaseSession: async (artworkId: string): Promise<ApiResponse<PaymentSession>> => {
    try {
      const response = await apiClient.post("/api/payments/create-purchase-session/", { artworkId })
      return response as unknown as ApiResponse<PaymentSession>
    } catch (error) {
      throw error
    }
  },

  // Get payment history
  getPaymentHistory: async (filters?: PaymentFilters): Promise<ApiResponse<TransactionsPaginated>> => {
    try {
      const queryParams = new URLSearchParams()
      if (filters?.page) queryParams.append("page", filters.page.toString())
      if (filters?.limit) queryParams.append("limit", filters.limit.toString())
      if (filters?.type) queryParams.append("type", filters.type)
      if (filters?.status) queryParams.append("status", filters.status)
      if (filters?.startDate) queryParams.append("startDate", filters.startDate)
      if (filters?.endDate) queryParams.append("endDate", filters.endDate)
      if (filters?.sort) queryParams.append("sort", filters.sort)

      const response = await apiClient.get(`/api/payments/history?${queryParams.toString()}`)
      return response as unknown as ApiResponse<TransactionsPaginated>
    } catch (error) {
      throw error
    }
  },

  // Get single transaction
  getTransaction: async (id: string): Promise<ApiResponse<{ transaction: Transaction }>> => {
    try {
      const response = await apiClient.get(`/api/payments/transactions/${id}`)
      return response as unknown as ApiResponse<{ transaction: Transaction }>
    } catch (error) {
      throw error
    }
  },

  // Get payment statistics
  getPaymentStats: async (): Promise<ApiResponse<{ stats: PaymentStats }>> => {
    try {
      const response = await apiClient.get("/api/payments/stats")
      return response as unknown as ApiResponse<{ stats: PaymentStats }>
    } catch (error) {
      throw error
    }
  },
}
