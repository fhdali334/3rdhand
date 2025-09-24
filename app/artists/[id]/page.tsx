"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Globe, Instagram, Facebook, Twitter, MessageCircle, Heart, Calendar } from "lucide-react"
import { notFound } from "next/navigation"
import { artistsApi } from "@/lib/api/artists"
import { artworkApi } from "@/lib/api/artwork"
import { ArtworkCard } from "@/components/artwork/artwork-card"
import type { ArtistDetailsResponse } from "@/lib/api/artists"
import type { Artwork } from "@/lib/types/artwork"
import { Skeleton } from "@/components/ui/skeleton"

export default function ArtistProfilePage({ params }: { params: { id: string } }) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [artistDetails, setArtistDetails] = useState<ArtistDetailsResponse["data"]["profile"] | null>(null)
  const [artistArtworks, setArtistArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true)
        const [artistResponse, artworksResponse] = await Promise.all([
          artistsApi.getArtistDetails(params.id),
          artworkApi.getArtworksByArtist(params.id, { status: "approved" }),
        ])

        if (artistResponse.data?.profile) {
          setArtistDetails(artistResponse.data.profile)
        } else {
          notFound()
        }

        if (artworksResponse.data?.data?.artworks) {
          setArtistArtworks(artworksResponse.data.data.artworks)
        }
      } catch (err) {
        console.error("[v0] Failed to fetch artist data:", err)
        setError("Failed to load artist profile. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchArtistData()
  }, [params.id])

  if (loading) {
    return (
      <>
        <div className="container py-8">
          <div className="relative mb-8">
            <Skeleton className="h-32 sm:h-48 md:h-64 bg-gray-200 rounded-lg mb-4 sm:mb-6" />
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-16 relative z-10">
              <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-background" />
              <div className="flex-1">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-64 mb-2" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-10 w-full mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="container py-8 text-center">
          <h2 className="text-2xl font-bold text-red-500">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </>
    )
  }

  const artist = artistDetails?.user
  const artistProfile = artistDetails?.user.profile
  const artistExtendedProfile = artistDetails?.extendedProfile
  const artistStats = artistDetails?.stats
  const artistEngagement = artistDetails?.engagement

  if (!artist || artist.role !== "artist") {
    notFound()
  }

  const approvedArtworks = artistArtworks

  return (
    <>
      <div className="container py-8">
        {/* Artist Header */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-32 sm:h-48 md:h-64 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg mb-4 sm:mb-6"></div>

          {/* Artist Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-16 relative z-10">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
              <AvatarImage src="/placeholder.svg" alt={artist.username} />
              <AvatarFallback className="text-2xl">
                {artist.username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{artist.username}</h1>
                    {artist.verified && <Badge variant="secondary">Verified Artist</Badge>}
                  </div>
                  <p className="text-muted-foreground mb-2">{artistProfile?.bio || "No bio available"}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(artist.joinedDate || "").getFullYear()}</span>
                    </div>
                    {artistExtendedProfile?.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>
                          {artistExtendedProfile.rating.average.toFixed(1)} ({artistExtendedProfile.rating.count}{" "}
                          reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {artistEngagement?.canFollow && (
                    <Button variant="outline" size="icon" onClick={() => setIsFollowing(!isFollowing)}>
                      <Heart className={`h-4 w-4 ${isFollowing ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                  )}
                  {artistEngagement?.canMessage && (
                    <Button>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message Artist
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Stats */}
            {artistStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Artist Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Sales</span>
                    <span className="font-medium">{artistStats.soldArtworks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Artworks</span>
                    <span className="font-medium">{artistStats.totalArtworks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{artistExtendedProfile?.rating?.average.toFixed(1) || "0.0"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Reviews</span>
                    <span className="font-medium">{artistExtendedProfile?.rating?.count || 0}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specialties */}
            {artistExtendedProfile?.specialties && artistExtendedProfile.specialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {artistExtendedProfile.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Connect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {artistProfile?.website && (
                  <a
                    href={artistProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {artistProfile?.socialLinks?.instagram && (
                  <a
                    href={`https://instagram.com/${artistProfile.socialLinks.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                )}
                {artistProfile?.socialLinks?.facebook && (
                  <a
                    href={`https://facebook.com/${artistProfile.socialLinks.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>
                )}
                {artistProfile?.socialLinks?.twitter && (
                  <a
                    href={`https://twitter.com/${artistProfile.socialLinks.twitter.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </a>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="artworks" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="artworks" className="text-xs sm:text-sm">
                  Artworks ({approvedArtworks.length})
                </TabsTrigger>
                <TabsTrigger value="about" className="text-xs sm:text-sm">
                  About
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs sm:text-sm">
                  Reviews ({artistExtendedProfile?.rating?.count || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="artworks">
                {approvedArtworks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {approvedArtworks.map((artwork) => (
                      <ArtworkCard
                        key={artwork._id}
                        artwork={{
                          _id: artwork._id,
                          title: artwork.title,
                          artist: artist.username,
                          price: artwork.price,
                          images: artwork.images[0],
                          category: artwork.medium || "Art",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No artworks yet</h3>
                    <p className="text-muted-foreground">This artist hasn't published any artworks yet.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle>About {artist.username}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>{artistProfile?.bio || "No bio available"}</p>

                    {artistExtendedProfile && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <h4 className="font-medium mb-2">Artist Journey</h4>
                          <p className="text-sm text-muted-foreground">
                            Member since {new Date(artist.joinedDate || "").toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {artistStats?.soldArtworks || 0} successful sales
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Recognition</h4>
                          <p className="text-sm text-muted-foreground">
                            {artistExtendedProfile.rating?.average.toFixed(1) || "0.0"} star rating from{" "}
                            {artistExtendedProfile.rating?.count || 0} reviews
                          </p>
                          {artist.verified && <p className="text-sm text-muted-foreground">Verified artist</p>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                    <CardDescription>
                      {artistExtendedProfile?.rating?.count || 0} reviews with an average rating of{" "}
                      {artistExtendedProfile?.rating?.average.toFixed(1) || "0.0"} stars
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {artistExtendedProfile?.rating?.count && artistExtendedProfile.rating.count > 0 ? (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          Reviews are not yet available through the API. Displaying summary.
                        </p>
                        {/* You would map over actual review data here if available from the API */}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No reviews available for this artist yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}
