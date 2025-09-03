"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [countdown, setCountdown] = useState(5)
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "success" | "failed">("loading")

  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    // Simulate checking payment status (you can replace this with actual API call)
    const checkPaymentStatus = async () => {
      try {
        // For now, we'll assume success if session_id exists
        // In a real implementation, you'd verify the session with your backend
        if (sessionId) {
          setPaymentStatus("success")
          toast({
            title: "Payment Successful!",
            description: "Your artwork purchase has been completed successfully.",
          })
        } else {
          setPaymentStatus("failed")
          toast({
            title: "Payment Failed",
            description: "There was an issue processing your payment.",
            variant: "destructive",
          })
        }
      } catch (error) {
        setPaymentStatus("failed")
        toast({
          title: "Payment Verification Failed",
          description: "Unable to verify payment status. Please check your purchases.",
          variant: "destructive",
        })
      }
    }

    checkPaymentStatus()
  }, [sessionId, toast])

  useEffect(() => {
    if (paymentStatus !== "loading") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            router.push("/dashboard/purchases")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [paymentStatus, router])

  if (paymentStatus === "loading") {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-primary" />
              <h1 className="text-2xl font-bold mb-4">Verifying Payment</h1>
              <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            {paymentStatus === "success" ? (
              <>
                <CheckCircle className="h-16 w-16 mx-auto mb-6 text-green-500" />
                <h1 className="text-2xl font-bold mb-4 text-green-700">Payment Successful!</h1>
                <p className="text-muted-foreground mb-6">
                  Your artwork purchase has been completed successfully. You will receive a confirmation email shortly.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-700">
                    Session ID: <span className="font-mono text-xs">{sessionId}</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 mx-auto mb-6 text-red-500" />
                <h1 className="text-2xl font-bold mb-4 text-red-700">Payment Failed</h1>
                <p className="text-muted-foreground mb-6">
                  There was an issue processing your payment. Please try again or contact support if the problem
                  persists.
                </p>
              </>
            )}

            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Redirecting to your purchases in <span className="font-bold text-primary">{countdown}</span>{" "}
                  seconds...
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <Link href="/dashboard/purchases">
                    View Purchases
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href="/browse">Continue Shopping</Link>
                </Button>
              </div>

              {paymentStatus === "failed" && (
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/dashboard/messages">Contact Support</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-primary" />
                <h1 className="text-2xl font-bold mb-4">Loading...</h1>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
