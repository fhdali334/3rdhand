"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, Eye, MessageCircle, Package, Loader2 } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { fetchPaymentHistory, updateTransactionsFilters } from "@/lib/store/slices/paymentSlice"

export default function PurchasesPage() {
  const dispatch = useAppDispatch()
  const { transactions, transactionsLoading } = useAppSelector((state) => state.payment)
  const { user } = useAppSelector((state) => state.auth)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchPaymentHistory({ type: "sale" as const, limit: 20 }))
  }, [dispatch])

  const handleFilterChange = () => {
    const filters = {
      type: "sale" as const,
      status: statusFilter === "all" ? undefined : (statusFilter as "pending" | "completed" | "failed" | "success"),
      page: 1,
      limit: 20,
    }

    dispatch(updateTransactionsFilters(filters))
    dispatch(fetchPaymentHistory(filters))
  }

  useEffect(() => {
    handleFilterChange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase()
    switch (s) {
      case "completed":
      case "success":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
      case "canceled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const completedStatuses = new Set(["completed", "success"])
  const purchases = useMemo(
    () =>
      transactions
        .filter((t: any) => !!t?.buyer)
        .filter((t: any) =>
          statusFilter === "all" ? true : (t?.status || "").toLowerCase() === statusFilter.toLowerCase(),
        )
        .filter((t: any) => t?.artwork)
        .filter((t: any) =>
          searchTerm.trim()
            ? (t.artwork?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
            : true,
        ),
    [transactions, statusFilter, searchTerm],
  )

  const completedPurchasesList = purchases.filter((t: any) => completedStatuses.has((t?.status || "").toLowerCase()))
  const totalPurchases = completedPurchasesList.length
  const totalSpentCents = completedPurchasesList.reduce((sum: number, t: any) => sum + Number(t?.amount || 0), 0)

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p>Please log in to view your purchases.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Purchases</h1>
          <p className="text-muted-foreground">Track your artwork purchases and delivery status</p>
        </div>
      </div>

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
                <p className="text-2xl font-bold">€{(totalSpentCents / 100).toFixed(2)}</p>
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
                <p className="text-2xl font-bold">{totalPurchases}</p>
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
                <SelectItem value="success">Success</SelectItem>
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
            ) : purchases.length > 0 ? (
              purchases.map((t: any) => {
                const status = (t?.status || "").toLowerCase()
                const img = t?.artwork?.images?.[0] || "/placeholder.svg?key=vno5s"
                const seller = t?.seller
                const artwork = t?.artwork
                const amount = Number(t?.amount || 0)
                const completed = completedStatuses.has(status)
                return (
                  <Card key={t?._id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative w-full lg:w-24 h-48 lg:h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={img || "/placeholder.svg"} alt={artwork?.title || "Artwork"} fill className="object-cover" />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base sm:text-lg">{artwork?.title}</h3>
                              <p className="text-sm sm:text-base text-muted-foreground">by {seller?.username}</p>
                              <p className="text-sm text-muted-foreground">
                                Purchased on {t?.timestamp ? new Date(t.timestamp).toLocaleDateString() : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">€{(amount / 100).toFixed(2)}</p>
                              <Badge className={getStatusColor(status)}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Badge>
                            </div>
                          </div>

                          {completed && t?.timestamp && (
                            <div className="text-sm text-green-600">
                              Purchase completed on {new Date(t.timestamp).toLocaleDateString()}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                              <Link href={`/browse/${artwork?._id}` as string}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Artwork
                              </Link>
                            </Button>
                            {seller?._id && (
                              <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                                <Link
                                  href={`/dashboard/messages?artist=${encodeURIComponent(
                                    seller._id,
                                  )}&artwork=${encodeURIComponent(artwork?.title || "")}&artistName=${encodeURIComponent(
                                    seller?.username || "",
                                  )}`}
                                >
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                  Contact Artist
                                </Link>
                              </Button>
                            )}
                            {completed && t?.metadata?.stripe_receipt_url && (
                              <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                                <a
                                  href={t.metadata.stripe_receipt_url}
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
                )
              })
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
            {purchases
              .filter((t: any) => (t?.status || "").toLowerCase() === "pending")
              .map((t: any) => {
                const img = t?.artwork?.images?.[0] || "/placeholder.svg?key=yuikh"
                const amount = Number(t?.amount || 0)
                return (
                  <Card key={t?._id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative w-full lg:w-24 h-48 lg:h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={img || "/placeholder.svg"} alt={t?.artwork?.title || "Artwork"} fill className="object-cover" />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base sm:text-lg">{t?.artwork?.title}</h3>
                              <p className="text-sm sm:text-base text-muted-foreground">by {t?.seller?.username}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">€{(amount / 100).toFixed(2)}</p>
                              <Badge className={getStatusColor(t?.status || "")}>
                                {(t?.status || "").charAt(0).toUpperCase() + (t?.status || "").slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            {completedPurchasesList.map((t: any) => {
              const img = t?.artwork?.images?.[0] || "/placeholder.svg?key=gj4iq"
              const amount = Number(t?.amount || 0)
              return (
                <Card key={t?._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="relative w-full lg:w-24 h-48 lg:h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={img || "/placeholder.svg"} alt={t?.artwork?.title || "Artwork"} fill className="object-cover" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base sm:text-lg">{t?.artwork?.title}</h3>
                            <p className="text-sm sm:text-base text-muted-foreground">by {t?.seller?.username}</p>
                            {t?.timestamp && (
                              <p className="text-sm text-green-600">
                                Completed on {new Date(t.timestamp).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">€{(amount / 100).toFixed(2)}</p>
                            <Badge className={getStatusColor(t?.status || "")}>Completed</Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                            <Link href={`/browse/${t?.artwork?._id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Artwork
                            </Link>
                          </Button>
                          {t?.metadata?.stripe_receipt_url && (
                            <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                              <a href={t.metadata.stripe_receipt_url} target="_blank" rel="noopener noreferrer">
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
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
