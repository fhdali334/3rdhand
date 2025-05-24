import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 z-0" />
      <div
        className="absolute inset-0 z-0 opacity-50"
        style={{
          backgroundImage: "url('/images/hero-bg.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "top",
        }}
      />
      <div className="container relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Discover and collect unique artwork</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Connect directly with artists and find the perfect piece for your collection. List your artwork for just €1
            per listing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/browse">Browse Artwork</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/register?role=artist">Sell Your Art</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
