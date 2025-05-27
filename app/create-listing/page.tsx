import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Upload } from "lucide-react"

export default function CreateListingPage() {
  return (
    <>
      <Header />
      <div className="container py-6 sm:py-8 px-4">
        <div className="max-w-2xl lg:max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Create a New Listing</h1>

          <Card>
            <CardHeader>
              <CardTitle>Artwork Details</CardTitle>
              <CardDescription>Fill in the details about your artwork. Each listing costs €1.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter the title of your artwork" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your artwork, including inspiration, techniques, and any other relevant details"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="painting">Painting</SelectItem>
                      <SelectItem value="digital">Digital Art</SelectItem>
                      <SelectItem value="sculpture">Sculpture</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="drawing">Drawing</SelectItem>
                      <SelectItem value="mixed">Mixed Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (€)</Label>
                  <Input id="price" type="number" min="1" placeholder="Enter price" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input id="width" type="number" min="1" placeholder="Width" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input id="height" type="number" min="1" placeholder="Height" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depth">Depth (cm)</Label>
                  <Input id="depth" type="number" min="0" placeholder="Depth (if applicable)" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medium">Medium</Label>
                  <Input id="medium" placeholder="E.g., Oil on canvas, Digital print" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year Created</Label>
                  <Input id="year" type="number" placeholder="Year" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Images</Label>
                <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 text-center">
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="mb-2 font-medium">Drag and drop your images here</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload up to 5 high-quality images of your artwork (max 10MB each)
                    </p>
                    <Button variant="outline" size="sm">
                      Browse Files
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="bg-muted p-4 rounded-lg w-full">
                <p className="font-medium mb-2">Listing Fee: €1</p>
                <p className="text-sm text-muted-foreground">
                  Your listing will be reviewed by our team before being published. This process typically takes 24-48
                  hours.
                </p>
              </div>
              <Button className="w-full">Pay €1 and Submit Listing</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  )
}
