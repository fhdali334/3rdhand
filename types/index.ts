// User types
export interface User {
  _id: string
  username: string
  email: string
  role: "artist" | "buyer" | "admin"
  credits: number
  profile: {
    bio?: string
    website?: string
    socialLinks?: {
      facebook?: string
      twitter?: string
      instagram?: string
    }
  }
  isVerified: boolean
  createdAt: string
  lastActive: string
}

// Artist Profile types
export interface ArtistProfile {
  _id: string
  userId: string
  bio?: string
  website?: string
  socialLinks: {
    facebook?: string
    twitter?: string
    instagram?: string
    pinterest?: string
  }
  portfolioImages: string[]
  verified: boolean
  totalSales: number
  rating: {
    average: number
    count: number
  }
  specialties: string[]
  joinedAt: string
  featuredArtwork?: string
}

// Artwork types
export interface Artwork {
  _id: string
  title: string
  description: string
  price: number
  images: string[]
  artist: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  approvedAt?: string
  soldAt?: string
  currentOwner: string
  tags: string[]
  medium?: string
  dimensions: {
    width?: number
    height?: number
    unit: "cm" | "in"
  }
  year?: number
  isOriginal: boolean
  edition?: {
    number: number
    total: number
  }
}

// Message types
export interface Message {
  _id: string
  sender: string
  receiver: string
  content: string
  conversationId: string
  timestamp: string
  read: boolean
  attachments?: Array<{
    type: string
    url: string
  }>
}

// Transaction types
export interface Transaction {
  _id: string
  buyer?: string
  seller: string
  artwork: string
  amount: number
  paymentIntent: string
  status: "pending" | "completed" | "failed" | "refunded"
  transactionType: "listing_fee" | "sale"
  timestamp: string
  metadata: {
    stripe_payment_id?: string
    receipt_url?: string
    payment_method?: string
    additional_info?: any
  }
}

// Traceability types
export interface TraceabilityRecord {
  _id: string
  artworkId: string
  fromUserId: string
  toUserId: string
  transactionType: "created" | "sold" | "transferred"
  timestamp: string
  transactionHash: string
  additionalData: {
    price?: number
    location?: string
    notes?: string
    condition?: string
    certificate?: any
  }
}

// Listing Payment types
export interface ListingPayment {
  _id: string
  artist: string
  artwork: string
  paymentIntent: string
  amount: number
  status: "pending" | "completed" | "failed"
  createdAt: string
  paidAt?: string
}
