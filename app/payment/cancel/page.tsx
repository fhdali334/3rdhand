"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function PaymentCancelPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/browse")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 mx-auto mb-6 text-orange-500" />
            <h1 className="text-2xl font-bold mb-4 text-orange-700">Payment Cancelled</h1>
            <p className="text-muted-foreground mb-6">
              Your payment was cancelled. No charges have been made to your account.
            </p>

            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Redirecting to browse artworks in <span className="font-bold text-primary">{countdown}</span>{" "}
                  seconds...
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href="javascript:history.back()">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/browse">
                    Browse Artworks
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/dashboard/purchases">View My Purchases</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
