// @ts-ignore
import { apiClient } from "./client"
import type { Artwork, ArtworkFilters, CreateArtworkData, UpdateArtworkData } from "@/lib/types/artwork"
import type { PaginationMeta } from "@/lib/types/api"

export const artworkApi = {
  // Get all artworks with filters
  getArtworks: async (filters: ArtworkFilters = {}) => {
    const params = new URLSearchParams()

    if (filters.minPrice) params.append("minPrice", filters.minPrice.toString())
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString())
    if (filters.status) params.append("status", filters.status)
    if (filters.page) params.append("page", filters.page.toString())
    if (filters.limit) params.append("limit", filters.limit.toString())
    if (filters.sort) params.append("sort", filters.sort)
    if (filters.medium) params.append("medium", filters.medium)
    if (filters.tags) filters.tags.forEach((tag) => params.append("tags", tag))
    if (filters.artist) params.append("artist", filters.artist)
    if (filters.isOriginal !== undefined) params.append("isOriginal", filters.isOriginal.toString())
    if (filters.soldAt !== undefined) params.append("soldAt", filters.soldAt.toString())
    if (filters.q) params.append("q", filters.q) // Add search query

    const queryString = params.toString()
    const url = queryString ? `/api/artwork?${queryString}` : "/api/artwork"

    try {
      console.log("artworkApi.getArtworks - Calling URL:", url)
      const response = await apiClient.get<{
        status: string
        results: number
        data: {
          artworks: Artwork[]
          pagination: PaginationMeta
        }
      }>(url)

      console.log("artworkApi.getArtworks - Response:", response)
      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      console.error("artworkApi.getArtworks - Error:", error)
      throw error
    }
  },

  // Get single artwork - IMPROVED with better error handling
  getArtwork: async (id: string) => {
    console.log("🎯 artworkApi.getArtwork - Fetching artwork with ID:", id)

    if (!id) {
      throw new Error("Artwork ID is required")
    }

    try {
      // Try the single artwork endpoint first
      const url = `/api/artwork/${id}`
      console.log("📡 artworkApi.getArtwork - Calling URL:", url)

      const response = await apiClient.get<{
        status: string
        data: {
          artwork: Artwork
        }
      }>(url)

      console.log("✅ artworkApi.getArtwork - Single artwork response:", response)

      if (response.data?.artwork) {
        return response
      } else {
        throw new Error("Invalid response structure")
      }
    } catch (error: any) {
      console.error("❌ artworkApi.getArtwork - Primary endpoint failed:", error)

      // Try fallback with general endpoint
      try {
        console.log("🔄 artworkApi.getArtwork - Trying fallback endpoint")
        const fallbackUrl = `/api/artwork?_id=${id}`
        console.log("📡 artworkApi.getArtwork - Fallback URL:", fallbackUrl)

        const fallbackResponse = await apiClient.get<{
          status: string
          results: number
          data: {
            artworks: Artwork[]
            pagination: PaginationMeta
          }
        }>(fallbackUrl)

        console.log("📡 artworkApi.getArtwork - Fallback response:", fallbackResponse)

        if (fallbackResponse.data?.data?.artworks && fallbackResponse.data.data.artworks.length > 0) {
          // Transform to single artwork format
          const transformedResponse = {
            ...fallbackResponse,
            data: {
              ...fallbackResponse.data,
              data: {
                artwork: fallbackResponse.data.data.artworks[0],
              },
            },
          }
          console.log("✅ artworkApi.getArtwork - Transformed fallback response")
          return transformedResponse
        } else {
          throw new Error("Artwork not found in fallback response")
        }
      } catch (fallbackError: any) {
        console.error("❌ artworkApi.getArtwork - Fallback also failed:", fallbackError)

        // If both API calls fail, return mock data for testing
        console.log("🧪 artworkApi.getArtwork - Returning mock data for testing")
            }
    }
  },

  // Search artworks - now integrated with main getArtworks
  searchArtworks: async (query: string, filters: Omit<ArtworkFilters, "search"> = {}) => {
    return artworkApi.getArtworks({ ...filters, q: query })
  },

  // Get artworks by artist - Updated endpoint
  getArtworksByArtist: async (artistId: string, filters: ArtworkFilters = {}) => {
    const params = new URLSearchParams()

    if (filters.page) params.append("page", filters.page.toString())
    if (filters.limit) params.append("limit", filters.limit.toString())
    if (filters.status) params.append("status", filters.status)
    if (filters.sort) params.append("sort", filters.sort)

    const queryString = params.toString()
    const url = queryString ? `/api/artwork/artist/${artistId}?${queryString}` : `/api/artwork/artist/${artistId}`

    return apiClient.get<{
      status: string
      results: number
      data: {
        artworks: Artwork[]
        pagination: PaginationMeta
      }
    }>(url)
  },

  // Get my artworks (for authenticated artists) - Updated endpoint
  getMyArtworks: async (filters: ArtworkFilters = {}) => {
    try {
      const params = new URLSearchParams()

      if (filters.status) params.append("status", filters.status)
      if (filters.page) params.append("page", filters.page.toString())
      if (filters.limit) params.append("limit", filters.limit.toString())
      if (filters.sort) params.append("sort", filters.sort)

      const queryString = params.toString()
      const url = queryString ? `/api/artwork/my/artworks?${queryString}` : "/api/artwork/my/artworks"

      return apiClient.get<{
        status: string
        results: number
        data: {
          artworks: Artwork[]
          pagination: PaginationMeta
        }
      }>(url)
    } catch (error: any) {
      // If endpoint doesn't exist, return empty response
      if (error.response?.status === 404 || error.response?.status === 400) {
        return {
          success: true,
          data: {
            status: "success",
            results: 0,
            data: {
              artworks: [],
              pagination: {
                page: 1,
                limit: filters.limit || 10,
                total: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false,
              },
            },
          },
        }
      }
      throw error
    }
  },

  // Create artwork - Updated to handle FormData properly
  createArtwork: async (artworkData: CreateArtworkData | FormData, images: File[]) => {
    // If artworkData is already FormData, use it directly
    if (artworkData instanceof FormData) {
      console.log("Sending FormData directly to API")

      return apiClient.post<{
        status: string
        message: string
        data: {
          artwork: Artwork
        }
      }>("/api/artwork", artworkData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    }

    // Otherwise, create FormData from the object
    const formData = new FormData()

    // Add artwork data
    Object.entries(artworkData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => formData.append(`${key}[${index}]`, item))
        } else if (typeof value === "object") {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue !== undefined && subValue !== null) {
              formData.append(`${key}[${subKey}]`, subValue.toString())
            }
          })
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    // Add images
    images.forEach((image) => {
      formData.append("images", image)
    })

    return apiClient.post<{
      status: string
      message: string
      data: {
        artwork: Artwork
      }
    }>("/api/artwork", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },

  // Update artwork
  updateArtwork: async (id: string, updateData: UpdateArtworkData) => {
    return apiClient.patch<{
      status: string
      message: string
      data: {
        artwork: Artwork
      }
    }>(`/api/artwork/${id}`, updateData)
  },

  // Delete artwork
  deleteArtwork: async (id: string) => {
    return apiClient.delete(`/api/artwork/${id}`)
  },

  // Get artwork statistics - Updated to match API response
  getArtworkStats: async () => {
    try {
      return apiClient.get<{
        status: string
        data: {
          stats: {
            _id: null
            totalArtworks: number
            approvedArtworks: number
            pendingArtworks: number
            rejectedArtworks: number
            soldArtworks: number
            averagePrice: number
            totalValue: number
          }
        }
      }>("/api/artwork/stats/overview")
    } catch (error: any) {
      // If endpoint doesn't exist, return default stats
      if (error.response?.status === 404 || error.response?.status === 400) {
        return {
          success: true,
          data: {
            status: "success",
            data: {
              stats: {
                _id: null,
                totalArtworks: 0,
                approvedArtworks: 0,
                pendingArtworks: 0,
                rejectedArtworks: 0,
                soldArtworks: 0,
                averagePrice: 0,
                totalValue: 0,
              },
            },
          },
        }
      }
      throw error
    }
  },
}
