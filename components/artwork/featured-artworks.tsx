"use client"

import { useEffect } from "react"
import { ArtworkCard } from "./artwork-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { fetchArtworks } from "@/lib/store/slices/artworkSlice"

export function FeaturedArtworks() {
  const dispatch = useAppDispatch()
  const { artworks, artworksLoading, artworksError } = useAppSelector((state) => state.artwork)

  useEffect(() => {
    // Fetch featured artworks (latest 6)
    dispatch(
      fetchArtworks({
        limit: 6,
        sort: "-createdAt",
        status: "approved", // Only show approved artworks
      }),
    )
  }, [dispatch])

  if (artworksLoading) {
    return (
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Artworks</h2>
            <p className="text-muted-foreground">Discover exceptional pieces from our community</p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  if (artworksError) {
    return (
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Artworks</h2>
            <p className="text-muted-foreground">Discover exceptional pieces from our community</p>
          </div>
          <div className="text-center">
            <p className="text-destructive mb-4">{artworksError}</p>
            <Button onClick={() => dispatch(fetchArtworks({ limit: 6, sort: "-createdAt" }))}>Try Again</Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Artworks</h2>
          <p className="text-muted-foreground">Discover exceptional pieces from our community</p>
        </div>

        {artworks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {artworks.slice(0, 6).map((artwork) => (
                <ArtworkCard key={artwork._id} artwork={artwork} showArtist={true} />
              ))}
            </div>

            <div className="text-center">
              <Button asChild size="lg">
                <Link href="/browse">View All Artworks</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No featured artworks available at the moment.</p>
            <Button asChild>
              <Link href="/browse">Browse All Artworks</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
