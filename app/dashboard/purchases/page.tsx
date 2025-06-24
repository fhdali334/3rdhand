"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, Eye, MessageCircle, Package, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { fetchPaymentHistory, updateTransactionsFilters } from "@/lib/store/slices/paymentSlice"
import { useToast } from "@/hooks/use-toast"

export default function PurchasesPage() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const { transactions, transactionsLoading, transactionsPagination, transactionsFilters } = useAppSelector(
    (state) => state.payment,
  )
  const { user } = useAppSelector((state) => state.auth)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    // Fetch purchase history on component mount
    dispatch(fetchPaymentHistory({ type: "sale", limit: 20 }))
  }, [dispatch])

  const handleFilterChange = () => {
    const filters = {
      type: "sale" as const,
      status: statusFilter === "all" ? undefined : (statusFilter as "pending" | "completed" | "failed"),
      page: 1,
      limit: 20,
    }

    dispatch(updateTransactionsFilters(filters))
    dispatch(fetchPaymentHistory(filters))
  }

  useEffect(() => {
    handleFilterChange()
  }, [statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const purchaseTransactions = transactions.filter((t) => t.transactionType === "sale" && t.buyer)
  const totalSpent = purchaseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  const totalPurchases = purchaseTransactions.length
  const completedPurchases = purchaseTransactions.filter((p) => p.status === "completed").length

  if (!user) {
    return (
      <>
         
        <div className="container py-8">
          <div className="text-center">
            <p>Please log in to view your purchases.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
       
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
                  <p className="text-2xl font-bold">€{(totalSpent / 100).toFixed(2)}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedPurchases}</p>
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all">
            <div className="space-y-4">
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : purchaseTransactions.length > 0 ? (
                purchaseTransactions.map((transaction) => (
                  <Card key={transaction._id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative w-full lg:w-24 h-48 lg:h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={transaction.artwork.images[0] || "/placeholder.svg"}
                            alt={transaction.artwork.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base sm:text-lg">{transaction.artwork.title}</h3>
                              <p className="text-sm sm:text-base text-muted-foreground">
                                by {transaction.seller.username}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Purchased on {new Date(transaction.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">€{(transaction.amount / 100).toFixed(2)}</p>
                              <Badge className={getStatusColor(transaction.status)}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </Badge>
                            </div>
                          </div>

                          {transaction.status === "completed" && (
                            <div className="text-sm text-green-600">
                              Purchase completed on {new Date(transaction.timestamp).toLocaleDateString()}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                              <Link href={`/browse/${transaction.artwork._id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Artwork
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                              <Link href={`/artists/${transaction.seller._id}`}>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Contact Artist
                              </Link>
                            </Button>
                            {transaction.status === "completed" && transaction.metadata.stripe_receipt_url && (
                              <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                                <a
                                  href={transaction.metadata.stripe_receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download Receipt
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No purchases yet</h3>
                  <p className="text-muted-foreground mb-4">Start exploring and purchase your first artwork!</p>
                  <Button asChild>
                    <Link href="/browse">Browse Artworks</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="space-y-4">
              {purchaseTransactions
                .filter((p) => p.status === "pending")
                .map((transaction) => (
                  <Card key={transaction._id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative w-full lg:w-24 h-48 lg:h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={transaction.artwork.images[0] || "/placeholder.svg"}
                            alt={transaction.artwork.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base sm:text-lg">{transaction.artwork.title}</h3>
                              <p className="text-sm sm:text-base text-muted-foreground">
                                by {transaction.seller.username}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">€{(transaction.amount / 100).toFixed(2)}</p>
                              <Badge className={getStatusColor(transaction.status)}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-4">
              {purchaseTransactions
                .filter((p) => p.status === "completed")
                .map((transaction) => (
                  <Card key={transaction._id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative w-full lg:w-24 h-48 lg:h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={transaction.artwork.images[0] || "/placeholder.svg"}
                            alt={transaction.artwork.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base sm:text-lg">{transaction.artwork.title}</h3>
                              <p className="text-sm sm:text-base text-muted-foreground">
                                by {transaction.seller.username}
                              </p>
                              <p className="text-sm text-green-600">
                                Completed on {new Date(transaction.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">€{(transaction.amount / 100).toFixed(2)}</p>
                              <Badge className={getStatusColor(transaction.status)}>Completed</Badge>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                              <Link href={`/browse/${transaction.artwork._id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Artwork
                              </Link>
                            </Button>
                            {transaction.metadata.stripe_receipt_url && (
                              <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                                <a
                                  href={transaction.metadata.stripe_receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download Receipt
                                </a>
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
    </>
  )
}
