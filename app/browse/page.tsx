"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"

// Dynamically import the actual BrowsePage
const BrowsePageClient = dynamic(() => import("./BrowsePage"), {
  loading: () => (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin" />
    </div>
  ),
  ssr: false, // ✅ Works here inside a client component
})

export default function BrowseClientWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>}>
      <BrowsePageClient />
    </Suspense>
  )
}
