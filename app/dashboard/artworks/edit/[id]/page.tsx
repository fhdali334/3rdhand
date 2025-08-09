"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Loader2, ArrowLeft } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { fetchArtwork, updateArtwork, clearCurrentArtwork } from "@/lib/store/slices/artworkSlice"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import type { UpdateArtworkData } from "@/lib/types/artwork"

interface ArtworkFormData {
  title: string
  description: string
  price: string
  medium: string
  width: string
  height: string
  unit: "cm" | "in"
  year: string
  isOriginal: boolean
  tags: string[]
}

export default function EditArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const artworkId = resolvedParams.id

  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const { currentArtwork, currentArtworkLoading, updateLoading, updateError } = useAppSelector((state) => state.artwork)
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState<ArtworkFormData>({
    title: "",
    description: "",
    price: "",
    medium: "",
    width: "",
    height: "",
    unit: "cm",
    year: "",
    isOriginal: true,
    tags: [],
  })

  const [currentTag, setCurrentTag] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isFormInitialized, setIsFormInitialized] = useState(false)

  // Redirect if not authenticated or not an artist
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    if (user?.role !== "artist") {
      router.push("/")
      return
    }
  }, [isAuthenticated, user, router])

  // Fetch artwork data
  useEffect(() => {
    if (artworkId && (!currentArtwork || currentArtwork._id !== artworkId)) {
      dispatch(clearCurrentArtwork())
      dispatch(fetchArtwork(artworkId))
    }
  }, [dispatch, artworkId, currentArtwork])

  // Initialize form with artwork data
  useEffect(() => {
    if (currentArtwork && !isFormInitialized) {
      console.log("🎨 Initializing form with artwork data:", currentArtwork)

      setFormData({
        title: currentArtwork.title || "",
        description: currentArtwork.description || "",
        price: currentArtwork.price?.toString() || "",
        medium: currentArtwork.medium || "",
        width: currentArtwork.dimensions?.width?.toString() || "",
        height: currentArtwork.dimensions?.height?.toString() || "",
        unit: currentArtwork.dimensions?.unit || "cm",
        year: currentArtwork.year?.toString() || "",
        isOriginal: currentArtwork.isOriginal ?? true,
        tags: currentArtwork.tags || [],
      })

      setIsFormInitialized(true)
    }
  }, [currentArtwork, isFormInitialized])

  // Check if user owns this artwork
  const isOwner =
    currentArtwork &&
    user &&
    ((typeof currentArtwork.artist === "object" && currentArtwork.artist._id === user.id) ||
      (typeof currentArtwork.artist === "string" && currentArtwork.artist === user.id))

  const handleInputChange = (field: keyof ArtworkFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long"
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters long"
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Valid price is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      })
      return
    }

    if (!currentArtwork) {
      toast({
        title: "Error",
        description: "Artwork not found.",
        variant: "destructive",
      })
      return
    }

    try {
      const updateData: UpdateArtworkData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        tags: formData.tags,
        isOriginal: formData.isOriginal,
      }

      if (formData.medium) {
        updateData.medium = formData.medium
      }

      if (formData.year) {
        updateData.year = Number(formData.year)
      }

      if (formData.width || formData.height) {
        updateData.dimensions = {
          width: formData.width ? Number(formData.width) : undefined,
          height: formData.height ? Number(formData.height) : undefined,
          unit: formData.unit,
        }
      }

      console.log("🔄 Updating artwork with data:", updateData)

      await dispatch(updateArtwork({ id: currentArtwork._id, updateData })).unwrap()

      toast({
        title: "Success!",
        description: "Artwork updated successfully.",
      })

      router.push("/dashboard/artworks")
    } catch (error: any) {
      console.error("Update artwork error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update artwork. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  // Loading state
  if (currentArtworkLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Loading Artwork</h2>
            <p className="text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (!currentArtwork) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Artwork Not Found</h2>
          <p className="text-muted-foreground mb-6">The artwork you're trying to edit could not be found.</p>
          <Button onClick={() => router.push("/dashboard/artworks")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Artworks
          </Button>
        </div>
      </div>
    )
  }

  // Permission check
  if (!isOwner) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You don't have permission to edit this artwork.</p>
          <Button onClick={() => router.push("/dashboard/artworks")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Artworks
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 sm:py-8 px-4">
      <div className="max-w-2xl lg:max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard/artworks")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Artworks
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Edit Artwork</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Update Artwork Details</CardTitle>
              <CardDescription>Make changes to your artwork information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter the title of your artwork"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your artwork, including inspiration, techniques, and any other relevant details"
                  rows={5}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medium">Medium</Label>
                  <Select value={formData.medium} onValueChange={(value) => handleInputChange("medium", value)}>
                    <SelectTrigger id="medium">
                      <SelectValue placeholder="Select medium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oil on Canvas">Oil on Canvas</SelectItem>
                      <SelectItem value="Acrylic">Acrylic</SelectItem>
                      <SelectItem value="Watercolor">Watercolor</SelectItem>
                      <SelectItem value="Digital Art">Digital Art</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Sculpture">Sculpture</SelectItem>
                      <SelectItem value="Mixed Media">Mixed Media</SelectItem>
                      <SelectItem value="Pencil Drawing">Pencil Drawing</SelectItem>
                      <SelectItem value="Charcoal">Charcoal</SelectItem>
                      <SelectItem value="Pastel">Pastel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className={errors.price ? "border-destructive" : ""}
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    min="1"
                    placeholder="Width"
                    value={formData.width}
                    onChange={(e) => handleInputChange("width", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    min="1"
                    placeholder="Height"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleInputChange("unit", value as "cm" | "in")}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="in">in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="Year created"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isOriginal"
                  checked={formData.isOriginal}
                  onCheckedChange={(checked) => handleInputChange("isOriginal", checked as boolean)}
                />
                <Label htmlFor="isOriginal">This is an original artwork</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add a tag and press Enter"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <div
                        key={tag}
                        className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-primary-foreground/20"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/artworks")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateLoading} className="flex-1">
                {updateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Artwork"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
