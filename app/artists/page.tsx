"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Star, Palette } from "lucide-react"
import Link from "next/link"
import { mockUsers, mockArtistProfiles, getArtworksByArtist } from "@/lib/mock-data"

export default function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [filterBySpecialty, setFilterBySpecialty] = useState("all")

  const artists = mockUsers.filter((user) => user.role === "artist")
  const allSpecialties = Array.from(new Set(mockArtistProfiles.flatMap((profile) => profile.specialties)))

  const filteredArtists = useMemo(() => {
    const filtered = artists.filter((artist) => {
      const profile = mockArtistProfiles.find((p) => p.userId === artist._id)
      const matchesSearch =
        searchTerm === "" ||
        artist.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile?.bio && profile.bio.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesSpecialty =
        filterBySpecialty === "all" || (profile?.specialties && profile.specialties.includes(filterBySpecialty))

      return matchesSearch && matchesSpecialty
    })

    // Sort artists
    filtered.sort((a, b) => {
      const profileA = mockArtistProfiles.find((p) => p.userId === a._id)
      const profileB = mockArtistProfiles.find((p) => p.userId === b._id)

      switch (sortBy) {
        case "rating":
          return (profileB?.rating.average || 0) - (profileA?.rating.average || 0)
        case "sales":
          return (profileB?.totalSales || 0) - (profileA?.totalSales || 0)
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "name":
          return a.username.localeCompare(b.username)
        default:
          return 0
      }
    })

    return filtered
  }, [artists, searchTerm, sortBy, filterBySpecialty])

  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Discover Artists</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Connect with talented artists from around the world
            </p>
          </div>
          <div className="text-sm text-muted-foreground">{filteredArtists.length} artists found</div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <Input placeholder="Search artists..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={filterBySpecialty} onValueChange={setFilterBySpecialty}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {allSpecialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="sales">Most Sales</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Artists Grid */}
        {filteredArtists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredArtists.map((artist) => {
              const profile = mockArtistProfiles.find((p) => p.userId === artist._id)
              const artworkCount = getArtworksByArtist(artist._id).length

              return (
                <Card key={artist._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mb-3 sm:mb-4">
                        <AvatarImage src="/placeholder.svg" alt={artist.username} />
                        <AvatarFallback className="text-lg">
                          {artist.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold">{artist.username}</h3>
                        {artist.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                        {profile?.bio || artist.profile.bio || "No bio available"}
                      </p>

                      {profile && (
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{profile.rating.average.toFixed(1)}</span>
                            <span className="text-muted-foreground">({profile.rating.count})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Palette className="h-4 w-4 text-muted-foreground" />
                            <span>{artworkCount} works</span>
                          </div>
                        </div>
                      )}

                      {profile?.specialties && profile.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {profile.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {profile.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{profile.specialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <Button asChild className="w-full">
                        <Link href={`/artists/${artist._id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No artists found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setFilterBySpecialty("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
