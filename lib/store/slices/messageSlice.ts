import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import {
  messagesApi,
  type Message,
  type Conversation,
  type MessageAnalytics,
  type SendMessageData,
  type MessageFilters,
} from "@/lib/api/messages"

interface MessageState {
  // User messaging
  conversations: Conversation[]
  conversationsLoading: boolean
  conversationsError: string | null

  currentConversation: {
    userId: string | null
    messages: Message[]
    loading: boolean
    error: string | null
    otherUser: any | null
    hasMore: boolean
    currentPage: number
  }

  sendingMessage: boolean
  sendMessageError: string | null

  unreadCount: number
  unreadCountLoading: boolean

  // Search
  searchQuery: string
  searchResults: Conversation[]
  searchLoading: boolean

  // Admin messaging
  adminAnalytics: MessageAnalytics | null
  adminAnalyticsLoading: boolean
  adminAnalyticsError: string | null

  adminMessages: Message[]
  adminMessagesLoading: boolean
  adminMessagesError: string | null
  adminMessagesPagination: any
  adminMessagesFilters: MessageFilters

  // Socket connection
  isConnected: boolean
  onlineUsers: Set<string>
  typingUsers: Map<string, string[]>
}

const initialState: MessageState = {
  conversations: [],
  conversationsLoading: false,
  conversationsError: null,

  currentConversation: {
    userId: null,
    messages: [],
    loading: false,
    error: null,
    otherUser: null,
    hasMore: true,
    currentPage: 1,
  },

  sendingMessage: false,
  sendMessageError: null,

  unreadCount: 0,
  unreadCountLoading: false,

  searchQuery: "",
  searchResults: [],
  searchLoading: false,

  adminAnalytics: null,
  adminAnalyticsLoading: false,
  adminAnalyticsError: null,

  adminMessages: [],
  adminMessagesLoading: false,
  adminMessagesError: null,
  adminMessagesPagination: null,
  adminMessagesFilters: {},

  isConnected: false,
  onlineUsers: new Set(),
  typingUsers: new Map(),
}

// Async thunks
export const fetchConversations = createAsyncThunk("messages/fetchConversations", async (_, { rejectWithValue }) => {
  try {
    console.log("🔄 Redux: Starting to fetch conversations...")
    const response = await messagesApi.getConversations(1, 20)

    if (response.data?.status === "success") {
      const conversations = response.data.data.conversations || []
      console.log("✅ Redux: Conversations fetched successfully:", conversations)
      return {
        conversations,
        pagination: response.data.data.pagination,
      }
    } else {
      console.error("❌ Redux: Invalid response structure:", response.data)
      return rejectWithValue("Invalid response structure")
    }
  } catch (error: any) {
    console.error("❌ Redux: Failed to fetch conversations:", error)
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch conversations"
    return rejectWithValue(errorMessage)
  }
})

export const fetchConversationMessages = createAsyncThunk(
  "messages/fetchConversationMessages",
  async (
    { userId, page = 1, loadMore = false }: { userId: string; page?: number; loadMore?: boolean },
    { rejectWithValue },
  ) => {
    try {
      console.log(`🔄 Redux: Starting to fetch messages for user ${userId}, page ${page}`)
      const response = await messagesApi.getConversationMessages(userId, page, 50)

      if (response.data?.status === "success" && response.data?.data) {
        const data = response.data.data
        console.log("✅ Redux: Messages fetched successfully:", data)

        return {
          userId,
          messages: data.messages || [],
          page,
          loadMore,
          otherUser: data.otherUser || null,
          pagination: data.pagination,
        }
      } else {
        console.error("❌ Redux: Invalid messages response structure:", response.data)
        return rejectWithValue("Invalid response structure")
      }
    } catch (error: any) {
      console.error("❌ Redux: Failed to fetch messages:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch messages"
      return rejectWithValue(errorMessage)
    }
  },
)

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (data: SendMessageData, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux: Starting to send message:", data)
      const response = await messagesApi.sendMessage(data)

      if (response.data?.status === "success" && response.data?.message) {
        const message = response.data.data.message
        console.log("✅ Redux: Message sent successfully:", message)
        return {
          message,
          conversation: response.data.data.conversation,
        }
      } else {
        console.error("❌ Redux: Invalid send message response structure:", response.data)
        return rejectWithValue("Invalid response structure")
      }
    } catch (error: any) {
      console.error("❌ Redux: Failed to send message:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to send message"
      return rejectWithValue(errorMessage)
    }
  },
)

export const markConversationAsRead = createAsyncThunk(
  "messages/markConversationAsRead",
  async (userId: string, { rejectWithValue }) => {
    try {
      await messagesApi.markConversationAsRead(userId)
      return userId
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to mark conversation as read"
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchUnreadCount = createAsyncThunk("messages/fetchUnreadCount", async (_, { rejectWithValue }) => {
  try {
    const response = await messagesApi.getUnreadCount()
    return response.data?.unreadCount || 0
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch unread count"
    return rejectWithValue(errorMessage)
  }
})

export const searchConversations = createAsyncThunk(
  "messages/searchConversations",
  async (query: string, { rejectWithValue }) => {
    try {
      if (!query.trim()) {
        return { conversations: [], query: "" }
      }

      const response = await messagesApi.searchConversations(query)
      return {
        conversations: response.data?.conversations || [],
        query,
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to search conversations"
      return rejectWithValue(errorMessage)
    }
  },
)

// Admin thunks
export const fetchMessageAnalytics = createAsyncThunk(
  "messages/fetchAnalytics",
  async (period = "week", { rejectWithValue }) => {
    try {
      const response = await messagesApi.getAnalytics(period)
      return response.data?.data || null
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch analytics"
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchAdminMessages = createAsyncThunk(
  "messages/fetchAdminMessages",
  async (filters: MessageFilters = {}, { rejectWithValue }) => {
    try {
      const response = await messagesApi.getAllMessages(filters)
      return {
        messages: response.data?.messages || [],
        pagination: response.data?.pagination || null,
        filters,
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch admin messages"
      return rejectWithValue(errorMessage)
    }
  },
)

export const flagMessage = createAsyncThunk(
  "messages/flagMessage",
  async ({ messageId, reason }: { messageId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await messagesApi.flagMessage(messageId, reason)
      return response.data?.message
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to flag message"
      return rejectWithValue(errorMessage)
    }
  },
)

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    clearMessageError: (state) => {
      state.conversationsError = null
      state.currentConversation.error = null
      state.sendMessageError = null
      state.adminAnalyticsError = null
      state.adminMessagesError = null
    },

    setCurrentConversation: (state, action: PayloadAction<string | null>) => {
      console.log("🔄 Redux: Setting current conversation:", action.payload)
      state.currentConversation.userId = action.payload
      if (!action.payload) {
        state.currentConversation.messages = []
        state.currentConversation.otherUser = null
        state.currentConversation.hasMore = true
        state.currentConversation.currentPage = 1
      }
    },

    addMessageToConversation: (state, action: PayloadAction<Message>) => {
      const message = action.payload
      console.log("➕ Redux: Adding message to conversation:", message)

      // Get the other user ID from the message
      const currentUserId = state.currentConversation.userId
      const otherUserId = message.sender._id === currentUserId ? message.receiver._id : message.sender._id

      // Check if this message belongs to the current conversation
      const isCurrentConversation = currentUserId === otherUserId

      if (isCurrentConversation) {
        // Check if message already exists to avoid duplicates
        const existingMessage = state.currentConversation.messages.find((msg) => msg.id === message.id)
        if (!existingMessage) {
          state.currentConversation.messages.push(message)
        }
      }

      // Update conversations list with new last message
      const conversationIndex = state.conversations.findIndex((conv) => {
        const convId = conv.conversationId
        return convId.includes(message.sender._id) && convId.includes(message.receiver._id)
      })

      if (conversationIndex !== -1) {
        // Update existing conversation
        state.conversations[conversationIndex].lastMessage = {
          id: message.id,
          content: message.content,
          timestamp: message.timestamp,
          senderId: message.sender._id,
          isSentByMe: message.isSentByMe || false,
        }
        state.conversations[conversationIndex].updatedAt = message.timestamp
      }
    },

    updateMessageInConversation: (state, action: PayloadAction<Message>) => {
      const updatedMessage = action.payload
      console.log("🔄 Redux: Updating message in conversation:", updatedMessage)

      const index = state.currentConversation.messages.findIndex((msg) => msg.id === updatedMessage.id)
      if (index !== -1) {
        state.currentConversation.messages[index] = updatedMessage
      }
    },

    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      console.log("🔌 Redux: Connection status changed:", action.payload)
      state.isConnected = action.payload
    },

    updateOnlineUsers: (state, action: PayloadAction<{ userId: string; isOnline: boolean }>) => {
      const { userId, isOnline } = action.payload
      console.log("👤 Redux: User online status changed:", userId, isOnline)

      if (isOnline) {
        state.onlineUsers.add(userId)
      } else {
        state.onlineUsers.delete(userId)
      }
    },

    updateTypingUsers: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string; isTyping: boolean }>,
    ) => {
      const { conversationId, userId, isTyping } = action.payload
      console.log("⌨️ Redux: Typing status changed:", conversationId, userId, isTyping)

      const currentTyping = state.typingUsers.get(conversationId) || []

      if (isTyping) {
        if (!currentTyping.includes(userId)) {
          state.typingUsers.set(conversationId, [...currentTyping, userId])
        }
      } else {
        state.typingUsers.set(
          conversationId,
          currentTyping.filter((id) => id !== userId),
        )
      }
    },

    updateAdminMessagesFilters: (state, action: PayloadAction<Partial<MessageFilters>>) => {
      state.adminMessagesFilters = { ...state.adminMessagesFilters, ...action.payload }
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },

    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchQuery = ""
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        console.log("⏳ Redux: Conversations loading...")
        state.conversationsLoading = true
        state.conversationsError = null
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        console.log("✅ Redux: Conversations loaded successfully:", action.payload)
        state.conversationsLoading = false
        state.conversations = action.payload.conversations
        state.conversationsError = null
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        console.error("❌ Redux: Failed to load conversations:", action.payload)
        state.conversationsLoading = false
        state.conversationsError = action.payload as string
        state.conversations = []
      })

      // Fetch conversation messages
      .addCase(fetchConversationMessages.pending, (state) => {
        console.log("⏳ Redux: Messages loading...")
        state.currentConversation.loading = true
        state.currentConversation.error = null
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        console.log("✅ Redux: Messages loaded successfully:", action.payload)
        state.currentConversation.loading = false
        state.currentConversation.otherUser = action.payload.otherUser
        state.currentConversation.error = null

        if (action.payload.loadMore) {
          // For pagination, prepend older messages
          const sortedMessages = action.payload.messages.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )
          state.currentConversation.messages = [...sortedMessages, ...state.currentConversation.messages]
        } else {
          // Sort messages by timestamp to ensure proper order
          state.currentConversation.messages = action.payload.messages.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )
        }

        // Update pagination info
        state.currentConversation.hasMore = action.payload.pagination?.hasNextPage || false
        state.currentConversation.currentPage = action.payload.page
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        console.error("❌ Redux: Failed to load messages:", action.payload)
        state.currentConversation.loading = false
        state.currentConversation.error = action.payload as string
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        console.log("⏳ Redux: Sending message...")
        state.sendingMessage = true
        state.sendMessageError = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        console.log("✅ Redux: Message sent successfully:", action.payload)
        state.sendingMessage = false
        state.sendMessageError = null

        // Add message to current conversation if it matches
        if (action.payload.message) {
          const message = action.payload.message
          const existingMessage = state.currentConversation.messages.find((msg) => msg.id === message.id)
          if (!existingMessage) {
            state.currentConversation.messages.push(message)
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        console.error("❌ Redux: Failed to send message:", action.payload)
        state.sendingMessage = false
        state.sendMessageError = action.payload as string
      })

      // Unread count
      .addCase(fetchUnreadCount.pending, (state) => {
        state.unreadCountLoading = true
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCountLoading = false
        state.unreadCount = action.payload
      })
      .addCase(fetchUnreadCount.rejected, (state) => {
        state.unreadCountLoading = false
      })

      // Search conversations
      .addCase(searchConversations.pending, (state) => {
        state.searchLoading = true
      })
      .addCase(searchConversations.fulfilled, (state, action) => {
        state.searchLoading = false
        state.searchResults = action.payload.conversations
        state.searchQuery = action.payload.query
      })
      .addCase(searchConversations.rejected, (state) => {
        state.searchLoading = false
      })

      // Admin analytics
      .addCase(fetchMessageAnalytics.pending, (state) => {
        state.adminAnalyticsLoading = true
        state.adminAnalyticsError = null
      })
      .addCase(fetchMessageAnalytics.fulfilled, (state, action) => {
        state.adminAnalyticsLoading = false
        state.adminAnalytics = action.payload
      })
      .addCase(fetchMessageAnalytics.rejected, (state, action) => {
        state.adminAnalyticsLoading = false
        state.adminAnalyticsError = action.payload as string
      })

      // Admin messages
      .addCase(fetchAdminMessages.pending, (state) => {
        state.adminMessagesLoading = true
        state.adminMessagesError = null
      })
      .addCase(fetchAdminMessages.fulfilled, (state, action) => {
        state.adminMessagesLoading = false
        state.adminMessages = action.payload.messages
        state.adminMessagesPagination = action.payload.pagination
        state.adminMessagesFilters = action.payload.filters
      })
      .addCase(fetchAdminMessages.rejected, (state, action) => {
        state.adminMessagesLoading = false
        state.adminMessagesError = action.payload as string
      })

      // Flag message
      .addCase(flagMessage.fulfilled, (state, action) => {
        if (action.payload) {
          const updatedMessage = action.payload
          const index = state.adminMessages.findIndex((msg) => msg.id === updatedMessage.id)
          if (index !== -1) {
            state.adminMessages[index] = updatedMessage
          }
        }
      })
  },
})

export const {
  clearMessageError,
  setCurrentConversation,
  addMessageToConversation,
  updateMessageInConversation,
  setConnectionStatus,
  updateOnlineUsers,
  updateTypingUsers,
  updateAdminMessagesFilters,
  setSearchQuery,
  clearSearchResults,
} = messageSlice.actions

export default messageSlice.reducer
