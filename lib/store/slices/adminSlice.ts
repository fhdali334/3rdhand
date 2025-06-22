import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { adminApi } from "@/lib/api/admin"
import type {
  PlatformOverview,
  RevenueData,
  RecentActivity,
  PendingArtwork,
  AdminUser,
  AdminTransaction,
  ArtworkStats,
  UserStats,
  PendingArtworksParams,
  UsersParams,
  TransactionsParams,
  ArtworksParams,
} from "@/lib/types/admin"
import type { PaginationMeta } from "@/lib/types/api"

interface AdminState {
  // Overview
  overview: PlatformOverview | null
  revenue: RevenueData | null
  recentActivity: RecentActivity | null
  overviewLoading: boolean
  overviewError: string | null

  // Pending Artworks
  pendingArtworks: PendingArtwork[]
  pendingArtworksLoading: boolean
  pendingArtworksError: string | null
  pendingArtworksPagination: PaginationMeta | null
  pendingArtworksFilters: PendingArtworksParams

  // All Artworks
  allArtworks: PendingArtwork[]
  allArtworksLoading: boolean
  allArtworksError: string | null
  allArtworksPagination: PaginationMeta | null
  allArtworksFilters: ArtworksParams

  // Users
  users: AdminUser[]
  usersLoading: boolean
  usersError: string | null
  usersPagination: PaginationMeta | null
  usersFilters: UsersParams

  // Transactions
  transactions: AdminTransaction[]
  transactionsLoading: boolean
  transactionsError: string | null
  transactionsPagination: PaginationMeta | null
  transactionsFilters: TransactionsParams

  // Statistics
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

  allArtworks: [],
  allArtworksLoading: false,
  allArtworksError: null,
  allArtworksPagination: null,
  allArtworksFilters: {},

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

  artworkStats: null,
  userStats: null,
  statsLoading: false,
  statsError: null,
}

// Helper function to safely extract data from API response
const extractApiData = (response: any, dataKey: string) => {
  if (!response?.data) {
    return { data: [], pagination: null }
  }

  // Handle nested structure: { data: { [dataKey]: [...], pagination: {...} } }
  if (response.data.data && response.data.data[dataKey]) {
    return {
      data: response.data.data[dataKey] || [],
      pagination: response.data.data.pagination || null,
    }
  }

  // Handle direct structure: { [dataKey]: [...], pagination: {...} }
  if (response.data[dataKey]) {
    return {
      data: response.data[dataKey] || [],
      pagination: response.data.pagination || null,
    }
  }

  // Handle direct array: [...]
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      pagination: null,
    }
  }

  // Fallback
  return { data: [], pagination: null }
}

// Async thunks
export const fetchPlatformOverview = createAsyncThunk(
  "admin/fetchPlatformOverview",
  async (_: {}, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux: Fetching platform overview...")
      const response = await adminApi.getOverview()
      console.log("📊 Redux: Overview response:", response)

      if (!response.data) {
        throw new Error("No data received from overview API")
      }

      return response.data
    } catch (error: any) {
      console.error("❌ Redux: Overview fetch error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch platform overview"
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchPendingArtworks = createAsyncThunk(
  "admin/fetchPendingArtworks",
  async (params: PendingArtworksParams = {}, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux: Fetching pending artworks with params:", params)
      const response = await adminApi.getPendingArtworks(params)
      console.log("🎨 Redux: Pending artworks response:", response)

      if (!response.data) {
        throw new Error("No data received from pending artworks API")
      }

      const { data, pagination } = extractApiData(response, "artworks")

      const result = {
        data,
        pagination,
        filters: params,
      }

      console.log("✅ Redux: Processed pending artworks:", result)
      return result
    } catch (error: any) {
      console.error("❌ Redux: Pending artworks fetch error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch pending artworks"
      return rejectWithValue(errorMessage)
    }
  },
)

export const approveArtwork = createAsyncThunk(
  "admin/approveArtwork",
  async (artworkId: string, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux: Approving artwork:", artworkId)
      const response = await adminApi.approveArtwork(artworkId)
      console.log("✅ Redux: Approve response:", response)

      return { artworkId, ...response.data }
    } catch (error: any) {
      console.error("❌ Redux: Approve artwork error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to approve artwork"
      return rejectWithValue(errorMessage)
    }
  },
)

export const rejectArtwork = createAsyncThunk(
  "admin/rejectArtwork",
  async ({ artworkId, reason }: { artworkId: string; reason: string }, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux: Rejecting artwork:", artworkId, "Reason:", reason)
      const response = await adminApi.rejectArtwork(artworkId, reason)
      console.log("❌ Redux: Reject response:", response)

      return { artworkId, ...response.data }
    } catch (error: any) {
      console.error("❌ Redux: Reject artwork error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to reject artwork"
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchAllArtworks = createAsyncThunk(
  "admin/fetchAllArtworks",
  async (params: ArtworksParams = {}, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux: Fetching all artworks with params:", params)
      const response = await adminApi.getAllArtworks(params)
      console.log("🖼️ Redux: All artworks response:", response)

      if (!response.data) {
        throw new Error("No data received from all artworks API")
      }

      const { data, pagination } = extractApiData(response, "artworks")

      const result = {
        data,
        pagination,
        filters: params,
      }

      console.log("✅ Redux: Processed all artworks:", result)
      return result
    } catch (error: any) {
      console.error("❌ Redux: All artworks fetch error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch artworks"
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (params: UsersParams = {}, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux: Fetching users with params:", params)
      const response = await adminApi.getUsers(params)
      console.log("👥 Redux: Users response:", response)

      if (!response.data) {
        throw new Error("No data received from users API")
      }

      const { data, pagination } = extractApiData(response, "users")

      const result = {
        data,
        pagination,
        filters: params,
      }

      console.log("✅ Redux: Processed users:", result)
      return result
    } catch (error: any) {
      console.error("❌ Redux: Users fetch error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch users"
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchTransactions = createAsyncThunk(
  "admin/fetchTransactions",
  async (params: TransactionsParams = {}, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux: Fetching transactions with params:", params)
      const response = await adminApi.getTransactions(params)
      console.log("💰 Redux: Transactions response:", response)

      if (!response.data) {
        throw new Error("No data received from transactions API")
      }

      const { data, pagination } = extractApiData(response, "transactions")

      const result = {
        data,
        pagination,
        filters: params,
      }

      console.log("✅ Redux: Processed transactions:", result)
      return result
    } catch (error: any) {
      console.error("❌ Redux: Transactions fetch error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch transactions"
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchArtworkStats = createAsyncThunk("admin/fetchArtworkStats", async (_: {}, { rejectWithValue }) => {
  try {
    console.log("🔄 Redux: Fetching artwork stats...")
    const response = await adminApi.getArtworkStats()
    console.log("📈 Redux: Artwork stats response:", response)

    if (!response.data) {
      throw new Error("No data received from artwork stats API")
    }

    return response.data.stats
  } catch (error: any) {
    console.error("❌ Redux: Artwork stats fetch error:", error)
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch artwork stats"
    return rejectWithValue(errorMessage)
  }
})

export const fetchUserStats = createAsyncThunk("admin/fetchUserStats", async (_: {}, { rejectWithValue }) => {
  try {
    console.log("🔄 Redux: Fetching user stats...")
    const response = await adminApi.getUserStats()
    console.log("👤 Redux: User stats response:", response)

    if (!response.data) {
      throw new Error("No data received from user stats API")
    }

    return response.data.stats
  } catch (error: any) {
    console.error("❌ Redux: User stats fetch error:", error)
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch user stats"
    return rejectWithValue(errorMessage)
  }
})

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.overviewError = null
      state.pendingArtworksError = null
      state.allArtworksError = null
      state.usersError = null
      state.transactionsError = null
      state.statsError = null
    },
    updatePendingArtworksFilters: (state, action: PayloadAction<Partial<PendingArtworksParams>>) => {
      state.pendingArtworksFilters = { ...state.pendingArtworksFilters, ...action.payload }
    },
    updateAllArtworksFilters: (state, action: PayloadAction<Partial<ArtworksParams>>) => {
      state.allArtworksFilters = { ...state.allArtworksFilters, ...action.payload }
    },
    updateUsersFilters: (state, action: PayloadAction<Partial<UsersParams>>) => {
      state.usersFilters = { ...state.usersFilters, ...action.payload }
    },
    updateTransactionsFilters: (state, action: PayloadAction<Partial<TransactionsParams>>) => {
      state.transactionsFilters = { ...state.transactionsFilters, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    // Platform Overview
    builder
      .addCase(fetchPlatformOverview.pending, (state) => {
        console.log("⏳ Redux: Overview loading...")
        state.overviewLoading = true
        state.overviewError = null
      })
      .addCase(fetchPlatformOverview.fulfilled, (state, action) => {
        console.log("✅ Redux: Overview loaded:", action.payload)
        state.overviewLoading = false
        state.overview = action.payload.overview
        state.revenue = action.payload.revenue
        state.recentActivity = action.payload.recentActivity
      })
      .addCase(fetchPlatformOverview.rejected, (state, action) => {
        console.log("❌ Redux: Overview failed:", action.payload)
        state.overviewLoading = false
        state.overviewError = action.payload as string
      })

    // Pending Artworks
    builder
      .addCase(fetchPendingArtworks.pending, (state) => {
        console.log("⏳ Redux: Pending artworks loading...")
        state.pendingArtworksLoading = true
        state.pendingArtworksError = null
      })
      .addCase(fetchPendingArtworks.fulfilled, (state, action) => {
        console.log("✅ Redux: Pending artworks loaded:", action.payload)
        state.pendingArtworksLoading = false
        state.pendingArtworks = action.payload.data || []
        state.pendingArtworksPagination = action.payload.pagination || null
        state.pendingArtworksFilters = action.payload.filters
      })
      .addCase(fetchPendingArtworks.rejected, (state, action) => {
        console.log("❌ Redux: Pending artworks failed:", action.payload)
        state.pendingArtworksLoading = false
        state.pendingArtworksError = action.payload as string
      })

    // All Artworks
    builder
      .addCase(fetchAllArtworks.pending, (state) => {
        state.allArtworksLoading = true
        state.allArtworksError = null
      })
      .addCase(fetchAllArtworks.fulfilled, (state, action) => {
        state.allArtworksLoading = false
        state.allArtworks = action.payload.data || []
        state.allArtworksPagination = action.payload.pagination || null
        state.allArtworksFilters = action.payload.filters
      })
      .addCase(fetchAllArtworks.rejected, (state, action) => {
        state.allArtworksLoading = false
        state.allArtworksError = action.payload as string
      })

    // Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true
        state.usersError = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false
        state.users = action.payload.data || []
        state.usersPagination = action.payload.pagination || null
        state.usersFilters = action.payload.filters
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false
        state.usersError = action.payload as string
      })

    // Transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.transactionsLoading = true
        state.transactionsError = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false
        state.transactions = action.payload.data || []
        state.transactionsPagination = action.payload.pagination || null
        state.transactionsFilters = action.payload.filters
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactionsLoading = false
        state.transactionsError = action.payload as string
      })

    // Approve Artwork
    builder.addCase(approveArtwork.fulfilled, (state, action) => {
      const artworkId = action.payload.artworkId
      state.pendingArtworks = state.pendingArtworks.filter((artwork) => artwork._id !== artworkId)
      // Update overview if available
      if (state.overview) {
        state.overview.pendingApprovals = Math.max(0, state.overview.pendingApprovals - 1)
      }
    })

    // Reject Artwork
    builder.addCase(rejectArtwork.fulfilled, (state, action) => {
      const artworkId = action.payload.artworkId
      state.pendingArtworks = state.pendingArtworks.filter((artwork) => artwork._id !== artworkId)
      // Update overview if available
      if (state.overview) {
        state.overview.pendingApprovals = Math.max(0, state.overview.pendingApprovals - 1)
      }
    })

    // Stats
    builder
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

    builder
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
  updateAllArtworksFilters,
  updateUsersFilters,
  updateTransactionsFilters,
} = adminSlice.actions

export default adminSlice.reducer
