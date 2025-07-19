"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Artwork {
  _id: string
  title: string
  artist:
    | {
        _id: string
        username: string
      }
    | string // Allow both object and string types
  price: number
  images: any
  medium?: string
  isOriginal?: boolean
  soldAt?: string
  category?: string
}

interface ArtworkCardProps {
  artwork: Artwork
  showArtist?: boolean // Made optional with default
}

export function ArtworkCard({ artwork, showArtist = true }: ArtworkCardProps) {
  console.log("ArtworkCard: Rendering artwork with ID:", artwork._id)

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={artwork.images?.[0] || "/placeholder.svg"}
          alt={artwork.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full h-8 w-8 sm:h-10 sm:w-10"
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to favorites</span>
        </Button>
      </div>
      <CardContent className="p-3 sm:p-4">
        <Badge className="mb-2 text-xs">{artwork.medium || "Art"}</Badge>
        <h3 className="font-medium mb-1 line-clamp-1 text-sm sm:text-base">{artwork.title}</h3>
        {showArtist && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            by {typeof artwork.artist === "object" ? artwork.artist.username : "Unknown Artist"}
          </p>
        )}
        <p className="font-medium text-sm sm:text-base">€{artwork.price}</p>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0">
        <Button variant="outline" className="w-full text-xs sm:text-sm bg-transparent" asChild>
          <Link
            href={`/browse/${artwork._id}`}
            onClick={() => {
              console.log("View Details clicked for artwork ID:", artwork._id)
            }}
          >
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
