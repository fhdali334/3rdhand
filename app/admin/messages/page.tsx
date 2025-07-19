"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  MessageSquare,
  Flag,
  Users,
  Search,
  MoreVertical,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Eye,
  Trash2,
  User,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAdminMessages, useMessageAnalytics, useFlagMessage } from "@/lib/hooks/use-messages"
import { AdminGuard } from "@/components/auth/admin-guard"
import type { Message } from "@/lib/api/messages"

export default function AdminMessagesPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [filters, setFilters] = useState({
    flagged: undefined as boolean | undefined,
    sort: "timestamp",
    page: 1,
    limit: 20,
  })
  const [analyticsPeriod, setAnalyticsPeriod] = useState("week")

  // React Query hooks
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useAdminMessages({ ...filters, search: searchQuery })

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useMessageAnalytics(analyticsPeriod)

  // Mutations
  const flagMessageMutation = useFlagMessage()

  const handleFlagMessage = (messageId: string, reason?: string) => {
    flagMessageMutation.mutate({ messageId, reason })
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  // Extract data with proper null checking
  const messages = messagesData?.data?.messages || []
  const messagesPagination = messagesData?.data?.pagination
  const analytics = analyticsData?.data

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "default" as const,
      artist: "secondary" as const,
      buyer: "outline" as const,
    }
    return <Badge variant={variants[role as keyof typeof variants] || "outline"}>{role}</Badge>
  }

  const getMessageStatusBadge = (message: Message) => {
    if (message.flagged) {
      return <Badge variant="destructive">Flagged</Badge>
    }
    return <Badge variant="outline">Active</Badge>
  }

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Message Management</h1>
              <p className="text-muted-foreground">Monitor and moderate platform messages</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetchMessages()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="all-messages">All Messages</TabsTrigger>
            <TabsTrigger value="flagged">Flagged Messages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {analyticsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : analyticsError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load analytics. Please try again.
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 bg-transparent"
                    onClick={() => refetchAnalytics()}
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.overview?.totalMessages || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.overview?.totalConversations || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Flagged Messages</CardTitle>
                    <Flag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                      {analytics?.overview?.flaggedMessages || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No messages found</p>
                ) : (
                  <div className="space-y-4">
                    {messages.slice(0, 5).map((message: Message) => (
                      <div key={message.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{message.sender.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{message.sender.username}</p>
                            <div className="flex items-center gap-2">
                              {message.flagged && <Badge variant="destructive">Flagged</Badge>}
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Messages Tab */}
          <TabsContent value="all-messages" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Messages</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={filters.sort} onValueChange={(value) => handleFilterChange("sort", value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="timestamp">Latest</SelectItem>
                        <SelectItem value="-timestamp">Oldest</SelectItem>
                        <SelectItem value="sender">Sender</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messagesError ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load messages. Please try again.
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 bg-transparent"
                        onClick={() => refetchMessages()}
                      >
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sender</TableHead>
                        <TableHead>Receiver</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((message: Message) => (
                        <TableRow key={message.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={message.sender.avatar || "/placeholder.svg"} />
                                <AvatarFallback>{message.sender.username?.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">{message.sender.username}</span>
                                <div className="mt-1">{getRoleBadge(message.sender.role)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={message.receiver.avatar || "/placeholder.svg"} />
                                <AvatarFallback>{message.receiver.username?.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">{message.receiver.username}</span>
                                <div className="mt-1">{getRoleBadge(message.receiver.role)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{message.content}</TableCell>
                          <TableCell>{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</TableCell>
                          <TableCell>{getMessageStatusBadge(message)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedMessage(message)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleFlagMessage(message.id, "Inappropriate content")}
                                  disabled={message.flagged}
                                >
                                  <Flag className="h-4 w-4 mr-2" />
                                  {message.flagged ? "Already Flagged" : "Flag Message"}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Message
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {/* Pagination */}
                {messagesPagination && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {(messagesPagination.page - 1) * messagesPagination.limit + 1} to{" "}
                      {Math.min(messagesPagination.page * messagesPagination.limit, messagesPagination.total)} of{" "}
                      {messagesPagination.total} messages
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!messagesPagination.hasPrevPage}
                        onClick={() => handleFilterChange("page", messagesPagination.page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!messagesPagination.hasNextPage}
                        onClick={() => handleFilterChange("page", messagesPagination.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flagged Messages Tab */}
          <TabsContent value="flagged" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-destructive" />
                  Flagged Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Messages that have been flagged for review. Take appropriate action on reported content.
                </p>
                {messages.filter((msg: Message) => msg.flagged).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No flagged messages at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages
                      .filter((msg: Message) => msg.flagged)
                      .map((message: Message) => (
                        <div key={message.id} className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={message.sender.avatar || "/placeholder.svg"}
                                  alt={message.sender.username}
                                />
                                <AvatarFallback>
                                  {message.sender.username?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{message.sender.username}</p>
                                <div className="flex items-center gap-2">
                                  {getRoleBadge(message.sender.role)}
                                  <span className="text-xs text-muted-foreground">→</span>
                                  <span className="text-sm">{message.receiver.username}</span>
                                  {getRoleBadge(message.receiver.role)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">
                                <Flag className="h-3 w-3 mr-1" />
                                Flagged
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                          </div>

                          <div className="bg-background rounded p-3 mb-3">
                            <p className="text-sm">{message.content}</p>
                          </div>

                          {message.flagReason && (
                            <div className="bg-destructive/10 rounded p-2 mb-3">
                              <p className="text-xs font-medium text-destructive mb-1">Flag Reason:</p>
                              <p className="text-sm">{message.flagReason}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleFlagMessage(message.id)}>
                              <Flag className="h-4 w-4 mr-2" />
                              Unflag
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedMessage(message)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Message Analytics
                  </CardTitle>
                  <Select value={analyticsPeriod} onValueChange={setAnalyticsPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-32" />
                      <Skeleton className="h-32" />
                    </div>
                  </div>
                ) : analyticsError ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load analytics. Please try again.
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 bg-transparent"
                        onClick={() => refetchAnalytics()}
                      >
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Messages by Role */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Messages by User Role</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {analytics?.messagesByRole?.map((roleData: any) => (
                              <div key={roleData._id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">{getRoleBadge(roleData._id)}</div>
                                <span className="font-medium">{roleData.count.toLocaleString()}</span>
                              </div>
                            )) || <p className="text-muted-foreground text-center py-4">No data available</p>}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Active Conversations */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Most Active Conversations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {analytics?.activeConversations?.slice(0, 5).map((conv: any, index: number) => (
                              <div key={conv._id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">#{index + 1}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {conv.participants?.length || 0} participants
                                  </span>
                                </div>
                                <Badge variant="outline">{conv.messageCount} messages</Badge>
                              </div>
                            )) || <p className="text-muted-foreground text-center py-4">No data available</p>}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Message Details Dialog */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Message Details</DialogTitle>
              <DialogDescription>View complete message information and moderation options</DialogDescription>
            </DialogHeader>

            {selectedMessage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Sender</h4>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={selectedMessage.sender?.avatar || "/placeholder.svg"}
                          alt={selectedMessage.sender?.username}
                        />
                        <AvatarFallback>
                          {selectedMessage.sender?.username?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedMessage.sender?.username}</p>
                        {getRoleBadge(selectedMessage.sender?.role)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Receiver</h4>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={selectedMessage.receiver?.avatar || "/placeholder.svg"}
                          alt={selectedMessage.receiver?.username}
                        />
                        <AvatarFallback>
                          {selectedMessage.receiver?.username?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedMessage.receiver?.username}</p>
                        {getRoleBadge(selectedMessage.receiver?.role)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Message Content</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <p>{selectedMessage.content}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Sent:</span>{" "}
                    {formatDistanceToNow(new Date(selectedMessage.timestamp), { addSuffix: true })}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {getMessageStatusBadge(selectedMessage)}
                  </div>
                </div>

                {selectedMessage.flagged && (
                  <div className="bg-destructive/10 rounded-lg p-3">
                    <h4 className="font-medium text-destructive mb-2">Flag Information</h4>
                    <p className="text-sm">{selectedMessage.flagReason || "No reason provided"}</p>
                    {selectedMessage.flaggedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Flagged {formatDistanceToNow(new Date(selectedMessage.flaggedAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t">
                  {!selectedMessage.flagged ? (
                    <Button variant="outline" onClick={() => handleFlagMessage(selectedMessage.id)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Flag Message
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => handleFlagMessage(selectedMessage.id)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Unflag Message
                    </Button>
                  )}
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Message
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  )
}
