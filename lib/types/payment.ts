import type { BaseFilters } from "./api"

export interface PaymentSession {
  sessionId: string
  sessionUrl: string
  artworkId: string
  amount: number
  type: "listing_fee" | "purchase"
  expiresAt: string
}

export interface Transaction {
  _id: string
  buyer?: {
    _id: string
    username: string
    email: string
  }
  seller: {
    _id: string
    username: string
    email: string
  }
  artwork: {
    _id: string
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
    platform_commission?: number
    artist_amount?: number
    stripe_receipt_url?: string
    artwork_title?: string
  }
  createdAt: string
  updatedAt: string
}

export interface PaymentFilters extends BaseFilters {
  type?: "listing_fee" | "sale" | "all"
  status?: "pending" | "completed" | "failed" | "refunded"
  startDate?: string
  endDate?: string
}

export interface PaymentStats {
  totalTransactions: number
  totalSpent: number
  totalEarned: number
  salesCount: number
  purchasesCount: number
  listingFeesCount: number
}

export interface TransactionsPaginated {
  transactions: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}
