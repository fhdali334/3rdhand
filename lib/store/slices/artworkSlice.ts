import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { artworkApi } from "@/lib/api/artwork"
import type { Artwork, ArtworkFilters, UpdateArtworkData, ArtworkStats } from "@/lib/types/artwork"
import type { PaginationMeta } from "@/lib/types/api"

interface ArtworkState {
// Browse artworks
artworks: Artwork[]
artworksLoading: boolean
artworksError: string | null
artworksPagination: PaginationMeta | null
artworksFilters: ArtworkFilters

// Single artwork
currentArtwork: Artwork | null
currentArtworkLoading: boolean
currentArtworkError: string | null

// My artworks (for artists)
myArtworks: Artwork[]
myArtworksLoading: boolean
myArtworksError: string | null
myArtworksPagination: PaginationMeta | null
myArtworksFilters: ArtworkFilters

// Search results
searchResults: Artwork[]
searchLoading: boolean
searchError: string | null
searchPagination: PaginationMeta | null
searchQuery: string

// Artist artworks
artistArtworks: Artwork[]
artistArtworksLoading: boolean
artistArtworksError: string | null
artistArtworksPagination: PaginationMeta | null

// Statistics
stats: ArtworkStats | null
statsLoading: boolean
statsError: string | null

// Create/Update
createLoading: boolean
createError: string | null
lastCreatedId?: string | null
updateLoading: boolean
updateError: string | null
deleteLoading: boolean
deleteError: string | null
}

const initialState: ArtworkState = {
artworks: [],
artworksLoading: false,
artworksError: null,
artworksPagination: null,
artworksFilters: {},

currentArtwork: null,
currentArtworkLoading: false,
currentArtworkError: null,

myArtworks: [],
myArtworksLoading: false,
myArtworksError: null,
myArtworksPagination: null,
myArtworksFilters: {},

searchResults: [],
searchLoading: false,
searchError: null,
searchPagination: null,
searchQuery: "",

artistArtworks: [],
artistArtworksLoading: false,
artistArtworksError: null,
artistArtworksPagination: null,

stats: null,
statsLoading: false,
statsError: null,

createLoading: false,
createError: null,
lastCreatedId: null,
updateLoading: false,
updateError: null,
deleteLoading: false,
deleteError: null,
}

// Helper function to safely extract data from API response (for multiple artworks)
const extractApiData = (response: any) => {
console.log("extractApiData - Full API Response Structure:", JSON.stringify(response, null, 2))

let artworks: Artwork[] = []
let pagination: PaginationMeta | null = null

if (response?.data) {
  if (response.data.data?.artworks) {
    artworks = response.data.data.artworks
    pagination = response.data.data.pagination
    console.log("extractApiData - Using nested structure: response.data.data.artworks")
  } else if (response.data.artworks) {
    artworks = response.data.artworks
    pagination = response.data.pagination
    console.log("extractApiData - Using direct structure: response.data.artworks")
  } else if (Array.isArray(response.data)) {
    artworks = response.data
    console.log("extractApiData - Using array structure: response.data")
  }
}

if (!Array.isArray(artworks)) {
  console.warn("extractApiData - Artworks is not an array, defaulting to empty array")
  artworks = []
}

return { artworks, pagination }
}

// Helper function to safely extract single artwork from API response
const extractSingleArtwork = (response: any): Artwork | null => {
console.log("extractSingleArtwork - Full API Response Structure:", JSON.stringify(response, null, 2))

if (!response?.data) {
  console.error("extractSingleArtwork - No data in response")
  return null
}

let artwork: Artwork | null = null

if (response.data.data && response.data.data.artwork) {
  artwork = response.data.data.artwork
  console.log("extractSingleArtwork - Using nested structure: response.data.data.artwork")
} else if (response.data.artwork) {
  artwork = response.data.artwork
  console.log("extractSingleArtwork - Using direct structure: response.data.artwork")
} else if (response.data && typeof response.data === "object" && response.data._id) {
  artwork = response.data
  console.log("extractSingleArtwork - Using direct artwork structure: response.data")
} else if (response.data.artworks && Array.isArray(response.data.artworks) && response.data.artworks.length > 0) {
  artwork = response.data.artworks[0]
  console.log("extractSingleArtwork - Using first artwork from artworks array")
}

if (!artwork) {
  console.error("extractSingleArtwork - Could not extract artwork from response structure")
  console.error("extractSingleArtwork - Available keys in response.data:", Object.keys(response.data || {}))
  return null
}

if (!artwork._id) {
  console.error("extractSingleArtwork - Invalid artwork object - missing _id:", artwork)
  return null
}

return artwork
}

function extractCreatedArtwork(response: any): Artwork | null {
try {
  const data = response?.data ?? response
  if (!data) return null

  // Common shapes
  if (data.data?.artwork && typeof data.data.artwork === "object") {
    return data.data.artwork as Artwork
  }
  if (data.artwork && typeof data.artwork === "object") {
    return data.artwork as Artwork
  }
  // Sometimes APIs return the created object directly under "data"
  if (data.data && typeof data.data === "object" && (data.data._id || data.data.id)) {
    return data.data as Artwork
  }
  // Or return the created object as the root payload
  if (data._id || data.id) {
    return data as Artwork
  }
  return null
} catch {
  return null
}
}

// Async thunks
export const fetchArtworks = createAsyncThunk(
"artwork/fetchArtworks",
async (filters: ArtworkFilters = {}, { rejectWithValue }) => {
  try {
    const response = await artworkApi.getArtworks(filters)
    if (!response) throw new Error("No response received from API")
    const { artworks, pagination } = extractApiData(response)
    return { artworks, pagination, filters }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch artworks"
    return rejectWithValue(errorMessage)
  }
},
)

export const fetchArtwork = createAsyncThunk("artwork/fetchArtwork", async (id: string, { rejectWithValue }) => {
try {
  const response = await artworkApi.getArtwork(id)
  if (!response) throw new Error("No response received from API")
  const artwork = extractSingleArtwork(response)
  if (!artwork) throw new Error("Could not extract artwork from API response")
  return artwork
} catch (error: any) {
  const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch artwork"
  return rejectWithValue(errorMessage)
}
})

export const searchArtworks = createAsyncThunk(
"artwork/searchArtworks",
async ({ query, filters }: { query: string; filters?: Omit<ArtworkFilters, "search"> }, { rejectWithValue }) => {
  try {
    const response = await artworkApi.searchArtworks(query, filters)
    if (!response) throw new Error("No response received")
    const { artworks, pagination } = extractApiData(response)
    return { artworks, pagination, query, filters }
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to search artworks")
  }
},
)

export const fetchArtworksByArtist = createAsyncThunk(
"artwork/fetchArtworksByArtist",
async ({ artistId, filters }: { artistId: string; filters?: ArtworkFilters }, { rejectWithValue }) => {
  try {
    const response = await artworkApi.getArtworksByArtist(artistId, filters)
    if (!response) throw new Error("No response received")
    const { artworks, pagination } = extractApiData(response)
    return { artworks, pagination }
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to fetch artist artworks")
  }
},
)

export const fetchMyArtworks = createAsyncThunk(
"artwork/fetchMyArtworks",
async (filters: ArtworkFilters = {}, { rejectWithValue }) => {
  try {
    const response = await artworkApi.getMyArtworks(filters)
    if (!response) throw new Error("No response received")
    const { artworks, pagination } = extractApiData(response)
    return { artworks, pagination, filters }
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to fetch my artworks")
  }
},
)

export const createArtwork = createAsyncThunk(
"artwork/createArtwork",
async (formData: FormData, { rejectWithValue }) => {
  try {
    const res = await artworkApi.createArtwork(formData)
    const artwork = extractCreatedArtwork(res)
    if (artwork) {
      return artwork as { _id?: string; id?: string }
    }

    const payload = res?.data
    const isOkStatus = typeof res?.status === "number" && res.status >= 200 && res.status < 300
    const isOkFlag = payload?.status === "success" || payload?.success === true

    if (isOkStatus || isOkFlag) {
      // Return whatever best resembles an artwork so unwrap() resolves.
      const fallback =
        payload?.data?.artwork ??
        payload?.artwork ??
        payload?.data ??
        {}
      return fallback as { _id?: string; id?: string }
    }

    return rejectWithValue(payload?.message || "Failed to create artwork")
  } catch (err: any) {
    // Prefer server-provided message if available (Axios error shape)
    const serverMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message
    return rejectWithValue(serverMessage || "Failed to create artwork")
  }
},
)

export const updateArtwork = createAsyncThunk(
"artwork/updateArtwork",
async ({ id, updateData }: { id: string; updateData: UpdateArtworkData }, { rejectWithValue }) => {
  try {
    const response = await artworkApi.updateArtwork(id, updateData)
    if (!response?.data) throw new Error("No data received")
    return response.data.data.artwork
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to update artwork")
  }
},
)

export const deleteArtwork = createAsyncThunk("artwork/deleteArtwork", async (id: string, { rejectWithValue }) => {
try {
  await artworkApi.deleteArtwork(id)
  return id
} catch (error: any) {
  return rejectWithValue(error?.response?.data?.message || "Failed to delete artwork")
}
})

export const fetchArtworkStats = createAsyncThunk("artwork/fetchArtworkStats", async (_, { rejectWithValue }) => {
try {
  const response = await artworkApi.getArtworkStats()
  if (!response?.data) throw new Error("No data received")
  return response.data.data.stats
} catch (error: any) {
  return rejectWithValue(error?.response?.data?.message || "Failed to fetch artwork stats")
}
})

const artworkSlice = createSlice({
name: "artwork",
initialState,
reducers: {
  clearArtworkError: (state) => {
    state.artworksError = null
    state.currentArtworkError = null
    state.myArtworksError = null
    state.searchError = null
    state.artistArtworksError = null
    state.statsError = null
    state.createError = null
    state.updateError = null
    state.deleteError = null
  },
  updateArtworksFilters: (state, action: PayloadAction<ArtworkFilters>) => {
    state.artworksFilters = { ...state.artworksFilters, ...action.payload }
  },
  updateMyArtworksFilters: (state, action: PayloadAction<ArtworkFilters>) => {
    state.myArtworksFilters = { ...state.myArtworksFilters, ...action.payload }
  },
  clearCurrentArtwork: (state) => {
    state.currentArtwork = null
  },
  clearSearchResults: (state) => {
    state.searchResults = []
    state.searchPagination = null
    state.searchQuery = ""
  },
},
extraReducers: (builder) => {
  builder
    .addCase(fetchArtworks.pending, (state) => {
      state.artworksLoading = true
      state.artworksError = null
    })
    .addCase(fetchArtworks.fulfilled, (state, action) => {
      state.artworksLoading = false
      if (action.payload.filters.page && action.payload.filters.page > 1) {
        state.artworks = [...state.artworks, ...action.payload.artworks]
      } else {
        state.artworks = action.payload.artworks
      }
      state.artworksPagination = action.payload.pagination
      state.artworksFilters = action.payload.filters
    })
    .addCase(fetchArtworks.rejected, (state, action) => {
      state.artworksLoading = false
      state.artworksError = action.payload as string
    })

    .addCase(fetchArtwork.pending, (state) => {
      state.currentArtworkLoading = true
      state.currentArtworkError = null
    })
    .addCase(fetchArtwork.fulfilled, (state, action) => {
      state.currentArtworkLoading = false
      state.currentArtwork = action.payload
    })
    .addCase(fetchArtwork.rejected, (state, action) => {
      state.currentArtworkLoading = false
      state.currentArtworkError = action.payload as string
    })

    .addCase(searchArtworks.pending, (state) => {
      state.searchLoading = true
      state.searchError = null
    })
    .addCase(searchArtworks.fulfilled, (state, action) => {
      state.searchLoading = false
      state.searchResults = action.payload.artworks
      state.searchPagination = action.payload.pagination
      state.searchQuery = action.payload.query
    })
    .addCase(searchArtworks.rejected, (state, action) => {
      state.searchLoading = false
      state.searchError = action.payload as string
    })

    .addCase(fetchArtworksByArtist.pending, (state) => {
      state.artistArtworksLoading = true
      state.artistArtworksError = null
    })
    .addCase(fetchArtworksByArtist.fulfilled, (state, action) => {
      state.artistArtworksLoading = false
      state.artistArtworks = action.payload.artworks
      state.artistArtworksPagination = action.payload.pagination
    })
    .addCase(fetchArtworksByArtist.rejected, (state, action) => {
      state.artistArtworksLoading = false
      state.artistArtworksError = action.payload as string
    })

    .addCase(fetchMyArtworks.pending, (state) => {
      state.myArtworksLoading = true
      state.myArtworksError = null
    })
    .addCase(fetchMyArtworks.fulfilled, (state, action) => {
      state.myArtworksLoading = false
      state.myArtworks = Array.isArray(action.payload.artworks) ? action.payload.artworks : []
      state.myArtworksPagination = action.payload.pagination
      state.myArtworksFilters = action.payload.filters
    })
    .addCase(fetchMyArtworks.rejected, (state, action) => {
      state.myArtworksLoading = false
      state.myArtworksError = action.payload as string
    })

    .addCase(createArtwork.pending, (state) => {
      state.createLoading = true
      state.createError = null
      state.lastCreatedId = null
    })
    .addCase(createArtwork.fulfilled, (state, action) => {
      state.createLoading = false
      state.createError = null
      state.lastCreatedId = (action.payload as any)?._id || (action.payload as any)?.id || null
      // Put newest on top
      state.myArtworks.unshift(action.payload as any)
    })
    .addCase(createArtwork.rejected, (state, action) => {
      state.createLoading = false
      state.createError = (action.payload as string) || "Failed to create artwork"
    })

    .addCase(updateArtwork.pending, (state) => {
      state.updateLoading = true
      state.updateError = null
    })
    .addCase(updateArtwork.fulfilled, (state, action) => {
      state.updateLoading = false
      const index = state.myArtworks.findIndex((artwork) => artwork._id === (action.payload as any)._id)
      if (index !== -1) state.myArtworks[index] = action.payload as any
      if (state.currentArtwork?._id === (action.payload as any)._id) state.currentArtwork = action.payload as any
    })
    .addCase(updateArtwork.rejected, (state, action) => {
      state.updateLoading = false
      state.updateError = action.payload as string
    })

    .addCase(deleteArtwork.pending, (state) => {
      state.deleteLoading = true
      state.deleteError = null
    })
    .addCase(deleteArtwork.fulfilled, (state, action) => {
      state.deleteLoading = false
      state.myArtworks = state.myArtworks.filter((artwork) => artwork._id !== action.payload)
    })
    .addCase(deleteArtwork.rejected, (state, action) => {
      state.deleteLoading = false
      state.deleteError = action.payload as string
    })

    .addCase(fetchArtworkStats.pending, (state) => {
      state.statsLoading = true
      state.statsError = null
    })
    .addCase(fetchArtworkStats.fulfilled, (state, action) => {
      state.statsLoading = false
      state.stats = action.payload as any
    })
    .addCase(fetchArtworkStats.rejected, (state, action) => {
      state.statsLoading = false
      state.statsError = action.payload as string
    })
},
})

export const {
clearArtworkError,
updateArtworksFilters,
updateMyArtworksFilters,
clearCurrentArtwork,
clearSearchResults,
} = artworkSlice.actions

export default artworkSlice.reducer
