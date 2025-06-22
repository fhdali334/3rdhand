import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ReduxProvider } from "@/lib/providers/redux-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthInitializer } from "@/components/auth/auth-inilializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "3rdHand - Art Marketplace",
  description: "Discover and collect unique artworks from talented artists around the world",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthInitializer />
            {children}
            <Toaster />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
