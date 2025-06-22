"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Loader2,
  ShoppingCart,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  Wifi,
  WifiOff,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { fetchArtwork, clearCurrentArtwork } from "@/lib/store/slices/artworkSlice"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params)
  const artworkId = resolvedParams.id

  console.log("🎨 ArtworkDetailPage: Starting with artwork ID:", artworkId)

  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const { currentArtwork, currentArtworkLoading, currentArtworkError } = useAppSelector((state) => state.artwork)
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  const [isLiked, setIsLiked] = useState(false)
  const [viewCount, setViewCount] = useState(0)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    console.log("🔄 ArtworkDetailPage: useEffect triggered for artwork ID:", artworkId)
    console.log(
      "🔄 Current state - artwork:",
      currentArtwork?._id,
      "loading:",
      currentArtworkLoading,
      "error:",
      currentArtworkError,
    )

    if (!artworkId || artworkId.trim() === "") {
      console.error("❌ ArtworkDetailPage: Invalid artwork ID provided")
      return
    }

    // Only fetch if we don't have the current artwork or it's a different one
    if (!currentArtwork || currentArtwork._id !== artworkId) {
      console.log("🧹 ArtworkDetailPage: Clearing previous artwork data")
      dispatch(clearCurrentArtwork())

      console.log("📡 ArtworkDetailPage: Dispatching fetchArtwork for ID:", artworkId)
      dispatch(fetchArtwork(artworkId))
    }

    // Simulate view count increment
    setViewCount(Math.floor(Math.random() * 100) + 50)
  }, [dispatch, artworkId, retryCount])

  // Log state changes for debugging
  useEffect(() => {
    console.log("📊 State Update - currentArtwork:", currentArtwork?._id)
    console.log("📊 State Update - loading:", currentArtworkLoading)
    console.log("📊 State Update - error:", currentArtworkError)
  }, [currentArtwork, currentArtworkLoading, currentArtworkError])

  const handlePurchase = async () => {
    console.log("💳 Purchase button clicked for artwork:", currentArtwork?._id)

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase artwork.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!currentArtwork) {
      toast({
        title: "Error",
        description: "Artwork not found. Please try again.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Purchase Initiated",
      description: `Purchase process started for "${currentArtwork.title}"`,
    })
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

    if (currentArtwork?.artist?._id) {
      router.push(`/dashboard/messages?artist=${currentArtwork.artist._id}`)
    }
  }

  const handleRetry = () => {
    console.log("🔄 Retrying artwork fetch for ID:", artworkId)
    setRetryCount((prev) => prev + 1)
    dispatch(clearCurrentArtwork())
  }

  // Check if error is network-related
  const isNetworkError = currentArtworkError?.includes("fetch") || currentArtworkError?.includes("Network")

  // Loading state
  if (currentArtworkLoading) {
    console.log("⏳ ArtworkDetailPage: Showing loading state")
    return (
      <>
        <Header />
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Loading Artwork Details</h2>
              <p className="text-muted-foreground">Fetching artwork ID: {artworkId}</p>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-muted-foreground">
                  API Call: GET /api/artwork/{artworkId}
                  <br />
                  Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Error state
  if (currentArtworkError && !currentArtwork) {
    console.error("❌ ArtworkDetailPage: Showing error state:", currentArtworkError)
    return (
      <>
        <Header />
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-lg">
              {isNetworkError ? (
                <WifiOff className="h-16 w-16 text-destructive mx-auto mb-4" />
              ) : (
                <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              )}
              <h2 className="text-2xl font-semibold mb-4">
                {isNetworkError ? "API Connection Error" : "Error Loading Artwork"}
              </h2>
              <p className="text-muted-foreground mb-4">{currentArtworkError}</p>
              <div className="bg-muted/50 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-muted-foreground">
                  <strong>API Endpoint:</strong> GET /api/artwork/{artworkId}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Base URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.3rdhand.be"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Full URL:</strong>{" "}
                  {(process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.3rdhand.be") + `/api/artwork/${artworkId}`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Artwork ID:</strong> {artworkId}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Retry Count:</strong> {retryCount}
                </p>
                {isNetworkError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-800">
                    <p className="text-sm font-medium mb-2">🔧 Troubleshooting Steps:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Check if your API server is running</li>
                      <li>• Verify the base URL in your environment variables</li>
                      <li>• Ensure CORS is configured to allow your frontend domain</li>
                      <li>• Test the API endpoint directly in your browser or Postman</li>
                      <li>• Check network tab in browser dev tools for more details</li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleRetry}>
                  <Wifi className="mr-2 h-4 w-4" />
                  Retry API Call
                </Button>
                <Button variant="outline" onClick={() => router.push("/browse")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Browse
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // No artwork found state
  if (!currentArtwork && !currentArtworkLoading && !currentArtworkError) {
    console.log("❌ ArtworkDetailPage: No artwork found")
    return (
      <>
        <Header />
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-semibold mb-4">Artwork Not Found</h2>
              <p className="text-muted-foreground mb-6">The artwork with ID "{artworkId}" could not be found.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleRetry}>Try Again</Button>
                <Button variant="outline" onClick={() => router.push("/browse")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Browse
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  console.log("✅ ArtworkDetailPage: Rendering artwork details:", currentArtwork)

  // Remove the isMockData check and warning banner
  const isOwner = user?.id === currentArtwork?.artist?._id
  const isSold = !!currentArtwork?.soldAt
  const artworkImages = currentArtwork?.images || ["/placeholder.svg?height=600&width=400"]

  return (
    <>
      <Header />
      <div className="container py-8">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Artwork Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={artworkImages[selectedImageIndex] || "/placeholder.svg?height=600&width=400"}
                alt={currentArtwork?.title || "Artwork"}
                fill
                className="object-cover"
                priority
              />
              {isSold && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    SOLD
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {artworkImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {artworkImages.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className={`relative aspect-square overflow-hidden rounded cursor-pointer border-2 transition-colors ${
                      selectedImageIndex === index ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg?height=200&width=200"}
                      alt={`${currentArtwork?.title} view ${index + 1}`}
                      fill
                      className="object-cover hover:opacity-80 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Artwork Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge className="text-sm">{currentArtwork?.medium || "Art"}</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 mr-1" />
                  {viewCount} views
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{currentArtwork?.title || "Untitled"}</h1>

              {/* Artist Info */}
              <div className="flex items-center mb-6">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src="/placeholder.svg" alt={currentArtwork?.artist?.username || "Artist"} />
                  <AvatarFallback>
                    {(currentArtwork?.artist?.username || "A")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/artists/${currentArtwork?.artist?._id}`} className="font-medium hover:underline">
                    {currentArtwork?.artist?.username || "Unknown Artist"}
                  </Link>
                  <p className="text-sm text-muted-foreground">Artist</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-primary">€{currentArtwork?.price?.toLocaleString() || "0"}</p>
                {isSold && <p className="text-sm text-muted-foreground mt-1">This artwork has been sold</p>}
              </div>

              {/* Description */}
              {currentArtwork?.description && (
                <p className="text-muted-foreground mb-6 leading-relaxed">{currentArtwork.description}</p>
              )}
            </div>

            {/* Artwork Specifications */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dimensions</p>
                <p className="font-medium">
                  {currentArtwork?.dimensions?.width && currentArtwork?.dimensions?.height
                    ? `${currentArtwork.dimensions.width} × ${currentArtwork.dimensions.height} ${currentArtwork.dimensions.unit || "cm"}`
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medium</p>
                <p className="font-medium">{currentArtwork?.medium || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Year</p>
                <p className="font-medium">{currentArtwork?.year || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="font-medium">{currentArtwork?.isOriginal ? "Original" : "Print"}</p>
              </div>
            </div>

            {/* Edition Info (if available) */}
            {currentArtwork?.edition && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Edition Information</p>
                <p className="text-blue-800">
                  Edition {currentArtwork.edition.number} of {currentArtwork.edition.total}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {!isOwner && !isSold && (
                <Button size="lg" className="w-full text-lg py-6" onClick={handlePurchase}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Purchase for €{currentArtwork?.price?.toLocaleString() || "0"}
                </Button>
              )}

              {isSold && (
                <Button size="lg" className="w-full" disabled>
                  Artwork Sold
                </Button>
              )}

              {/* Secondary Actions */}
              <div className="flex gap-3">
                <Button variant="outline" size="icon" onClick={() => setIsLiked(!isLiked)} className="flex-shrink-0">
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>

                <Button variant="outline" size="icon" className="flex-shrink-0">
                  <Share2 className="h-5 w-5" />
                </Button>

                {!isOwner && (
                  <Button variant="outline" className="flex-1" onClick={handleContactArtist}>
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Message Artist
                  </Button>
                )}
              </div>
            </div>

            {/* Tags */}
            {currentArtwork?.tags && currentArtwork.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {currentArtwork.tags.map((tag) => (
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
        <Tabs defaultValue="details" className="mt-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="artist">Artist</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4">Artwork Details</h3>
              <p className="mb-4">{currentArtwork?.description || "No description available."}</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Specifications</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="font-medium">Medium:</dt>
                      <dd>{currentArtwork?.medium || "Not specified"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Dimensions:</dt>
                      <dd>
                        {currentArtwork?.dimensions?.width && currentArtwork?.dimensions?.height
                          ? `${currentArtwork.dimensions.width} × ${currentArtwork.dimensions.height} ${currentArtwork.dimensions.unit || "cm"}`
                          : "Not specified"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Year:</dt>
                      <dd>{currentArtwork?.year || "Not specified"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Type:</dt>
                      <dd>{currentArtwork?.isOriginal ? "Original artwork" : "Print"}</dd>
                    </div>
                    {currentArtwork?.edition && (
                      <div>
                        <dt className="font-medium">Edition:</dt>
                        <dd>
                          {currentArtwork.edition.number} of {currentArtwork.edition.total}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Condition & Authenticity</h4>
                  <p className="text-sm text-muted-foreground">
                    This artwork comes with a certificate of authenticity and is in excellent condition, ready for
                    display in your collection.
                  </p>
                  <div className="mt-4">
                    <p className="text-sm font-medium">
                      Status: <Badge variant="secondary">{currentArtwork?.status}</Badge>
                    </p>
                    {currentArtwork?.approvedAt && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Approved: {new Date(currentArtwork.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="artist" className="mt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" alt={currentArtwork?.artist?.username} />
                <AvatarFallback className="text-lg">
                  {(currentArtwork?.artist?.username || "A")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{currentArtwork?.artist?.username || "Unknown Artist"}</h3>
                <p className="text-muted-foreground mb-4">
                  {currentArtwork?.artist?.profile?.bio || "No biography available."}
                </p>

                {/* Artist Links */}
                {currentArtwork?.artist?.profile && (
                  <div className="space-y-2 mb-4">
                    {currentArtwork.artist.profile.website && (
                      <a
                        href={currentArtwork.artist.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Website
                      </a>
                    )}
                    {currentArtwork.artist.profile.socialLinks?.instagram && (
                      <a
                        href={currentArtwork.artist.profile.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline ml-4"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Instagram
                      </a>
                    )}
                    {currentArtwork.artist.profile.socialLinks?.twitter && (
                      <a
                        href={currentArtwork.artist.profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline ml-4"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Twitter
                      </a>
                    )}
                  </div>
                )}

                <Button variant="outline" asChild>
                  <Link href={`/artists/${currentArtwork?.artist?._id}`}>View Full Profile</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="mt-6">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Shipping Information</h4>
                <p className="text-muted-foreground mb-4">
                  All artworks are carefully packaged and insured for safe delivery.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium mb-2">Delivery Options</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Standard shipping: 5-7 business days</li>
                    <li>• Express shipping: 2-3 business days</li>
                    <li>• Local pickup available</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Returns & Exchanges</h5>
                  <p className="text-sm text-muted-foreground">
                    14-day return policy. Items must be returned in original condition.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  )
}
