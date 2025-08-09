"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, User, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Artist {
  _id: string
  username: string
  email?: string
}

interface CurrentOwner {
  _id: string
  username: string
  email: string
}

interface Artwork {
  _id: string
  title: string
  artist: Artist | string
  currentOwner?: CurrentOwner
  price: number
  images: string[]
  medium?: string
  isOriginal?: boolean
  soldAt?: string
  category?: string
  ownershipContext?: {
    isOwner: boolean
    canPurchase: boolean
    purchaseType: "from_artist" | "from_owner" | null
  }
}

interface ArtworkCardProps {
  artwork: Artwork
  showArtist?: boolean
  showOwnership?: boolean
}

export function ArtworkCard({ artwork, showArtist = true, showOwnership = false }: ArtworkCardProps) {
  console.log("ArtworkCard: Rendering artwork with ID:", artwork._id)

  const artistInfo = typeof artwork.artist === "object" ? artwork.artist : null
  const isOwned = artwork.currentOwner && artwork.currentOwner._id !== artistInfo?._id
  const isOwnedByUser = artwork.ownershipContext?.isOwner || false

  const getOwnershipDisplay = () => {
    if (isOwnedByUser) {
      return {
        text: "You own this",
        icon: <User className="h-3 w-3" />,
        className: "bg-purple-100 text-purple-800",
      }
    } else if (isOwned && artwork.currentOwner) {
      return {
        text: `Owned by ${artwork.currentOwner.username}`,
        icon: <ShoppingBag className="h-3 w-3" />,
        className: "bg-blue-100 text-blue-800",
      }
    } else {
      return {
        text: "Available",
        icon: <ShoppingBag className="h-3 w-3" />,
        className: "bg-green-100 text-green-800",
      }
    }
  }

  const ownershipDisplay = getOwnershipDisplay()

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

        {/* Ownership Status Badge */}
        {showOwnership && (
          <div className="absolute top-2 left-2">
            <Badge className={`${ownershipDisplay.className} flex items-center gap-1`}>
              {ownershipDisplay.icon}
              <span className="text-xs">{ownershipDisplay.text}</span>
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge className="text-xs">{artwork.medium || "Art"}</Badge>
          {artwork.isOriginal && (
            <Badge variant="outline" className="text-xs">
              Original
            </Badge>
          )}
        </div>

        <h3 className="font-medium mb-1 line-clamp-1 text-sm sm:text-base">{artwork.title}</h3>

        {showArtist && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">by {artistInfo?.username || "Unknown Artist"}</p>
        )}

        {/* Show current owner if different from artist */}
        {showOwnership && isOwned && artwork.currentOwner && !isOwnedByUser && (
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <User className="h-3 w-3" />
            Owned by {artwork.currentOwner.username}
          </p>
        )}

        <div className="flex items-center justify-between">
          <p className="font-medium text-sm sm:text-base">€{artwork.price.toLocaleString()}</p>
          {artwork.ownershipContext?.canPurchase && (
            <Badge variant="secondary" className="text-xs">
              {artwork.ownershipContext.purchaseType === "from_owner" ? "From Owner" : "From Artist"}
            </Badge>
          )}
        </div>
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
