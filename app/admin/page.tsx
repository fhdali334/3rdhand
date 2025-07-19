"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Clock, DollarSign, Eye, Users, XCircle, Search, AlertCircle, RefreshCw } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import {
  fetchPlatformOverview,
  fetchPendingArtworks,
  fetchUsers,
  fetchTransactions,
  fetchAllArtworks,
  fetchArtworkStats,
  fetchUserStats,
  approveArtwork,
  rejectArtwork,
  updatePendingArtworksFilters,
  updateUsersFilters,
  updateAllArtworksFilters,
  clearAdminError,
  updateTransactionsFilters,
} from "@/lib/store/slices/adminSlice"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { AdminGuard } from "@/components/auth/admin-guard"

function AdminDashboardContent() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const {
    overview,
    revenue,
    recentActivity,
    overviewLoading,
    overviewError,
    pendingArtworks,
    pendingArtworksLoading,
    pendingArtworksError,
    pendingArtworksPagination,
    pendingArtworksFilters,
    users,
    usersLoading,
    usersError,
    usersPagination,
    usersFilters,
    transactions,
    transactionsLoading,
    transactionsError,
    transactionsPagination,
    transactionsFilters,
    allArtworks,
    allArtworksLoading,
    allArtworksError,
    allArtworksPagination,
    allArtworksFilters,
    artworkStats,
    userStats,
    statsLoading,
  } = useAppSelector((state) => state.admin)

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    console.log("🚀 Component: Initializing admin dashboard...")
    dispatch(clearAdminError())
    dispatch(fetchPlatformOverview({}))
    dispatch(fetchPendingArtworks({}))
    dispatch(fetchArtworkStats({}))
    dispatch(fetchUserStats({}))
  }, [dispatch])

  const handleApproveArtwork = async (artworkId: string) => {
    try {
      await dispatch(approveArtwork(artworkId)).unwrap()
      toast({
        title: "Artwork approved",
        description: "The artwork has been approved successfully.",
      })
      // Refresh data
      dispatch(fetchPendingArtworks(pendingArtworksFilters))
      dispatch(fetchPlatformOverview({}))
    } catch (error: any) {
      console.error("Approve artwork error:", error)
      toast({
        title: "Error",
        description: error || "Failed to approve artwork. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRejectArtwork = async () => {
    if (!selectedArtworkId || !rejectionReason.trim()) return

    try {
      await dispatch(rejectArtwork({ artworkId: selectedArtworkId, reason: rejectionReason })).unwrap()
      toast({
        title: "Artwork rejected",
        description: "The artwork has been rejected with the provided reason.",
      })
      setRejectDialogOpen(false)
      setSelectedArtworkId(null)
      setRejectionReason("")
      // Refresh data
      dispatch(fetchPendingArtworks(pendingArtworksFilters))
      dispatch(fetchPlatformOverview({}))
    } catch (error: any) {
      console.error("Reject artwork error:", error)
      toast({
        title: "Error",
        description: error || "Failed to reject artwork. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openRejectDialog = (artworkId: string) => {
    setSelectedArtworkId(artworkId)
    setRejectDialogOpen(true)
  }

  const handleTabChange = (value: string) => {
    console.log("📑 Component: Tab changed to:", value)
    switch (value) {
      case "users":
        if (users.length === 0 && !usersLoading) {
          dispatch(fetchUsers({}))
        }
        break
      case "transactions":
        if (transactions.length === 0 && !transactionsLoading) {
          dispatch(fetchTransactions({}))
        }
        break
      case "listings":
        if (allArtworks.length === 0 && !allArtworksLoading) {
          dispatch(fetchAllArtworks({}))
        }
        break
    }
  }

  const handleSearch = (value: string, type: string) => {
    setSearchTerm(value)
    switch (type) {
      case "pending":
        dispatch(updatePendingArtworksFilters({ search: value, page: 1 }))
        dispatch(fetchPendingArtworks({ ...pendingArtworksFilters, search: value, page: 1 }))
        break
      case "users":
        dispatch(updateUsersFilters({ search: value, page: 1 }))
        dispatch(fetchUsers({ ...usersFilters, search: value, page: 1 }))
        break
      case "listings":
        dispatch(updateAllArtworksFilters({ search: value, page: 1 }))
        dispatch(fetchAllArtworks({ ...allArtworksFilters, search: value, page: 1 }))
        break
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleRetry = (action: string) => {
    dispatch(clearAdminError())
    switch (action) {
      case "overview":
        dispatch(fetchPlatformOverview({}))
        break
      case "pending":
        dispatch(fetchPendingArtworks({}))
        break
      case "users":
        dispatch(fetchUsers({}))
        break
      case "transactions":
        dispatch(fetchTransactions({}))
        break
      case "listings":
        dispatch(fetchAllArtworks({}))
        break
    }
  }

  if (overviewLoading && !overview) {
    return (
      <>
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage the 3rdHand art marketplace</p>
          </div>
          <Button
            variant="outline"
            onClick={() => handleRetry("overview")}
            disabled={overviewLoading}
            className="mt-4 lg:mt-0"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${overviewLoading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        {/* Error Banner */}
        {overviewError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-red-800">Failed to load dashboard data</h3>
                  <p className="text-sm text-red-600">{overviewError}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleRetry("overview")} className="ml-auto">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {overview?.totalArtists || 0} artists, {overview?.totalBuyers || 0} buyers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.pendingApprovals || 0}</div>
              <p className="text-xs text-muted-foreground">Artworks awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{((overview?.totalRevenue || 0) / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From listing fees & commissions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalSales || 0}</div>
              <p className="text-xs text-muted-foreground">Completed transactions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending ({pendingArtworks.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="listings" className="text-xs sm:text-sm">
              Listings ({allArtworks.length})
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm">
              Transactions ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="messages" className="text-xs sm:text-sm">
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Artwork Approvals</CardTitle>
                <CardDescription>Review and approve new artwork listings.</CardDescription>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search artworks..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value, "pending")}
                    />
                  </div>
                  <Button variant="outline" onClick={() => handleRetry("pending")} disabled={pendingArtworksLoading}>
                    <RefreshCw className={`h-4 w-4 ${pendingArtworksLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pendingArtworksError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error Loading Pending Artworks</h3>
                    <p className="text-muted-foreground mb-4">{pendingArtworksError}</p>
                    <Button onClick={() => handleRetry("pending")}>Try Again</Button>
                  </div>
                ) : pendingArtworksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : pendingArtworks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Artwork</TableHead>
                          <TableHead>Artist</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Fee Paid</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingArtworks.map((artwork) => (
                          <TableRow key={artwork._id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="relative w-12 h-12 rounded overflow-hidden">
                                  <Image
                                    src={artwork.images?.[0] || "/placeholder.svg?height=48&width=48"}
                                    alt={artwork.title || "Artwork"}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">{artwork.title || "Untitled"}</p>
                                  <p className="text-sm text-muted-foreground">{artwork.medium || "Unknown"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{artwork.artist?.username || "Unknown"}</TableCell>
                            <TableCell>€{artwork.price || 0}</TableCell>
                            <TableCell>
                              {artwork.createdAt ? new Date(artwork.createdAt).toLocaleDateString() : "Unknown"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={artwork.listingFeePaid ? "default" : "destructive"}>
                                {artwork.listingFeePaid ? "Paid" : "Unpaid"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent" asChild>
                                  <Link href={`/browse/${artwork._id}`}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-green-500 hover:text-green-600 bg-transparent"
                                  onClick={() => handleApproveArtwork(artwork._id)}
                                  disabled={!artwork.listingFeePaid}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="sr-only">Approve</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 bg-transparent"
                                  onClick={() => openRejectDialog(artwork._id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span className="sr-only">Reject</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No pending artwork approvals at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions.</CardDescription>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8"
                      onChange={(e) => handleSearch(e.target.value, "users")}
                    />
                  </div>
                  <Select
                    value={usersFilters.role || "all"}
                    onValueChange={(value) => {
                      const role = value === "all" ? undefined : (value as "artist" | "buyer" | "admin")
                      dispatch(updateUsersFilters({ role, page: 1 }))
                      dispatch(fetchUsers({ ...usersFilters, role, page: 1 }))
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="artist">Artists</SelectItem>
                      <SelectItem value="buyer">Buyers</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => handleRetry("users")} disabled={usersLoading}>
                    <RefreshCw className={`h-4 w-4 ${usersLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {usersError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error Loading Users</h3>
                    <p className="text-muted-foreground mb-4">{usersError}</p>
                    <Button onClick={() => handleRetry("users")}>Try Again</Button>
                  </div>
                ) : usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Last Active</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{user.username || "Unknown"}</p>
                                <p className="text-sm text-muted-foreground">
                                  {user.profile?.bio?.substring(0, 50) || "No bio"}
                                  {user.profile?.bio && user.profile.bio.length > 50 ? "..." : ""}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{user.email || "No email"}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === "artist" ? "default" : "secondary"}>
                                {user.role || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.isVerified ? "default" : "secondary"}>
                                {user.isVerified ? "Verified" : "Unverified"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                            </TableCell>
                            <TableCell>
                              {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No users found</h3>
                    <p className="text-muted-foreground">No users match your current filters.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>All Artwork Listings</CardTitle>
                <CardDescription>View and manage all artwork listings on the platform.</CardDescription>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search listings..."
                      className="pl-8"
                      onChange={(e) => handleSearch(e.target.value, "listings")}
                    />
                  </div>
                  <Select
                    value={allArtworksFilters.status || "all"}
                    onValueChange={(value) => {
                      const status = value === "all" ? undefined : (value as "pending" | "approved" | "rejected")
                      dispatch(updateAllArtworksFilters({ status, page: 1 }))
                      dispatch(fetchAllArtworks({ ...allArtworksFilters, status, page: 1 }))
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => handleRetry("listings")} disabled={allArtworksLoading}>
                    <RefreshCw className={`h-4 w-4 ${allArtworksLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {allArtworksError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error Loading Artwork Listings</h3>
                    <p className="text-muted-foreground mb-4">{allArtworksError}</p>
                    <Button onClick={() => handleRetry("listings")}>Try Again</Button>
                  </div>
                ) : allArtworksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : allArtworks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Artwork</TableHead>
                          <TableHead>Artist</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allArtworks.map((artwork) => (
                          <TableRow key={artwork._id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="relative w-12 h-12 rounded overflow-hidden">
                                  <Image
                                    src={artwork.images?.[0] || "/placeholder.svg?height=48&width=48"}
                                    alt={artwork.title || "Artwork"}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">{artwork.title || "Untitled"}</p>
                                  <p className="text-sm text-muted-foreground">{artwork.medium || "Unknown"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{artwork.artist?.username || "Unknown"}</TableCell>
                            <TableCell>€{artwork.price || 0}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(artwork.status)}>{artwork.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {artwork.createdAt ? new Date(artwork.createdAt).toLocaleDateString() : "Unknown"}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/browse/${artwork._id}`}>View Details</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No artwork listings found</h3>
                    <p className="text-muted-foreground">No artworks match your current filters.</p>
                    <Button onClick={() => handleRetry("listings")} className="mt-4">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Load Listings
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View all platform transactions and payments.</CardDescription>
                <div className="flex gap-2">
                  <Select
                    value={transactionsFilters.type || "all"}
                    onValueChange={(value) => {
                      const type = value === "all" ? undefined : (value as "listing_fee" | "sale")
                      dispatch(updateTransactionsFilters({ type, page: 1 }))
                      dispatch(fetchTransactions({ ...transactionsFilters, type, page: 1 }))
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="listing_fee">Listing Fee</SelectItem>
                      <SelectItem value="sale">Sale</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={transactionsFilters.status || "all"}
                    onValueChange={(value) => {
                      const status =
                        value === "all" ? undefined : (value as "pending" | "completed" | "failed" | "refunded")
                      dispatch(updateTransactionsFilters({ status, page: 1 }))
                      dispatch(fetchTransactions({ ...transactionsFilters, status, page: 1 }))
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => handleRetry("transactions")} disabled={transactionsLoading}>
                    <RefreshCw className={`h-4 w-4 ${transactionsLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transactionsError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error Loading Transactions</h3>
                    <p className="text-muted-foreground mb-4">{transactionsError}</p>
                    <Button onClick={() => handleRetry("transactions")}>Try Again</Button>
                  </div>
                ) : transactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Artwork</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction._id}>
                            <TableCell className="font-mono text-sm">{transaction._id.slice(-8)}</TableCell>
                            <TableCell>
                              <Badge variant={transaction.transactionType === "listing_fee" ? "secondary" : "default"}>
                                {transaction.transactionType.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>{transaction.seller?.username || "Unknown"}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="relative w-8 h-8 rounded overflow-hidden">
                                  <Image
                                    src={transaction.artwork?.images?.[0] || "/placeholder.svg?height=32&width=32"}
                                    alt={transaction.artwork?.title || "Artwork"}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <span className="text-sm">{transaction.artwork?.title || "Unknown"}</span>
                              </div>
                            </TableCell>
                            <TableCell>€{((transaction.amount || 0) / 100).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {transaction.timestamp ? new Date(transaction.timestamp).toLocaleDateString() : "Unknown"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                    <p className="text-muted-foreground">No transactions match your current filters.</p>
                    <Button onClick={() => handleRetry("transactions")} className="mt-4">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Load Transactions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  {overview ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Users</span>
                        <span className="font-medium">{overview.totalUsers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Artists</span>
                        <span className="font-medium">{overview.totalArtists || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Buyers</span>
                        <span className="font-medium">{overview.totalBuyers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Artworks</span>
                        <span className="font-medium">{overview.totalArtworks || 0}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No growth data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  {revenue ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Revenue</span>
                        <span className="font-medium">€{((overview?.totalRevenue || 0) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Listing Fees</span>
                        <span className="font-medium">€{((revenue.listingFees?.total || 0) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sales Revenue</span>
                        <span className="font-medium">€{((revenue.sales?.total || 0) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Sales</span>
                        <span className="font-medium">{overview?.totalSales || 0}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No revenue data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>New Users (Week)</span>
                        <span className="font-medium">{recentActivity.usersLastWeek || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>New Artworks (Week)</span>
                        <span className="font-medium">{recentActivity.artworksLastWeek || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Pending Reviews</span>
                        <span className="font-medium">{recentActivity.pendingLastWeek || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Sales (Week)</span>
                        <span className="font-medium">{recentActivity.salesLastWeek?.count || 0}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No activity data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Artwork Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Artwork Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {artworkStats ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Artworks</span>
                        <span className="font-medium">{artworkStats.totalArtworks || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending</span>
                        <span className="font-medium">{artworkStats.pendingArtworks || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Approved</span>
                        <span className="font-medium">{artworkStats.approvedArtworks || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rejected</span>
                        <span className="font-medium">{artworkStats.rejectedArtworks || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Price</span>
                        <span className="font-medium">€{artworkStats.averagePrice?.toFixed(2) || "0.00"}</span>
                      </div>
                    </div>
                  ) : statsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No artwork stats available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>User Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {userStats ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Users</span>
                        <span className="font-medium">{userStats.totalUsers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Artists</span>
                        <span className="font-medium">{userStats.totalArtists || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Buyers</span>
                        <span className="font-medium">{userStats.totalBuyers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verified Users</span>
                        <span className="font-medium">{userStats.verifiedUsers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Users (Week)</span>
                        <span className="font-medium">{userStats.recentActivity?.usersLastWeek || 0}</span>
                      </div>
                    </div>
                  ) : statsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No user stats available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Message Analytics</CardTitle>
                  <CardDescription>Platform messaging statistics and insights.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Message analytics will be implemented here */}
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Messages</span>
                      <span className="font-medium">1,250</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Conversations</span>
                      <span className="font-medium">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Flagged Messages</span>
                      <span className="font-medium text-red-600">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Messages Today</span>
                      <span className="font-medium">156</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Flagged Messages</CardTitle>
                  <CardDescription>Messages that require moderation attention.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">artist_john → buyer_jane</span>
                        <Badge variant="destructive" className="text-xs">
                          Flagged
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Inappropriate content detected...</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                        <Button size="sm" variant="destructive">
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="text-center py-4">
                      <Button variant="outline" size="sm">
                        View All Messages
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Artwork</DialogTitle>
              <DialogDescription>
                Please provide a detailed reason for rejecting this artwork. This will be sent to the artist.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter rejection reason (minimum 10 characters)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRejectArtwork} disabled={rejectionReason.trim().length < 10}>
                Reject Artwork
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  )
}
