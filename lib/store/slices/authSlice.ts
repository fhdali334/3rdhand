import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { authApi } from "@/lib/api/auth"
import type {
  AuthState,
  RegisterRequest,
  LoginRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
} from "@/lib/types/auth"

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

// Load initial state from localStorage if available
const loadInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("auth_token")
      const refreshToken = localStorage.getItem("refresh_token")
      const user = localStorage.getItem("user")

      if (token && user) {
        return {
          ...initialState,
          token,
          refreshToken,
          user: JSON.parse(user),
          isAuthenticated: true,
        }
      }
    } catch (error) {
      console.error("Error loading auth state from localStorage:", error)
    }
  }
  return initialState
}

// Async thunks
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData)
      return { ...response.data, email: userData.email }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.errors?.[0] || "Registration failed",
      )
    }
  },
)

export const verifyOtp = createAsyncThunk("auth/verifyOtp", async (otpData: VerifyOtpRequest, { rejectWithValue }) => {
  try {
    const response = await authApi.verifyOtp(otpData)
    return response.data
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.response?.data?.errors?.[0] || "OTP verification failed",
    )
  }
})

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (emailData: ResendOtpRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.resendOtp(emailData)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.errors?.[0] || "Failed to resend OTP",
      )
    }
  },
)

export const loginUser = createAsyncThunk("auth/login", async (credentials: LoginRequest, { rejectWithValue }) => {
  try {
    const response = await authApi.login(credentials)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.response?.data?.errors?.[0] || "Login failed")
  }
})

export const getCurrentUser = createAsyncThunk("auth/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.getCurrentUser()
    return response.data
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.response?.data?.errors?.[0] || "Failed to get user data",
    )
  }
})

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(profileData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.errors?.[0] || "Profile update failed",
      )
    }
  },
)

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (emailData: ForgotPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(emailData)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.errors?.[0] || "Failed to send reset email",
      )
    }
  },
)

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, ...passwordData }: ResetPasswordRequest & { token: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(token, passwordData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.errors?.[0] || "Password reset failed",
      )
    }
  },
)

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (passwordData: UpdatePasswordRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.updatePassword(passwordData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.errors?.[0] || "Password update failed",
      )
    }
  },
)

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await authApi.logout()
    return true
  } catch (error: any) {
    // Even if API call fails, we should clear local storage
    return true
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState: loadInitialState(),
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
      state.isVerificationRequired = false
      state.verificationEmail = null
      state.registrationData = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")
      }
    },
    clearVerificationState: (state) => {
      state.isVerificationRequired = false
      state.verificationEmail = null
      state.registrationData = null
    },
    setVerificationRequired: (state, action: PayloadAction<{ email: string; registrationData: any }>) => {
      state.isVerificationRequired = true
      state.verificationEmail = action.payload.email
      state.registrationData = action.payload.registrationData
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user))
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isVerificationRequired = true
        state.verificationEmail = action.payload.email
        state.registrationData = action.payload.user
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
        const { token, refreshToken, user } = action.payload
        state.token = token
        state.refreshToken = refreshToken
        state.user = user
        state.isAuthenticated = true
        state.isVerificationRequired = false
        state.verificationEmail = null
        state.registrationData = null
        state.error = null

        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token)
          localStorage.setItem("refresh_token", refreshToken)
          localStorage.setItem("user", JSON.stringify(user))
        }
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

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        const { token, refreshToken, user } = action.payload
        state.token = token
        state.refreshToken = refreshToken
        state.user = user
        state.isAuthenticated = true
        state.error = null

        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token)
          localStorage.setItem("refresh_token", refreshToken)
          localStorage.setItem("user", JSON.stringify(user))
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(action.payload.user))
        }
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // Don't clear auth state on getCurrentUser failure - token might still be valid
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.error = null

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(action.payload.user))
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Forgot Password
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

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false
        const { token, refreshToken, user } = action.payload
        state.token = token
        state.refreshToken = refreshToken
        state.user = user
        state.isAuthenticated = true
        state.error = null

        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token)
          localStorage.setItem("refresh_token", refreshToken)
          localStorage.setItem("user", JSON.stringify(user))
        }
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.isLoading = false
        const { token, refreshToken } = action.payload
        state.token = token
        state.refreshToken = refreshToken
        state.error = null

        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token)
          localStorage.setItem("refresh_token", refreshToken)
        }
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
        state.isVerificationRequired = false
        state.verificationEmail = null
        state.registrationData = null

        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("refresh_token")
          localStorage.removeItem("user")
        }
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // Even if logout API fails, clear local state
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.isVerificationRequired = false
        state.verificationEmail = null
        state.registrationData = null

        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("refresh_token")
          localStorage.removeItem("user")
        }
      })
  },
})

export const { clearError, clearAuth, clearVerificationState, setVerificationRequired, updateUserProfile } =
  authSlice.actions
export default authSlice.reducer
