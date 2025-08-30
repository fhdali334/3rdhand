import { configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import { combineReducers } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import artworkReducer from "./slices/artworkSlice"
import messageReducer from "./slices/messageSlice"
import paymentReducer from "./slices/paymentSlice"
import adminReducer from "./slices/adminSlice"
import analyticsReducer from "./slices/analyticsSlice"

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth state
}

const rootReducer = combineReducers({
  auth: authReducer,
  artwork: artworkReducer,
  message: messageReducer,
  payment: paymentReducer,
  admin: adminReducer,
  analytics: analyticsReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
