"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, DollarSign, Eye, FileText, Heart, MessageSquare, Package, PlusCircle, RefreshCw, TrendingUp } from 'lucide-react'
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import {
  fetchMyArtworks,
  fetchArtworkStats,
  deleteArtwork,
  updateMyArtworksFilters,
  clearArtworkError,
} from "@/lib/store/slices/artworkSlice"
import {
  fetchPaymentHistory,
  fetchPaymentStats,
  updateTransactionsFilters,
  clearPaymentError,
} from "@/lib/store/slices/paymentSlice"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { AuthGuard } from "@/components/auth/auth-gaurd"

function DashboardContent() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const { user } = useAppSelector((state) => state.auth)
  const {
    myArtworks,
    myArtworksLoading,
    myArtworksError,
    myArtworksPagination,
    myArtworksFilters,
    stats,
    statsLoading,
    statsError,
  } = useAppSelector((state) => state.artwork)
  const {
    transactions,
    transactionsLoading,
    transactionsError,
    transactionsPagination,
    transactionsFilters,
    stats: paymentStats,
    statsLoading: paymentStatsLoading,
  } = useAppSelector((state) => state.payment)

  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    console.log("🚀 Dashboard: Initializing...")
    dispatch(clearArtworkError())
    dispatch(clearPaymentError())

    if (user?.role === "artist") {
      dispatch(fetchMyArtworks({}))
      dispatch(fetchArtworkStats())
    }
    dispatch(fetchPaymentStats())
  }, [dispatch, user])

  const handleDeleteArtwork = async (artworkId: string) => {
    if (!confirm("Are you sure you want to delete this artwork? This action cannot be undone.")) {
      return
    }

    try {
      await dispatch(deleteArtwork(artworkId)).unwrap()
      toast({
        title: "Artwork deleted",
        description: "The artwork has been deleted successfully.",
      })
      // Refresh artworks list
      dispatch(fetchMyArtworks(myArtworksFilters))
      dispatch(fetchArtworkStats())
    } catch (error: any) {
      console.error("Delete artwork error:", error)
      toast({
        title: "Error",
        description: error || "Failed to delete artwork. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTabChange = (value: string) => {
    console.log("📑 Dashboard: Tab changed to:", value)
    switch (value) {
      case "sales":
        if (transactions.length === 0 && !transactionsLoading) {
          dispatch(fetchPaymentHistory({}))
        }
        break
    }
  }

  const handleSearch = (value: string, type: string) => {
    setSearchTerm(value)
    switch (type) {
      case "artworks":
        dispatch(updateMyArtworksFilters({ search: value, page: 1 }))
        dispatch(fetchMyArtworks({ ...myArtworksFilters, search: value, page: 1 }))
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
    switch (action) {
      case "artworks":
        dispatch(fetchMyArtworks({}))
        break
      case "stats":
        dispatch(fetchArtworkStats())
        break
      case "payments":
        dispatch(fetchPaymentHistory({}))
        break
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {user.username}!</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {user.role === "artist"
                ? "Manage your artworks and track your sales"
                : "Track your purchases and favorites"}
            </p>
          </div>
          {user.role === "artist" && (
            <Button asChild className="mt-4 lg:mt-0">
              <Link href="/create-listing">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Listing
              </Link>
            </Button>
          )}
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {user.role === "artist" ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalArtworks || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.approvedArtworks || 0} approved, {stats?.pendingArtworks || 0} pending
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{((paymentStats?.totalEarned || 0) / 100).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">{paymentStats?.salesCount || 0} sales completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats?.averagePrice?.toFixed(2) || "0.00"}</div>
                  <p className="text-xs text-muted-foreground">Across all artworks</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats?.totalValue || 0}</div>
                  <p className="text-xs text-muted-foreground">Total artwork value</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{paymentStats?.purchasesCount || 0}</div>
                  <p className="text-xs text-muted-foreground">Artworks purchased</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{((paymentStats?.totalSpent || 0) / 100).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">On artwork purchases</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Saved artworks</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Unread messages</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Tabs
          defaultValue={user.role === "artist" ? "artworks" : "purchases"}
          className="space-y-4"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {user.role === "artist" && (
              <TabsTrigger value="artworks" className="text-xs sm:text-sm">
                My Artworks ({myArtworks.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="sales" className="text-xs sm:text-sm">
              {user.role === "artist" ? "Sales" : "Purchases"} ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
              Profile
            </TabsTrigger>
          </TabsList>

          {user.role === "artist" && (
            <TabsContent value="artworks">
              <Card>
                <CardHeader>
                  <CardTitle>My Artworks</CardTitle>
                  <CardDescription>Manage your artwork listings and track their status.</CardDescription>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Eye className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search artworks..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value, "artworks")}
                      />
                    </div>
                    <Select
                      value={myArtworksFilters.status || "all"}
                      onValueChange={(value) => {
                        const status = value === "all" ? undefined : (value as "pending" | "approved" | "rejected")
                        dispatch(updateMyArtworksFilters({ status, page: 1 }))
                        dispatch(fetchMyArtworks({ ...myArtworksFilters, status, page: 1 }))
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
                    <Button variant="outline" onClick={() => handleRetry("artworks")} disabled={myArtworksLoading}>
                      <RefreshCw className={`h-4 w-4 ${myArtworksLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {myArtworksError ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Error Loading Artworks</h3>
                      <p className="text-muted-foreground mb-4">{myArtworksError}</p>
                      <Button onClick={() => handleRetry("artworks")}>Try Again</Button>
                    </div>
                  ) : myArtworksLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : myArtworks.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Artwork</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {myArtworks.map((artwork) => (
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
                              <TableCell>€{artwork.price || 0}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(artwork.status)}>{artwork.status}</Badge>
                              </TableCell>
                              <TableCell>
                                {artwork.createdAt ? new Date(artwork.createdAt).toLocaleDateString() : "Unknown"}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" asChild>
                                    <Link href={`/browse/${artwork._id}`}>View</Link>
                                  </Button>
                                  {artwork.status === "pending" && (
                                    <Button size="sm" variant="outline" asChild>
                                      <Link href={`/create-listing?edit=${artwork._id}`}>Edit</Link>
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteArtwork(artwork._id)}
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    Delete
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
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No artworks yet</h3>
                      <p className="text-muted-foreground mb-4">Start by creating your first artwork listing.</p>
                      <Button asChild>
                        <Link href="/create-listing">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Listing
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>{user.role === "artist" ? "Sales History" : "Purchase History"}</CardTitle>
                <CardDescription>
                  {user.role === "artist"
                    ? "Track your artwork sales and earnings."
                    : "View your artwork purchases and transaction history."}
                </CardDescription>
                <div className="flex gap-2">
                  <Select
                    value={transactionsFilters.type || "all"}
                    onValueChange={(value) => {
                      const type = value === "all" ? undefined : (value as "listing_fee" | "sale")
                      dispatch(updateTransactionsFilters({ type, page: 1 }))
                      dispatch(fetchPaymentHistory({ ...transactionsFilters, type, page: 1 }))
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
                  <Button variant="outline" onClick={() => handleRetry("payments")} disabled={transactionsLoading}>
                    <RefreshCw className={`h-4 w-4 ${transactionsLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transactionsError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error Loading Transaction History</h3>
                    <p className="text-muted-foreground mb-4">{transactionsError}</p>
                    <Button onClick={() => handleRetry("payments")}>Try Again</Button>
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
                          <TableHead>Artwork</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction: any) => (
                          <TableRow key={transaction._id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="relative w-10 h-10 rounded overflow-hidden">
                                  <Image
                                    src={transaction.artwork?.images?.[0] || "/placeholder.svg?height=40&width=40"}
                                    alt={transaction.artwork?.title || "Artwork"}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">{transaction.artwork?.title || "Unknown"}</p>
                                  <p className="text-sm text-muted-foreground">€{transaction.artwork?.price || 0}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={transaction.transactionType === "listing_fee" ? "secondary" : "default"}>
                                {transaction.transactionType.replace("_", " ")}
                              </Badge>
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
                    <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground">
                      {user.role === "artist"
                        ? "Your sales and listing fees will appear here."
                        : "Your purchases will appear here."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.role === "artist" ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Artwork Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats ? (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Total Artworks</span>
                            <span className="font-medium">{stats.totalArtworks || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Approved</span>
                            <span className="font-medium">{stats.approvedArtworks || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pending</span>
                            <span className="font-medium">{stats.pendingArtworks || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rejected</span>
                            <span className="font-medium">{stats.rejectedArtworks || 0}</span>
                          </div>
                        </div>
                      ) : statsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No artwork data available</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Sales Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {paymentStats ? (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Total Earned</span>
                            <span className="font-medium">€{((paymentStats.totalEarned || 0) / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sales Count</span>
                            <span className="font-medium">{paymentStats.salesCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Listing Fees</span>
                            <span className="font-medium">{paymentStats.listingFeesCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Transactions</span>
                            <span className="font-medium">{paymentStats.totalTransactions || 0}</span>
                          </div>
                        </div>
                      ) : paymentStatsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No sales data available</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Purchase Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {paymentStats ? (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Total Spent</span>
                            <span className="font-medium">€{((paymentStats.totalSpent || 0) / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Purchases</span>
                            <span className="font-medium">{paymentStats.purchasesCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Transactions</span>
                            <span className="font-medium">{paymentStats.totalTransactions || 0}</span>
                          </div>
                        </div>
                      ) : paymentStatsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No purchase data available</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Account Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Account Type</span>
                      <Badge variant="default">{user.role}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Member Since</span>
                      <span className="font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verification Status</span>
                      <Badge variant={user.isVerified ? "default" : "secondary"}>
                        {user.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Credits</span>
                      <span className="font-medium">{user.credits || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account information and preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Account Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Username</label>
                          <p className="text-sm text-muted-foreground">{user.username}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Role</label>
                          <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Bio</label>
                          <p className="text-sm text-muted-foreground">{user.profile?.bio || "No bio provided"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Website</label>
                          <p className="text-sm text-muted-foreground">
                            {user.profile?.website || "No website provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button asChild>
                      <Link href="/profile">Edit Profile</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/messages">Messages</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
