import type { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with 3rd Hand",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Get in touch with us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We'd love to hear from you! Whether you have a question about our platform, need support, or just want to say
          hello, feel free to reach out.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Contact Information</h2>
          <p className="text-muted-foreground">
            Our team is here to help. You can reach us via email or by filling out the contact form.
          </p>
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <a href="mailto:info@3rdhand.be" className="text-lg text-foreground hover:underline">
              info@3rdhand.be
            </a>
          </div>
       
        </div>
        <ContactForm />
      </div>
    </div>
  )
}
