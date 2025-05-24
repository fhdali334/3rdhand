"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ArtworkCard } from "@/components/artwork/artwork-card"
import { BarChart, MessageSquare, Plus, Users, Euro } from "lucide-react"
import Link from "next/link"
import { mockUsers, mockMessages, getArtworksByArtist, getTransactionsByUser, getUserById } from "@/lib/mock-data"

// Simulating current user - in real app this would come from auth context
const currentUser = mockUsers[0] // Emma Johnson (artist)

export default function DashboardPage() {
  const [userArtworks, setUserArtworks] = useState(getArtworksByArtist(currentUser._id))
  const [userTransactions, setUserTransactions] = useState(getTransactionsByUser(currentUser._id))
  const [unreadMessages, setUnreadMessages] = useState(
    mockMessages.filter((m) => m.receiver === currentUser._id && !m.read),
  )

  const stats = {
    activeListings: userArtworks.filter((a) => a.status === "approved").length,
    totalViews: 145, // This would come from analytics
    totalSales: userTransactions.filter((t) => t.transactionType === "sale" && t.status === "completed").length,
    totalEarnings: userTransactions
      .filter((t) => t.transactionType === "sale" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
  }

  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {currentUser.username}!</h1>
            <p className="text-muted-foreground">Manage your artwork and track your sales</p>
          </div>
          <Button asChild>
            <Link href="/create-listing">
              <Plus className="mr-2 h-4 w-4" /> Create New Listing
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeListings}</div>
              <p className="text-xs text-muted-foreground">
                {userArtworks.filter((a) => a.status === "pending").length} pending approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockMessages.filter((m) => m.receiver === currentUser._id).length}
              </div>
              <p className="text-xs text-muted-foreground">{unreadMessages.length} unread</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.totalEarnings}</div>
              <p className="text-xs text-muted-foreground">{stats.totalSales} sales completed</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="listings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="messages">Messages ({unreadMessages.length})</TabsTrigger>
            <TabsTrigger value="sales">Sales History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userArtworks.map((artwork) => (
                <div key={artwork._id} className="relative">
                  <ArtworkCard
                    artwork={{
                      id: artwork._id,
                      title: artwork.title,
                      artist: currentUser.username,
                      price: artwork.price,
                      image: artwork.images[0],
                      category: artwork.medium || "Art",
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        artwork.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : artwork.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {artwork.status}
                    </span>
                  </div>
                </div>
              ))}
              <Card className="flex flex-col items-center justify-center h-full min-h-[300px] border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Plus className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl mb-2">Add New Artwork</CardTitle>
                  <CardDescription className="text-center mb-4">Create a new listing for just €1</CardDescription>
                  <Button asChild>
                    <Link href="/create-listing">Create Listing</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>View and respond to messages from potential buyers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockMessages
                  .filter((m) => m.receiver === currentUser._id)
                  .map((message) => {
                    const sender = getUserById(message.sender)
                    return (
                      <div
                        key={message._id}
                        className={`p-4 rounded-lg border ${!message.read ? "bg-blue-50 border-blue-200" : "bg-gray-50"}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{sender?.username}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(message.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        {!message.read && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    )
                  })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Sales History</CardTitle>
                <CardDescription>Track your sales and payment history.</CardDescription>
              </CardHeader>
              <CardContent>
                {userTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {userTransactions.map((transaction) => (
                      <div key={transaction._id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {transaction.transactionType === "listing_fee" ? "Listing Fee" : "Artwork Sale"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">€{transaction.amount / 100}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : transaction.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No sales recorded yet. Your sales history will appear here.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Artworks</span>
                      <span className="font-medium">{userArtworks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved</span>
                      <span className="font-medium text-green-600">
                        {userArtworks.filter((a) => a.status === "approved").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending</span>
                      <span className="font-medium text-yellow-600">
                        {userArtworks.filter((a) => a.status === "pending").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Price</span>
                      <span className="font-medium">
                        €{Math.round(userArtworks.reduce((sum, a) => sum + a.price, 0) / userArtworks.length)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Activity tracking and detailed analytics will be available here.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your profile information and preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <p>
                    <strong>Username:</strong> {currentUser.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {currentUser.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {currentUser.role}
                  </p>
                  <p>
                    <strong>Verified:</strong> {currentUser.isVerified ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Profile</h4>
                  <p>
                    <strong>Bio:</strong> {currentUser.profile.bio || "No bio added"}
                  </p>
                  <p>
                    <strong>Website:</strong> {currentUser.profile.website || "No website added"}
                  </p>
                </div>
                <Button>Edit Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  )
}
