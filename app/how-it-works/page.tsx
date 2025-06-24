"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Palette,
  Upload,
  Eye,
  ShoppingCart,
  CreditCard,
  Download,
  UserPlus,
  Search,
  MessageCircle,
  Shield,
  Zap,
  Heart,
  Star,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
  return (
    <>
       
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="container py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 text-sm px-4 py-2">How It Works</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Gateway to Digital Art
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover how 3rdHand connects artists with art lovers in a seamless digital marketplace. Whether you're
              creating or collecting, we make it simple and secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Start Your Journey
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/browse">
                  <Search className="mr-2 h-5 w-5" />
                  Explore Artworks
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* For Artists Section */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Palette className="h-8 w-8 text-blue-600" />
              <h2 className="text-3xl md:text-4xl font-bold">For Artists</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your passion into profit. Share your art with the world and build your artistic career.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">1. Sign Up</CardTitle>
                <CardDescription>Create your artist account and set up your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Free registration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Artist verification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Portfolio setup
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">2. Upload Art</CardTitle>
                <CardDescription>Share your masterpieces with detailed descriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    High-quality images
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Detailed descriptions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Set your price
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">3. Get Discovered</CardTitle>
                <CardDescription>Your art gets featured and reaches potential buyers</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Featured listings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Search optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Social sharing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">4. Earn Money</CardTitle>
                <CardDescription>Receive payments instantly when your art sells</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Instant payments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Low commission
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Secure transactions
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/auth/register?role=artist">
                <Palette className="mr-2 h-5 w-5" />
                Become an Artist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* For Buyers Section */}
        <section className="container py-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl my-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <h2 className="text-3xl md:text-4xl font-bold">For Art Lovers</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover unique artworks from talented artists around the world. Build your digital art collection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle className="text-xl">1. Explore</CardTitle>
                <CardDescription>Browse thousands of unique artworks by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Advanced filters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Artist profiles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Curated collections
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-pink-600" />
                </div>
                <CardTitle className="text-xl">2. Connect</CardTitle>
                <CardDescription>Interact with artists and fellow art enthusiasts</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Message artists
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Save favorites
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Follow artists
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">3. Purchase</CardTitle>
                <CardDescription>Buy artworks securely with our protected payment system</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Secure payments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Instant delivery
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Purchase protection
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-violet-600" />
                </div>
                <CardTitle className="text-xl">4. Collect</CardTitle>
                <CardDescription>Build your digital art collection and enjoy forever</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    High-res downloads
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Lifetime access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Collection management
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/browse">
                <Search className="mr-2 h-5 w-5" />
                Start Exploring
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose 3rdHand?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide the best platform for digital art transactions with cutting-edge features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Secure & Safe</CardTitle>
                <CardDescription>
                  Your transactions are protected with bank-level security and encryption.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Instant downloads and payments. No waiting, no delays, just pure efficiency.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Quality Assured</CardTitle>
                <CardDescription>Every artwork is reviewed to ensure the highest quality standards.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle>24/7 Support</CardTitle>
                <CardDescription>Our dedicated support team is always here to help you succeed.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle>Fair Pricing</CardTitle>
                <CardDescription>Low commission rates that let artists keep more of what they earn.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-pink-600" />
                </div>
                <CardTitle>Community Driven</CardTitle>
                <CardDescription>
                  Join a vibrant community of artists and art lovers from around the world.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="text-center py-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of artists and art lovers who have already discovered the future of digital art.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/auth/register?role=artist">
                    <Palette className="mr-2 h-5 w-5" />
                    I'm an Artist
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  asChild
                >
                  <Link href="/auth/register?role=buyer">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    I'm a Buyer
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  )
}
