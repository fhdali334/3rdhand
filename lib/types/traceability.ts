import type { PaginationMeta } from "./api"

export interface ArtworkHistoryResponse {
  history: {
    artwork: {
      id: string
      title: string
      images: string[]
      price: number
      status: string
      createdAt: string
      totalSales: number
    }
    artist: {
      _id: string
      username: string
      email: string
    }
    currentOwner: {
      _id: string
      username: string
      email: string
    }
    ownershipChain: {
      id: string
      transactionType: string
      fromUser: {
        _id: string
        username: string
        email: string
      }
      toUser: {
        _id: string
        username: string
        email: string
      }
      timestamp: string
      transactionHash: string
      details: {
        price: number
        condition: string
        paymentIntent?: string
        saleDate?: string
      }
    }[]
    statistics: {
      totalTransfers: number
      firstTransfer: string
      lastTransfer: string
      totalRevenue: number
      uniqueOwners: number
    }
  }
}

export interface OwnershipCertificateResponse {
  certificate: {
    certificateId: string
    generatedAt: string
    artwork: {
      id: string
      title: string
      artist: {
        _id: string
        username: string
        email: string
        profile: {
          bio: string
          website: string
          socialLinks: {
            instagram: string
            twitter: string
          }
        }
      }
      yearCreated: number
      medium: string
      dimensions: {
        width: number
        height: number
        unit: string
      }
      description: string
      images: string[]
    }
    currentOwner: {
      _id: string
      username: string
      email: string
      profile: {
        bio: string
        website: string
        socialLinks: {
          instagram: string
          twitter: string
        }
      }
    }
    ownership: {
      acquiredOn: string
      acquiredFrom: {
        _id: string
        username: string
        email: string
      }
      acquisitionType: string
      transactionHash: string
      purchasePrice: number
    }
    provenance: {
      totalTransfers: number
      verificationHash: string
      chainOfOwnership: {
        timestamp: string
        type: string
        hash: string
      }[]
    }
    authenticity: {
      platformVerified: boolean
      blockchainHash: string
      verificationLevel: string
    }
    legalDisclaimer: string
  }
}

export interface OwnershipVerificationResponse {
  verification: {
    isVerified: boolean
    artworkId: string
    claimedOwner: string
    actualOwner: {
      _id: string
      username: string
      email: string
    }
    verificationTimestamp: string
    ownershipDetails: any
  }
}

export interface UserOwnershipHistoryResponse {
  records: {
    _id: string
    artworkId: {
      _id: string
      title: string
      images: string[]
      price: number
    }
    fromUserId: {
      _id: string
      username: string
      profile: {
        bio: string
        website: string
        socialLinks: {
          instagram: string
          twitter: string
        }
      }
    }
    toUserId: {
      _id: string
      username: string
      profile: {
        bio: string
        website: string
        socialLinks: {
          instagram: string
          twitter: string
        }
      }
    }
    transactionType: string
    transactionHash: string
    additionalData: {
      price: number
      condition: string
    }
    timestamp: string
    createdAt: string
    updatedAt: string
    __v: number
  }[]
  pagination: PaginationMeta
}

export interface AdminTraceabilityOverviewResponse {
  traceability: {
    overview: {
      totalRecords: number
      totalArtworksTracked: number
      totalTransfers: number
      totalCreations: number
    }
    mostTransferredArtwork: {
      _id: string
      transfers: number
      artwork: {
        _id: string
        title: string
        description: string
        price: number
        images: string[]
        artist: string
        listingFeeStatus: string
        listingFeePaymentIntent: any
        listingFeePaidAt: string
        status: string
        currentOwner: string
        tags: string[]
        medium: string
        dimensions: {
          width: number
          height: number
          unit: string
        }
        year: number
        isOriginal: boolean
        edition: {
          number: number
          total: number
        }
        createdAt: string
        updatedAt: string
        __v: number
        approvedAt: string
        soldAt: string
        engagementStats: {
          lastLikedAt: string
          popularityScore: number
          totalLikes: number
          totalViews: number
        }
        likedBy: string[]
        ownershipHistory: any[]
        totalSales: number
      }
    }
    recentActivity: {
      _id: string
      artworkId: {
        _id: string
        title: string
      }
      fromUserId: {
        _id: string
        username: string
      }
      toUserId: {
        _id: string
        username: string
      }
      transactionType: string
      transactionHash: string
      additionalData: {
        price: number
        condition: string
      }
      timestamp: string
      createdAt: string
      updatedAt: string
      __v: number
    }[]
    generatedAt: string
  }
}

export interface SearchTraceabilityRecordsResponse {
  records: {
    _id: string
    artworkId: {
      _id: string
      title: string
      images: string[]
    }
    fromUserId: {
      _id: string
      username: string
      profile: {
        bio: string
        website: string
        socialLinks: {
          instagram: string
          twitter: string
        }
      }
    }
    toUserId: {
      _id: string
      username: string
      profile: {
        bio: string
        website: string
        socialLinks: {
          instagram: string
          twitter: string
        }
      }
    }
    transactionType: string
    transactionHash: string
    additionalData: {
      price: number
      condition: string
    }
    timestamp: string
    createdAt: string
    updatedAt: string
    __v: number
  }[]
  pagination: PaginationMeta
}
