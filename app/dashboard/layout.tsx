import type React from "react"
export const metadata = {
  title: "3rd Hand - Dashboard",
  description: "Dashboard for 3rd Hand Marketplace",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
