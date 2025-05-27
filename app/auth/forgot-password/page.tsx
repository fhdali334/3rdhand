"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ArrowLeft, CheckCircle, Mail } from "lucide-react"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { forgotPassword, clearError } from "@/lib/store/slices/authSlice"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState("")
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      dispatch(clearError())
      const result = await dispatch(forgotPassword(data))

      if (forgotPassword.fulfilled.match(result)) {
        setIsEmailSent(true)
        setSentEmail(data.email)
        toast.success("Password reset email sent successfully!")
      } else {
        toast.error(result.payload as string)
      }
    } catch (err) {
      toast.error("Failed to send reset email. Please try again.")
    }
  }

  if (isEmailSent) {
    return (
      <>
        <Header />
        <div className="container flex items-center justify-center min-h-[calc(100vh-64px-200px)] px-4 py-8 sm:py-12">
          <Card className="w-full max-w-sm sm:max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Check your email</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                We've sent a password reset link to <strong>{sentEmail}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Click the link in the email to reset your password. The link will expire in 10 minutes.
                </AlertDescription>
              </Alert>
              <Alert>
                <AlertDescription>
                  If you don't see the email in your inbox, please check your spam folder.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
              <div className="text-center text-sm">
                Didn't receive the email?{" "}
                <button
                  onClick={() => {
                    setIsEmailSent(false)
                    setSentEmail("")
                  }}
                  className="text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container flex items-center justify-center min-h-[calc(100vh-64px-200px)] px-4 py-8 sm:py-12">
        <Card className="w-full max-w-sm sm:max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Forgot your password?</CardTitle>
            <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full text-sm sm:text-base" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <div className="text-center text-sm">
                Remember your password?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
      <Footer />
    </>
  )
}
