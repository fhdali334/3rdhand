import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { engagementApi } from "@/lib/api/engagement"
import type {
  PopularArtworksResponse,
  TrendingArtistsResponse,
  UserEngagementStatsResponse,
  MyFavoritesResponse,
  MyFollowingResponse,
} from "@/lib/types/engagement"

interface EngagementState {
  popularArtworks: PopularArtworksResponse | null
  popularArtworksLoading: boolean
  popularArtworksError: string | null

  trendingArtists: TrendingArtistsResponse | null
  trendingArtistsLoading: boolean
  trendingArtistsError: string | null

  userEngagementStats: UserEngagementStatsResponse | null
  userEngagementStatsLoading: boolean
  userEngagementStatsError: string | null

  myFavorites: MyFavoritesResponse | null
  myFavoritesLoading: boolean
  myFavoritesError: string | null

  myFollowing: MyFollowingResponse | null
  myFollowingLoading: boolean
  myFollowingError: string | null
}

const initialState: EngagementState = {
  popularArtworks: null,
  popularArtworksLoading: false,
  popularArtworksError: null,

  trendingArtists: null,
  trendingArtistsLoading: false,
  trendingArtistsError: null,

  userEngagementStats: null,
  userEngagementStatsLoading: false,
  userEngagementStatsError: null,

  myFavorites: null,
  myFavoritesLoading: false,
  myFavoritesError: null,

  myFollowing: null,
  myFollowingLoading: false,
  myFollowingError: null,
}

export const fetchPopularArtworks = createAsyncThunk(
  "engagement/fetchPopularArtworks",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await engagementApi.getPopularArtworks(limit)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch popular artworks")
    }
  },
)

export const fetchTrendingArtists = createAsyncThunk(
  "engagement/fetchTrendingArtists",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await engagementApi.getTrendingArtists(limit)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch trending artists")
    }
  },
)

export const fetchUserEngagementStats = createAsyncThunk(
  "engagement/fetchUserEngagementStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await engagementApi.getMyStats()
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user engagement stats")
    }
  },
)

export const fetchMyFavorites = createAsyncThunk(
  "engagement/fetchMyFavorites",
  async ({ page, limit }: { page: number; limit: number } = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      const response = await engagementApi.getMyFavorites(page, limit)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user's liked artworks")
    }
  },
)

export const fetchMyFollowing = createAsyncThunk(
  "engagement/fetchMyFollowing",
  async ({ page, limit }: { page: number; limit: number } = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      const response = await engagementApi.getMyFollowing(page, limit)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user's followed artists")
    }
  },
)

const engagementSlice = createSlice({
  name: "engagement",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPopularArtworks.pending, (state) => {
        state.popularArtworksLoading = true
        state.popularArtworksError = null
      })
      .addCase(fetchPopularArtworks.fulfilled, (state, action) => {
        state.popularArtworksLoading = false
        state.popularArtworks = action.payload
      })
      .addCase(fetchPopularArtworks.rejected, (state, action) => {
        state.popularArtworksLoading = false
        state.popularArtworksError = action.payload as string
      })
      .addCase(fetchTrendingArtists.pending, (state) => {
        state.trendingArtistsLoading = true
        state.trendingArtistsError = null
      })
      .addCase(fetchTrendingArtists.fulfilled, (state, action) => {
        state.trendingArtistsLoading = false
        state.trendingArtists = action.payload
      })
      .addCase(fetchTrendingArtists.rejected, (state, action) => {
        state.trendingArtistsLoading = false
        state.trendingArtistsError = action.payload as string
      })
      .addCase(fetchUserEngagementStats.pending, (state) => {
        state.userEngagementStatsLoading = true
        state.userEngagementStatsError = null
      })
      .addCase(fetchUserEngagementStats.fulfilled, (state, action) => {
        state.userEngagementStatsLoading = false
        state.userEngagementStats = action.payload
      })
      .addCase(fetchUserEngagementStats.rejected, (state, action) => {
        state.userEngagementStatsLoading = false
        state.userEngagementStatsError = action.payload as string
      })
      .addCase(fetchMyFavorites.pending, (state) => {
        state.myFavoritesLoading = true
        state.myFavoritesError = null
      })
      .addCase(fetchMyFavorites.fulfilled, (state, action) => {
        state.myFavoritesLoading = false
        state.myFavorites = action.payload
      })
      .addCase(fetchMyFavorites.rejected, (state, action) => {
        state.myFavoritesLoading = false
        state.myFavoritesError = action.payload as string
      })
      .addCase(fetchMyFollowing.pending, (state) => {
        state.myFollowingLoading = true
        state.myFollowingError = null
      })
      .addCase(fetchMyFollowing.fulfilled, (state, action) => {
        state.myFollowingLoading = false
        state.myFollowing = action.payload
      })
      .addCase(fetchMyFollowing.rejected, (state, action) => {
        state.myFollowingLoading = false
        state.myFollowingError = action.payload as string
      })
  },
})

export default engagementSlice.reducer
