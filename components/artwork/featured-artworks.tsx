import { Button } from "@/components/ui/button"
import { ArtworkCard } from "@/components/artwork/artwork-card"
import Link from "next/link"

const featuredArtworks = [
  {
    id: "1",
    title: "Abstract Harmony",
    artist: "Emma Johnson",
    price: 450,
    image: "/placeholder.svg?height=400&width=300",
    category: "Painting",
  },
  {
    id: "2",
    title: "Digital Dreams",
    artist: "Michael Chen",
    price: 350,
    image: "/placeholder.svg?height=400&width=300",
    category: "Digital Art",
  },
  {
    id: "3",
    title: "Nature's Embrace",
    artist: "Sofia Rodriguez",
    price: 550,
    image: "/placeholder.svg?height=400&width=300",
    category: "Sculpture",
  },
  {
    id: "4",
    title: "Urban Perspective",
    artist: "David Kim",
    price: 400,
    image: "/placeholder.svg?height=400&width=300",
    category: "Photography",
  },
]

export function FeaturedArtworks() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Artwork</h2>
            <p className="text-muted-foreground max-w-2xl">
              Discover unique pieces from talented artists around the world.
            </p>
          </div>
          <Button variant="outline" className="mt-4 md:mt-0" asChild>
            <Link href="/browse">View All Artwork</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      </div>
    </section>
  )
}
