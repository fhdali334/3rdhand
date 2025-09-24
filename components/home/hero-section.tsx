import { Button } from "@/components/ui/button"
import Link from "next/link"
// import { useTranslation } from "@/lib/hooks/use-translation"

export function HeroSection() {
  //  const { t } = useTranslation()
  return (
    <section className="relative py-16 sm:py-20 md:py-52 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 z-0" />
      <div
        className="absolute inset-0 z-0 opacity-85 "
        style={{
          backgroundImage: "url('/images/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="container relative z-10">
        <div className="max-w-2xl lg:max-w-3xl px-4 sm:px-0">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
            Discover and collect unique artwork
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white mb-6 sm:mb-8">
            Connect directly with artists and find the perfect piece for your collection.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/browse">Browse Artwork</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/auth/register?role=artist">Sell Your Art</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
