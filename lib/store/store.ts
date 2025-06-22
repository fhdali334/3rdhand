import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./slices/authSlice"
import adminSlice from "./slices/adminSlice"
import artworkSlice from "./slices/artworkSlice"
import paymentSlice from "./slices/paymentSlice"
import analyticsSlice from "./slices/analyticsSlice"

export const store = configureStore({
  reducer: {
    auth: authSlice,
    admin: adminSlice,
    artwork: artworkSlice,
    payment: paymentSlice,
    analytics: analyticsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
