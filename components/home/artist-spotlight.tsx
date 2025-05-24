import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const featuredArtists = [
  {
    id: "1",
    name: "Emma Johnson",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Contemporary painter specializing in abstract landscapes",
    artCount: 24,
  },
  {
    id: "2",
    name: "Michael Chen",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Digital artist creating surreal portraits and dreamscapes",
    artCount: 18,
  },
  {
    id: "3",
    name: "Sofia Rodriguez",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Sculptor working with sustainable materials and natural forms",
    artCount: 12,
  },
]

export function ArtistSpotlight() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Artists</h2>
            <p className="text-muted-foreground max-w-2xl">
              Discover talented artists from around the world showcasing their unique work.
            </p>
          </div>
          <Button variant="outline" className="mt-4 md:mt-0" asChild>
            <Link href="/artists">View All Artists</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredArtists.map((artist) => (
            <Card key={artist.id}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={artist.avatar || "/placeholder.svg"} alt={artist.name} />
                    <AvatarFallback>
                      {artist.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-medium mb-2">{artist.name}</h3>
                  <p className="text-muted-foreground mb-4">{artist.bio}</p>
                  <p className="text-sm mb-4">{artist.artCount} artworks</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/artists/${artist.id}`}>View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
