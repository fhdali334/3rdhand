import { CircleDollarSign, ImageIcon, MessageSquare, ShieldCheck } from "lucide-react"

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform makes it easy for artists to sell their work and for buyers to discover unique pieces.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-background rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">1. Create a Listing</h3>
            <p className="text-muted-foreground">
              Artists can create listings with images, descriptions, and pricing for free.
            </p>
          </div>
          <div className="bg-background rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">2. Moderation</h3>
            <p className="text-muted-foreground">
              We review each listing to ensure quality and authenticity before it goes live.
            </p>
          </div>
          <div className="bg-background rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">3. Connect</h3>
            <p className="text-muted-foreground">
              Buyers can browse artwork and message artists directly to discuss purchases.
            </p>
          </div>
          <div className="bg-background rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <CircleDollarSign className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">4. Complete Sale</h3>
            <p className="text-muted-foreground">
              Finalize the transaction directly with the artist and receive your unique artwork.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
