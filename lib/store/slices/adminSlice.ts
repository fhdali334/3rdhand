import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { adminApi } from "@/lib/api/admin"
import type {
  PlatformOverview,
  PendingArtworksParams,
  UsersParams,
  TransactionsParams,
  ArtworksParams,
  ArtworkStats,
  UserStats,
  AdminUser,
  AdminTransaction,
  PaginationMeta,
} from "@/lib/types/admin"

interface AdminState {
  overview: PlatformOverview | null
  revenue: any | null
  recentActivity: any | null
  overviewLoading: boolean
  overviewError: string | null

  pendingArtworks: any[] //PendingArtwork[]
  pendingArtworksLoading: boolean
  pendingArtworksError: string | null
  pendingArtworksPagination: PaginationMeta | null
  pendingArtworksFilters: PendingArtworksParams

  users: AdminUser[]
  usersLoading: boolean
  usersError: string | null
  usersPagination: PaginationMeta | null
  usersFilters: UsersParams

  transactions: AdminTransaction[]
  transactionsLoading: boolean
  transactionsError: string | null
  transactionsPagination: PaginationMeta | null
  transactionsFilters: TransactionsParams

  allArtworks: any[] //Artwork[]
  allArtworksLoading: boolean
  allArtworksError: string | null
  allArtworksPagination: PaginationMeta | null
  allArtworksFilters: ArtworksParams

  artworkStats: ArtworkStats | null
  userStats: UserStats | null
  statsLoading: boolean
  statsError: string | null
}

const initialState: AdminState = {
  overview: null,
  revenue: null,
  recentActivity: null,
  overviewLoading: false,
  overviewError: null,

  pendingArtworks: [],
  pendingArtworksLoading: false,
  pendingArtworksError: null,
  pendingArtworksPagination: null,
  pendingArtworksFilters: {},

  users: [],
  usersLoading: false,
  usersError: null,
  usersPagination: null,
  usersFilters: {},

  transactions: [],
  transactionsLoading: false,
  transactionsError: null,
  transactionsPagination: null,
  transactionsFilters: {},

  allArtworks: [],
  allArtworksLoading: false,
  allArtworksError: null,
  allArtworksPagination: null,
  allArtworksFilters: {},

  artworkStats: null,
  userStats: null,
  statsLoading: false,
  statsError: null,
}

export const fetchPlatformOverview = createAsyncThunk(
  "admin/fetchPlatformOverview",
  async (params: {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.getOverview()
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch platform overview")
    }
  },
)

export const fetchPendingArtworks = createAsyncThunk(
  "admin/fetchPendingArtworks",
  async (params: PendingArtworksParams = {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.getPendingArtworks(params)
      if (!response.data) {
        throw new Error("No data received")
      }
      return { artworks: response.data.artworks, pagination: response.data.pagination }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch pending artworks")
    }
  },
)

export const approveArtwork = createAsyncThunk(
  "admin/approveArtwork",
  async (artworkId: string, { rejectWithValue }) => {
    try {
      const response = await adminApi.approveArtwork(artworkId)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data.artwork
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to approve artwork")
    }
  },
)

export const rejectArtwork = createAsyncThunk(
  "admin/rejectArtwork",
  async ({ artworkId, reason }: { artworkId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await adminApi.rejectArtwork(artworkId, reason)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data.artwork
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to reject artwork")
    }
  },
)

export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (params: UsersParams = {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.getUsers(params)
      if (!response.data) {
        throw new Error("No data received")
      }
      return { users: response.data.users, pagination: response.data.pagination }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users")
    }
  },
)

export const fetchTransactions = createAsyncThunk(
  "admin/fetchTransactions",
  async (params: TransactionsParams = {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.getTransactions(params)
      if (!response.data) {
        throw new Error("No data received")
      }
      return { transactions: response.data.transactions, pagination: response.data.pagination }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch transactions")
    }
  },
)

export const fetchAllArtworks = createAsyncThunk(
  "admin/fetchAllArtworks",
  async (params: ArtworksParams = {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAllArtworks(params)
      if (!response.data) {
        throw new Error("No data received")
      }
      return { artworks: response.data.artworks, pagination: response.data.pagination }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch all artworks")
    }
  },
)

export const fetchArtworkStats = createAsyncThunk("admin/fetchArtworkStats", async (_, { rejectWithValue }) => {
  try {
    const response = await adminApi.getArtworkStats()
    if (!response.data) {
      throw new Error("No data received")
    }
    return response.data.stats
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch artwork stats")
  }
})

export const fetchUserStats = createAsyncThunk("admin/fetchUserStats", async (_, { rejectWithValue }) => {
  try {
    const response = await adminApi.getUserStats()
    if (!response.data) {
      throw new Error("No data received")
    }
    return response.data.stats
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch user stats")
  }
})

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.overviewError = null
      state.pendingArtworksError = null
      state.usersError = null
      state.transactionsError = null
      state.allArtworksError = null
      state.statsError = null
    },
    updatePendingArtworksFilters: (state, action: PayloadAction<Partial<PendingArtworksParams>>) => {
      state.pendingArtworksFilters = { ...state.pendingArtworksFilters, ...action.payload }
    },
    updateUsersFilters: (state, action: PayloadAction<Partial<UsersParams>>) => {
      state.usersFilters = { ...state.usersFilters, ...action.payload }
    },
    updateTransactionsFilters: (state, action: PayloadAction<Partial<TransactionsParams>>) => {
      state.transactionsFilters = { ...state.transactionsFilters, ...action.payload }
    },
    updateAllArtworksFilters: (state, action: PayloadAction<Partial<ArtworksParams>>) => {
      state.allArtworksFilters = { ...state.allArtworksFilters, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformOverview.pending, (state) => {
        state.overviewLoading = true
        state.overviewError = null
      })
      .addCase(fetchPlatformOverview.fulfilled, (state, action) => {
        state.overviewLoading = false
        state.overview = action.payload.overview
        state.revenue = action.payload.revenue
        state.recentActivity = action.payload.recentActivity
      })
      .addCase(fetchPlatformOverview.rejected, (state, action) => {
        state.overviewLoading = false
        state.overviewError = action.payload as string
      })
      .addCase(fetchPendingArtworks.pending, (state) => {
        state.pendingArtworksLoading = true
        state.pendingArtworksError = null
      })
      .addCase(fetchPendingArtworks.fulfilled, (state, action) => {
        state.pendingArtworksLoading = false
        state.pendingArtworks = action.payload.artworks || []
        state.pendingArtworksPagination = action.payload.pagination || null
      })
      .addCase(fetchPendingArtworks.rejected, (state, action) => {
        state.pendingArtworksLoading = false
        state.pendingArtworksError = action.payload as string
      })
      .addCase(approveArtwork.fulfilled, (state, action) => {
        const approvedArtworkId = action.payload.id
        state.pendingArtworks = state.pendingArtworks.filter((artwork) => artwork._id !== approvedArtworkId)
        // Update pagination total count
        if (state.pendingArtworksPagination) {
          state.pendingArtworksPagination.total = Math.max(0, state.pendingArtworksPagination.total - 1)
        }
      })
      .addCase(rejectArtwork.fulfilled, (state, action) => {
        const rejectedArtworkId = action.payload.id
        state.pendingArtworks = state.pendingArtworks.filter((artwork) => artwork._id !== rejectedArtworkId)
        // Update pagination total count
        if (state.pendingArtworksPagination) {
          state.pendingArtworksPagination.total = Math.max(0, state.pendingArtworksPagination.total - 1)
        }
      })
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true
        state.usersError = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false
        state.users = action.payload.users
        state.usersPagination = action.payload.pagination
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false
        state.usersError = action.payload as string
      })
      .addCase(fetchTransactions.pending, (state) => {
        state.transactionsLoading = true
        state.transactionsError = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false
        state.transactions = action.payload.transactions
        state.transactionsPagination = action.payload.pagination
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactionsLoading = false
        state.transactionsError = action.payload as string
      })
      .addCase(fetchAllArtworks.pending, (state) => {
        state.allArtworksLoading = true
        state.allArtworksError = null
      })
      .addCase(fetchAllArtworks.fulfilled, (state, action) => {
        state.allArtworksLoading = false
        state.allArtworks = action.payload.artworks
        state.allArtworksPagination = action.payload.pagination
      })
      .addCase(fetchAllArtworks.rejected, (state, action) => {
        state.allArtworksLoading = false
        state.allArtworksError = action.payload as string
      })
      .addCase(fetchArtworkStats.pending, (state) => {
        state.statsLoading = true
        state.statsError = null
      })
      .addCase(fetchArtworkStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.artworkStats = action.payload
      })
      .addCase(fetchArtworkStats.rejected, (state, action) => {
        state.statsLoading = false
        state.statsError = action.payload as string
      })
      .addCase(fetchUserStats.pending, (state) => {
        state.statsLoading = true
        state.statsError = null
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.userStats = action.payload
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.statsLoading = false
        state.statsError = action.payload as string
      })
  },
})

export const {
  clearAdminError,
  updatePendingArtworksFilters,
  updateUsersFilters,
  updateTransactionsFilters,
  updateAllArtworksFilters,
} = adminSlice.actions

export default adminSlice.reducer
