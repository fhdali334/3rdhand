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
      instagram?: string
      twitter?: string
    }
  }
  artistProfile?: {
    _id: string
    userId: string
    bio: string
    portfolioImages: string[]
    verified: boolean
    totalSales: number
    specialties: string[]
    joinedAt: string
    rating: {
      average: number
      count: number
    }
    createdAt: string
    updatedAt: string
  }
  artworks?: Artwork[]
  credits: number
  createdAt: string
  lastActive?: string
}

export interface Artwork {
  _id: string
  id: string
  title: string
  description: string
  price: number
  images: string[]
  artist:
    | string
    | {
        _id: string
        username: string
        profile?: {
          bio?: string
          website?: string
          socialLinks?: {
            instagram?: string
            twitter?: string
            facebook?: string
          }
        }
      }
  status: "pending" | "approved" | "rejected"
  currentOwner: string
  tags: string[]
  medium: string
  year: number
  isOriginal: boolean
  dimensions: {
    width: number
    height: number
    unit: string
  }
  edition?: {
    number: number
    total: number
  }
  createdAt: string
  updatedAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  soldAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  role: "artist" | "buyer"
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

export interface UpdateProfileRequest {
  profile: {
    bio?: string
    website?: string
    socialLinks?: {
      facebook?: string
      instagram?: string
      twitter?: string
    }
  }
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface RegisterResponse {
  user: User
  message: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
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
