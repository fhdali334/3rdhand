"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { registerUser, clearError } from "@/lib/store/slices/authSlice"
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const { isLoading, error, isAuthenticated, isVerificationRequired } = useAppSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "buyer",
    },
  })

  const watchedRole = watch("role")

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else if (isVerificationRequired) {
      router.push("/auth/verify-otp")
    }
  }, [isAuthenticated, isVerificationRequired, router])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await dispatch(registerUser(data))
      if (registerUser.fulfilled.match(result)) {
        toast({
          title: "Registration Successful!",
          description: "Please check your email for verification OTP.",
        })
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Header />
      <div className="container flex items-center justify-center min-h-[calc(100vh-64px-200px)] px-4 py-8 sm:py-12">
        <Card className="w-full max-w-sm sm:max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...register("username")} placeholder="Enter your username" />
                {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="your@email.com" />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} placeholder="Enter your password" />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Account type</Label>
                <RadioGroup
                  value={watchedRole}
                  onValueChange={(value) => setValue("role", value as "artist" | "buyer")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buyer" id="buyer" />
                    <Label htmlFor="buyer">Buyer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="artist" id="artist" />
                    <Label htmlFor="artist">Artist</Label>
                  </div>
                </RadioGroup>
                {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create account
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Login
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
