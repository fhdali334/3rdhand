"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, Eye, MessageCircle, Package, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock purchase data for a buyer
const mockPurchases = [
  {
    id: "purchase_1",
    artworkId: "1",
    artworkTitle: "Abstract Harmony",
    artistName: "Emma Johnson",
    artistId: "1",
    price: 450,
    purchaseDate: "2024-01-15T10:00:00Z",
    status: "delivered",
    image: "/placeholder.svg?height=400&width=300",
    trackingNumber: "TRK123456789",
    deliveryDate: "2024-01-20T14:30:00Z",
    rated: true,
    rating: 5,
  },
  {
    id: "purchase_2",
    artworkId: "2",
    artworkTitle: "Digital Dreams",
    artistName: "Michael Chen",
    artistId: "2",
    price: 350,
    purchaseDate: "2024-01-10T08:00:00Z",
    status: "shipped",
    image: "/placeholder.svg?height=400&width=300",
    trackingNumber: "TRK987654321",
    estimatedDelivery: "2024-01-25T12:00:00Z",
    rated: false,
  },
  {
    id: "purchase_3",
    artworkId: "3",
    artworkTitle: "Nature's Embrace",
    artistName: "Sofia Rodriguez",
    artistId: "3",
    price: 550,
    purchaseDate: "2024-01-05T16:00:00Z",
    status: "processing",
    image: "/placeholder.svg?height=400&width=300",
    rated: false,
  },
]

export default function PurchasesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const filteredPurchases = mockPurchases
    .filter((purchase) => {
      const matchesSearch =
        searchTerm === "" ||
        purchase.artworkTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.artistName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || purchase.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
        case "oldest":
          return new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
        case "price-high":
          return b.price - a.price
        case "price-low":
          return a.price - b.price
        default:
          return 0
      }
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalSpent = mockPurchases.reduce((sum, purchase) => sum + purchase.price, 0)
  const totalPurchases = mockPurchases.length
  const deliveredPurchases = mockPurchases.filter((p) => p.status === "delivered").length

  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Purchases</h1>
            <p className="text-muted-foreground">Track your artwork purchases and delivery status</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                  <p className="text-2xl font-bold">{totalPurchases}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">€{totalSpent}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold">{deliveredPurchases}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                All Purchases
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs sm:text-sm">
                Active Orders
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">
                Completed
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Input
                placeholder="Search purchases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 lg:w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="price-high">Price High</SelectItem>
                  <SelectItem value="price-low">Price Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all">
            <div className="space-y-4">
              {filteredPurchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="relative w-full lg:w-24 h-48 lg:h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={purchase.image || "/placeholder.svg"}
                          alt={purchase.artworkTitle}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base sm:text-lg">{purchase.artworkTitle}</h3>
                            <p className="text-sm sm:text-base text-muted-foreground">by {purchase.artistName}</p>
                            <p className="text-sm text-muted-foreground">
                              Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">€{purchase.price}</p>
                            <Badge className={getStatusColor(purchase.status)}>
                              {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {purchase.trackingNumber && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Tracking: </span>
                            <span className="font-mono">{purchase.trackingNumber}</span>
                          </div>
                        )}

                        {purchase.deliveryDate && (
                          <div className="text-sm text-green-600">
                            Delivered on {new Date(purchase.deliveryDate).toLocaleDateString()}
                          </div>
                        )}

                        {purchase.estimatedDelivery && (
                          <div className="text-sm text-blue-600">
                            Estimated delivery: {new Date(purchase.estimatedDelivery).toLocaleDateString()}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                            <Link href={`/browse/${purchase.artworkId}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Artwork
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                            <Link href={`/artists/${purchase.artistId}`}>
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Contact Artist
                            </Link>
                          </Button>
                          {purchase.status === "delivered" && (
                            <>
                              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                                <Download className="mr-2 h-4 w-4" />
                                Download Receipt
                              </Button>
                              {!purchase.rated && (
                                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                                  <Star className="mr-2 h-4 w-4" />
                                  Rate Purchase
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="space-y-4">
              {filteredPurchases
                .filter((p) => p.status === "processing" || p.status === "shipped")
                .map((purchase) => (
                  <Card key={purchase.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative w-full lg:w-24 h-48 lg:h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={purchase.image || "/placeholder.svg"}
                            alt={purchase.artworkTitle}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base sm:text-lg">{purchase.artworkTitle}</h3>
                              <p className="text-sm sm:text-base text-muted-foreground">by {purchase.artistName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">€{purchase.price}</p>
                              <Badge className={getStatusColor(purchase.status)}>
                                {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                              </Badge>
                            </div>
                          </div>

                          {purchase.trackingNumber && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Tracking: </span>
                              <span className="font-mono">{purchase.trackingNumber}</span>
                            </div>
                          )}

                          {purchase.estimatedDelivery && (
                            <div className="text-sm text-blue-600">
                              Estimated delivery: {new Date(purchase.estimatedDelivery).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-4">
              {filteredPurchases
                .filter((p) => p.status === "delivered")
                .map((purchase) => (
                  <Card key={purchase.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative w-full lg:w-24 h-48 lg:h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={purchase.image || "/placeholder.svg"}
                            alt={purchase.artworkTitle}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base sm:text-lg">{purchase.artworkTitle}</h3>
                              <p className="text-sm sm:text-base text-muted-foreground">by {purchase.artistName}</p>
                              {purchase.deliveryDate && (
                                <p className="text-sm text-green-600">
                                  Delivered on {new Date(purchase.deliveryDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">€{purchase.price}</p>
                              <Badge className={getStatusColor(purchase.status)}>Delivered</Badge>
                            </div>
                          </div>

                          {purchase.rated && (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-muted-foreground">Your rating:</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= purchase.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                              <Link href={`/browse/${purchase.artworkId}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Artwork
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                              <Download className="mr-2 h-4 w-4" />
                              Download Receipt
                            </Button>
                            {!purchase.rated && (
                              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                                <Star className="mr-2 h-4 w-4" />
                                Rate Purchase
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  )
}
