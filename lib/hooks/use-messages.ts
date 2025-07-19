"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { messagesApi, type MessageFilters } from "@/lib/api/messages"
import { useToast } from "@/hooks/use-toast"

// User messaging hooks
export function useConversations(page = 1, limit = 20) {
  const messageKeysAll = ["messages"] as const;

const messageKeys = {
  all: messageKeysAll,
  conversations: (page?: number, limit?: number) =>
    [...messageKeysAll, "conversations", page, limit] as const,
  conversation: (userId: string, page?: number, limit?: number) =>
    [...messageKeysAll, "conversation", userId, page, limit] as const,
  unreadCount: () =>
    [...messageKeysAll, "unreadCount"] as const,
  search: (query: string) =>
    [...messageKeysAll, "search", query] as const,
  admin: {
    all: [...messageKeysAll, "admin"] as const,
    messages: (filters: MessageFilters) =>
      [...messageKeysAll, "admin", "messages", filters] as const,
    analytics: (period: string) =>
      [...messageKeysAll, "admin", "analytics", period] as const,
  },
} as const;

  return useQuery({
    queryKey: messageKeys.conversations(page, limit),
    queryFn: () => messagesApi.getConversations(page, limit),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export function useConversationMessages(userId: string | null, page = 1, limit = 50) {
  const messageKeys = {
    all: ["messages"] as const,
    conversations: (page?: number, limit?: number) => ["messages", "conversations", page, limit] as const,
    conversation: (userId: string, page?: number, limit?: number) => ["messages", "conversation", userId, page, limit] as const,
    unreadCount: () => ["messages", "unreadCount"] as const,
    search: (query: string) => ["messages", "search", query] as const,
    admin: {
      all: ["messages", "admin"] as const,
      messages: (filters: MessageFilters) => ["messages", "admin", "messages", filters] as const,
      analytics: (period: string) => ["messages", "admin", "analytics", period] as const,
    },
  } as const

  return useQuery({
    queryKey: messageKeys.conversation(userId || "", page, limit),
    queryFn: () => messagesApi.getConversationMessages(userId!, page, limit),
    enabled: !!userId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
  })
}

export function useUnreadCount() {
  const messageKeys = {
    all: ["messages"] as const,
    conversations: (page?: number, limit?: number) => ["messages", "conversations", page, limit] as const,
    conversation: (userId: string, page?: number, limit?: number) => ["messages", "conversation", userId, page, limit] as const,
    unreadCount: () => ["messages", "unreadCount"] as const,
    search: (query: string) => ["messages", "search", query] as const,
    admin: {
      all: ["messages", "admin"] as const,
      messages: (filters: MessageFilters) => ["messages", "admin", "messages", filters] as const,
      analytics: (period: string) => ["messages", "admin", "analytics", period] as const,
    },
  } as const

  return useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: messagesApi.getUnreadCount,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: 2,
  })
}

export function useSearchConversations(query: string) {
  const messageKeys = {
    all: ["messages"] as const,
    conversations: (page?: number, limit?: number) => ["messages", "conversations", page, limit] as const,
    conversation: (userId: string, page?: number, limit?: number) => ["messages", "conversation", userId, page, limit] as const,
    unreadCount: () => ["messages", "unreadCount"] as const,
    search: (query: string) => ["messages", "search", query] as const,
    admin: {
      all: ["messages", "admin"] as const,
      messages: (filters: MessageFilters) => ["messages", "admin", "messages", filters] as const,
      analytics: (period: string) => ["messages", "admin", "analytics", period] as const,
    },
  } as const

  return useQuery({
    queryKey: messageKeys.search(query),
    queryFn: () => messagesApi.searchConversations(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutations
export function useSendMessage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const messageKeys = {
    all: ["messages"] as const,
    conversations: (page?: number, limit?: number) => ["messages", "conversations", page, limit] as const,
    conversation: (userId: string, page?: number, limit?: number) => ["messages", "conversation", userId, page, limit] as const,
    unreadCount: () => ["messages", "unreadCount"] as const,
    search: (query: string) => ["messages", "search", query] as const,
    admin: {
      all: ["messages", "admin"] as const,
      messages: (filters: MessageFilters) => ["messages", "admin", "messages", filters] as const,
      analytics: (period: string) => ["messages", "admin", "analytics", period] as const,
    },
  } as const

  return useMutation({
    mutationFn: messagesApi.sendMessage,
    onSuccess: (data, variables) => {
      console.log("✅ Message sent successfully:", data)

      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: messageKeys.all })

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      })
    },
    onError: (error: any) => {
      console.error("❌ Failed to send message:", error)
      toast({
        title: "Failed to send message",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      })
    },
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  const messageKeys = {
    all: ["messages"] as const,
    conversations: (page?: number, limit?: number) => ["messages", "conversations", page, limit] as const,
    conversation: (userId: string, page?: number, limit?: number) => ["messages", "conversation", userId, page, limit] as const,
    unreadCount: () => ["messages", "unreadCount"] as const,
    search: (query: string) => ["messages", "search", query] as const,
    admin: {
      all: ["messages", "admin"] as const,
      messages: (filters: MessageFilters) => ["messages", "admin", "messages", filters] as const,
      analytics: (period: string) => ["messages", "admin", "analytics", period] as const,
    },
  } as const

  return useMutation({
    mutationFn: messagesApi.markConversationAsRead,
    onSuccess: (data, userId) => {
      console.log("✅ Conversation marked as read:", data)

      // Update all message-related queries
      queryClient.invalidateQueries({ queryKey: messageKeys.all })
    },
    onError: (error: any) => {
      console.error("❌ Failed to mark as read:", error)
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const messageKeys = {
    all: ["messages"] as const,
    conversations: (page?: number, limit?: number) => ["messages", "conversations", page, limit] as const,
    conversation: (userId: string, page?: number, limit?: number) => ["messages", "conversation", userId, page, limit] as const,
    unreadCount: () => ["messages", "unreadCount"] as const,
    search: (query: string) => ["messages", "search", query] as const,
    admin: {
      all: ["messages", "admin"] as const,
      messages: (filters: MessageFilters) => ["messages", "admin", "messages", filters] as const,
      analytics: (period: string) => ["messages", "admin", "analytics", period] as const,
    },
  } as const

  return useMutation({
    mutationFn: messagesApi.deleteMessage,
    onSuccess: () => {
      console.log("✅ Message deleted successfully")

      // Invalidate all message-related queries
      queryClient.invalidateQueries({ queryKey: messageKeys.all })

      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully",
      })
    },
    onError: (error: any) => {
      console.error("❌ Failed to delete message:", error)
      toast({
        title: "Failed to delete message",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      })
    },
  })
}

// Admin hooks
export function useAdminMessages(filters: MessageFilters = {}) {
  const messageKeys = {
    all: ["messages"] as const,
    conversations: (page?: number, limit?: number) => ["messages", "conversations", page, limit] as const,
    conversation: (userId: string, page?: number, limit?: number) => ["messages", "conversation", userId, page, limit] as const,
    unreadCount: () => ["messages", "unreadCount"] as const,
    search: (query: string) => ["messages", "search", query] as const,
    admin: {
      all: ["messages", "admin"] as const,
      messages: (filters: MessageFilters) => ["messages", "admin", "messages", filters] as const,
      analytics: (period: string) => ["messages", "admin", "analytics", period] as const,
    },
  } as const

  return useQuery({
    queryKey: messageKeys.admin.messages(filters),
    queryFn: () => messagesApi.getAllMessages(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  })
}

export function useMessageAnalytics(period = "week") {
  const messageKeys = {
    all: ["messages"] as const,
    conversations: (page?: number, limit?: number) => ["messages", "conversations", page, limit] as const,
    conversation: (userId: string, page?: number, limit?: number) => ["messages", "conversation", userId, page, limit] as const,
    unreadCount: () => ["messages", "unreadCount"] as const,
    search: (query: string) => ["messages", "search", query] as const,
    admin: {
      all: ["messages", "admin"] as const,
      messages: (filters: MessageFilters) => ["messages", "admin", "messages", filters] as const,
      analytics: (period: string) => ["messages", "admin", "analytics", period] as const,
    },
  } as const

  return useQuery({
    queryKey: messageKeys.admin.analytics(period),
    queryFn: () => messagesApi.getAnalytics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

export function useFlagMessage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const messageKeys = {
    all: ["messages"] as const,
    conversations: (page?: number, limit?: number) => ["messages", "conversations", page, limit] as const,
    conversation: (userId: string, page?: number, limit?: number) => ["messages", "conversation", userId, page, limit] as const,
    unreadCount: () => ["messages", "unreadCount"] as const,
    search: (query: string) => ["messages", "search", query] as const,
    admin: {
      all: ["messages", "admin"] as const,
      messages: (filters: MessageFilters) => ["messages", "admin", "messages", filters] as const,
      analytics: (period: string) => ["messages", "admin", "analytics", period] as const,
    },
  } as const

  return useMutation({
    mutationFn: ({ messageId, reason }: { messageId: string; reason?: string }) =>
      messagesApi.flagMessage(messageId, reason),
    onSuccess: () => {
      console.log("✅ Message flagged successfully")

      // Invalidate admin queries
      queryClient.invalidateQueries({ queryKey: messageKeys.admin.all })

      toast({
        title: "Message flagged",
        description: "The message has been flagged for review",
      })
    },
    onError: (error: any) => {
      console.error("❌ Failed to flag message:", error)
      toast({
        title: "Failed to flag message",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      })
    },
  })
}
