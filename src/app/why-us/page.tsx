import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Menu } from "lucide-react"
import { WhyPropozzy } from "@/components/landing/why-propozzy"
import { TestimonialsSection } from "@/components/landing/testimonials"
import { FAQSection } from "@/components/landing/faq"

export default function WhyUsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-navy/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <Image
              src="/images/propozzy/My Logo.jpg"
              alt="Propozzy Logo"
              width={40}
              height={40}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-contain"
              priority
            />
            <span className="font-bold text-xl text-white tracking-tight">Propozzy</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-1">
            <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
              <Link href="/how-it-works">How It Works</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
              <Link href="/features">Features</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
              <Link href="/why-us">Why Us</Link>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex text-white/80 hover:text-white hover:bg-white/10">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild className="bg-teal hover:bg-teal-dark text-white shadow-lg shadow-teal/25 transition-all hover:shadow-teal/40">
              <Link href="/sign-up">
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <WhyPropozzy />
      <TestimonialsSection />
      <FAQSection />

      {/* Footer */}
      <footer className="bg-navy-light border-t border-white/10 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-6 hover:opacity-90 transition-opacity">
                <Image
                  src="/images/propozzy/My Logo.jpg"
                  alt="Propozzy Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-lg object-contain"
                />
                <span className="font-bold text-xl text-white">Propozzy</span>
              </Link>
              <p className="text-white/60 leading-relaxed mb-6">
                Win more projects with AI-powered proposals that sound like you wrote them.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3 text-white/60">
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Account</h3>
              <ul className="space-y-3 text-white/60">
                <li><Link href="/sign-in" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/sign-up" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-3 text-white/60">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">© {new Date().getFullYear()} Propozzy. All rights reserved.</p>
            <p className="text-white/50 text-sm">Made with ❤️ for freelancers everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
