import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"
import type { ApiResponse } from "@/lib/types/auth"

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.3rdhand.be"

console.log("🔗 API Base URL:", baseURL)

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
      withCredentials: false,
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)

        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token")
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
            console.log("🔐 Auth token added to request")
          } else {
            console.log("⚠️ No auth token found")
          }
        }
        return config
      },
      (error) => {
        console.error("❌ Request interceptor error:", error)
        return Promise.reject(error)
      },
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`)
        console.log("📦 Response data:", response.data)
        return response
      },
      (error) => {
        console.error("❌ API Error:", error)

        // Handle CORS errors specifically
        if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
          console.error("🚫 Network/CORS Error:", error.message)
          return Promise.reject(new Error("Unable to connect to server. Please check your connection."))
        }

        // Handle specific HTTP errors
        if (error.response) {
          console.error(`🔴 HTTP Error ${error.response.status}:`, error.response.data)

          // Only handle 401 errors for specific endpoints, not all requests
          if (error.response.status === 401) {
            const url = error.config?.url || ""

            // Only redirect on auth-specific endpoints or critical user data endpoints
            if (url.includes("/auth/me") || url.includes("/auth/") || url.includes("/profile")) {
              if (typeof window !== "undefined") {
                localStorage.removeItem("token")
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("user")

                // Only redirect if not already on auth pages
                if (!window.location.pathname.startsWith("/auth")) {
                  window.location.href = "/auth/login"
                }
              }
            }
          }
        }

        return Promise.reject(error)
      },
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config)
      return response.data
    } catch (error: any) {
      console.error("GET request failed:", error)
      throw error
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      console.error("POST request failed:", error)
      throw error
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      console.error("PUT request failed:", error)
      throw error
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      console.error("PATCH request failed:", error)
      throw error
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config)
      return response.data
    } catch (error: any) {
      console.error("DELETE request failed:", error)
      throw error
    }
  }
}

export const apiClient = new ApiClient()
