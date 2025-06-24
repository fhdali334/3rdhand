// @ts-ignore
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth/auth-gaurd"
import {
  Search,
  Edit,
  Trash2,
  Plus,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  ImageIcon,
  Grid3X3,
  List,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { artworkApi } from "@/lib/api/artwork"
import type { Artwork } from "@/lib/types/auth"

function MyArtworksContent() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)

  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null)
  const [deletingArtwork, setDeletingArtwork] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Fetch user's artworks
  const fetchMyArtworks = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get artworks from user data (already loaded from profile API)
      if (user?.artworks) {
        setArtworks(user.artworks)
      } else {
        // Fallback: fetch from artworks API if not in user data
        const response = await artworkApi.getMyArtworks({})
        if (response?.data?.data?.artworks) {
          setArtworks(response.data.artworks)
        }
      }
    } catch (error: any) {
      console.error("Fetch artworks error:", error)
      setError(error?.message || "Failed to fetch artworks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === "artist") {
      fetchMyArtworks()
    }
  }, [user])

  // Filter artworks based on search and status
  const filteredArtworks = artworks.filter((artwork) => {
    const matchesSearch =
      artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.medium.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || artwork.status === statusFilter

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

      // Remove from local state
      setArtworks((prev) => prev.filter((artwork) => artwork._id !== artworkToDelete))
      setDeleteDialogOpen(false)
      setArtworkToDelete(null)
    } catch (error: any) {
      console.error("Delete artwork error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to delete artwork. Please try again.",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return "✓"
      case "pending":
        return "⏳"
      case "rejected":
        return "✗"
      default:
        return "?"
    }
  }

  const handleRetry = () => {
    fetchMyArtworks()
  }

  if (user?.role !== "artist") {
    return (
      <div className="container py-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            Only artists can access this page. Please contact support if you believe this is an error.
          </p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Artworks</h1>
            <p className="text-muted-foreground">Manage your artwork collection ({artworks.length} total)</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/create-listing">
              <Plus className="mr-2 h-4 w-4" />
              Add New Artwork
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-lg sm:text-2xl font-bold">{artworks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {artworks.filter((a) => a.status === "approved").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {artworks.filter((a) => a.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {artworks.filter((a) => a.status === "rejected").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
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

        {/* Artworks Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Artwork Collection</CardTitle>
            <CardDescription>
              {filteredArtworks.length} of {artworks.length} artworks
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {filteredArtworks.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {artworks.length === 0 ? "No artworks yet" : "No artworks match your filters"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {artworks.length === 0
                    ? "Start by creating your first artwork listing."
                    : "Try adjusting your search or filter criteria."}
                </p>
                {artworks.length === 0 && (
                  <Button asChild>
                    <Link href="/create-listing">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Artwork
                    </Link>
                  </Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredArtworks.map((artwork) => (
                  <Card key={artwork._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-[3/4] bg-gray-100">
                      <Image
                        src={artwork.images[0] || "/placeholder.svg?height=300&width=225"}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={getStatusColor(artwork.status)}>
                          {getStatusIcon(artwork.status)} {artwork.status}
                        </Badge>
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
                          {artwork.price.toLocaleString()}
                        </div>
                        <span className="text-xs text-muted-foreground">{artwork.medium}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(artwork.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {artwork.status === "rejected" && artwork.rejectionReason && (
                        <p className="text-xs text-red-600 mb-3 line-clamp-2">{artwork.rejectionReason}</p>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/create-listing?edit=${artwork._id}`}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(artwork._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // List View
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
                    {filteredArtworks.map((artwork) => (
                      <TableRow key={artwork._id}>
                        <TableCell>
                          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={artwork.images[0] || "/placeholder.svg?height=64&width=64"}
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
                              €{artwork.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">
                              {artwork.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={getStatusColor(artwork.status)}>
                            {getStatusIcon(artwork.status)} {artwork.status}
                          </Badge>
                          {artwork.status === "rejected" && artwork.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1 line-clamp-1">{artwork.rejectionReason}</p>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />€
                            {artwork.price.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm">{artwork.medium}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(artwork.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/create-listing?edit=${artwork._id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(artwork._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
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
