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
  // Create listing payment session - Updated endpoint
  createListingSession: (artworkId: string): Promise<ApiResponse<PaymentSession>> =>
    apiClient.post("/api/payments/create-listing-session", { artworkId }),

  // Create purchase payment session - Updated endpoint
  createPurchaseSession: (artworkId: string): Promise<ApiResponse<PaymentSession>> =>
    apiClient.post("/api/payments/create-purchase-session/", { artworkId }),

  // Get payment history - Fixed return type
  getPaymentHistory: (filters?: PaymentFilters): Promise<ApiResponse<TransactionsPaginated>> => {
    const queryParams = new URLSearchParams()
    if (filters?.page) queryParams.append("page", filters.page.toString())
    if (filters?.limit) queryParams.append("limit", filters.limit.toString())
    if (filters?.type) queryParams.append("type", filters.type)
    if (filters?.status) queryParams.append("status", filters.status)
    if (filters?.startDate) queryParams.append("startDate", filters.startDate)
    if (filters?.endDate) queryParams.append("endDate", filters.endDate)
    if (filters?.sort) queryParams.append("sort", filters.sort)

    return apiClient.get(`/api/payments/history?${queryParams.toString()}`)
  },

  // Get single transaction
  getTransaction: (id: string): Promise<ApiResponse<{ transaction: Transaction }>> =>
    apiClient.get(`/api/payments/transactions/${id}`),

  // Get payment statistics - Fixed return type
  getPaymentStats: (): Promise<ApiResponse<{ stats: PaymentStats }>> => apiClient.get("/api/payments/stats"),
}
