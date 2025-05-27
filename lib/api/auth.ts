import { apiClient } from "./client"
import type {
  ApiResponse,
  AuthResponse,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
  User,
} from "@/lib/types/auth"

export const authApi = {
  // Register new user
  register: (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> =>
    apiClient.post("/api/auth/register", data),

  // Verify OTP
  verifyOtp: (data: VerifyOtpRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post("/api/auth/verify-otp", data),

  // Resend OTP
  resendOtp: (data: ResendOtpRequest): Promise<ApiResponse> => apiClient.post("/api/auth/resend-otp", data),

  // Login user
  login: (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => apiClient.post("/api/auth/login", data),

  // Get current user
  getCurrentUser: (): Promise<ApiResponse<{ user: User }>> => apiClient.get("/api/auth/me"),

  // Update profile
  updateProfile: (data: UpdateProfileRequest): Promise<ApiResponse<{ user: User }>> =>
    apiClient.patch("/api/auth/update-profile", data),

  // Forgot password
  forgotPassword: (data: ForgotPasswordRequest): Promise<ApiResponse> =>
    apiClient.post("/api/auth/forgot-password", data),

  // Reset password with token from URL
  resetPassword: (token: string, data: ResetPasswordRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post(`/api/auth/reset-password/${token}`, data),

  // Update password (for logged in users)
  updatePassword: (data: UpdatePasswordRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.patch("/api/auth/update-password", data),

  // Logout
  logout: (): Promise<ApiResponse> => apiClient.post("/api/auth/logout"),
}
