import type { User, ArtistProfile, Artwork, Message, Transaction, TraceabilityRecord } from "@/types"

// Mock Users
export const mockUsers: User[] = [
  {
    _id: "1",
    username: "emmajohnson",
    email: "emma@example.com",
    role: "artist",
    credits: 5,
    profile: {
      bio: "Contemporary painter specializing in abstract landscapes",
      website: "https://emmajohnson.art",
      socialLinks: {
        instagram: "@emmajohnson_art",
        facebook: "emmajohnsonart",
      },
    },
    isVerified: true,
    createdAt: "2024-01-15T10:00:00Z",
    lastActive: "2024-01-20T15:30:00Z",
  },
  {
    _id: "2",
    username: "michaelchen",
    email: "michael@example.com",
    role: "artist",
    credits: 3,
    profile: {
      bio: "Digital artist creating surreal portraits and dreamscapes",
      website: "https://michaelchen.digital",
      socialLinks: {
        instagram: "@michael_digital_art",
        twitter: "@michaelchen_art",
      },
    },
    isVerified: true,
    createdAt: "2024-01-10T08:00:00Z",
    lastActive: "2024-01-20T12:00:00Z",
  },
  {
    _id: "3",
    username: "admin",
    email: "admin@3rdhand.com",
    role: "admin",
    credits: 0,
    profile: {
      bio: "Platform administrator",
    },
    isVerified: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastActive: "2024-01-20T16:00:00Z",
  },
  {
    _id: "4",
    username: "sarahwilliams",
    email: "sarah@example.com",
    role: "buyer",
    credits: 0,
    profile: {
      bio: "Art collector and enthusiast",
    },
    isVerified: false,
    createdAt: "2024-01-18T14:00:00Z",
    lastActive: "2024-01-20T11:00:00Z",
  },
]

// Mock Artist Profiles
export const mockArtistProfiles: ArtistProfile[] = [
  {
    _id: "ap1",
    userId: "1",
    bio: "Contemporary painter specializing in abstract landscapes. My work explores the harmony between color and form, drawing inspiration from natural landscapes and emotional experiences.",
    website: "https://emmajohnson.art",
    socialLinks: {
      instagram: "@emmajohnson_art",
      facebook: "emmajohnsonart",
      pinterest: "emmajohnsonart",
    },
    portfolioImages: [
      "/placeholder.svg?height=400&width=300",
      "/placeholder.svg?height=400&width=300",
      "/placeholder.svg?height=400&width=300",
    ],
    verified: true,
    totalSales: 12,
    rating: {
      average: 4.8,
      count: 15,
    },
    specialties: ["Abstract Art", "Landscape Painting", "Acrylic"],
    joinedAt: "2024-01-15T10:00:00Z",
    featuredArtwork: "1",
  },
  {
    _id: "ap2",
    userId: "2",
    bio: "Digital artist creating surreal portraits and dreamscapes using cutting-edge digital techniques.",
    website: "https://michaelchen.digital",
    socialLinks: {
      instagram: "@michael_digital_art",
      twitter: "@michaelchen_art",
    },
    portfolioImages: ["/placeholder.svg?height=400&width=300", "/placeholder.svg?height=400&width=300"],
    verified: true,
    totalSales: 8,
    rating: {
      average: 4.6,
      count: 10,
    },
    specialties: ["Digital Art", "Surrealism", "Portrait"],
    joinedAt: "2024-01-10T08:00:00Z",
    featuredArtwork: "2",
  },
]

// Mock Artworks
export const mockArtworks: Artwork[] = [
  {
    _id: "1",
    title: "Abstract Harmony",
    description:
      "A vibrant abstract painting exploring the harmony between color and form. This piece was inspired by the natural landscapes and emotional experiences of the artist's travels through southern Europe.",
    price: 450,
    images: ["/placeholder.svg?height=800&width=600", "/placeholder.svg?height=800&width=600"],
    artist: "1",
    status: "approved",
    createdAt: "2024-01-16T10:00:00Z",
    approvedAt: "2024-01-17T09:00:00Z",
    currentOwner: "1",
    tags: ["abstract", "colorful", "harmony", "landscape"],
    medium: "Acrylic on canvas",
    dimensions: {
      width: 60,
      height: 80,
      unit: "cm",
    },
    year: 2024,
    isOriginal: true,
  },
  {
    _id: "2",
    title: "Digital Dreams",
    description: "A surreal digital artwork that blends reality with imagination, creating a dreamlike atmosphere.",
    price: 350,
    images: ["/placeholder.svg?height=800&width=600"],
    artist: "2",
    status: "approved",
    createdAt: "2024-01-12T14:00:00Z",
    approvedAt: "2024-01-13T11:00:00Z",
    currentOwner: "2",
    tags: ["digital", "surreal", "dreams", "fantasy"],
    medium: "Digital print",
    dimensions: {
      width: 50,
      height: 70,
      unit: "cm",
    },
    year: 2024,
    isOriginal: false,
    edition: {
      number: 1,
      total: 10,
    },
  },
  {
    _id: "3",
    title: "Ocean Waves",
    description: "A pending artwork submission showing the power and beauty of ocean waves.",
    price: 520,
    images: ["/placeholder.svg?height=800&width=600"],
    artist: "2",
    status: "pending",
    createdAt: "2024-01-20T09:00:00Z",
    currentOwner: "2",
    tags: ["ocean", "waves", "blue", "nature"],
    medium: "Digital art",
    dimensions: {
      width: 45,
      height: 60,
      unit: "cm",
    },
    year: 2024,
    isOriginal: false,
  },
]

// Mock Messages
export const mockMessages: Message[] = [
  {
    _id: "m1",
    sender: "4",
    receiver: "1",
    content:
      "Hi Emma, I'm interested in your Abstract Harmony piece. Could you tell me more about the inspiration behind it?",
    conversationId: "1_4",
    timestamp: "2024-01-20T10:00:00Z",
    read: true,
  },
  {
    _id: "m2",
    sender: "1",
    receiver: "4",
    content:
      "Hello Sarah! Thank you for your interest. This piece was inspired by my travels through Tuscany last summer. The colors represent the changing light throughout the day.",
    conversationId: "1_4",
    timestamp: "2024-01-20T10:30:00Z",
    read: false,
  },
  {
    _id: "m3",
    sender: "4",
    receiver: "1",
    content: "That sounds beautiful! Is it still available for purchase?",
    conversationId: "1_4",
    timestamp: "2024-01-20T11:00:00Z",
    read: false,
  },
]

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    _id: "t1",
    seller: "1",
    artwork: "1",
    amount: 100,
    paymentIntent: "pi_1234567890",
    status: "completed",
    transactionType: "listing_fee",
    timestamp: "2024-01-16T10:00:00Z",
    metadata: {
      stripe_payment_id: "ch_1234567890",
      payment_method: "card",
    },
  },
  {
    _id: "t2",
    seller: "2",
    artwork: "2",
    amount: 100,
    paymentIntent: "pi_0987654321",
    status: "completed",
    transactionType: "listing_fee",
    timestamp: "2024-01-12T14:00:00Z",
    metadata: {
      stripe_payment_id: "ch_0987654321",
      payment_method: "card",
    },
  },
]

// Mock Traceability Records
export const mockTraceabilityRecords: TraceabilityRecord[] = [
  {
    _id: "tr1",
    artworkId: "1",
    fromUserId: "1",
    toUserId: "1",
    transactionType: "created",
    timestamp: "2024-01-16T10:00:00Z",
    transactionHash: "tr-1705401600000-123456",
    additionalData: {
      location: "Berlin, Germany",
      condition: "Excellent",
      notes: "Original creation by artist",
    },
  },
  {
    _id: "tr2",
    artworkId: "2",
    fromUserId: "2",
    toUserId: "2",
    transactionType: "created",
    timestamp: "2024-01-12T14:00:00Z",
    transactionHash: "tr-1705064400000-654321",
    additionalData: {
      location: "Munich, Germany",
      condition: "Mint",
      notes: "Digital artwork creation",
    },
  },
]

// Helper functions to get data
export const getUserById = (id: string | undefined): User | undefined => {
  if (!id) return undefined
  return mockUsers.find((user) => user._id === id)
}

export const getArtistProfileByUserId = (userId: string): ArtistProfile | undefined => {
  return mockArtistProfiles.find((profile) => profile.userId === userId)
}

export const getArtworksByArtist = (artistId: string): Artwork[] => {
  return mockArtworks.filter((artwork) => artwork.artist === artistId)
}

export const getApprovedArtworks = (): Artwork[] => {
  return mockArtworks.filter((artwork) => artwork.status === "approved")
}

export const getPendingArtworks = (): Artwork[] => {
  return mockArtworks.filter((artwork) => artwork.status === "pending")
}

export const getMessagesByConversation = (conversationId: string): Message[] => {
  return mockMessages.filter((message) => message.conversationId === conversationId)
}

export const getTransactionsByUser = (userId: string): Transaction[] => {
  return mockTransactions.filter((transaction) => transaction.seller === userId || transaction.buyer === userId)
}
