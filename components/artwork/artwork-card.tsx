import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Artwork {
  id: string
  title: string
  artist: string
  price: number
  image: string
  category: string
}

interface ArtworkCardProps {
  artwork: Artwork
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={artwork.image || "/placeholder.svg"}
          alt={artwork.title}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full"
        >
          <Heart className="h-5 w-5" />
          <span className="sr-only">Add to favorites</span>
        </Button>
      </div>
      <CardContent className="p-4">
        <Badge className="mb-2">{artwork.category}</Badge>
        <h3 className="font-medium mb-1 line-clamp-1">{artwork.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">by {artwork.artist}</p>
        <p className="font-medium">€{artwork.price}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/browse/${artwork.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
