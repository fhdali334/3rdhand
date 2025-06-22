import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { artworkApi } from "@/lib/api/artwork"
import type { Artwork, ArtworkFilters, CreateArtworkData, UpdateArtworkData, ArtworkStats } from "@/lib/types/artwork"
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
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
}

// Helper function to safely extract data from API response (for multiple artworks)
const extractApiData = (response: any) => {
  console.log("extractApiData - Full API Response Structure:", JSON.stringify(response, null, 2))

  // Handle different possible response structures
  let artworks: Artwork[] = []
  let pagination: PaginationMeta | null = null

  if (response?.data) {
    // Case 1: response.data.data.artworks (nested structure)
    if (response.data.data?.artworks) {
      artworks = response.data.data.artworks
      pagination = response.data.data.pagination
      console.log("extractApiData - Using nested structure: response.data.data.artworks")
    }
    // Case 2: response.data.artworks (direct structure)
    else if (response.data.artworks) {
      artworks = response.data.artworks
      pagination = response.data.pagination
      console.log("extractApiData - Using direct structure: response.data.artworks")
    }
    // Case 3: response.data is array (direct array)
    else if (Array.isArray(response.data)) {
      artworks = response.data
      console.log("extractApiData - Using array structure: response.data")
    }
  }

  // Ensure artworks is always an array
  if (!Array.isArray(artworks)) {
    console.warn("extractApiData - Artworks is not an array, defaulting to empty array")
    artworks = []
  }

  console.log("extractApiData - Final extracted artworks:", artworks)
  console.log("extractApiData - Final extracted pagination:", pagination)

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

  // Case 1: response.data.data.artwork (nested structure)
  if (response.data.data && response.data.data.artwork) {
    artwork = response.data.data.artwork
    console.log("extractSingleArtwork - Using nested structure: response.data.data.artwork")
  }
  // Case 2: response.data.artwork (direct structure with artwork property)
  else if (response.data.artwork) {
    artwork = response.data.artwork
    console.log("extractSingleArtwork - Using direct structure: response.data.artwork")
  }
  // Case 3: response.data is the artwork object directly (has artwork properties)
  else if (response.data && typeof response.data === "object" && response.data._id) {
    artwork = response.data
    console.log("extractSingleArtwork - Using direct artwork structure: response.data")
  }
  // Case 4: Check if it's in the same structure as multiple artworks but just one item
  else if (response.data.artworks && Array.isArray(response.data.artworks) && response.data.artworks.length > 0) {
    artwork = response.data.artworks[0] // Take the first artwork from the array
    console.log("extractSingleArtwork - Using first artwork from artworks array")
  }

  if (!artwork) {
    console.error("extractSingleArtwork - Could not extract artwork from response structure")
    console.error("extractSingleArtwork - Available keys in response.data:", Object.keys(response.data || {}))
    return null
  }

  // Validate that we have a proper artwork object
  if (!artwork._id) {
    console.error("extractSingleArtwork - Invalid artwork object - missing _id:", artwork)
    return null
  }

  console.log("extractSingleArtwork - Successfully extracted artwork:", artwork)
  return artwork
}

// Async thunks
export const fetchArtworks = createAsyncThunk(
  "artwork/fetchArtworks",
  async (filters: ArtworkFilters = {}, { rejectWithValue }) => {
    try {
      console.log("fetchArtworks - Fetching artworks with filters:", filters)
      const response = await artworkApi.getArtworks(filters)

      console.log("fetchArtworks - Raw API Response:", response)

      if (!response) {
        throw new Error("No response received from API")
      }

      // Extract data using helper function
      const { artworks, pagination } = extractApiData(response)

      return {
        artworks,
        pagination,
        filters,
      }
    } catch (error: any) {
      console.error("fetchArtworks - Error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch artworks"
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchArtwork = createAsyncThunk("artwork/fetchArtwork", async (id: string, { rejectWithValue }) => {
  try {
    console.log("fetchArtwork - Fetching single artwork with ID:", id)
    const response = await artworkApi.getArtwork(id)

    console.log("fetchArtwork - Single artwork API response:", response)

    if (!response) {
      throw new Error("No response received from API")
    }

    // Use helper function to extract artwork
    const artwork = extractSingleArtwork(response)

    if (!artwork) {
      throw new Error("Could not extract artwork from API response")
    }

    console.log("fetchArtwork - Successfully extracted artwork:", artwork)
    return artwork
  } catch (error: any) {
    console.error("fetchArtwork - Error:", error)
    console.error("fetchArtwork - Error response:", error.response)
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch artwork"
    return rejectWithValue(errorMessage)
  }
})

export const searchArtworks = createAsyncThunk(
  "artwork/searchArtworks",
  async ({ query, filters }: { query: string; filters?: Omit<ArtworkFilters, "search"> }, { rejectWithValue }) => {
    try {
      const response = await artworkApi.searchArtworks(query, filters)
      if (!response) {
        throw new Error("No response received")
      }

      const { artworks, pagination } = extractApiData(response)

      return {
        artworks,
        pagination,
        query,
        filters,
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to search artworks")
    }
  },
)

export const fetchArtworksByArtist = createAsyncThunk(
  "artwork/fetchArtworksByArtist",
  async ({ artistId, filters }: { artistId: string; filters?: ArtworkFilters }, { rejectWithValue }) => {
    try {
      const response = await artworkApi.getArtworksByArtist(artistId, filters)
      if (!response) {
        throw new Error("No response received")
      }

      const { artworks, pagination } = extractApiData(response)

      return {
        artworks,
        pagination,
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch artist artworks")
    }
  },
)

export const fetchMyArtworks = createAsyncThunk(
  "artwork/fetchMyArtworks",
  async (filters: ArtworkFilters = {}, { rejectWithValue }) => {
    try {
      const response = await artworkApi.getMyArtworks(filters)
      if (!response) {
        throw new Error("No response received")
      }

      const { artworks, pagination } = extractApiData(response)

      return {
        artworks,
        pagination,
        filters,
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch my artworks")
    }
  },
)

export const createArtwork = createAsyncThunk(
  "artwork/createArtwork",
  async (
    { artworkData, images }: { artworkData: CreateArtworkData | FormData; images: File[] },
    { rejectWithValue },
  ) => {
    try {
      const response = await artworkApi.createArtwork(artworkData, images)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data.data.artwork
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create artwork")
    }
  },
)

export const updateArtwork = createAsyncThunk(
  "artwork/updateArtwork",
  async ({ id, updateData }: { id: string; updateData: UpdateArtworkData }, { rejectWithValue }) => {
    try {
      const response = await artworkApi.updateArtwork(id, updateData)
      if (!response.data) {
        throw new Error("No data received")
      }
      return response.data.data.artwork
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update artwork")
    }
  },
)

export const deleteArtwork = createAsyncThunk("artwork/deleteArtwork", async (id: string, { rejectWithValue }) => {
  try {
    await artworkApi.deleteArtwork(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete artwork")
  }
})

export const fetchArtworkStats = createAsyncThunk("artwork/fetchArtworkStats", async (_, { rejectWithValue }) => {
  try {
    const response = await artworkApi.getArtworkStats()
    if (!response.data) {
      throw new Error("No data received")
    }
    return response.data.data.stats
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch artwork stats")
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
      // Fetch Artworks
      .addCase(fetchArtworks.pending, (state) => {
        state.artworksLoading = true
        state.artworksError = null
      })
      .addCase(fetchArtworks.fulfilled, (state, action) => {
        state.artworksLoading = false

        // Handle pagination - append for load more, replace for new search
        if (action.payload.filters.page && action.payload.filters.page > 1) {
          // Load more - append to existing artworks
          state.artworks = [...state.artworks, ...action.payload.artworks]
        } else {
          // New search or initial load - replace artworks
          state.artworks = action.payload.artworks
        }

        state.artworksPagination = action.payload.pagination
        state.artworksFilters = action.payload.filters
      })
      .addCase(fetchArtworks.rejected, (state, action) => {
        state.artworksLoading = false
        state.artworksError = action.payload as string
      })

      // Fetch Single Artwork
      .addCase(fetchArtwork.pending, (state) => {
        state.currentArtworkLoading = true
        state.currentArtworkError = null
        console.log("fetchArtwork.pending - Starting to fetch artwork")
      })
      .addCase(fetchArtwork.fulfilled, (state, action) => {
        state.currentArtworkLoading = false
        state.currentArtwork = action.payload
        console.log("fetchArtwork.fulfilled - Successfully set current artwork:", action.payload)
      })
      .addCase(fetchArtwork.rejected, (state, action) => {
        state.currentArtworkLoading = false
        state.currentArtworkError = action.payload as string
        console.error("fetchArtwork.rejected - Error:", action.payload)
      })

      // Search Artworks
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

      // Fetch Artworks by Artist
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

      // Fetch My Artworks
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

      // Create Artwork
      .addCase(createArtwork.pending, (state) => {
        state.createLoading = true
        state.createError = null
      })
      .addCase(createArtwork.fulfilled, (state, action) => {
        state.createLoading = false
        state.myArtworks.unshift(action.payload)
      })
      .addCase(createArtwork.rejected, (state, action) => {
        state.createLoading = false
        state.createError = action.payload as string
      })

      // Update Artwork
      .addCase(updateArtwork.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
      })
      .addCase(updateArtwork.fulfilled, (state, action) => {
        state.updateLoading = false
        const index = state.myArtworks.findIndex((artwork) => artwork._id === action.payload._id)
        if (index !== -1) {
          state.myArtworks[index] = action.payload
        }
        if (state.currentArtwork?._id === action.payload._id) {
          state.currentArtwork = action.payload
        }
      })
      .addCase(updateArtwork.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = action.payload as string
      })

      // Delete Artwork
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

      // Fetch Stats
      .addCase(fetchArtworkStats.pending, (state) => {
        state.statsLoading = true
        state.statsError = null
      })
      .addCase(fetchArtworkStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload
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
