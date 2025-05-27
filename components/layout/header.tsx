"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Menu,
  Search,
  User,
  X,
  LogOut,
  Settings,
  LayoutDashboardIcon as Dashboard,
  UserCircle,
  Palette,
  ShoppingBag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { logoutUser, getCurrentUser } from "@/lib/store/slices/authSlice"
import { useToast } from "@/hooks/use-toast"

const routes = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/browse",
    label: "Browse Art",
  },
  {
    href: "/artists",
    label: "Artists",
  },
  {
    href: "/how-it-works",
    label: "How It Works",
  },
]

export function Header() {
  const [showSearch, setShowSearch] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth)

  // Get current user on mount if token exists
  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser())
    }
  }, [token, user, dispatch])

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging you out.",
        variant: "destructive",
      })
    }
  }

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  const getUserMenuItems = () => {
    if (!user) return []

    const baseItems = [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: Dashboard,
      },
      {
        href: "/profile",
        label: "Profile",
        icon: UserCircle,
      },
    ]

    // Add role-specific items
    if (user.role === "artist") {
      baseItems.push({
        href: "/dashboard/artworks",
        label: "My Artworks",
        icon: Palette,
      })
    }

    if (user.role === "buyer") {
      baseItems.push({
        href: "/dashboard/purchases",
        label: "My Purchases",
        icon: ShoppingBag,
      })
    }

    baseItems.push({
      href: "/dashboard/messages",
      label: "Messages",
      icon: Settings,
    })

    return baseItems
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[300px]">
              <nav className="flex flex-col gap-3 sm:gap-4 mt-6 sm:mt-8">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      pathname === route.href ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {route.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Account</p>
                      {getUserMenuItems().map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary py-1"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary py-1 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2 mr-6">
            <span className="font-bold text-xl">3rdHand</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === route.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {showSearch ? (
            <div className="flex items-center">
              <Input type="search" placeholder="Search..." className="w-[150px] sm:w-[200px] md:w-[300px]" />
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile?.avatar || "/placeholder.svg"} alt={user.username} />
                    <AvatarFallback>{getUserInitials(user.username)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.username}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {getUserMenuItems().map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/auth/login" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/register" className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    Register
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
