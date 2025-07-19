import { apiClient } from "./client"

// Updated types to match exact API response structure
export interface Message {
  id: string
  content: string
  sender: {
    _id: string
    username: string
    role: "artist" | "buyer" | "admin"
    avatar?: string
    id?: string
  }
  receiver: {
    _id: string
    username: string
    role: "artist" | "buyer" | "admin"
    avatar?: string
    id?: string
    isOnline?: boolean
    lastSeen?: string
  }
  timestamp: string
  read: boolean
  conversationId?: string
  readAt?: string
  flagged?: boolean
  flagReason?: string
  flaggedBy?: string
  flaggedAt?: string
  deleted?: boolean
  messageStatus?: "sent" | "delivered" | "read"
  isSentByMe?: boolean
}

export interface Conversation {
  conversationId: string
  otherUser: {
    _id?: string
    id: string
    username: string
    role: "artist" | "buyer" | "admin"
    avatar?: string
    isOnline?: boolean
    lastSeen?: string
  }
  lastMessage?: {
    id: string
    content: string
    timestamp: string
    senderId: string
    isSentByMe: boolean
  }
  unreadCount: number
  updatedAt: string
}

export interface MessageAnalytics {
  period: string
  overview: {
    totalMessages: number
    totalConversations: number
    flaggedMessages: number
  }
  messagesByRole: Array<{
    _id: string
    count: number
  }>
  activeConversations: Array<{
    _id: string
    messageCount: number
    participants: string[]
    lastMessage: string
  }>
  messagesOverTime: Array<{
    _id: string
    count: number
  }>
}

export interface SendMessageData {
  receiverId: string
  content: string
}

export interface MessageFilters {
  page?: number
  limit?: number
  flagged?: boolean
  conversationId?: string
  userId?: string
  search?: string
  sort?: string
}

export interface ConversationDetails {
  conversationId: string
  participants: Array<{
    _id: string
    username: string
    email: string
    role: "artist" | "buyer" | "admin"
  }>
  messages: Message[]
  stats: {
    totalMessages: number
    flaggedMessages: number
    startDate: string
    lastMessage: string
    messagesByParticipant: Record<
      string,
      {
        username: string
        role: string
        count: number
      }
    >
  }
}

// API Client
export const messagesApi = {
  // User messaging endpoints
  getConversations: async (page = 1, limit = 20) => {
    console.log(`📞 API: Fetching conversations - page: ${page}, limit: ${limit}`)
    try {
      const response = await apiClient.get<{
        status: string
        results: number
        data: {
          conversations: Conversation[]
          pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
            hasNextPage: boolean
            hasPrevPage: boolean
          }
        }
      }>(`/api/messages/conversations?page=${page}&limit=${limit}`)

      console.log("📞 API: Conversations response received:", {
        status: response.data?.status,
        results: response.data?.results,
        conversationsCount: response.data?.data?.conversations?.length,
        pagination: response.data?.data?.pagination,
      })

      return response
    } catch (error: any) {
      console.error("❌ API: Error fetching conversations:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  getConversationMessages: async (userId: string, page = 1, limit = 50) => {
    console.log(`📨 API: Fetching messages for user ${userId}, page ${page}, limit ${limit}`)
    try {
      const response = await apiClient.get<{
        status: string
        results: number
        data: {
          messages: Message[]
          pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
            hasNextPage: boolean
            hasPrevPage: boolean
          }
          otherUser: {
            id: string
            username?: string
            role: string
            isOnline: boolean
            lastSeen: string
          }
        }
      }>(`/api/messages/conversation/${userId}?page=${page}&limit=${limit}`)

      console.log(`📨 API: Messages response received:`, {
        status: response.data?.status,
        results: response.data?.results,
        messagesCount: response.data?.data?.messages?.length,
        otherUser: response.data?.data?.otherUser,
      })

      return response
    } catch (error: any) {
      console.error(`❌ API: Error fetching messages for ${userId}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  sendMessage: async (data: SendMessageData) => {
    console.log("📤 API: Sending message:", data)
    try {
      const response = await apiClient.post<{
        status: string
        message: string
        data: {
          message: Message
          conversation: {
            conversationId: string
            otherUser: {
              _id: string
              username: string
              role: string
              isOnline: boolean
              lastSeen: string
              id: string
            }
          }
        }
      }>("/api/messages/send", data)

      console.log("📤 API: Send message response received:", {
        status: response.data?.status,
        messageId: response.data?.data?.message?.id,
        conversationId: response.data?.data?.conversation?.conversationId,
      })

      return response
    } catch (error: any) {
      console.error("❌ API: Error sending message:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  markConversationAsRead: async (userId: string) => {
    console.log(`👁️ API: Marking conversation with ${userId} as read`)
    try {
      const response = await apiClient.put<{
        status: string
        message: string
      }>(`/api/messages/conversation/${userId}/read`)

      console.log(`👁️ API: Mark as read response:`, response.data)
      return response
    } catch (error: any) {
      console.error(`❌ API: Error marking conversation ${userId} as read:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  getUnreadCount: async () => {
    console.log("📊 API: Fetching unread count")
    try {
      const response = await apiClient.get<{
        status: string
        data: {
          unreadCount: number
        }
      }>("/api/messages/unread-count")

      console.log("📊 API: Unread count response:", response.data)
      return response
    } catch (error: any) {
      console.error("❌ API: Error fetching unread count:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  searchConversations: async (query: string, page = 1, limit = 10) => {
    console.log(`🔍 API: Searching conversations with query: ${query}`)
    try {
      const response = await apiClient.get<{
        status: string
        results: number
        data: {
          conversations: Conversation[]
          pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
            hasNextPage: boolean
            hasPrevPage: boolean
          }
        }
      }>(`/api/messages/conversations/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)

      console.log("🔍 API: Search response:", response.data)
      return response
    } catch (error: any) {
      console.error(`❌ API: Error searching conversations:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  searchWithinConversation: async (userId: string, query: string, page = 1, limit = 20) => {
    console.log(`🔍 API: Searching within conversation ${userId} with query: ${query}`)
    try {
      const response = await apiClient.get<{
        status: string
        results: number
        data: {
          messages: Message[]
          pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
            hasNextPage: boolean
            hasPrevPage: boolean
          }
        }
      }>(`/api/messages/conversation/${userId}/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)

      console.log("🔍 API: Search within conversation response:", response.data)
      return response
    } catch (error: any) {
      console.error(`❌ API: Error searching within conversation:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  blockUser: async (userId: string) => {
    console.log(`🚫 API: Blocking user ${userId}`)
    try {
      const response = await apiClient.put<{
        status: string
        message: string
      }>(`/api/messages/block/${userId}`)

      console.log(`🚫 API: Block user response:`, response.data)
      return response
    } catch (error: any) {
      console.error(`❌ API: Error blocking user ${userId}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  unblockUser: async (userId: string) => {
    console.log(`✅ API: Unblocking user ${userId}`)
    try {
      const response = await apiClient.delete<{
        status: string
        message: string
      }>(`/api/messages/block/${userId}`)

      console.log(`✅ API: Unblock user response:`, response.data)
      return response
    } catch (error: any) {
      console.error(`❌ API: Error unblocking user ${userId}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  deleteMessage: async (messageId: string) => {
    console.log(`🗑️ API: Deleting message ${messageId}`)
    try {
      const response = await apiClient.delete<{
        status: string
        message: string
      }>(`/api/messages/${messageId}`)

      console.log(`🗑️ API: Delete message response:`, response.data)
      return response
    } catch (error: any) {
      console.error(`❌ API: Error deleting message ${messageId}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  // Get artist/user info for starting new conversations
  getArtistInfo: async (artistId: string) => {
    console.log(`👤 API: Fetching artist info for ${artistId}`)
    try {
      const response = await apiClient.get<{
        status: string
        data: {
          _id: string
          username: string
          email: string
          role: string
          avatar?: string
          profile?: {
            bio?: string
            website?: string
            socialLinks?: {
              instagram?: string
              twitter?: string
            }
          }
        }
      }>(`/api/users/${artistId}`)

      console.log(`👤 API: Artist info response:`, response.data)
      return response
    } catch (error: any) {
      console.error(`❌ API: Error fetching artist info for ${artistId}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  // Admin messaging endpoints
  getAnalytics: async (period = "week") => {
    console.log(`📊 API: Fetching message analytics for period: ${period}`)
    try {
      const response = await apiClient.get<{
        status: string
        data: MessageAnalytics
      }>(`/api/admin/messages/analytics?period=${period}`)

      console.log(`📊 API: Analytics response:`, response.data)
      return response
    } catch (error: any) {
      console.error(`❌ API: Error fetching analytics:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  getAllMessages: async (filters: MessageFilters = {}) => {
    console.log("📋 API: Fetching all messages with filters:", filters)
    try {
      const params = new URLSearchParams()

      if (filters.page) params.append("page", filters.page.toString())
      if (filters.limit) params.append("limit", filters.limit.toString())
      if (filters.flagged !== undefined) params.append("flagged", filters.flagged.toString())
      if (filters.conversationId) params.append("conversationId", filters.conversationId)
      if (filters.userId) params.append("userId", filters.userId)
      if (filters.search) params.append("search", filters.search)
      if (filters.sort) params.append("sort", filters.sort)

      const queryString = params.toString()
      const url = queryString ? `/api/admin/messages?${queryString}` : "/api/admin/messages"

      const response = await apiClient.get<{
        status: string
        results: number
        data: {
          messages: Message[]
          pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
            hasNextPage: boolean
            hasPrevPage: boolean
          }
        }
      }>(url)

      console.log("📋 API: Admin messages response:", response.data)
      return response
    } catch (error: any) {
      console.error("❌ API: Error fetching admin messages:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  flagMessage: async (messageId: string, reason?: string) => {
    console.log(`🚩 API: Flagging message ${messageId} with reason:`, reason)
    try {
      const response = await apiClient.patch<{
        status: string
        message: string
        data: {
          message: Message
        }
      }>(`/api/admin/messages/${messageId}/flag`, { reason })

      console.log(`🚩 API: Flag message response:`, response.data)
      return response
    } catch (error: any) {
      console.error(`❌ API: Error flagging message ${messageId}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  unflagMessage: async (messageId: string) => {
    console.log(`✅ API: Unflagging message ${messageId}`)
    try {
      const response = await apiClient.patch<{
        status: string
        message: string
        data: {
          message: Message
        }
      }>(`/api/admin/messages/${messageId}/flag`, { reason: null })

      console.log(`✅ API: Unflag message response:`, response.data)
      return response
    } catch (error: any) {
      console.error(`❌ API: Error unflagging message ${messageId}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  deleteMessageAdmin: async (messageId: string, reason?: string) => {
    console.log(`🗑️ API: Admin deleting message ${messageId} with reason:`, reason)
    try {
      const response = await apiClient.delete<{
        status: string
        message: string
      }>(`/api/admin/messages/${messageId}`, {
        data: { reason },
      })

      console.log(`🗑️ API: Admin delete message response:`, response.data)
      return response
    } catch (error: any) {
      console.error(`❌ API: Error admin deleting message ${messageId}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },

  getConversationDetails: async (conversationId: string) => {
    console.log(`🔍 API: Fetching conversation details for ${conversationId}`)
    try {
      const response = await apiClient.get<{
        status: string
        data: ConversationDetails
      }>(`/api/admin/messages/conversation/${conversationId}`)

      console.log(`🔍 API: Conversation details response:`, response.data)
      return response
    } catch (error: any) {
      console.error(`❌ API: Error fetching conversation details for ${conversationId}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  },
}
