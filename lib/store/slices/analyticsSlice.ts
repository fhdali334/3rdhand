import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { analyticsApi } from "@/lib/api/analytics"
import type { TopArtist, TopArtwork, TopCategory, AnalyticsParams, AnalyticsReport } from "@/lib/types/analytics"

interface AnalyticsState {
  // Top Artists
  topArtists: TopArtist[]
  topArtistsLoading: boolean
  topArtistsError: string | null
  topArtistsFilters: AnalyticsParams

  // Top Artworks
  topArtworks: TopArtwork[]
  topArtworksLoading: boolean
  topArtworksError: string | null
  topArtworksFilters: AnalyticsParams

  // Top Categories
  topCategories: TopCategory[]
  topCategoriesLoading: boolean
  topCategoriesError: string | null
  topCategoriesFilters: AnalyticsParams

  // Comprehensive Report
  report: AnalyticsReport | null
  reportLoading: boolean
  reportError: string | null
  reportPeriod: "week" | "month" | "quarter" | "year"
}

const initialState: AnalyticsState = {
  topArtists: [],
  topArtistsLoading: false,
  topArtistsError: null,
  topArtistsFilters: {},

  topArtworks: [],
  topArtworksLoading: false,
  topArtworksError: null,
  topArtworksFilters: {},

  topCategories: [],
  topCategoriesLoading: false,
  topCategoriesError: null,
  topCategoriesFilters: {},

  report: null,
  reportLoading: false,
  reportError: null,
  reportPeriod: "month",
}

// Async thunks
export const fetchTopArtists = createAsyncThunk(
  "analytics/fetchTopArtists",
  async (params: AnalyticsParams = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getTopArtists(params)
      if (!response.data) {
        throw new Error("No data received")
      }
      return { topArtists: response.data.topArtists, filters: params }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch top artists")
    }
  },
)

export const fetchTopArtworks = createAsyncThunk(
  "analytics/fetchTopArtworks",
  async (params: AnalyticsParams = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getTopArtworks(params)
      if (!response.data) {
        throw new Error("No data received")
      }
      return { topArtworks: response.data.topArtworks, filters: params }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch top artworks")
    }
  },
)

export const fetchTopCategories = createAsyncThunk(
  "analytics/fetchTopCategories",
  async (params: AnalyticsParams = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getTopCategories(params)
      if (!response.data) {
        throw new Error("No data received")
      }
      return { topCategories: response.data.topCategories, filters: params }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch top categories")
    }
  },
)

export const fetchReport = createAsyncThunk(
  "analytics/fetchReport",
  async (period: "week" | "month" | "quarter" | "year", { rejectWithValue }) => {
    try {
      const response = await analyticsApi.generateReport(period)
      if (!response.data) {
        throw new Error("No data received")
      }
      return { report: response.data.report, period }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch report")
    }
  },
)

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setReportPeriod: (state, action: PayloadAction<"week" | "month" | "quarter" | "year">) => {
      state.reportPeriod = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopArtists.pending, (state) => {
        state.topArtistsLoading = true
        state.topArtistsError = null
      })
      .addCase(fetchTopArtists.fulfilled, (state, action) => {
        state.topArtistsLoading = false
        state.topArtists = action.payload.topArtists
        state.topArtistsFilters = action.payload.filters
      })
      .addCase(fetchTopArtists.rejected, (state, action) => {
        state.topArtistsLoading = false
        state.topArtistsError = action.payload as string
      })

      .addCase(fetchTopArtworks.pending, (state) => {
        state.topArtworksLoading = true
        state.topArtworksError = null
      })
      .addCase(fetchTopArtworks.fulfilled, (state, action) => {
        state.topArtworksLoading = false
        state.topArtworks = action.payload.topArtworks
        state.topArtworksFilters = action.payload.filters
      })
      .addCase(fetchTopArtworks.rejected, (state, action) => {
        state.topArtworksLoading = false
        state.topArtworksError = action.payload as string
      })

      .addCase(fetchTopCategories.pending, (state) => {
        state.topCategoriesLoading = true
        state.topCategoriesError = null
      })
      .addCase(fetchTopCategories.fulfilled, (state, action) => {
        state.topCategoriesLoading = false
        state.topCategories = action.payload.topCategories
        state.topCategoriesFilters = action.payload.filters
      })
      .addCase(fetchTopCategories.rejected, (state, action) => {
        state.topCategoriesLoading = false
        state.topCategoriesError = action.payload as string
      })

      .addCase(fetchReport.pending, (state) => {
        state.reportLoading = true
        state.reportError = null
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.reportLoading = false
        state.report = action.payload.report
        state.reportPeriod = action.payload.period
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.reportLoading = false
        state.reportError = action.payload as string
      })
  },
})

export const { setReportPeriod } = analyticsSlice.actions

export default analyticsSlice.reducer
