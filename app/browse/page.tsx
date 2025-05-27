"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArtworkCard } from "@/components/artwork/artwork-card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getApprovedArtworks, getUserById } from "@/lib/mock-data"

export default function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortBy, setSortBy] = useState("newest")

  const approvedArtworks = getApprovedArtworks()

  const categories = Array.from(new Set(approvedArtworks.map((a) => a.medium).filter(Boolean)))

  const filteredArtworks = useMemo(() => {
    const filtered = approvedArtworks.filter((artwork) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      // Category filter
      const matchesCategory =
        selectedCategories.length === 0 || (artwork.medium && selectedCategories.includes(artwork.medium))

      // Price filter
      const matchesPrice = artwork.price >= priceRange[0] && artwork.price <= priceRange[1]

      return matchesSearch && matchesCategory && matchesPrice
    })

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default:
        break
    }

    return filtered
  }, [approvedArtworks, searchTerm, selectedCategories, priceRange, sortBy])

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, category])
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category))
    }
  }

  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Browse Artwork</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Discover unique pieces from talented artists</p>
          </div>
          <div className="text-sm text-muted-foreground">{filteredArtworks.length} artworks found</div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
          {/* Filters sidebar */}
          <div className="w-full xl:w-64 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 xl:space-y-6 xl:gap-0">
              <div>
                <h3 className="font-medium mb-3 text-sm sm:text-base">Search</h3>
                <Input
                  placeholder="Search artwork..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <h3 className="font-medium mb-3 text-sm sm:text-base">Medium</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                      />
                      <Label htmlFor={`category-${category}`}>{category}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-sm sm:text-base">Price Range</h3>
                <div className="space-y-4">
                  <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={1000} step={10} />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">€{priceRange[0]}</span>
                    <span className="text-sm">€{priceRange[1]}+</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-sm sm:text-base">Sort By</h3>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategories([])
                setPriceRange([0, 1000])
                setSortBy("newest")
              }}
            >
              Clear Filters
            </Button>
          </div>

          {/* Artwork grid */}
          <div className="flex-1">
            {filteredArtworks.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredArtworks.map((artwork) => {
                    const artist = getUserById(artwork.artist)
                    return (
                      <ArtworkCard
                        key={artwork._id}
                        artwork={{
                          id: artwork._id,
                          title: artwork.title,
                          artist: artist?.username || "Unknown Artist",
                          price: artwork.price,
                          image: artwork.images[0],
                          category: artwork.medium || "Art",
                        }}
                      />
                    )
                  })}
                </div>

                {filteredArtworks.length > 12 && (
                  <div className="mt-8 flex justify-center">
                    <Button variant="outline">Load More</Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No artworks found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategories([])
                    setPriceRange([0, 1000])
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
