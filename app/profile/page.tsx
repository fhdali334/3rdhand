"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Camera, Check, Edit, Globe, Instagram, Facebook, Twitter, Upload, Verified } from "lucide-react"
import { mockUsers, getArtistProfileByUserId, getArtworksByArtist } from "@/lib/mock-data"
import { ArtworkCard } from "@/components/artwork/artwork-card"

// Simulating current user - in real app this would come from auth context
const currentUser = mockUsers[0] // Emma Johnson (artist)

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    username: currentUser.username,
    email: currentUser.email,
    bio: currentUser.profile.bio || "",
    website: currentUser.profile.website || "",
    socialLinks: {
      facebook: currentUser.profile.socialLinks?.facebook || "",
      instagram: currentUser.profile.socialLinks?.instagram || "",
      twitter: currentUser.profile.socialLinks?.twitter || "",
    },
  })

  const artistProfile = getArtistProfileByUserId(currentUser._id)
  const userArtworks = getArtworksByArtist(currentUser._id)

  const handleSave = () => {
    // In real app, this would make an API call to update profile
    console.log("Saving profile:", profileData)
    setIsEditing(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In real app, this would upload to Cloudinary or similar
      console.log("Uploading image:", file)
    }
  }

  return (
    <>
      <Header />
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
                        <AvatarImage src="/placeholder.svg" alt={currentUser.username} />
                        <AvatarFallback className="text-2xl">
                          {currentUser.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
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
                      <h2 className="text-xl font-bold">{currentUser.username}</h2>
                      {currentUser.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          <Verified className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">{currentUser.email}</p>
                    <Badge variant={currentUser.role === "artist" ? "default" : "secondary"}>
                      {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Artist Stats */}
              {currentUser.role === "artist" && artistProfile && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Artist Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Sales</span>
                        <span className="font-medium">{artistProfile.totalSales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating</span>
                        <span className="font-medium">
                          {artistProfile.rating.average.toFixed(1)} ({artistProfile.rating.count})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Artworks</span>
                        <span className="font-medium">{userArtworks.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Member Since</span>
                        <span className="font-medium">{new Date(artistProfile.joinedAt).getFullYear()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Profile Details */}
            <div className="xl:col-span-2">
              <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  <TabsTrigger value="general" className="text-xs sm:text-sm">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="social" className="text-xs sm:text-sm">
                    Social
                  </TabsTrigger>
                  {currentUser.role === "artist" && (
                    <TabsTrigger value="portfolio" className="text-xs sm:text-sm">
                      Portfolio
                    </TabsTrigger>
                  )}
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
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            disabled={!isEditing}
                          />
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
                          <Button onClick={handleSave}>
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
                            placeholder="@username"
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
                            placeholder="username"
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
                            placeholder="@username"
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
                          <Button onClick={handleSave}>
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

                {currentUser.role === "artist" && (
                  <TabsContent value="portfolio">
                    <Card>
                      <CardHeader>
                        <CardTitle>Portfolio</CardTitle>
                        <CardDescription>Manage your artwork portfolio</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {userArtworks.map((artwork) => (
                            <ArtworkCard
                              key={artwork._id}
                              artwork={{
                                id: artwork._id,
                                title: artwork.title,
                                artist: currentUser.username,
                                price: artwork.price,
                                image: artwork.images[0],
                                category: artwork.medium || "Art",
                              }}
                            />
                          ))}
                          <Card className="flex flex-col items-center justify-center h-48 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-6">
                              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground text-center">Add new artwork</p>
                              <Button variant="outline" size="sm" className="mt-2">
                                Upload
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Manage your account security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" disabled={!isEditing} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" disabled={!isEditing} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" disabled={!isEditing} />
                      </div>
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">Account Verification</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">Email Verification</p>
                            <p className="text-xs text-muted-foreground">
                              {currentUser.isVerified ? "Your email is verified" : "Please verify your email"}
                            </p>
                          </div>
                          {currentUser.isVerified ? (
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
                      {isEditing && (
                        <div className="flex gap-2">
                          <Button onClick={handleSave}>
                            <Check className="mr-2 h-4 w-4" />
                            Update Password
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
