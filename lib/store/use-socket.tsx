"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import {
  setConnectionStatus,
  updateOnlineUsers,
  updateTypingUsers,
  addMessageToConversation,
  updateMessageInConversation,
  fetchConversations,
} from "./slices/messageSlice"
import { useToast } from "@/hooks/use-toast"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (receiverId: string, content: string) => void
  joinConversation: (userId: string) => void
  leaveConversation: (userId: string) => void
  markAsRead: (userId: string) => void
  startTyping: (userId: string) => void
  stopTyping: (userId: string) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
  joinConversation: () => {},
  leaveConversation: () => {},
  markAsRead: () => {},
  startTyping: () => {},
  stopTyping: () => {},
})

export const useSocketContext = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider")
  }
  return context
}

interface SocketProviderProps {
  children: React.ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const { user } = useAppSelector((state) => state.auth)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!user?.token) {
      console.log("🔌 No user token, skipping socket connection")
      return
    }

    console.log("🔌 Initializing socket connection...")

    // Initialize socket connection only once
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.3rdhand.be", {
        auth: {
          token: user.token,
        },
        path: "/api/socketio",
        transports: ["websocket", "polling"],
        upgrade: true,
        rememberUpgrade: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      })

      // Connection events
      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected:", socketRef.current?.id)
        setIsConnected(true)
        dispatch(setConnectionStatus(true))
      })

      socketRef.current.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason)
        setIsConnected(false)
        dispatch(setConnectionStatus(false))
      })

      socketRef.current.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error)
        setIsConnected(false)
        dispatch(setConnectionStatus(false))

        // Only show toast for non-authentication errors
        if (!error.message?.includes("Authentication")) {
          toast({
            title: "Connection Error",
            description: "Failed to connect to messaging service",
            variant: "destructive",
          })
        }
      })

      // Authentication events
      socketRef.current.on("connected", (data) => {
        console.log("🔐 Socket authenticated:", data)
        toast({
          title: "Connected",
          description: "Successfully connected to messaging service",
        })
      })

      socketRef.current.on("authentication_error", (error) => {
        console.error("🔐 Socket authentication error:", error)
        toast({
          title: "Authentication Error",
          description: "Failed to authenticate with messaging service",
          variant: "destructive",
        })
      })

      // Message events
      socketRef.current.on("new_message", (message) => {
        console.log("📨 New message received:", message)
        dispatch(addMessageToConversation(message))

        // Refresh conversations to update last message
        dispatch(fetchConversations())

        // Show notification if not in current conversation
        if (Notification.permission === "granted") {
          new Notification(`New message from ${message.sender.username}`, {
            body: message.content,
            icon: message.sender.avatar || "/placeholder.svg",
          })
        }
      })

      socketRef.current.on("message_updated", (message) => {
        console.log("🔄 Message updated:", message)
        dispatch(updateMessageInConversation(message))
      })

      socketRef.current.on("message_read", (data) => {
        console.log("👁️ Message read:", data)
        // Update message status in the conversation
      })

      socketRef.current.on("messages_read", (data) => {
        console.log("👁️ Messages marked as read:", data)
        // Update read status for multiple messages
      })

      // User presence events
      socketRef.current.on("user_online", (data) => {
        console.log("👤 User came online:", data)
        dispatch(updateOnlineUsers({ userId: data.userId, isOnline: true }))
      })

      socketRef.current.on("user_offline", (data) => {
        console.log("👤 User went offline:", data)
        dispatch(updateOnlineUsers({ userId: data.userId, isOnline: false }))
      })

      socketRef.current.on("user_status_change", (data) => {
        console.log("👤 User status changed:", data)
        dispatch(updateOnlineUsers({ userId: data.userId, isOnline: data.isOnline }))
      })

      // Typing events
      socketRef.current.on("user_typing", (data) => {
        console.log("⌨️ User typing:", data)
        dispatch(
          updateTypingUsers({
            conversationId: data.conversationId || `${data.userId}_typing`,
            userId: data.userId,
            isTyping: true,
          }),
        )

        // Auto-hide typing indicator after 5 seconds
        setTimeout(() => {
          dispatch(
            updateTypingUsers({
              conversationId: data.conversationId || `${data.userId}_typing`,
              userId: data.userId,
              isTyping: false,
            }),
          )
        }, 5000)
      })

      socketRef.current.on("user_stopped_typing", (data) => {
        console.log("⌨️ User stopped typing:", data)
        dispatch(
          updateTypingUsers({
            conversationId: data.conversationId || `${data.userId}_typing`,
            userId: data.userId,
            isTyping: false,
          }),
        )
      })

      // Conversation events
      socketRef.current.on("conversation_joined", (data) => {
        console.log("🏠 Conversation joined:", data)
      })

      socketRef.current.on("conversation_left", (data) => {
        console.log("🚪 Conversation left:", data)
      })

      // Error events
      socketRef.current.on("error", (error) => {
        console.error("❌ Socket error:", error)
        toast({
          title: "Error",
          description: error.message || "An error occurred",
          variant: "destructive",
        })
      })
    }

    setSocket(socketRef.current)

    // Cleanup on unmount or userId change
    return () => {
      console.log("🔌 Cleaning up socket connection...")
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsConnected(false)
        dispatch(setConnectionStatus(false))
      }
    }
  }, [user?.token, dispatch, toast])

  // Socket methods
  const sendMessage = (receiverId: string, content: string) => {
    if (!socket || !isConnected) {
      console.warn("⚠️ Socket not connected, cannot send message")
      return
    }

    console.log("📤 Sending message via socket:", { receiverId, content })
    socket.emit("send_message", {
      receiverId,
      content,
      timestamp: new Date().toISOString(),
    })
  }

  const joinConversation = (userId: string) => {
    if (!socket || !isConnected) {
      console.warn("⚠️ Socket not connected, cannot join conversation")
      return
    }

    console.log("🔗 Joining conversation:", userId)
    socket.emit("join_conversation", { userId })
  }

  const leaveConversation = (userId: string) => {
    if (!socket || !isConnected) {
      console.warn("⚠️ Socket not connected, cannot leave conversation")
      return
    }

    console.log("🔗 Leaving conversation:", userId)
    socket.emit("leave_conversation", { userId })
  }

  const markAsRead = (userId: string) => {
    if (!socket || !isConnected) {
      console.warn("⚠️ Socket not connected, cannot mark as read")
      return
    }

    console.log("👁️ Marking messages as read:", userId)
    socket.emit("mark_as_read", { userId })
  }

  const startTyping = (userId: string) => {
    if (!socket || !isConnected) {
      console.warn("⚠️ Socket not connected, cannot start typing")
      return
    }

    console.log("⌨️ Starting typing:", userId)
    socket.emit("start_typing", { userId })
  }

  const stopTyping = (userId: string) => {
    if (!socket || !isConnected) {
      console.warn("⚠️ Socket not connected, cannot stop typing")
      return
    }

    console.log("⌨️ Stopping typing:", userId)
    socket.emit("stop_typing", { userId })
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    markAsRead,
    startTyping,
    stopTyping,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
