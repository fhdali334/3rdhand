"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageCircle, Send, Search, User, AlertCircle, Loader2, RefreshCw, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  useConversations,
  useConversationMessages,
  useUnreadCount,
  useSendMessage,
  useMarkAsRead,
  useSearchConversations,
} from "@/lib/hooks/use-messages"
import { AuthGuard } from "@/components/auth/auth-gaurd"
import type { Conversation, Message } from "@/lib/api/messages"
import { useSearchParams } from "next/navigation"
import { artistsApi } from "@/lib/api/artists"

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageContent, setMessageContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [artistFallback, setArtistFallback] = useState<{ username?: string; avatar?: string; role?: string } | null>(
    null,
  )

  // Debounce search input to reduce API calls
  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350)
    return () => clearTimeout(t)
  }, [searchQuery])

  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useConversations()

  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useConversationMessages(selectedConversation)

  const { data: unreadData, isLoading: unreadLoading } = useUnreadCount()
  const { data: searchData, isLoading: searchLoading } = useSearchConversations(debouncedSearch)

  // Mutations
  const sendMessageMutation = useSendMessage()
  const markAsReadMutation = useMarkAsRead()

  // Extract data
  const conversations = conversationsData?.data?.conversations || []
  const messages = messagesData?.data?.messages || []
  const otherUser = messagesData?.data?.otherUser
  const unreadCount = unreadData?.data?.unreadCount || 0
  const searchResults = searchData?.data?.conversations || []

  const searchParams = useSearchParams()
  const artistId = searchParams.get("artist")
  const artworkTitle = searchParams.get("artwork")
  const artistNameParam = searchParams.get("artistName")

  // Ensure a conversation gets selected as soon as artist param is present
  useEffect(() => {
    if (artistId && !selectedConversation) {
      setSelectedConversation(artistId)
      if (artworkTitle && !messageContent) {
        setMessageContent(
          `Hi! I'm interested in your artwork "${decodeURIComponent(artworkTitle)}"`,
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistId])

  // Prefetch artist profile as a fallback header if needed
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!artistId) return
      try {
        const res = await artistsApi.getArtistProfile(artistId)
        const profile = res?.data?.data?.profile
        if (!cancelled && profile) {
          setArtistFallback({
            username: profile?.user?.username,
            avatar: (profile?.user as any)?.avatar || undefined,
            role: profile?.user?.role || "artist",
          })
        } else if (!cancelled && artistNameParam) {
          setArtistFallback({ username: decodeURIComponent(artistNameParam), role: "artist" })
        }
      } catch {
        if (!cancelled && artistNameParam) {
          setArtistFallback({ username: decodeURIComponent(artistNameParam), role: "artist" })
        }
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [artistId, artistNameParam])

  // Auto-select artist conversation if it exists in the list
  useEffect(() => {
    if (artistId && !conversationsLoading) {
      if (conversations.length > 0) {
        const artistConversation = conversations.find(
          (conv: Conversation) => (conv.otherUser.id || conv.otherUser._id) === artistId,
        )
        if (artistConversation) {
          const userId = artistConversation.otherUser.id || artistConversation.otherUser._id
          setSelectedConversation(userId)
        }
      }
    }
  }, [artistId, conversations, conversationsLoading])

  // Derive the selected conversation record to know its unreadCount
  const selectedConv = useMemo(
    () => conversations.find((c: Conversation) => (c.otherUser.id || c.otherUser._id) === selectedConversation),
    [conversations, selectedConversation],
  )

  // Mark as read when selected and messages loaded, but only if there are unread items
  useEffect(() => {
    if (selectedConversation && !messagesLoading && (selectedConv?.unreadCount ?? 0) > 0) {
      markAsReadMutation.mutate(selectedConversation)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation, messagesLoading, selectedConv?.unreadCount])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageContent.trim() || !selectedConversation) return
    try {
      await sendMessageMutation.mutateAsync({
        receiverId: selectedConversation,
        content: messageContent.trim(),
      })
      setMessageContent("")
      // No refetch needed; we update caches optimistically.
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleConversationSelect = (conversation: Conversation) => {
    const userId = conversation.otherUser.id || conversation.otherUser._id
    if (userId) {
      setSelectedConversation(userId)
    }
  }

  const displayConversations = debouncedSearch ? searchResults : conversations

  const isSameRoleError = (error: any) => {
    return error?.response?.data?.message === "You cannot view messages with users of the same role"
  }

  const getErrorMessage = (error: any) => {
    if (isSameRoleError(error)) {
      return "You cannot message users with the same role. Artists can only message buyers and vice versa."
    }
    return "Failed to load messages. Please try again."
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-muted-foreground">{unreadLoading ? "Loading..." : `${unreadCount} unread messages`}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchConversations()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Conversations</span>
                <Badge variant="secondary">{conversations.length}</Badge>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversationsLoading || searchLoading ? (
                  <div className="space-y-4 p-4">
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
                ) : conversationsError ? (
                  <Alert variant="destructive" className="m-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load conversations. Please try again.
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 bg-transparent"
                        onClick={() => refetchConversations()}
                      >
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : displayConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{debouncedSearch ? "No conversations found" : "No conversations yet"}</p>
                    <p className="text-sm">
                      {debouncedSearch ? "Try a different search term" : "Start a conversation with an artist"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {displayConversations.map((conversation: Conversation) => {
                      const userId = conversation.otherUser.id || conversation.otherUser._id
                      const isSelected = selectedConversation === userId

                      return (
                        <div
                          key={conversation.conversationId}
                          className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            isSelected ? "bg-muted" : ""
                          }`}
                          onClick={() => handleConversationSelect(conversation)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={conversation.otherUser.avatar || "/placeholder.svg"}
                              alt={conversation.otherUser.username}
                            />
                            <AvatarFallback>
                              {conversation.otherUser.username?.charAt(0)?.toUpperCase() || (
                                <User className="h-4 w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm truncate">{conversation.otherUser.username}</p>
                              <div className="flex items-center gap-2">
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage.content}</p>
                            {conversation.otherUser.isOnline && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="h-2 w-2 bg-green-500 rounded-full" />
                                <span className="text-xs text-green-600">Online</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={otherUser?.avatar || artistFallback?.avatar || "/placeholder.svg"}
                        alt={otherUser?.username || artistFallback?.username}
                      />
                      <AvatarFallback>
                        {otherUser?.username?.charAt(0)?.toUpperCase() ||
                          artistFallback?.username?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {otherUser?.username}
                        {/* {messages.receiver.username} */}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {otherUser?.role || artistFallback?.role || "User"}
                        </Badge>
                        {otherUser?.isOnline && (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 bg-green-500 rounded-full" />
                            <span className="text-xs text-green-600">Online</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[400px] p-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                            <div className="flex items-start gap-2 max-w-xs">
                              {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-16 w-48" />
                              </div>
                              {i % 2 === 1 && <Skeleton className="h-8 w-8 rounded-full" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : messagesError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {getErrorMessage(messagesError)}
                          {!isSameRoleError(messagesError) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-2 bg-transparent"
                              onClick={() => refetchMessages()}
                            >
                              Retry
                            </Button>
                          )}
                        </AlertDescription>
                      </Alert>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message: Message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isSentByMe ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`flex items-start gap-2 max-w-xs lg:max-w-md ${
                                message.isSentByMe ? "flex-row-reverse" : "flex-row"
                              }`}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={
                                    message.isSentByMe
                                      ? message.sender.avatar || "/placeholder.svg"
                                      : message.receiver.avatar || "/placeholder.svg"
                                  }
                                  alt={message.isSentByMe ? message.sender.username : message.receiver.username}
                                />
                                <AvatarFallback>
                                  {message.isSentByMe
                                    ? message.sender.username?.charAt(0)?.toUpperCase()
                                    : message.receiver.username?.charAt(0)?.toUpperCase() || (
                                        <User className="h-4 w-4" />
                                      )}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`rounded-lg px-3 py-2 ${
                                  message.isSentByMe
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    message.isSentByMe ? "text-primary-foreground/70" : "text-muted-foreground/70"
                                  }`}
                                >
                                  {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>

                <Separator />

                {/* Message Input */}
                <div className="p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      disabled={sendMessageMutation.isPending || isSameRoleError(messagesError)}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={
                        !messageContent.trim() || sendMessageMutation.isPending || isSameRoleError(messagesError)
                      }
                      size="sm"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                  {isSameRoleError(messagesError) && (
                    <p className="text-sm text-muted-foreground mt-2">
                      💡 Tip: You can only message users with different roles (artists ↔ buyers)
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
