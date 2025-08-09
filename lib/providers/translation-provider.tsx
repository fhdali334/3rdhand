"use client"

import { useState, type ReactNode, useEffect } from "react"
import { TranslationContext } from "@/lib/hooks/use-translation"
import { translations, type Locale, defaultLocale } from "@/i18n"

interface TranslationProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function TranslationProvider({ children, initialLocale = defaultLocale }: TranslationProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale
    if (savedLocale && Object.keys(translations).includes(savedLocale)) {
      setLocale(savedLocale)
    }
  }, [])

  // Save locale to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("locale", locale)
  }, [locale])

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[locale]

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Fallback to English if key not found
        value = translations[defaultLocale]
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key // Return key if not found in fallback
          }
        }
        break
      }
    }

    return typeof value === "string" ? value : key
  }

  return <TranslationContext.Provider value={{ locale, setLocale, t }}>{children}</TranslationContext.Provider>
}
