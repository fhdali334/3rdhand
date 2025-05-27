"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Heart, MessageCircle, Share2, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { mockArtworks, getUserById, getArtistProfileByUserId, mockTraceabilityRecords } from "@/lib/mock-data"
import { notFound } from "next/navigation"

export default function ArtworkDetailPage({ params }: { params: { id: string } }) {
  const [isLiked, setIsLiked] = useState(false)
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 100) + 50)

  const artwork = mockArtworks.find((a) => a._id === params.id)

  if (!artwork) {
    notFound()
  }

  const artist = getUserById(artwork.artist)
  const artistProfile = getArtistProfileByUserId(artwork.artist)
  const traceabilityHistory = mockTraceabilityRecords.filter((tr) => tr.artworkId === artwork._id)

  useEffect(() => {
    // Simulate view count increment
    setViewCount((prev) => prev + 1)
  }, [])

  if (!artist) {
    return <div>Artist not found</div>
  }

  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Artwork image */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
              <Image src={artwork.images[0] || "/placeholder.svg"} alt={artwork.title} fill className="object-cover" />
            </div>
            {artwork.images.length > 1 && (
              <div className="grid grid-cols-4 gap-1 sm:gap-2">
                {artwork.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${artwork.title} view ${index + 2}`}
                      fill
                      className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Artwork details */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge className="mb-2 text-xs sm:text-sm">{artwork.medium || "Art"}</Badge>
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 mr-1" />
                  {viewCount} views
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">{artwork.title}</h1>
              <div className="flex items-center mb-4">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/placeholder.svg" alt={artist.username} />
                  <AvatarFallback>
                    {artist.username
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Link href={`/artists/${artist._id}`} className="text-sm hover:underline">
                  by {artist.username}
                </Link>
                {artistProfile?.verified && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold mb-4">€{artwork.price}</p>
              <p className="text-muted-foreground mb-6">{artwork.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Dimensions</p>
                <p>
                  {artwork.dimensions.width && artwork.dimensions.height
                    ? `${artwork.dimensions.width} x ${artwork.dimensions.height} ${artwork.dimensions.unit}`
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medium</p>
                <p>{artwork.medium || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p>{artwork.year || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p>{artwork.isOriginal ? "Original" : "Print"}</p>
              </div>
              {artwork.edition && (
                <div>
                  <p className="text-sm text-muted-foreground">Edition</p>
                  <p>
                    {artwork.edition.number} of {artwork.edition.total}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3 sm:space-y-4">
              <Button size="lg" className="text-sm sm:text-base" disabled={artwork.soldAt !== undefined}>
                {artwork.soldAt ? "Sold" : "Contact Artist"}
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={() => setIsLiked(!isLiked)}>
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  <span className="sr-only">Add to favorites</span>
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-5 w-5" />
                  <span className="sr-only">Share</span>
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Message Artist
                </Button>
              </div>
            </div>

            {artwork.tags.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {artwork.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="details" className="mt-8 sm:mt-12">
          <TabsList className="mb-4 grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="details" className="text-xs sm:text-sm">
              Details
            </TabsTrigger>
            <TabsTrigger value="artist" className="text-xs sm:text-sm">
              Artist
            </TabsTrigger>
            <TabsTrigger value="traceability" className="text-xs sm:text-sm">
              Traceability
            </TabsTrigger>
            <TabsTrigger value="shipping" className="text-xs sm:text-sm">
              Shipping
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <h3 className="text-xl font-medium">Artwork Details</h3>
            <p>{artwork.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium mb-2">Specifications</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <strong>Medium:</strong> {artwork.medium}
                  </li>
                  <li>
                    <strong>Dimensions:</strong>{" "}
                    {artwork.dimensions.width && artwork.dimensions.height
                      ? `${artwork.dimensions.width} x ${artwork.dimensions.height} ${artwork.dimensions.unit}`
                      : "Not specified"}
                  </li>
                  <li>
                    <strong>Year:</strong> {artwork.year}
                  </li>
                  <li>
                    <strong>Type:</strong> {artwork.isOriginal ? "Original" : "Print"}
                  </li>
                  {artwork.edition && (
                    <li>
                      <strong>Edition:</strong> {artwork.edition.number} of {artwork.edition.total}
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Condition & Authenticity</h4>
                <p className="text-sm">
                  This artwork comes with a certificate of authenticity signed by the artist. The piece is in excellent
                  condition and ready for display.
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="artist" className="space-y-4">
            <div className="flex items-center mb-4">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src="/placeholder.svg" alt={artist.username} />
                <AvatarFallback>
                  {artist.username
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-medium">{artist.username}</h3>
                <p className="text-muted-foreground">{artistProfile?.bio || artist.profile.bio}</p>
              </div>
            </div>
            {artistProfile && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Artist Stats</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-2xl font-bold">{artistProfile.totalSales}</p>
                      <p className="text-sm text-muted-foreground">Total Sales</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{artistProfile.rating.average.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">Rating ({artistProfile.rating.count} reviews)</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{artistProfile.specialties.length}</p>
                      <p className="text-sm text-muted-foreground">Specialties</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{new Date(artistProfile.joinedAt).getFullYear()}</p>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                    </div>
                  </div>
                </div>
                {artistProfile.specialties.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {artistProfile.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <Button variant="outline" asChild className="mt-4">
              <Link href={`/artists/${artist._id}`}>View Full Artist Profile</Link>
            </Button>
          </TabsContent>
          <TabsContent value="traceability" className="space-y-4">
            <h3 className="text-xl font-medium">Ownership History</h3>
            <p className="text-muted-foreground">
              Track the complete ownership history of this artwork from creation to current owner.
            </p>
            {traceabilityHistory.length > 0 ? (
              <div className="space-y-4">
                {traceabilityHistory.map((record) => {
                  const fromUser = getUserById(record.fromUserId)
                  const toUser = getUserById(record.toUserId)
                  return (
                    <div key={record._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium capitalize">{record.transactionType}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(record.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">
                        {record.transactionType === "created"
                          ? `Created by ${fromUser?.username}`
                          : `Transferred from ${fromUser?.username} to ${toUser?.username}`}
                      </p>
                      {record.additionalData.price && (
                        <p className="text-sm text-muted-foreground">Sale price: €{record.additionalData.price}</p>
                      )}
                      {record.additionalData.location && (
                        <p className="text-sm text-muted-foreground">Location: {record.additionalData.location}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        Transaction Hash: {record.transactionHash}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No traceability records available for this artwork.</p>
            )}
          </TabsContent>
          <TabsContent value="shipping" className="space-y-4">
            <h3 className="text-xl font-medium">Shipping Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Shipping Options</h4>
                <p className="text-sm text-muted-foreground">
                  Artwork is carefully packaged to ensure safe delivery. Shipping costs will be calculated based on your
                  location and the size of the artwork.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Delivery Time</h4>
                <ul className="text-sm space-y-1">
                  <li>• Local delivery (same city): 1-2 business days</li>
                  <li>• National shipping: 3-5 business days</li>
                  <li>• International shipping: 7-14 business days</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Packaging</h4>
                <p className="text-sm text-muted-foreground">
                  All artworks are professionally packaged with protective materials to ensure they arrive in perfect
                  condition. Insurance is included for all shipments.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Returns</h4>
                <p className="text-sm text-muted-foreground">
                  We offer a 14-day return policy for all artwork purchases. Items must be returned in their original
                  condition and packaging.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  )
}
