export interface User {
  id: string
  username: string
  email: string
  role: "artist" | "buyer" | "admin"
  isVerified: boolean
  profile?: {
    bio?: string
    website?: string
    avatar?: string
    socialLinks?: {
      facebook?: string
      twitter?: string
      instagram?: string
    }
  }
  credits?: number
  createdAt?: string
  lastActive?: string
  artistProfile?: {
    rating: {
      average: number
      count: number
    }
    _id: string
    userId: string
    bio: string
    portfolioImages: string[]
    verified: boolean
    totalSales: number
    specialties: string[]
    joinedAt: string
    createdAt: string
    updatedAt: string
    __v: number
    id: string
  }
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

export interface ApiResponse<T = any> {
  status: "success" | "error" | "fail"
  message: string
  data?: T
  errors?: string[]
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  role: "artist" | "buyer"
}

export interface RegisterResponse {
  user: {
    id: string
    username: string
    email: string
    role: string
    isVerified: boolean
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface ResendOtpRequest {
  email: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  password: string
  confirmPassword: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface UpdateProfileRequest {
  username?: string
  profile?: {
    bio?: string
    website?: string
    socialLinks?: {
      facebook?: string
      twitter?: string
      instagram?: string
    }
  }
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isVerificationRequired: boolean
  verificationEmail: string | null
  registrationData: RegisterResponse | null
}
