"use client"

import { useState, useMemo, useEffect } from "react"
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
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { fetchUsers } from "@/lib/store/slices/adminSlice" // We'll use admin slice to fetch users

export default function ArtistsPage() {
  const dispatch = useAppDispatch()
  const { users, usersLoading, usersError } = useAppSelector((state) => state.admin)

  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [filterBySpecialty, setFilterBySpecialty] = useState("all")

  useEffect(() => {
    // Fetch artists (users with role 'artist')
    dispatch(fetchUsers({ role: "artist", limit: 50 }))
  }, [dispatch])

  const artists = users.filter((user) => user.role === "artist")

  // Update specialties to work with real data
  const allSpecialties = [
    "Painting",
    "Digital Art",
    "Photography",
    "Sculpture",
    "Mixed Media",
    "Abstract",
    "Portrait",
    "Landscape",
  ]

  const filteredArtists = useMemo(() => {
    const filtered = artists.filter((artist) => {
      const matchesSearch =
        searchTerm === "" ||
        artist.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artist.profile?.bio && artist.profile.bio.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesSpecialty = filterBySpecialty === "all" // Simplified for now until we have proper artist profile structure

      return matchesSearch && matchesSpecialty
    })

    // Sort artists based on real data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return 0 // Will implement when artist profile structure is available
        case "sales":
          return 0 // Will implement when artist profile structure is available
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
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
              {allSpecialties.map((specialty: string) => (
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
        {usersLoading ? (
          <div className="flex items-center justify-center py-12 col-span-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading artists...</p>
            </div>
          </div>
        ) : filteredArtists.length > 0 ? (
          filteredArtists.map((artist) => {
            const profile = null // Will be implemented when proper artist profile structure is available

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
                      {artist.profile?.bio || "No bio available"}
                    </p>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>0.0</span>
                        <span className="text-muted-foreground">(0)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span>0 sales</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      <Badge variant="outline" className="text-xs">
                        Artist
                      </Badge>
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/artists/${artist._id}`}>View Profile</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
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
