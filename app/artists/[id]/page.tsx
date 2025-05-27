"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Star, Globe, Instagram, Facebook, Twitter, MessageCircle, Heart, Calendar } from "lucide-react"
import { notFound } from "next/navigation"
import { getArtistProfileByUserId, getArtworksByArtist, getUserById } from "@/lib/mock-data"
import { ArtworkCard } from "@/components/artwork/artwork-card"

export default function ArtistProfilePage({ params }: { params: { id: string } }) {
  const [isFollowing, setIsFollowing] = useState(false)

  const artist = getUserById(params.id)
  const artistProfile = getArtistProfileByUserId(params.id)
  const artistArtworks = getArtworksByArtist(params.id)

  if (!artist || artist.role !== "artist") {
    notFound()
  }

  const approvedArtworks = artistArtworks.filter((artwork) => artwork.status === "approved")

  return (
    <>
      <Header />
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{artist.username}</h1>
                    {artist.isVerified && <Badge variant="secondary">Verified Artist</Badge>}
                  </div>
                  <p className="text-muted-foreground mb-2">
                    {artistProfile?.bio || artist.profile.bio || "No bio available"}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(artist.createdAt).getFullYear()}</span>
                    </div>
                    {artistProfile && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>
                          {artistProfile.rating.average.toFixed(1)} ({artistProfile.rating.count} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setIsFollowing(!isFollowing)}>
                    <Heart className={`h-4 w-4 ${isFollowing ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message Artist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Stats */}
            {artistProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Artist Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Sales</span>
                    <span className="font-medium">{artistProfile.totalSales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Artworks</span>
                    <span className="font-medium">{approvedArtworks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{artistProfile.rating.average.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Reviews</span>
                    <span className="font-medium">{artistProfile.rating.count}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specialties */}
            {artistProfile?.specialties && artistProfile.specialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {artistProfile.specialties.map((specialty) => (
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
                  Reviews ({artistProfile?.rating.count || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="artworks">
                {approvedArtworks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {approvedArtworks.map((artwork) => (
                      <ArtworkCard
                        key={artwork._id}
                        artwork={{
                          id: artwork._id,
                          title: artwork.title,
                          artist: artist.username,
                          price: artwork.price,
                          image: artwork.images[0],
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
                    <p>{artistProfile?.bio || artist.profile.bio || "No bio available"}</p>

                    {artistProfile && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <h4 className="font-medium mb-2">Artist Journey</h4>
                          <p className="text-sm text-muted-foreground">
                            Member since {new Date(artistProfile.joinedAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">{artistProfile.totalSales} successful sales</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Recognition</h4>
                          <p className="text-sm text-muted-foreground">
                            {artistProfile.rating.average.toFixed(1)} star rating from {artistProfile.rating.count}{" "}
                            reviews
                          </p>
                          {artist.isVerified && <p className="text-sm text-muted-foreground">Verified artist</p>}
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
                      {artistProfile?.rating.count || 0} reviews with an average rating of{" "}
                      {artistProfile?.rating.average.toFixed(1) || "0.0"} stars
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Mock reviews */}
                      <div className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-sm font-medium">Sarah Williams</span>
                          <span className="text-sm text-muted-foreground">2 weeks ago</span>
                        </div>
                        <p className="text-sm">
                          Amazing artwork and excellent communication. The piece arrived exactly as described and the
                          packaging was perfect. Highly recommend this artist!
                        </p>
                      </div>
                      <div className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4].map((star) => (
                              <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            <Star className="h-4 w-4 text-gray-300" />
                          </div>
                          <span className="text-sm font-medium">John Doe</span>
                          <span className="text-sm text-muted-foreground">1 month ago</span>
                        </div>
                        <p className="text-sm">
                          Beautiful work, though shipping took a bit longer than expected. The quality is excellent and
                          I'm very happy with my purchase.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
