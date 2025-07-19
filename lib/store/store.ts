import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import artworkReducer from "./slices/artworkSlice"
import paymentReducer from "./slices/paymentSlice"
import adminReducer from "./slices/adminSlice"
import analyticsReducer from "./slices/analyticsSlice"
import messageReducer from "./slices/messageSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    artwork: artworkReducer,
    payment: paymentReducer,
    admin: adminReducer,
    analytics: analyticsReducer,
    messages: messageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["messages/updateOnlineUsers", "messages/updateTypingUsers"],
        ignoredPaths: ["messages.onlineUsers", "messages.typingUsers"],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
