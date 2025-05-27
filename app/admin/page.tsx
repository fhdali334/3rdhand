"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, DollarSign, Eye, Users, XCircle } from "lucide-react"
import { mockUsers, mockArtworks, mockTransactions, getPendingArtworks, getUserById } from "@/lib/mock-data"

export default function AdminDashboardPage() {
  const [pendingArtworks, setPendingArtworks] = useState(getPendingArtworks())

  const stats = {
    totalUsers: mockUsers.length,
    totalArtists: mockUsers.filter((u) => u.role === "artist").length,
    totalBuyers: mockUsers.filter((u) => u.role === "buyer").length,
    pendingApprovals: pendingArtworks.length,
    totalRevenue: mockTransactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0) / 100,
    activeListings: mockArtworks.filter((a) => a.status === "approved").length,
    totalTransactions: mockTransactions.length,
  }

  const handleApproveArtwork = (artworkId: string) => {
    // In real app, this would make an API call
    console.log("Approving artwork:", artworkId)
    // Update local state for demo
    setPendingArtworks((prev) => prev.filter((a) => a._id !== artworkId))
  }

  const handleRejectArtwork = (artworkId: string) => {
    // In real app, this would make an API call
    console.log("Rejecting artwork:", artworkId)
    // Update local state for demo
    setPendingArtworks((prev) => prev.filter((a) => a._id !== artworkId))
  }

  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage the 3rdHand art marketplace</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalArtists} artists, {stats.totalBuyers} buyers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">Artworks awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">From listing fees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeListings}</div>
              <p className="text-xs text-muted-foreground">Approved artworks</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending ({stats.pendingApprovals})
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">
              Users
            </TabsTrigger>
            <TabsTrigger value="listings" className="text-xs sm:text-sm">
              Listings
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Artwork Approvals</CardTitle>
                <CardDescription>Review and approve new artwork listings.</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingArtworks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Artwork</TableHead>
                          <TableHead>Artist</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingArtworks.map((artwork) => {
                          const artist = getUserById(artwork.artist)
                          return (
                            <TableRow key={artwork._id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={artwork.images[0] || "/placeholder.svg"}
                                    alt={artwork.title}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div>
                                    <p className="font-medium">{artwork.title}</p>
                                    <p className="text-sm text-muted-foreground">{artwork.medium}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{artist?.username}</TableCell>
                              <TableCell>€{artwork.price}</TableCell>
                              <TableCell>{new Date(artwork.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-green-500 hover:text-green-600"
                                    onClick={() => handleApproveArtwork(artwork._id)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="sr-only">Approve</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                    onClick={() => handleRejectArtwork(artwork._id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                    <span className="sr-only">Reject</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
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
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUsers
                        .filter((u) => u.role !== "admin")
                        .map((user) => (
                          <TableRow key={user._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{user.username}</p>
                                <p className="text-sm text-muted-foreground">{user.profile.bio?.substring(0, 50)}...</p>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === "artist" ? "default" : "secondary"}>{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.isVerified ? "default" : "secondary"}>
                                {user.isVerified ? "Verified" : "Unverified"}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                View Profile
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>All Artwork Listings</CardTitle>
                <CardDescription>View and manage all artwork listings on the platform.</CardDescription>
              </CardHeader>
              <CardContent>
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
                      {mockArtworks.map((artwork) => {
                        const artist = getUserById(artwork.artist)
                        return (
                          <TableRow key={artwork._id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <img
                                  src={artwork.images[0] || "/placeholder.svg"}
                                  alt={artwork.title}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div>
                                  <p className="font-medium">{artwork.title}</p>
                                  <p className="text-sm text-muted-foreground">{artwork.medium}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{artist?.username}</TableCell>
                            <TableCell>€{artwork.price}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  artwork.status === "approved"
                                    ? "default"
                                    : artwork.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {artwork.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(artwork.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View all platform transactions and payments.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTransactions.map((transaction) => {
                        const user = getUserById(transaction.seller)
                        return (
                          <TableRow key={transaction._id}>
                            <TableCell className="font-mono text-sm">{transaction._id}</TableCell>
                            <TableCell>
                              <Badge variant={transaction.transactionType === "listing_fee" ? "secondary" : "default"}>
                                {transaction.transactionType.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>{user?.username}</TableCell>
                            <TableCell>€{transaction.amount / 100}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  transaction.status === "completed"
                                    ? "default"
                                    : transaction.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(transaction.timestamp).toLocaleDateString()}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
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
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Users</span>
                      <span className="font-medium">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Artists</span>
                      <span className="font-medium">{stats.totalArtists}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Buyers</span>
                      <span className="font-medium">{stats.totalBuyers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Listings</span>
                      <span className="font-medium">{stats.activeListings}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-medium">€{stats.totalRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transactions</span>
                      <span className="font-medium">{stats.totalTransactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. per Transaction</span>
                      <span className="font-medium">€{(stats.totalRevenue / stats.totalTransactions).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Approval Rate</span>
                      <span className="font-medium">
                        {Math.round(
                          (mockArtworks.filter((a) => a.status === "approved").length / mockArtworks.length) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Pending Reviews</span>
                      <span className="font-medium">{stats.pendingApprovals}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Verified Artists</span>
                      <span className="font-medium">
                        {mockUsers.filter((u) => u.role === "artist" && u.isVerified).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  )
}
