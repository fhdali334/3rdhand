"use client"

import { useEffect } from "react"
import { useAppDispatch } from "@/lib/hooks/redux"
import { initializeAuth } from "@/lib/store/slices/authSlice"

export function AuthInitializer() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  return null
}
