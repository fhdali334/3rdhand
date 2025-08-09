"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { messagesApi, type MessageFilters } from "@/lib/api/messages"
import { useToast } from "@/hooks/use-toast"

// Shared query keys for all hooks in this module
const messageKeys = {
  all: ["messages"] as const,
  conversations: (page?: number, limit?: number) => ["messages", "conversations", page, limit] as const,
  conversation: (userId: string, page?: number, limit?: number) =>
    ["messages", "conversation", userId, page, limit] as const,
  unreadCount: () => ["messages", "unreadCount"] as const,
  search: (query: string) => ["messages", "search", query] as const,
  admin: {
    all: ["messages", "admin"] as const,
    messages: (filters: MessageFilters) => ["messages", "admin", "messages", filters] as const,
    analytics: (period: string) => ["messages", "admin", "analytics", period] as const,
  },
} as const

// Track last "mark as read" per conversation to avoid hammering the API.
const lastMarkedAt = new Map<string, number>()
const MARK_AS_READ_THROTTLE_MS = 20_000

function shouldThrottleMarkAsRead(userId: string) {
  const now = Date.now()
  const last = lastMarkedAt.get(userId) ?? 0
  if (now - last < MARK_AS_READ_THROTTLE_MS) return true
  lastMarkedAt.set(userId, now)
  return false
}

// Utility: only run queries when the tab is visible
function useDocumentVisible(): boolean {
  if (typeof document === "undefined") return true
  const [visible, setVisible] = (require("react") as typeof import("react")).useState(
    document.visibilityState !== "hidden",
  )
  ;(require("react") as typeof import("react")).useEffect(() => {
    const handler = () => setVisible(document.visibilityState !== "hidden")
    document.addEventListener("visibilitychange", handler)
    return () => document.removeEventListener("visibilitychange", handler)
  }, [])
  return visible
}

// Conversations
export function useConversations(page = 1, limit = 20) {
  const isVisible = useDocumentVisible()

  return useQuery({
    queryKey: messageKeys.conversations(page, limit),
    queryFn: () => messagesApi.getConversations(page, limit),
    enabled: isVisible,
    // Reduce background noise; manual refresh via UI button
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  })
}

// Conversation messages
export function useConversationMessages(userId: string | null, page = 1, limit = 50) {
  const isVisible = useDocumentVisible()

  return useQuery({
    queryKey: messageKeys.conversation(userId || "", page, limit),
    queryFn: () => messagesApi.getConversationMessages(userId!, page, limit),
    enabled: !!userId && isVisible,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // No polling; user can press refresh if needed
    retry: 2,
  })
}

// Unread count (lightweight; still keep a long-ish heartbeat but avoid burst)
export function useUnreadCount() {
  const isVisible = useDocumentVisible()

  return useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: messagesApi.getUnreadCount,
    enabled: isVisible,
    staleTime: 60 * 1000,
    refetchInterval: 90 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  })
}

// Debounced search should be done at the component level and then passed here.
// Here we require > 1 char to reduce server load.
export function useSearchConversations(query: string) {
  const isVisible = useDocumentVisible()

  return useQuery({
    queryKey: messageKeys.search(query),
    queryFn: () => messagesApi.searchConversations(query),
    enabled: isVisible && query.trim().length > 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  })
}

// Mutations

// Helper to safely derive ids
const getUserId = (u: any) => u?.id || u?._id

export function useSendMessage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: messagesApi.sendMessage,
    // Optimistic update to avoid refetching lists and unread-count
    onMutate: async (variables: { receiverId: string; content: string }) => {
      const { receiverId, content } = variables

      // Cancel outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({ queryKey: messageKeys.conversation(receiverId, 1, 50) }),
        queryClient.cancelQueries({ queryKey: messageKeys.conversations(1, 20) }),
      ])

      // Snapshot previous data
      const prevMessages = queryClient.getQueryData<any>(messageKeys.conversation(receiverId, 1, 50))
      const prevConversations = queryClient.getQueryData<any>(messageKeys.conversations(1, 20))

      // 1) Append message to message thread
      queryClient.setQueryData<any>(messageKeys.conversation(receiverId, 1, 50), (old) => {
        const base = old?.data?.messages ?? []
        const now = new Date().toISOString()
        const optimisticMsg = {
          id: `optimistic-${now}`,
          content,
          timestamp: now,
          isSentByMe: true,
          sender: { username: "Me" },
          receiver: { username: "" },
        }
        return {
          ...(old || {}),
          data: {
            ...(old?.data || {}),
            messages: [...base, optimisticMsg],
            otherUser: old?.data?.otherUser,
          },
        }
      })

      // 2) Update conversations list lastMessage and move to top if exists
      queryClient.setQueryData<any>(messageKeys.conversations(1, 20), (old) => {
        if (!old?.data?.conversations) return old
        const list = [...old.data.conversations]
        const idx = list.findIndex((c: any) => getUserId(c.otherUser) === receiverId)
        const now = new Date().toISOString()
        const lastMessage = { content, timestamp: now }
        if (idx >= 0) {
          const updated = { ...list[idx], lastMessage }
          list.splice(idx, 1)
          return { data: { conversations: [updated, ...list] } }
        } else {
          // If conversation doesn't exist locally, create a lightweight entry
          const lightweight = {
            conversationId: `optimistic-${now}`,
            otherUser: { _id: receiverId, username: "" },
            lastMessage,
            unreadCount: 0,
          }
          return { data: { conversations: [lightweight, ...list] } }
        }
      })

      return { prevMessages, prevConversations }
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      })
      // No invalidation here to avoid bursts; cached data already updated.
    },
    onError: (error: any, variables, context) => {
      // Revert optimistic updates
      if (context?.prevMessages) {
        queryClient.setQueryData(messageKeys.conversation(variables.receiverId, 1, 50), context.prevMessages)
      }
      if (context?.prevConversations) {
        queryClient.setQueryData(messageKeys.conversations(1, 20), context.prevConversations)
      }
      console.error("❌ Failed to send message:", error)
      const { toast } = require("@/hooks/use-toast")
      toast().toast({
        title: "Failed to send message",
        description: error?.response?.data?.message || "Please try again",
        variant: "destructive",
      })
    },
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    // Throttle duplicate mark-as-read calls for same userId
    mutationFn: async (userId: string) => {
      if (shouldThrottleMarkAsRead(userId)) {
        return { throttled: true }
      }
      return messagesApi.markConversationAsRead(userId)
    },
    onSuccess: (data: any, userId) => {
      // If throttled, don't touch caches (they're likely already up-to-date)
      if ((data as any)?.throttled) return

      // Set selected conversation's unreadCount to 0 locally
      queryClient.setQueryData<any>(messageKeys.conversations(1, 20), (old) => {
        if (!old?.data?.conversations) return old
        const list = old.data.conversations.map((c: any) =>
          getUserId(c.otherUser) === userId ? { ...c, unreadCount: 0 } : c,
        )
        return { data: { conversations: list } }
      })

      // Reduce global unreadCount by that conversation's unread count if we have it
      const convs = queryClient.getQueryData<any>(messageKeys.conversations(1, 20))
      const conv = convs?.data?.conversations?.find((c: any) => getUserId(c.otherUser) === userId)
      const convUnread = conv?.unreadCount ?? 0

      queryClient.setQueryData<any>(messageKeys.unreadCount(), (old) => {
        if (old?.data?.unreadCount == null) return old
        const next = Math.max(0, (old.data.unreadCount as number) - convUnread)
        return { data: { unreadCount: next } }
      })
    },
    onError: (error: any) => {
      console.error("❌ Failed to mark as read:", error)
      // Do not invalidate to avoid extra bursts.
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: messagesApi.deleteMessage,
    onSuccess: () => {
      // Prefer targeted cache updates over full invalidations if needed.
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

// Admin hooks (kept unchanged except reduced retries)
export function useAdminMessages(filters: MessageFilters = {}) {
  return useQuery({
    queryKey: messageKeys.admin.messages(filters),
    queryFn: () => messagesApi.getAllMessages(filters),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  })
}

export function useMessageAnalytics(period = "week") {
  return useQuery({
    queryKey: messageKeys.admin.analytics(period),
    queryFn: () => messagesApi.getAnalytics(period),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  })
}

export function useFlagMessage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ messageId, reason }: { messageId: string; reason?: string }) =>
      messagesApi.flagMessage(messageId, reason),
    onSuccess: () => {
      // Targeted invalidation: only admin lists, not user-facing lists.
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
