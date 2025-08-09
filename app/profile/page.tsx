"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Check, Edit, Globe, Instagram, Facebook, Twitter, Verified, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { getCurrentUser } from "@/lib/store/slices/authSlice"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth/auth-gaurd"
import { authApi } from "@/lib/api/auth"
import { artistsApi } from "@/lib/api/artists"

function ProfileContent() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const { user, isLoading } = useAppSelector((state) => state.auth)

  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [artistFollowers, setArtistFollowers] = useState<number | null>(null)
  const [artistFollowersLoading, setArtistFollowersLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    bio: "",
    website: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

  // Fetch current user data on component mount
  useEffect(() => {
    dispatch(getCurrentUser())
  }, [dispatch])

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        bio: user.profile?.bio || user.artistProfile?.bio || "",
        website: user.profile?.website || "",
        socialLinks: {
          facebook: user.profile?.socialLinks?.facebook || "",
          instagram: user.profile?.socialLinks?.instagram || "",
          twitter: user.profile?.socialLinks?.twitter || "",
        },
      })
    }
  }, [user])

  useEffect(() => {
    const loadArtistFollowers = async () => {
      try {
        if (!user || user.role !== "artist") return
        const artistId = (user as any)._id || (user as any).id
        if (!artistId) return
        setArtistFollowersLoading(true)
        const res = await artistsApi.getArtistDetails(artistId)
        const followers =
          (res as any)?.data?.data?.profile?.stats?.followers ??
          (res as any)?.data?.profile?.stats?.followers ??
          null
        if (typeof followers === "number") setArtistFollowers(followers)
      } catch (e) {
        console.error("Failed to load artist followers:", e)
      } finally {
        setArtistFollowersLoading(false)
      }
    }
    loadArtistFollowers()
  }, [user])

  const handleSaveProfile = async () => {
    try {
      setIsUpdating(true)

      const updateData = {
        profile: {
          bio: profileData.bio,
          website: profileData.website,
          socialLinks: profileData.socialLinks,
        },
      }

      const response = await authApi.updateProfile(updateData)

      if (response.success || response.data) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
        setIsEditing(false)
        // Refresh user data
        dispatch(getCurrentUser())
      } else {
        throw new Error(response.message || "Failed to update profile")
      }
    } catch (error: any) {
      console.error("Profile update error:", error)
      toast({
        title: "Update failed",
        description: error?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUpdatingPassword(true)

      const response = await authApi.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword,
      })

      if (response.success || response.data) {
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully.",
        })
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        })
      } else {
        throw new Error(response.message || "Failed to update password")
      }
    } catch (error: any) {
      console.error("Password update error:", error)
      toast({
        title: "Update failed",
        description: error?.message || "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In real app, this would upload to Cloudinary or similar
      console.log("Uploading image:", file)
      toast({
        title: "Image upload",
        description: "Image upload functionality will be implemented soon.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Loading Profile</h2>
            <p className="text-muted-foreground">Fetching your profile data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Profile Not Found</h2>
          <p className="text-muted-foreground">Unable to load profile data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your account settings and public profile</p>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
            {isEditing ? (
              "Cancel"
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Picture and Basic Info */}
          <div className="xl:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                      <AvatarImage src={user.profile?.avatar || "/placeholder.svg"} alt={user.username} />
                      <AvatarFallback className="text-2xl">
                        {user.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90">
                        <Camera className="h-4 w-4" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold">{user.username}</h2>
                    {user.isVerified && (
                      <Badge variant="secondary" className="text-xs">
                        <Verified className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{user.email}</p>
                  <Badge variant={user.role === "artist" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Artist Stats */}
            {user.role === "artist" && user.artistProfile && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Artist Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Sales</span>
                      <span className="font-medium">{user.artistProfile.totalSales}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating</span>
                      <span className="font-medium">
                        {user.artistProfile.rating.average.toFixed(1)} ({user.artistProfile.rating.count})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Artworks</span>
                      <span className="font-medium">{user.artworks?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Followers</span>
                      <span className="font-medium">
                        {artistFollowersLoading ? "Loading..." : artistFollowers ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Member Since</span>
                      <span className="font-medium">
                        {user.createdAt ? new Date(user.createdAt).getFullYear() : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified Artist</span>
                      <Badge variant={user.artistProfile.verified ? "default" : "secondary"}>
                        {user.artistProfile.verified ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Profile Details */}
          <div className="xl:col-span-2">
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                <TabsTrigger value="general" className="text-xs sm:text-sm">
                  General
                </TabsTrigger>
                <TabsTrigger value="social" className="text-xs sm:text-sm">
                  Social
                </TabsTrigger>
                <TabsTrigger value="security" className="text-xs sm:text-sm">
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Update your basic profile information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={profileData.username}
                          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                          disabled={true} // Username should not be editable
                        />
                        <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled={true} // Email should not be editable
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="website"
                          placeholder="https://yourwebsite.com"
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                          disabled={!isEditing}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} disabled={isUpdating}>
                          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <Check className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="social">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                    <CardDescription>Connect your social media accounts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                          <Instagram className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="instagram"
                          placeholder="https://instagram.com/username"
                          value={profileData.socialLinks.instagram}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              socialLinks: { ...profileData.socialLinks, instagram: e.target.value },
                            })
                          }
                          disabled={!isEditing}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                          <Facebook className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="facebook"
                          placeholder="https://facebook.com/username"
                          value={profileData.socialLinks.facebook}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              socialLinks: { ...profileData.socialLinks, facebook: e.target.value },
                            })
                          }
                          disabled={!isEditing}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                          <Twitter className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="twitter"
                          placeholder="https://twitter.com/username"
                          value={profileData.socialLinks.twitter}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              socialLinks: { ...profileData.socialLinks, twitter: e.target.value },
                            })
                          }
                          disabled={!isEditing}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} disabled={isUpdating}>
                          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <Check className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmNewPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                          placeholder="Confirm new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Account Verification</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Email Verification</p>
                          <p className="text-xs text-muted-foreground">
                            {user.isVerified ? "Your email is verified" : "Please verify your email"}
                          </p>
                        </div>
                        {user.isVerified ? (
                          <Badge variant="default">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Button variant="outline" size="sm">
                            Verify Email
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword}>
                        {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Check className="mr-2 h-4 w-4" />
                        Update Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}
