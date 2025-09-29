"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppSelector } from "@/lib/hooks/redux"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth/auth-gaurd"
import { Search, Edit, Trash2, Plus, Filter, Loader2, AlertCircle, RefreshCw, Calendar, DollarSign, ImageIcon, Grid3X3, List, User, ShoppingBag, Palette } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { artworkApi } from "@/lib/api/artwork"
import type { Artwork } from "@/lib/types/artwork"

interface ArtworkWithOwnership extends Artwork {
  currentOwner?: {
    _id: string
    username: string
    email?: string
  }
  ownershipContext?: {
    isOwner?: boolean
    isCurrentOwner?: boolean
    canPurchase?: boolean
    purchaseType?: "from_artist" | "from_owner" | null
    canEdit?: boolean
    canDelete?: boolean
  }
}

function MyArtworksContent() {
  const { toast } = useToast()
  const { user } = useAppSelector((state) => state.auth)

  const [createdArtworks, setCreatedArtworks] = useState<ArtworkWithOwnership[]>([])
  const [ownedArtworks, setOwnedArtworks] = useState<ArtworkWithOwnership[]>([])
  const [soldArtworks, setSoldArtworks] = useState<ArtworkWithOwnership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null)
  const [deletingArtwork, setDeletingArtwork] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("created")

  const fetchMyArtworks = async () => {
    try {
      setLoading(true)
      setError(null)

      const normalize = (resp: any): ArtworkWithOwnership[] => {
        return resp?.data?.data?.artworks || resp?.data?.artworks || resp?.artworks || []
      }

      const createdResponse = await artworkApi.getMyArtworks({ view: "created" })
      setCreatedArtworks(normalize(createdResponse))

      const ownedResponse = await artworkApi.getMyArtworks({ view: "owned" })
      setOwnedArtworks(normalize(ownedResponse))

      const soldResponse = await artworkApi.getMyArtworks({ view: "sold" })
      setSoldArtworks(normalize(soldResponse))
    } catch (err: any) {
      console.error("Fetch artworks error:", err)
      setError(err?.message || "Failed to fetch artworks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      void fetchMyArtworks()
    }
  }, [user])

  const getCurrentArtworks = () => {
    switch (activeTab) {
      case "created":
        return createdArtworks
      case "owned":
        return ownedArtworks
      case "sold":
        return soldArtworks
      default:
        return createdArtworks
    }
  }

  const filteredArtworks = getCurrentArtworks().filter((artwork: any) => {
    const title = (artwork?.title || "").toLowerCase()
    const description = (artwork?.description || "").toLowerCase()
    const medium = (artwork?.medium || "").toLowerCase()
    const matchesSearch =
      title.includes(searchTerm.toLowerCase()) ||
      description.includes(searchTerm.toLowerCase()) ||
      medium.includes(searchTerm.toLowerCase())

    const status = artwork?.status || ""
    const matchesStatus = statusFilter === "all" || status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDeleteArtwork = async () => {
    if (!artworkToDelete) return

    try {
      setDeletingArtwork(true)
      await artworkApi.deleteArtwork(artworkToDelete)

      toast({
        title: "Artwork deleted",
        description: "The artwork has been deleted successfully.",
      })

      setCreatedArtworks((prev) => prev.filter((artwork: any) => (artwork._id || artwork.id) !== artworkToDelete))
      setDeleteDialogOpen(false)
      setArtworkToDelete(null)
    } catch (err: any) {
      console.error("Delete artwork error:", err)
      toast({
        title: "Error",
        description: err?.message || "Failed to delete artwork. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingArtwork(false)
    }
  }

  const openDeleteDialog = (artworkId: string) => {
    setArtworkToDelete(artworkId)
    setDeleteDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getOwnershipStatus = (artwork: any) => {
    if (activeTab === "created") {
      if ((artwork.currentOwner?._id || artwork.artist?._id) === artwork.artist?._id) {
        return {
          status: "available",
          label: "Available for Purchase",
          className: "text-green-600",
        }
      } else {
        return {
          status: "sold",
          label: `Sold`,
          className: "text-blue-600",
        }
      }
    } else if (activeTab === "owned") {
      return {
        status: "owned",
        label: "You own this artwork",
        className: "text-purple-600",
      }
    } else {
      return {
        status: "sold",
        label: `Sold`,
        className: "text-blue-600",
      }
    }
  }

  const handleRetry = () => {
    void fetchMyArtworks()
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Loading Your Artworks</h2>
            <p className="text-muted-foreground">Fetching your artwork collection...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Error Loading Artworks</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4 sm:py-8">
      <div className="flex flex-col space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Artworks</h1>
            <p className="text-muted-foreground">Manage your artwork collection</p>
          </div>
          <Link href="/create-listing">
          <Button asChild className="w-full sm:w-auto">
            
              <Plus className="mr-2 h-4 w-4" />
              Add New Artwork
            
          </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-lg sm:text-2xl font-bold">{createdArtworks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Owned</p>
                  <p className="text-lg sm:text-2xl font-bold">{ownedArtworks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Sold</p>
                  <p className="text-lg sm:text-2xl font-bold">{soldArtworks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-lg sm:text-2xl font-bold">
                    €
                    {soldArtworks
                      .reduce((sum: number, artwork: any) => sum + Number(artwork?.price || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="created" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Created ({createdArtworks.length})
            </TabsTrigger>
            <TabsTrigger value="owned" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Owned ({ownedArtworks.length})
            </TabsTrigger>
            <TabsTrigger value="sold" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Sold ({soldArtworks.length})
            </TabsTrigger>
          </TabsList>

          <Card className="mt-4">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search artworks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {activeTab === "created" && (
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <div className="hidden sm:flex border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  {activeTab === "created" && "Created Artworks"}
                  {activeTab === "owned" && "Owned Artworks"}
                  {activeTab === "sold" && "Sold Artworks"}
                </CardTitle>
                <CardDescription>
                  {filteredArtworks.length} of {getCurrentArtworks().length} artworks
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {filteredArtworks.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {getCurrentArtworks().length === 0
                        ? `No ${activeTab} artworks yet`
                        : "No artworks match your filters"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {getCurrentArtworks().length === 0
                        ? activeTab === "created"
                          ? "Start by creating your first artwork listing."
                          : activeTab === "owned"
                            ? "Purchase artworks to see them here."
                            : "Sell your artworks to see them here."
                        : "Try adjusting your search or filter criteria."}
                    </p>
                    {getCurrentArtworks().length === 0 && activeTab === "created" && (
                      <Link href="/create-listing">
                      <Button asChild>
                        
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Artwork
                       
                      </Button>
                       </Link>
                    )}
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredArtworks.map((artwork: any) => {
                      const ownershipStatus = getOwnershipStatus(artwork)
                      const img = (artwork?.images && artwork.images[0]) || "/abstract-colorful-artwork.png"
                      const price = Number(artwork?.price || 0)
                      return (
                        <Card key={artwork._id || artwork.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative aspect-[3/4] bg-gray-100">
                            <Image src={img || "/placeholder.svg"} alt={artwork.title} fill className="object-cover" />
                            <div className="absolute top-2 right-2">
                              {activeTab === "created" ? (
                                <Badge className={getStatusColor(artwork.status)}>{artwork.status}</Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800">
                                  {activeTab === "owned" ? "Owned" : "Sold"}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardContent className="p-3 sm:p-4">
                            <h3 className="font-semibold text-sm sm:text-base line-clamp-1 mb-1">{artwork.title}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                              {artwork.description}
                            </p>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center text-sm font-medium">
                                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mr-1" />€
                                {price.toLocaleString()}
                              </div>
                              <span className="text-xs text-muted-foreground">{artwork.medium}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {artwork.createdAt ? new Date(artwork.createdAt).toLocaleDateString() : ""}
                              </div>
                              <span className={ownershipStatus.className}>{ownershipStatus.label}</span>
                            </div>
                            {activeTab === "created" && artwork.status === "rejected" && artwork.rejectionReason && (
                              <p className="text-xs text-red-600 mb-3 line-clamp-2">{artwork.rejectionReason}</p>
                            )}
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                                <Link href={`/browse/${artwork._id || artwork.id}`}>View Details</Link>
                              </Button>
                              {activeTab === "created" && (
                                <>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/create-listing?edit=${artwork._id || artwork.id}`}>
                                      <Edit className="h-3 w-3" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDeleteDialog(artwork._id || artwork.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px] sm:w-[100px]">Image</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead className="hidden sm:table-cell">Status</TableHead>
                          <TableHead className="hidden md:table-cell">Price</TableHead>
                          <TableHead className="hidden lg:table-cell">Medium</TableHead>
                          <TableHead className="hidden lg:table-cell">Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredArtworks.map((artwork: any) => {
                          const price = Number(artwork?.price || 0)
                          return (
                            <TableRow key={artwork._id || artwork.id}>
                              <TableCell>
                                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100">
                                  <Image
                                    src={
                                      (artwork?.images && artwork.images[0]) ||
                                      "/placeholder.svg?height=64&width=64&query=artwork"
                                    }
                                    alt={artwork.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm sm:text-base line-clamp-1">{artwork.title}</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:hidden">
                                    €{price.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">
                                    {artwork.description}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {activeTab === "created" ? (
                                  <>
                                    <Badge className={getStatusColor(artwork.status)}>{artwork.status}</Badge>
                                    {artwork.status === "rejected" && artwork.rejectionReason && (
                                      <p className="text-xs text-red-600 mt-1 line-clamp-1">
                                        {artwork.rejectionReason}
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {activeTab === "owned" ? "Owned" : "Sold"}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />€
                                  {price.toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <span className="text-sm">{artwork.medium}</span>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {artwork.createdAt ? new Date(artwork.createdAt).toLocaleDateString() : ""}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/browse/${artwork._id || artwork.id}`}>View</Link>
                                  </Button>
                                  {activeTab === "created" && (
                                    <>
                                      <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/create-listing?edit=${artwork._id || artwork.id}`}>
                                          <Edit className="h-4 w-4" />
                                        </Link>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openDeleteDialog(artwork._id || artwork.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this artwork? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingArtwork}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteArtwork}
              disabled={deletingArtwork}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingArtwork && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function MyArtworksPage() {
  return (
    <AuthGuard>
      <MyArtworksContent />
    </AuthGuard>
  )
}
