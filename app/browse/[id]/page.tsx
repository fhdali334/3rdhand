"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/lib/hooks/redux"
import { artworkApi } from "@/lib/api/artwork"
import { paymentApi } from "@/lib/api/payment"
import { traceabilityApi } from "@/lib/api/traceability"
import { engagementApi } from "@/lib/api/engagement"
import { artistsApi, type ArtistDetailsResponse } from "@/lib/api/artists"
import { cn } from "@/lib/utils"
import {
  Heart,
  Share2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  Calendar,
  User,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  Users,
  Globe,
  Star,
} from "lucide-react"

interface ArtworkDetail {
  _id: string
  title: string
  description: string
  price: number
  images: string[]
  artist: {
    _id: string
    username: string
    email: string
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
  listingFeeStatus: string
  listingFeePaymentIntent?: string | null
  listingFeePaidAt?: string
  status: string
  totalSales: number
  currentOwner: {
    _id: string
    username: string
    profile?: {
      bio?: string
      website?: string
      socialLinks?: {
        facebook?: string
        twitter?: string
        instagram?: string
      }
    }
    tags: string[]
    medium: string
    dimensions: {
      width?: number
      height?: number
      unit?: string
    }
    year?: number
    isOriginal: boolean
    edition?: {
      number: number
      total: number
    }
    engagementStats?: {
      totalLikes: number
      totalViews: number
      popularityScore: number
    }
    likedBy?: string[]
    createdAt: string
    ownershipHistory: any[]
    updatedAt: string
    approvedAt?: string
    engagementContext?: {
      isLiked: boolean
      isFollowingArtist: boolean
      canLike: boolean
      canFollow: boolean
    }
    traceabilityContext?: {
      totalTransfers: number
      hasHistory: boolean
      canViewHistory: boolean
      canGenerateCertificate: boolean
    }
  }
  // Optional fields used in UI
  tags?: string[]
  medium?: string
  dimensions?: { width?: number; height?: number; unit?: string }
  year?: number
  isOriginal?: boolean
  edition?: { number: number; total: number }
  engagementStats?: { totalLikes: number; totalViews: number; popularityScore: number }
  likedBy?: string[]
  createdAt?: string
  ownershipHistory?: any[]
  updatedAt?: string
  approvedAt?: string
  engagementContext?: {
    isLiked: boolean
    isFollowingArtist: boolean
    canLike: boolean
    canFollow: boolean
  }
  ownershipContext?: any
}

interface OwnershipHistoryItem {
  owner: string
  purchaseDate: string
  price: number
  transactionId: string
  fromOwner: string
}

type ArtistProfile = ArtistDetailsResponse["data"]["profile"]

export default function ArtworkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  const [artwork, setArtwork] = useState<ArtworkDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [fullScreenOpen, setFullScreenOpen] = useState(false)
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState(0)

  const [ownershipCertificate, setOwnershipCertificate] = useState<any>(null)
  const [traceabilityRecords, setTraceabilityRecords] = useState<any[]>([])

  const [likeLoading, setLikeLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const [selectedTab, setSelectedTab] = useState("details")
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null)
  const [artistLoading, setArtistLoading] = useState(false)
  const [artistError, setArtistError] = useState<string | null>(null)

  const artworkId = params.id as string

  // Derivatives
  const artworkImages = artwork?.images || []
  const artistInfo = artwork?.artist
  const isOwner = artwork?.currentOwner?._id === user?._id
  const canBuy = artwork?.ownershipContext ? (artwork.ownershipContext as any).canPurchase !== false : true
  const purchaseType = (artwork?.ownershipContext as any)?.purchaseType || "from_artist"
  const isSold = artwork?.currentOwner?._id !== artwork?.artist?._id
  const engagementContext = artwork?.engagementContext || {
    isLiked: false,
    isFollowingArtist: false,
    canLike: true,
    canFollow: true,
  }

  const totalLikes = useMemo(
    () => artwork?.engagementStats?.totalLikes ?? (artwork?.likedBy ? artwork.likedBy.length : 0),
    [artwork],
  )

  // Fetch artwork details
  useEffect(() => {
    const fetchArtworkDetails = async () => {
      if (!artworkId) return
      try {
        setLoading(true)
        setError(null)

        const response = await artworkApi.getArtwork(artworkId)

        let artworkData: any = null
        if (response?.data?.data?.artwork) {
          artworkData = response.data.data.artwork
        } else if (response?.data?.artwork) {
          artworkData = response.data.artwork
        } else if (response?.data && response.data._id) {
          artworkData = response.data
        }

        if (artworkData && artworkData._id) {
          setArtwork(artworkData)

          // Fetch ownership certificate if user owns the artwork
          if (artworkData.ownershipContext?.isOwner) {
            try {
              const certResponse = await traceabilityApi.getOwnershipCertificate(artworkId)
              const certData = certResponse?.data?.data
              if (certData) setOwnershipCertificate(certData)
            } catch (e) {
              console.error("Failed to fetch ownership certificate:", e)
            }
          }

          // Fetch traceability records
          try {
            const traceResponse = await traceabilityApi.getArtworkHistory(artworkId)
            const records = traceResponse?.data?.data?.records
            if (Array.isArray(records)) setTraceabilityRecords(records)
          } catch (e) {
            console.error("Failed to fetch traceability records:", e)
          }
        } else {
          setError("Artwork not found or invalid response structure")
        }
      } catch (err: any) {
        console.error("Fetch artwork error:", err)
        setError(err?.message || "Failed to load artwork")
      } finally {
        setLoading(false)
      }
    }

    fetchArtworkDetails()
  }, [artworkId])

  // Fetch artist profile lazily on tab switch
  useEffect(() => {
    const fetchArtist = async () => {
      if (selectedTab !== "artist") return
      if (!artwork?.artist?._id) return
      if (artistProfile) return

      try {
        setArtistLoading(true)
        setArtistError(null)
        const res = await artistsApi.getArtistDetails(artwork.artist._id)
        const profile: ArtistProfile | undefined = res?.data?.data?.profile || res?.data?.profile
        if (profile) {
          setArtistProfile(profile)
        } else {
          setArtistError("Failed to load artist details")
        }
      } catch (e: any) {
        console.error("Artist details error:", e)
        setArtistError(e?.message || "Failed to load artist details")
      } finally {
        setArtistLoading(false)
      }
    }

    fetchArtist()
  }, [selectedTab, artwork?.artist?._id, artistProfile])

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase artwork.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }
    if (!artwork) {
      toast({ title: "Error", description: "Artwork not found. Please try again.", variant: "destructive" })
      return
    }
    try {
      const response = await paymentApi.createPurchaseSession(artwork._id)
      if ((response as any).status === "success" && (response as any).data?.sessionUrl) {
        window.location.href = (response as any).data.sessionUrl
      } else {
        const statusCode = (response as any).statusCode
        const message = (response as any).message || "Failed to create payment session"
        if (statusCode === 409 && message.includes("concurrent purchase")) {
          toast({
            title: "Purchase Error",
            description: "This artwork is currently being purchased by another user. Please try again later.",
            variant: "destructive",
          })
        } else if (statusCode === 400 && message.includes("You cannot purchase artwork you already own")) {
          toast({
            title: "Purchase Error",
            description: "You cannot purchase artwork you already own.",
            variant: "destructive",
          })
        } else {
          throw new Error(message)
        }
      }
    } catch (error: any) {
      console.error("Purchase error:", error)
      toast({
        title: "Purchase Failed",
        description: error?.message || "Failed to initiate purchase. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleContactArtist = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to contact the artist.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }
    if (!artistInfo?._id) {
      toast({ title: "Error", description: "Artist information not available", variant: "destructive" })
      return
    }
    // Use the correct query param key: "artist" (NOT "user"), and pass artistName for header fallback.
    const messageUrl = `/dashboard/messages?artist=${encodeURIComponent(
      artistInfo._id,
    )}&artwork=${encodeURIComponent(artwork?.title || "")}&artistName=${encodeURIComponent(artistInfo?.username || "")}`
    router.push(messageUrl)
  }

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to contact the owner.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }
    if (!artwork?.currentOwner?._id) {
      toast({ title: "Error", description: "Owner information not available", variant: "destructive" })
      return
    }
    const messageUrl = `/dashboard/messages?artist=${encodeURIComponent(
      artwork.currentOwner._id,
    )}&artwork=${encodeURIComponent(artwork?.title || "")}&artistName=${encodeURIComponent(
      artwork.currentOwner?.username || "",
    )}`
    router.push(messageUrl)
  }

  const handleLikeToggle = async () => {
    if (!artwork) return
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Please log in to like artworks.", variant: "destructive" })
      router.push("/auth/login")
      return
    }
    if (!engagementContext?.canLike) {
      toast({ title: "Unavailable", description: "You cannot like this artwork right now." })
      return
    }
    try {
      setLikeLoading(true)
      // Optimistic update
      setArtwork((prev) => {
        if (!prev) return prev
        const isLiked = !!prev.engagementContext?.isLiked
        const currentLikes = prev.engagementStats?.totalLikes ?? prev.likedBy?.length ?? 0
        const newLikes = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1
        return {
          ...prev,
          engagementContext: { ...(prev.engagementContext || {}), isLiked: !isLiked },
          engagementStats: { ...(prev.engagementStats || { totalViews: 0, popularityScore: 0 }), totalLikes: newLikes },
        }
      })

      const res = await engagementApi.likeArtwork(artwork._id)
      const action = (res as any)?.data?.data?.action || (res as any)?.data?.action || (res as any)?.action

      if (!action) return
      const liked = action === "liked"
      setArtwork((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          engagementContext: { ...(prev.engagementContext || {}), isLiked: liked },
        }
      })
    } catch (e: any) {
      console.error("Like toggle failed:", e)
      // Revert optimistic update
      setArtwork((prev) => {
        if (!prev) return prev
        const isLiked = !!prev.engagementContext?.isLiked
        const currentLikes = prev.engagementStats?.totalLikes ?? 0
        return {
          ...prev,
          engagementContext: { ...(prev.engagementContext || {}), isLiked: !isLiked },
          engagementStats: {
            ...(prev.engagementStats || { totalViews: 0, popularityScore: 0 }),
            totalLikes: Math.max(0, isLiked ? currentLikes + 1 : currentLikes - 1),
          },
        }
      })
      toast({
        title: "Failed",
        description: e?.message || "Could not update like. Try again.",
        variant: "destructive",
      })
    } finally {
      setLikeLoading(false)
    }
  }

  const handleFollowToggle = async () => {
    const artistId = artwork?.artist?._id
    if (!artistId) return
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Please log in to follow artists.", variant: "destructive" })
      router.push("/auth/login")
      return
    }
    const canFollow = artistProfile?.engagement?.canFollow ?? engagementContext?.canFollow ?? true
    if (!canFollow) {
      toast({ title: "Unavailable", description: "You cannot follow this artist right now." })
      return
    }
    try {
      setFollowLoading(true)
      const currentlyFollowing = artistProfile?.engagement?.isFollowing ?? engagementContext?.isFollowingArtist ?? false
      setArtistProfile((prev) => {
        if (!prev) return prev
        const currentFollowers = prev.stats?.followers ?? 0
        const newFollowers = currentlyFollowing ? Math.max(0, currentFollowers - 1) : currentFollowers + 1
        return {
          ...prev,
          engagement: { ...(prev.engagement || {}), isFollowing: !currentlyFollowing },
          stats: { ...(prev.stats || {}), followers: newFollowers },
        }
      })

      const res = await engagementApi.followArtist(artistId)
      const action = (res as any)?.data?.data?.action || (res as any)?.data?.action || (res as any)?.action

      const followed = action === "followed"
      setArtwork((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          engagementContext: { ...(prev.engagementContext || {}), isFollowingArtist: followed },
        }
      })
    } catch (e: any) {
      console.error("Follow toggle failed:", e)
      setArtistProfile((prev) => {
        if (!prev) return prev
        const flipped = !(prev.engagement?.isFollowing ?? false)
        const currentFollowers = prev.stats?.followers ?? 0
        const newFollowers = flipped ? Math.max(0, currentFollowers - 1) : currentFollowers + 1
        return {
          ...prev,
          engagement: { ...(prev.engagement || {}), isFollowing: flipped },
          stats: { ...(prev.stats || {}), followers: newFollowers },
        }
      })
      toast({
        title: "Failed",
        description: e?.message || "Could not update follow. Try again.",
        variant: "destructive",
      })
    } finally {
      setFollowLoading(false)
    }
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % artworkImages.length)
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + artworkImages.length) % artworkImages.length)
  const openFullScreen = (index: number) => {
    setFullScreenImageIndex(index)
    setFullScreenOpen(true)
  }
  const nextFullScreenImage = () => setFullScreenImageIndex((prev) => (prev + 1) % artworkImages.length)
  const prevFullScreenImage = () =>
    setFullScreenImageIndex((prev) => (prev - 1 + artworkImages.length) % artworkImages.length)

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: artwork?.title, text: artwork?.description, url })
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast({ title: "Link Copied", description: "Artwork link copied to clipboard" })
      } catch {
        toast({ title: "Error", description: "Failed to copy link", variant: "destructive" })
      }
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Loading Artwork</h2>
            <p className="text-muted-foreground">Fetching artwork details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !artwork) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Artwork Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || "The requested artwork could not be found."}</p>
          <Button onClick={() => router.push("/browse")}>Browse Artworks</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4 sm:py-8">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
            <Image
              src={artworkImages[currentImageIndex] || "/placeholder.svg?height=600&width=450&query=artwork-main-image"}
              alt={artwork.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              priority
              onClick={() => openFullScreen(currentImageIndex)}
            />

            {/* Navigation arrows */}
            {artworkImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Image counter */}
            {artworkImages.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {currentImageIndex + 1} / {artworkImages.length}
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {artworkImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {artworkImages.slice(0, 4).map((image: string, index: number) => (
                <div
                  key={index}
                  className={cn(
                    "relative aspect-square bg-gray-100 rounded cursor-pointer overflow-hidden border-2 transition-colors",
                    currentImageIndex === index ? "border-primary" : "border-transparent hover:border-gray-300",
                  )}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={image || "/placeholder.svg?height=100&width=100&query=artwork-thumbnail"}
                    alt={`View ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Artwork Information */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{artwork.medium}</Badge>
              {artwork.isOriginal && <Badge variant="outline">Original</Badge>}
              {isOwner && <Badge className="bg-green-100 text-green-800">You own this</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{artwork.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground mb-4">
              <span>by</span>
              <Link href={`/artists/${artistInfo?._id}`} className="font-medium text-foreground hover:underline">
                {artistInfo?.username || "Unknown Artist"}
              </Link>
              {isSold && (
                <>
                  <span>•</span>
                  <span>Currently owned by {artwork.currentOwner.username}</span>
                </>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-primary">€{artwork.price?.toLocaleString() || "0"}</div>
              {/* Likes Count */}
              <div className="flex items-center gap-2 text-sm">
                <Heart
                  className={cn(
                    "h-4 w-4",
                    engagementContext.isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground",
                  )}
                />
                <span className="text-muted-foreground">{totalLikes ?? 0} likes</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Purchase Button */}
            {/* <Button size="lg" className="w-full text-lg py-6" onClick={handlePurchase} disabled={!canBuy}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              {canBuy
                ? `Purchase from ${purchaseType === "from_owner" ? "Owner" : "Artist"} for €${artwork?.price?.toLocaleString() || "0"}`
                : isOwner
                  ? "You own this artwork"
                  : "Not available for purchase"}
            </Button> */}

            {/* Secondary Actions */}
            <div className="flex gap-3">
              <Button
                variant={engagementContext.isLiked ? "default" : "outline"}
                size="icon"
                onClick={handleLikeToggle}
                disabled={likeLoading || !engagementContext?.canLike}
                className="flex-shrink-0"
              >
                {likeLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={cn("h-5 w-5", engagementContext.isLiked ? "fill-red-500 text-red-500" : "")} />
                )}
                <span className="sr-only">{engagementContext.isLiked ? "Unlike" : "Like"}</span>
              </Button>

              <Button variant="outline" size="icon" className="flex-shrink-0 bg-transparent" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>

              {/* {!isOwner && (
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleContactArtist}>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Message {isSold ? "Owner" : "Artist"}
                </Button>
              )} */}

              {/* Added separate button to message current owner when artwork is sold and owner is different from artist */}
              {!isOwner && isSold && artwork.currentOwner.username !== artwork.artist.username && (
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleContactOwner}>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Message Owner
                </Button>
              )}
            </div>
          </div>

          {/* Tags */}
          {artwork?.tags && artwork.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {artwork.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-12">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="artist">Artist</TabsTrigger>
          {/* Added current owner tab when artwork is sold */}
          {isSold && <TabsTrigger value="owner">Current Owner</TabsTrigger>}
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="provenance">Provenance</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">Artwork Details</h3>
            <p className="mb-4">{artwork?.description || "No description available."}</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Specifications</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="font-medium">Medium:</dt>
                    <dd>{artwork?.medium || "Not specified"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Dimensions:</dt>
                    <dd>
                      {artwork?.dimensions?.width && artwork?.dimensions?.height
                        ? `${artwork.dimensions.width} × ${artwork.dimensions.height} ${artwork.dimensions.unit || "cm"}`
                        : "Not specified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium">Year:</dt>
                    <dd>{artwork?.year || "Not specified"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Type:</dt>
                    <dd>{artwork?.isOriginal ? "Original artwork" : "Print"}</dd>
                  </div>
                  {artwork?.edition && (
                    <div>
                      <dt className="font-medium">Edition:</dt>
                      <dd>
                        {artwork.edition.number} of {artwork.edition.total}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Condition & Authenticity</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  This artwork comes with a certificate of authenticity and is in excellent condition, ready for display
                  in your collection.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Verified Authentic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Blockchain Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{artwork?.status}</Badge>
                  </div>
                  {artwork?.approvedAt && (
                    <p className="text-sm text-muted-foreground">
                      Approved: {new Date(artwork.approvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="artist" className="mt-6">
          {/* Artist Details via API */}
          {artistLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading artist details...</span>
            </div>
          ) : artistError ? (
            <div className="text-center text-sm text-destructive">{artistError}</div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/artist-avatar.png" alt={artistInfo?.username} />
                  <AvatarFallback className="text-lg">
                    {(artistInfo?.username || "A")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold">
                      {artistProfile?.user?.username || artistInfo?.username || "Artist"}
                    </h3>
                    {(artistProfile?.user?.verified || artistInfo?.profile) && (
                      <Badge variant="secondary">Verified</Badge>
                    )}
                    <Badge variant="outline">Original Artist</Badge>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    {artistProfile?.extendedProfile?.bio || artistInfo?.profile?.bio || "No biography available."}
                  </p>

                  {/* Links and Meta */}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    {artistProfile?.extendedProfile?.website && (
                      <a
                        href={artistProfile.extendedProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Website
                      </a>
                    )}
                    {artistInfo?.profile?.socialLinks?.instagram && (
                      <a
                        href={artistInfo.profile.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Instagram
                      </a>
                    )}
                    {artistInfo?.profile?.socialLinks?.twitter && (
                      <a
                        href={artistInfo.profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Twitter
                      </a>
                    )}
                  </div>

                  {/* Follow + Stats */}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button
                      variant={
                        artistProfile?.engagement?.isFollowing || engagementContext.isFollowingArtist
                          ? "default"
                          : "outline"
                      }
                      onClick={handleFollowToggle}
                      disabled={followLoading || !(artistProfile?.engagement?.canFollow ?? engagementContext.canFollow)}
                    >
                      {followLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : artistProfile?.engagement?.isFollowing || engagementContext.isFollowingArtist ? (
                        "Unfollow"
                      ) : (
                        "Follow"
                      )}
                    </Button>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{artistProfile?.stats?.followers ?? 0} followers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4" />
                      <span>
                        {(artistProfile?.extendedProfile?.rating?.average ?? 0).toFixed(1)} (
                        {artistProfile?.extendedProfile?.rating?.count ?? 0})
                      </span>
                    </div>
                  </div>

                  {/* <div className="mt-3">
                    <Button variant="outline" asChild>
                      <Link href={`/artists/${artistInfo?._id}`}>View Full Profile</Link>
                    </Button>
                  </div> */}
                </div>
              </div>

              {/* Artist Stats Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Total Artworks</p>
                    <p className="text-xl font-semibold">{artistProfile?.stats?.totalArtworks ?? 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Followers</p>
                    <p className="text-xl font-semibold">{artistProfile?.stats?.followers ?? 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Total Likes</p>
                    <p className="text-xl font-semibold">{artistProfile?.stats?.totalLikes ?? 0}</p>
                  </CardContent>
                </Card>
              </div>

              {/* For Sale Artworks */}
              {artistProfile?.artworks?.forSale && artistProfile.artworks.forSale.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Artworks For Sale</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {artistProfile.artworks.forSale.map((a) => (
                      <Link key={a._id} href={`/browse/${a._id}`} className="group">
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={a.images?.[0] || "/placeholder.svg?height=300&width=225&query=artist-artwork-for-sale"}
                            alt={a.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm font-medium line-clamp-1">{a.title}</p>
                          {typeof a.price === "number" && <p className="text-sm text-muted-foreground">€{a.price}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sold Artworks */}
              {artistProfile?.artworks?.sold && artistProfile.artworks.sold.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Recently Sold</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {artistProfile.artworks.sold.map((a) => (
                      <div key={a._id} className="group">
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={a.images?.[0] || "/placeholder.svg?height=300&width=225&query=artist-artwork-sold"}
                            alt={a.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium line-clamp-1">{a.title}</p>
                          <p className="text-xs text-muted-foreground">Sold to {a.soldTo || "collector"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Added current owner tab content */}
        {isSold && (
          <TabsContent value="owner" className="mt-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/owner-avatar.png" alt={artwork.currentOwner?.username} />
                  <AvatarFallback className="text-lg">
                    {(artwork.currentOwner?.username || "O")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold">{artwork.currentOwner?.username || "Current Owner"}</h3>
                    <Badge variant="secondary">Current Owner</Badge>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    {artwork.currentOwner?.profile?.bio || "No biography available."}
                  </p>

                  {/* Owner Links and Meta */}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    {artwork.currentOwner?.profile?.website && (
                      <a
                        href={artwork.currentOwner.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Website
                      </a>
                    )}
                    {artwork.currentOwner?.profile?.socialLinks?.instagram && (
                      <a
                        href={artwork.currentOwner.profile.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Instagram
                      </a>
                    )}
                    {artwork.currentOwner?.profile?.socialLinks?.twitter && (
                      <a
                        href={artwork.currentOwner.profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Twitter
                      </a>
                    )}
                  </div>

                  {/* Contact Owner Button */}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {!isOwner && (
                      <Button variant="outline" onClick={handleContactOwner}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message Owner
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner Information Card */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-3">Ownership Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Owner Since</p>
                      <p className="text-sm">
                        {artwork.ownershipHistory && artwork.ownershipHistory.length > 0
                          ? new Date(artwork.ownershipHistory[0].purchaseDate).toLocaleDateString()
                          : "Original purchase"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Purchase Price</p>
                      <p className="text-sm">
                        {artwork.ownershipHistory && artwork.ownershipHistory.length > 0
                          ? `€${artwork.ownershipHistory[0].price.toLocaleString()}`
                          : `€${artwork.price?.toLocaleString() || "0"}`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Verified Ownership</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This ownership is verified through blockchain technology and our secure transfer system.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        <TabsContent value="history" className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Ownership History</h3>
          {artwork?.ownershipHistory && artwork.ownershipHistory.length > 0 ? (
            <div className="space-y-4">
              {artwork.ownershipHistory.map((history: OwnershipHistoryItem, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{artwork.currentOwner.username}</span>
                          {index === 0 && <Badge variant="secondary">Current Owner</Badge>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(history.purchaseDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />€{history.price.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            From: {artwork.artist.username}
                          </div>
                        </div>
                        {/* <p className="text-xs text-muted-foreground mt-2">Transaction ID: {history.transactionId}</p> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No ownership history available.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="provenance" className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Provenance & Traceability</h3>
          {traceabilityRecords.length > 0 ? (
            <div className="space-y-4">
              {traceabilityRecords.map((record, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{record.eventType}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(record.timestamp).toLocaleString()}</span>
                          <span>Block: {record.blockchainHash}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No provenance records available.</p>
            </div>
          )}

          {/* Ownership Certificate */}
          {ownershipCertificate && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Ownership Certificate
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Certificate ID:</span> {ownershipCertificate.certificateId}
                  </div>
                  <div>
                    <span className="font-medium">Issued:</span>{" "}
                    {new Date(ownershipCertificate.issuedAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Blockchain Hash:</span> {ownershipCertificate.blockchainHash}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge variant="secondary" className="ml-2">
                      Verified
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Full Screen Image Dialog */}
      <Dialog open={fullScreenOpen} onOpenChange={setFullScreenOpen}>
        <DialogContent className="max-w-screen-lg w-full h-full max-h-screen p-0 bg-black">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={
                artworkImages[fullScreenImageIndex] ||
                "/placeholder.svg?height=800&width=600&query=artwork-fullscreen" ||
                "/placeholder.svg" ||
                "/placeholder.svg"
              }
              alt={`${artwork?.title} - Full Screen`}
              fill
              className="object-contain"
              priority
            />

            {/* Navigation buttons */}
            {artworkImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={prevFullScreenImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={nextFullScreenImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {fullScreenImageIndex + 1} / {artworkImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
