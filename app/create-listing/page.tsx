"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { X, Loader2, Upload } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux"
import { createArtwork } from "@/lib/store/slices/artworkSlice"
import { createListingSession } from "@/lib/store/slices/paymentSlice"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"

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

export default function CreateListingPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const { createLoading } = useAppSelector((state) => state.artwork)
  const { sessionLoading } = useAppSelector((state) => state.payment)
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

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect if not authenticated or not an artist
  if (!isAuthenticated) {
    router.push("/auth/login")
    return null
  }

  if (user?.role !== "artist") {
    router.push("/")
    return null
  }

  const handleInputChange = (field: keyof ArtworkFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images.",
        variant: "destructive",
      })
      return
    }

    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB.`,
          variant: "destructive",
        })
        return false
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    setImages((prev) => [...prev, ...validFiles])

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
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
    if (images.length === 0) newErrors.images = "At least one image is required"

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

    try {
      // Create FormData for multipart/form-data submission
      const formDataToSend = new FormData()

      // Add text fields
      formDataToSend.append("title", formData.title.trim())
      formDataToSend.append("description", formData.description.trim())
      formDataToSend.append("price", formData.price)

      if (formData.medium) {
        formDataToSend.append("medium", formData.medium)
      }

      // Add dimensions
      if (formData.width) {
        formDataToSend.append("dimensions[width]", formData.width)
      }
      if (formData.height) {
        formDataToSend.append("dimensions[height]", formData.height)
      }
      formDataToSend.append("dimensions[unit]", formData.unit)

      if (formData.year) {
        formDataToSend.append("year", formData.year)
      }

      formDataToSend.append("isOriginal", formData.isOriginal.toString())

      // Add tags
      formData.tags.forEach((tag, index) => {
        formDataToSend.append(`tags[${index}]`, tag)
      })

      // Add images
      images.forEach((image, index) => {
        formDataToSend.append("images", image)
      })

      // Log the form data for debugging
      console.log("Form data being sent:")
      for (const [key, value] of formDataToSend.entries()) {
        console.log(key, value)
      }

      const result = await dispatch(
        createArtwork({
          artworkData: formDataToSend,
          images: [], // Images are already in FormData
        }),
      ).unwrap()

      toast({
        title: "Artwork created successfully!",
        description: "Now you need to pay the €1 listing fee to submit for review.",
      })

      // Create payment session for listing fee
      const paymentResult = await dispatch(createListingSession(result._id)).unwrap()

      if (paymentResult?.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = paymentResult.sessionUrl
      }
    } catch (error: any) {
      console.error("Create artwork error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to create artwork. Please try again.",
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

  return (
    <>
      <Header />
      <div className="container py-6 sm:py-8 px-4">
        <div className="max-w-2xl lg:max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Create a New Listing</h1>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Artwork Details</CardTitle>
                <CardDescription>Fill in the details about your artwork. Each listing costs €1.</CardDescription>
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

                <div className="space-y-2">
                  <Label htmlFor="images">Images * (Max 5 images, 10MB each)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Label htmlFor="images" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">Click to upload images</span>
                        </Label>
                        <Input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                  {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            {/* Use regular img tag instead of Next.js Image for data URLs */}
                            <img
                              src={preview || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={createLoading || sessionLoading} className="w-full">
                  {createLoading || sessionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Listing...
                    </>
                  ) : (
                    "Create Listing (€1 fee)"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
