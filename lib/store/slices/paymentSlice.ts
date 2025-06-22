import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { paymentApi } from "@/lib/api/payment"
import type { PaymentSession, Transaction, PaymentFilters, PaymentStats } from "@/lib/types/payment"
import type { PaginationMeta } from "@/lib/types/api"

interface PaymentState {
  // Payment sessions
  currentSession: PaymentSession | null
  sessionLoading: boolean
  sessionError: string | null

  // Payment history
  transactions: Transaction[]
  transactionsLoading: boolean
  transactionsError: string | null
  transactionsPagination: PaginationMeta | null
  transactionsFilters: PaymentFilters

  // Single transaction
  currentTransaction: Transaction | null
  currentTransactionLoading: boolean
  currentTransactionError: string | null

  // Statistics
  stats: PaymentStats | null
  statsLoading: boolean
  statsError: string | null
}

const initialState: PaymentState = {
  currentSession: null,
  sessionLoading: false,
  sessionError: null,

  transactions: [], // Ensure this is always an array
  transactionsLoading: false,
  transactionsError: null,
  transactionsPagination: null,
  transactionsFilters: {},

  currentTransaction: null,
  currentTransactionLoading: false,
  currentTransactionError: null,

  stats: null,
  statsLoading: false,
  statsError: null,
}

// Async thunks
export const createListingSession = createAsyncThunk(
  "payment/createListingSession",
  async (artworkId: string, { rejectWithValue }) => {
    try {
      const response = await paymentApi.createListingSession(artworkId)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create listing payment session")
    }
  },
)

export const createPurchaseSession = createAsyncThunk(
  "payment/createPurchaseSession",
  async (artworkId: string, { rejectWithValue }) => {
    try {
      const response = await paymentApi.createPurchaseSession(artworkId)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create purchase payment session")
    }
  },
)

export const fetchPaymentHistory = createAsyncThunk(
  "payment/fetchPaymentHistory",
  async (filters: PaymentFilters = {}, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getPaymentHistory(filters)
      if ( !response.data) {
        throw new Error("No data received")
      }
      return {
        transactions: response.data.transactions,
        pagination: response.data.pagination,
        filters,
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch payment history")
    }
  },
)

export const fetchTransaction = createAsyncThunk(
  "payment/fetchTransaction",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getTransaction(id)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data.transaction
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch transaction")
    }
  },
)

export const fetchPaymentStats = createAsyncThunk("payment/fetchPaymentStats", async (_, { rejectWithValue }) => {
  try {
    const response = await paymentApi.getPaymentStats()
    if (!response.data) {
      throw new Error("No data received")
    }
    return response.data.stats
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch payment stats")
  }
})

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.sessionError = null
      state.transactionsError = null
      state.currentTransactionError = null
      state.statsError = null
    },
    clearCurrentSession: (state) => {
      state.currentSession = null
    },
    updateTransactionsFilters: (state, action: PayloadAction<PaymentFilters>) => {
      state.transactionsFilters = { ...state.transactionsFilters, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Listing Session
      .addCase(createListingSession.pending, (state) => {
        state.sessionLoading = true
        state.sessionError = null
      })
      .addCase(createListingSession.fulfilled, (state, action) => {
        state.sessionLoading = false
        state.currentSession = action.payload
      })
      .addCase(createListingSession.rejected, (state, action) => {
        state.sessionLoading = false
        state.sessionError = action.payload as string
      })

      // Create Purchase Session
      .addCase(createPurchaseSession.pending, (state) => {
        state.sessionLoading = true
        state.sessionError = null
      })
      .addCase(createPurchaseSession.fulfilled, (state, action) => {
        state.sessionLoading = false
        state.currentSession = action.payload
      })
      .addCase(createPurchaseSession.rejected, (state, action) => {
        state.sessionLoading = false
        state.sessionError = action.payload as string
      })

      // Fetch Payment History
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.transactionsLoading = true
        state.transactionsError = null
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.transactionsLoading = false
        state.transactions = Array.isArray(action.payload.transactions) ? action.payload.transactions : []
        state.transactionsPagination = action.payload.pagination
        state.transactionsFilters = action.payload.filters
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.transactionsLoading = false
        state.transactionsError = action.payload as string
      })

      // Fetch Transaction
      .addCase(fetchTransaction.pending, (state) => {
        state.currentTransactionLoading = true
        state.currentTransactionError = null
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.currentTransactionLoading = false
        state.currentTransaction = action.payload
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.currentTransactionLoading = false
        state.currentTransactionError = action.payload as string
      })

      // Fetch Payment Stats
      .addCase(fetchPaymentStats.pending, (state) => {
        state.statsLoading = true
        state.statsError = null
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.statsLoading = false
        state.statsError = action.payload as string
      })
  },
})

export const { clearPaymentError, clearCurrentSession, updateTransactionsFilters } = paymentSlice.actions

export default paymentSlice.reducer
