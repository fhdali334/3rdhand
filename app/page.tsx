import { Button } from "@/components/ui/button"
import { FeaturedArtworks } from "@/components/artwork/featured-artworks"
import { HeroSection } from "@/components/home/hero-section"
import { HowItWorks } from "@/components/home/how-it-works"
import { ArtistSpotlight } from "@/components/home/artist-spotlight"

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturedArtworks />
      <HowItWorks />
      {/* <ArtistSpotlight /> */}
      <section className="bg-muted py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to join our community?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're an artist looking to showcase your work or a collector searching for unique pieces, 3rdHand
            is the perfect platform for you.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/auth/register">Get Started</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/browse">Browse Artwork</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
