"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Search, MoreVertical, ImageIcon, Paperclip } from "lucide-react"
import { mockUsers, mockMessages, getUserById } from "@/lib/mock-data"

// Simulating current user
const currentUser = mockUsers[0] // Emma Johnson

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Get all conversations for current user
  const userConversations = mockMessages
    .filter((message) => message.sender === currentUser._id || message.receiver === currentUser._id)
    .reduce(
      (conversations, message) => {
        const otherUserId = message.sender === currentUser._id ? message.receiver : message.sender
        const existingConversation = conversations.find((conv) => conv.otherUserId === otherUserId)

        if (existingConversation) {
          if (new Date(message.timestamp) > new Date(existingConversation.lastMessage.timestamp)) {
            existingConversation.lastMessage = message
          }
          existingConversation.messages.push(message)
          if (!message.read && message.receiver === currentUser._id) {
            existingConversation.unreadCount++
          }
        } else {
          conversations.push({
            otherUserId,
            otherUser: getUserById(otherUserId)!,
            lastMessage: message,
            messages: [message],
            unreadCount: !message.read && message.receiver === currentUser._id ? 1 : 0,
          })
        }

        return conversations
      },
      [] as Array<{
        otherUserId: string
        otherUser: any
        lastMessage: any
        messages: any[]
        unreadCount: number
      }>,
    )
    .sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime())

  const filteredConversations = userConversations.filter((conv) =>
    conv.otherUser.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedConversationData = selectedConversation
    ? userConversations.find((conv) => conv.otherUserId === selectedConversation)
    : null

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    // In real app, this would send the message via API
    console.log("Sending message:", newMessage, "to:", selectedConversation)
    setNewMessage("")
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground">Communicate with artists and buyers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-[500px] sm:h-[600px] lg:h-[700px]">
          {/* Conversations List */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {filteredConversations.length > 0 ? (
                    <div className="space-y-1">
                      {filteredConversations.map((conversation) => (
                        <div
                          key={conversation.otherUserId}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedConversation === conversation.otherUserId ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedConversation(conversation.otherUserId)}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                              <AvatarImage src="/placeholder.svg" alt={conversation.otherUser.username} />
                              <AvatarFallback>
                                {conversation.otherUser.username
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate">{conversation.otherUser.username}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(conversation.lastMessage.timestamp)}
                                  </span>
                                  {conversation.unreadCount > 0 && (
                                    <Badge variant="default" className="h-5 w-5 p-0 text-xs">
                                      {conversation.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.lastMessage.sender === currentUser._id ? "You: " : ""}
                                {conversation.lastMessage.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      {searchTerm ? "No conversations found" : "No messages yet"}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="h-full flex flex-col">
              {selectedConversationData ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarImage src="/placeholder.svg" alt={selectedConversationData.otherUser.username} />
                          <AvatarFallback>
                            {selectedConversationData.otherUser.username
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{selectedConversationData.otherUser.username}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedConversationData.otherUser.role === "artist" ? "Artist" : "Buyer"}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[400px] p-4">
                      <div className="space-y-4">
                        {selectedConversationData.messages
                          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                          .map((message) => {
                            const isOwnMessage = message.sender === currentUser._id
                            return (
                              <div
                                key={message._id}
                                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-lg p-3 ${
                                    isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                                    }`}
                                  >
                                    {formatTime(message.timestamp)}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button variant="ghost" size="icon" className="hidden sm:flex">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hidden sm:flex">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1 text-sm sm:text-base"
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
