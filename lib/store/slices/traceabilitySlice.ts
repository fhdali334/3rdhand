import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { traceabilityApi } from "@/lib/api/traceability"
import type {
  ArtworkHistoryResponse,
  OwnershipCertificateResponse,
  OwnershipVerificationResponse,
  UserOwnershipHistoryResponse,
  AdminTraceabilityOverviewResponse,
  SearchTraceabilityRecordsResponse,
} from "@/lib/types/traceability"

interface TraceabilityState {
  artworkHistory: ArtworkHistoryResponse | null
  artworkHistoryLoading: boolean
  artworkHistoryError: string | null

  ownershipCertificate: OwnershipCertificateResponse | null
  ownershipCertificateLoading: boolean
  ownershipCertificateError: string | null

  ownershipVerification: OwnershipVerificationResponse | null
  ownershipVerificationLoading: boolean
  ownershipVerificationError: string | null

  userOwnershipHistory: UserOwnershipHistoryResponse | null
  userOwnershipHistoryLoading: boolean
  userOwnershipHistoryError: string | null

  adminTraceabilityOverview: AdminTraceabilityOverviewResponse | null
  adminTraceabilityOverviewLoading: boolean
  adminTraceabilityOverviewError: string | null

  searchTraceabilityRecords: SearchTraceabilityRecordsResponse | null
  searchTraceabilityRecordsLoading: boolean
  searchTraceabilityRecordsError: string | null
}

const initialState: TraceabilityState = {
  artworkHistory: null,
  artworkHistoryLoading: false,
  artworkHistoryError: null,

  ownershipCertificate: null,
  ownershipCertificateLoading: false,
  ownershipCertificateError: null,

  ownershipVerification: null,
  ownershipVerificationLoading: false,
  ownershipVerificationError: null,

  userOwnershipHistory: null,
  userOwnershipHistoryLoading: false,
  userOwnershipHistoryError: null,

  adminTraceabilityOverview: null,
  adminTraceabilityOverviewLoading: false,
  adminTraceabilityOverviewError: null,

  searchTraceabilityRecords: null,
  searchTraceabilityRecordsLoading: false,
  searchTraceabilityRecordsError: null,
}

export const fetchArtworkHistory = createAsyncThunk(
  "traceability/fetchArtworkHistory",
  async (artworkId: string, { rejectWithValue }) => {
    try {
      const response = await traceabilityApi.getArtworkHistory(artworkId)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch artwork history")
    }
  },
)

export const fetchOwnershipCertificate = createAsyncThunk(
  "traceability/fetchOwnershipCertificate",
  async (artworkId: string, { rejectWithValue }) => {
    try {
      const response = await traceabilityApi.generateOwnershipCertificate(artworkId)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to generate ownership certificate")
    }
  },
)

export const fetchOwnershipVerification = createAsyncThunk(
  "traceability/fetchOwnershipVerification",
  async (artworkId: string, { rejectWithValue }) => {
    try {
      const response = await traceabilityApi.verifyOwnership(artworkId)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to verify ownership")
    }
  },
)

export const fetchUserOwnershipHistory = createAsyncThunk(
  "traceability/fetchUserOwnershipHistory",
  async ({ page, limit }: { page: number; limit: number } = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      const response = await traceabilityApi.getUserOwnershipHistory(page, limit)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user ownership history")
    }
  },
)

export const fetchAdminTraceabilityOverview = createAsyncThunk(
  "traceability/fetchAdminTraceabilityOverview",
  async (_, { rejectWithValue }) => {
    try {
      const response = await traceabilityApi.getTraceabilityStats()
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch admin traceability overview")
    }
  },
)

export const searchTraceabilityRecords = createAsyncThunk(
  "traceability/searchTraceabilityRecords",
  async ({ page, limit }: { page: number; limit: number } = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      const response = await traceabilityApi.searchTraceabilityRecords(page, limit)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to search traceability records")
    }
  },
)

const traceabilitySlice = createSlice({
  name: "traceability",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtworkHistory.pending, (state) => {
        state.artworkHistoryLoading = true
        state.artworkHistoryError = null
      })
      .addCase(fetchArtworkHistory.fulfilled, (state, action) => {
        state.artworkHistoryLoading = false
        state.artworkHistory = action.payload
      })
      .addCase(fetchArtworkHistory.rejected, (state, action) => {
        state.artworkHistoryLoading = false
        state.artworkHistoryError = action.payload as string
      })
      .addCase(fetchOwnershipCertificate.pending, (state) => {
        state.ownershipCertificateLoading = true
        state.ownershipCertificateError = null
      })
      .addCase(fetchOwnershipCertificate.fulfilled, (state, action) => {
        state.ownershipCertificateLoading = false
        state.ownershipCertificate = action.payload
      })
      .addCase(fetchOwnershipCertificate.rejected, (state, action) => {
        state.ownershipCertificateLoading = false
        state.ownershipCertificateError = action.payload as string
      })
      .addCase(fetchOwnershipVerification.pending, (state) => {
        state.ownershipVerificationLoading = true
        state.ownershipVerificationError = null
      })
      .addCase(fetchOwnershipVerification.fulfilled, (state, action) => {
        state.ownershipVerificationLoading = false
        state.ownershipVerification = action.payload
      })
      .addCase(fetchOwnershipVerification.rejected, (state, action) => {
        state.ownershipVerificationLoading = false
        state.ownershipVerificationError = action.payload as string
      })
      .addCase(fetchUserOwnershipHistory.pending, (state) => {
        state.userOwnershipHistoryLoading = true
        state.userOwnershipHistoryError = null
      })
      .addCase(fetchUserOwnershipHistory.fulfilled, (state, action) => {
        state.userOwnershipHistoryLoading = false
        state.userOwnershipHistory = action.payload
      })
      .addCase(fetchUserOwnershipHistory.rejected, (state, action) => {
        state.userOwnershipHistoryLoading = false
        state.userOwnershipHistoryError = action.payload as string
      })
      .addCase(fetchAdminTraceabilityOverview.pending, (state) => {
        state.adminTraceabilityOverviewLoading = true
        state.adminTraceabilityOverviewError = null
      })
      .addCase(fetchAdminTraceabilityOverview.fulfilled, (state, action) => {
        state.adminTraceabilityOverviewLoading = false
        state.adminTraceabilityOverview = action.payload
      })
      .addCase(fetchAdminTraceabilityOverview.rejected, (state, action) => {
        state.adminTraceabilityOverviewLoading = false
        state.adminTraceabilityOverviewError = action.payload as string
      })
      .addCase(searchTraceabilityRecords.pending, (state) => {
        state.searchTraceabilityRecordsLoading = true
        state.searchTraceabilityRecordsError = null
      })
      .addCase(searchTraceabilityRecords.fulfilled, (state, action) => {
        state.searchTraceabilityRecordsLoading = false
        state.searchTraceabilityRecords = action.payload
      })
      .addCase(searchTraceabilityRecords.rejected, (state, action) => {
        state.searchTraceabilityRecordsLoading = false
        state.searchTraceabilityRecordsError = action.payload as string
      })
  },
})

export default traceabilitySlice.reducer
