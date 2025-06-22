"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ArtworkCard } from "@/components/artwork/artwork-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Search, Filter, X } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { fetchArtworks, updateArtworksFilters, clearArtworkError } from "@/lib/store/slices/artworkSlice"
import type { ArtworkFilters } from "@/lib/types/artwork"

const MEDIUMS = [
  "Painting",
  "Photography",
  "Sculpture",
  "Digital Art",
  "Drawing",
  "Printmaking",
  "Mixed Media",
  "Ceramics",
  "Textile",
  "Installation",
]

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest First" },
  { value: "-createdAt", label: "Oldest First" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "title", label: "Title A-Z" },
  { value: "-title", label: "Title Z-A" },
]

export default function BrowsePage() {
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const { artworks, artworksLoading, artworksError, artworksPagination, artworksFilters } = useAppSelector(
    (state) => state.artwork,
  )

  const [localFilters, setLocalFilters] = useState<ArtworkFilters>({
    page: 1,
    limit: 12,
    sort: "-createdAt",
    minPrice: 0,
    maxPrice: 10000,
    ...artworksFilters,
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [showFilters, setShowFilters] = useState(false)

  // Initialize from URL params
  useEffect(() => {
    const urlFilters: ArtworkFilters = {}

    if (searchParams.get("q")) {
      urlFilters.q = searchParams.get("q")!
      setSearchQuery(searchParams.get("q")!)
    }
    if (searchParams.get("medium")) {
      urlFilters.medium = searchParams.get("medium")!
    }
    if (searchParams.get("minPrice")) {
      urlFilters.minPrice = Number.parseInt(searchParams.get("minPrice")!)
    }
    if (searchParams.get("maxPrice")) {
      urlFilters.maxPrice = Number.parseInt(searchParams.get("maxPrice")!)
    }
    if (searchParams.get("sort")) {
      urlFilters.sort = searchParams.get("sort")!
    }

    if (Object.keys(urlFilters).length > 0) {
      setLocalFilters((prev) => ({ ...prev, ...urlFilters }))
    }
  }, [searchParams])

  // Fetch artworks when filters change
  useEffect(() => {
    console.log("BrowsePage: Fetching artworks with filters:", localFilters)
    dispatch(fetchArtworks(localFilters))
  }, [dispatch, localFilters])

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearArtworkError())
  }, [dispatch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...localFilters, q: searchQuery, page: 1 }
    setLocalFilters(newFilters)
    dispatch(updateArtworksFilters(newFilters))
  }

  const handleFilterChange = (key: keyof ArtworkFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value, page: 1 }
    setLocalFilters(newFilters)
    dispatch(updateArtworksFilters(newFilters))
  }

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
    const newFilters = {
      ...localFilters,
      minPrice: values[0],
      maxPrice: values[1],
      page: 1,
    }
    setLocalFilters(newFilters)
    dispatch(updateArtworksFilters(newFilters))
  }

  const handleLoadMore = () => {
    if (artworksPagination?.hasNextPage) {
      const newFilters = {
        ...localFilters,
        page: (localFilters.page || 1) + 1,
      }
      setLocalFilters(newFilters)
    }
  }

  const clearFilters = () => {
    const resetFilters: ArtworkFilters = {
      page: 1,
      limit: 12,
      sort: "-createdAt",
    }
    setLocalFilters(resetFilters)
    setSearchQuery("")
    setPriceRange([0, 10000])
    dispatch(updateArtworksFilters(resetFilters))
  }

  const activeFiltersCount = Object.keys(localFilters).filter(
    (key) => key !== "page" && key !== "limit" && localFilters[key as keyof ArtworkFilters],
  ).length

  return (
    <>
      <Header />
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Browse Artworks</h1>
              <p className="text-muted-foreground">Discover unique artworks from talented artists</p>
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artworks, artists, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? "block" : "hidden"}`}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Filters</CardTitle>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sort */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select
                    value={localFilters.sort || "-createdAt"}
                    onValueChange={(value) => handleFilterChange("sort", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price Range: €{priceRange[0]} - €{priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceRangeChange}
                    max={10000}
                    min={0}
                    step={50}
                    className="mt-2"
                  />
                </div>

                <Separator />

                {/* Medium */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Medium</label>
                  <Select
                    value={localFilters.medium || "all"}
                    onValueChange={(value) => handleFilterChange("medium", value === "all" ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All mediums" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All mediums</SelectItem>
                      {MEDIUMS.map((medium) => (
                        <SelectItem key={medium} value={medium}>
                          {medium}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="original"
                        checked={localFilters.isOriginal === true}
                        onCheckedChange={(checked) => handleFilterChange("isOriginal", checked ? true : undefined)}
                      />
                      <label htmlFor="original" className="text-sm">
                        Original works only
                      </label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Availability */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Availability</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="available"
                        checked={localFilters.soldAt === false}
                        onCheckedChange={(checked) => handleFilterChange("soldAt", checked ? false : undefined)}
                      />
                      <label htmlFor="available" className="text-sm">
                        Available only
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Artworks Grid */}
          <div className="lg:col-span-3">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {artworksPagination ? (
                  <>
                    Showing {artworks.length} of {artworksPagination.total} artworks
                  </>
                ) : (
                  `${artworks.length} artworks`
                )}
              </p>
              {localFilters.q && <Badge variant="secondary">Search: "{localFilters.q}"</Badge>}
            </div>

            {/* Error State */}
            {artworksError && (
              <Card className="p-6 text-center">
                <p className="text-destructive mb-4">{artworksError}</p>
                <Button onClick={() => dispatch(fetchArtworks(localFilters))}>Try Again</Button>
              </Card>
            )}

            {/* Loading State */}
            {artworksLoading && artworks.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                  <p>Loading artworks...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!artworksLoading && artworks.length === 0 && !artworksError && (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-2">No artworks found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </Card>
            )}

            {/* Artworks Grid */}
            {artworks.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {artworks.map((artwork) => (
                    <ArtworkCard key={artwork._id} artwork={artwork} showArtist={true} />
                  ))}
                </div>

                {/* Load More */}
                {artworksPagination?.hasNextPage && (
                  <div className="flex justify-center mt-8">
                    <Button onClick={handleLoadMore} disabled={artworksLoading} size="lg">
                      {artworksLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
