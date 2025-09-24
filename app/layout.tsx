import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster"
import { ReduxProvider } from "@/lib/providers/redux-provider"
import { QueryProvider } from "@/lib/providers/query-provider"
// import { TranslationProvider } from "@/lib/providers/translation-provider"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "3rd Hand - Marketplace for Artists",
  description: "Connect artists with buyers in a seamless marketplace experience",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* <TranslationProvider> */}
          <QueryProvider>
            <ReduxProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {/* <AuthInitializer /> */}
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </div>
                <Toaster />
              </ThemeProvider>
            </ReduxProvider>
          </QueryProvider>
      
      </body>
    </html>
  )
}
