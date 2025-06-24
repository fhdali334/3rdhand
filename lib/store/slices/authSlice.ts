import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { authApi } from "@/lib/api/auth"
import type {
  LoginRequest,
  RegisterRequest,
  AuthState,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  UpdateProfileRequest,
  UpdatePasswordRequest,
} from "@/lib/types/auth"

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isVerificationRequired: false,
  verificationEmail: null,
  registrationData: null,
}

// Helper function to get initial state from localStorage (client-side only)
const getInitialAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return initialState
  }

  try {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    const refreshToken = localStorage.getItem("refreshToken")

    if (token && userStr) {
      const user = JSON.parse(userStr)
      return {
        ...initialState,
        user,
        token,
        refreshToken,
        isAuthenticated: true,
      }
    }
  } catch (error) {
    console.error("Error parsing auth state from localStorage:", error)
    // Clear corrupted data
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("refreshToken")
  }

  return initialState
}

// Async thunks
export const loginUser = createAsyncThunk("auth/login", async (credentials: LoginRequest, { rejectWithValue }) => {
  try {
    const response = await authApi.login(credentials)
    if (response.data) {
      // Store in localStorage
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("refreshToken", response.data.refreshToken)
      localStorage.setItem("user", JSON.stringify(response.data.user))
      return response.data
    }
    return rejectWithValue(response.message || "Login failed")
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Login failed")
  }
})

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData)
      if (response.data) {
        return response.data
      }
      return rejectWithValue(response.message || "Registration failed")
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Registration failed")
    }
  },
)

export const verifyOtp = createAsyncThunk("auth/verifyOtp", async (data: VerifyOtpRequest, { rejectWithValue }) => {
  try {
    const response = await authApi.verifyOtp(data)
    if (response.data) {
      // Store in localStorage
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("refreshToken", response.data.refreshToken)
      localStorage.setItem("user", JSON.stringify(response.data.user))
      return response.data
    }
    return rejectWithValue(response.message || "OTP verification failed")
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "OTP verification failed")
  }
})

export const resendOtp = createAsyncThunk("auth/resendOtp", async (data: ResendOtpRequest, { rejectWithValue }) => {
  try {
    const response = await authApi.resendOtp(data)
    return response.message || "OTP sent successfully"
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to resend OTP")
  }
})

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    // Clear localStorage immediately
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("refreshToken")

    // Try to call logout API, but don't fail if it doesn't work
    try {
      await authApi.logout()
    } catch (error) {
      console.warn("Logout API call failed, but continuing with local logout")
    }

    return null
  } catch (error: any) {
    return rejectWithValue(error.message || "Logout failed")
  }
})

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data: ForgotPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(data)
      return response.message || "Reset email sent"
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to send reset email")
    }
  },
)

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, data }: { token: string; data: ResetPasswordRequest }, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(token, data)
      if (response.data) {
        // Store in localStorage
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("refreshToken", response.data.refreshToken)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        return response.data
      }
      return rejectWithValue(response.message || "Failed to reset password")
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to reset password")
    }
  },
)

// Optional: Manual profile fetch (only when explicitly needed)
export const getCurrentUser = createAsyncThunk("auth/getCurrentUser", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as { auth: AuthState }
    if (!state.auth.token) {
      return rejectWithValue("No token available")
    }

    const response = await authApi.getCurrentUser()
    if (response.data) {
      // Update localStorage with fresh user data
      localStorage.setItem("user", JSON.stringify(response.data.user))
      return response.data.user
    }
    return rejectWithValue(response.message || "Failed to get user data")
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to get user data")
  }
})

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(data)
      if (response.data) {
        // Update localStorage with fresh user data
        localStorage.setItem("user", JSON.stringify(response.data.user))
        return response.data.user
      }
      return rejectWithValue(response.message || "Failed to update profile")
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile")
    }
  },
)

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (data: UpdatePasswordRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.updatePassword(data)
      return response.message || "Password updated successfully"
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update password")
    }
  },
)

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState: getInitialAuthState(),
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearVerificationState: (state) => {
      state.isVerificationRequired = false
      state.verificationEmail = null
      state.registrationData = null
    },
    initializeAuth: (state) => {
      // This will be called on app startup to restore auth state
      if (typeof window !== "undefined") {
        try {
          const token = localStorage.getItem("token")
          const userStr = localStorage.getItem("user")
          const refreshToken = localStorage.getItem("refreshToken")

          if (token && userStr) {
            const user = JSON.parse(userStr)
            state.user = user
            state.token = token
            state.refreshToken = refreshToken
            state.isAuthenticated = true
          }
        } catch (error) {
          console.error("Error initializing auth state:", error)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          localStorage.removeItem("refreshToken")
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.refreshToken = null
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.registrationData = action.payload
        state.isVerificationRequired = true
        state.verificationEmail = action.payload.user.email
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.isVerificationRequired = false
        state.verificationEmail = null
        state.registrationData = null
        state.error = null
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = null
        state.isVerificationRequired = false
        state.verificationEmail = null
        state.registrationData = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        // Even if logout fails, clear local state
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = action.payload as string
      })

      // Get current user (optional)
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        // Don't clear auth state on profile fetch failure
        state.error = action.payload as string
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Update password
      .addCase(updatePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearVerificationState, initializeAuth } = authSlice.actions
export default authSlice.reducer
