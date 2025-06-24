"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { verifyOtp, resendOtp, clearError } from "@/lib/store/slices/authSlice"
import { verifyOtpSchema, type VerifyOtpFormData } from "@/lib/validations/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail, RefreshCw } from "lucide-react"

export default function VerifyOtpPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const { isLoading, error, isAuthenticated, verificationEmail, isVerificationRequired } = useAppSelector(
    (state) => state.auth,
  )

  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: verificationEmail || "",
    },
  })

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else if (!isVerificationRequired && !verificationEmail) {
      router.push("/auth/register")
    }
  }, [isAuthenticated, isVerificationRequired, verificationEmail, router])

  useEffect(() => {
    if (verificationEmail) {
      setValue("email", verificationEmail)
    }
  }, [verificationEmail, setValue])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendCooldown])

  const onSubmit = async (data: VerifyOtpFormData) => {
    try {
      const result = await dispatch(verifyOtp(data))
      if (verifyOtp.fulfilled.match(result)) {
        toast({
          title: "Email Verified!",
          description: "Welcome to 3rdHand! Your account has been verified.",
        })
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Please check your OTP and try again.",
        variant: "destructive",
      })
    }
  }

  const handleResendOtp = async () => {
    if (!verificationEmail || resendCooldown > 0) return

    setResendLoading(true)
    try {
      const result = await dispatch(resendOtp({ email: verificationEmail }))
      if (resendOtp.fulfilled.match(result)) {
        toast({
          title: "OTP Sent!",
          description: "A new OTP has been sent to your email.",
        })
        setResendCooldown(60) // 60 seconds cooldown
      }
    } catch (error) {
      toast({
        title: "Failed to Resend",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <>
       
      <div className="container flex items-center justify-center min-h-[calc(100vh-64px-200px)] px-4 py-8 sm:py-12">
        <Card className="w-full max-w-sm sm:max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">Verify your email</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to <strong className="text-foreground">{verificationEmail}</strong>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} disabled />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  {...register("otp")}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                {errors.otp && <p className="text-sm text-red-500">{errors.otp.message}</p>}
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={resendLoading || resendCooldown > 0}
                  className="text-primary hover:text-primary/80"
                >
                  {resendLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Email
              </Button>
              <div className="text-center text-sm">
                Wrong email?{" "}
                <Link href="/auth/register" className="text-primary hover:underline">
                  Go back to registration
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  )
}
