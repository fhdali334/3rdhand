import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import artworkReducer from "./slices/artworkSlice"
import messageReducer from "./slices/messageSlice"
import paymentReducer from "./slices/paymentSlice"
import adminReducer from "./slices/adminSlice"
import analyticsReducer from "./slices/analyticsSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    artwork: artworkReducer,
    message: messageReducer,
    payment: paymentReducer,
    admin: adminReducer,
    analytics: analyticsReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
