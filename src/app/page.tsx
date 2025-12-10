import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Check,
  ArrowRight,
  Sparkles,
  Play,
  Menu,
  Star,
  ChevronRight,
} from "lucide-react"
import { HeroVideo } from "@/components/landing/hero-video"
import { LogoCloud } from "@/components/landing/logo-cloud"

export default function LandingPage() {
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-dark/20 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-4 py-2 text-sm mb-8 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-teal-light" />
              <span className="text-teal-light font-medium">Powered by Advanced AI</span>
              <ChevronRight className="h-4 w-4 text-teal-light" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Stop Writing Proposals.
              <br />
              <span className="bg-gradient-to-r from-teal-light via-teal to-teal-dark bg-clip-text text-transparent">
                Start Winning Them.
              </span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Propozzy turns any job posting into a tailored, professional proposal in under 2 minutes. More wins. Less writing.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-teal hover:bg-teal-dark text-white h-14 px-8 text-lg shadow-xl shadow-teal/30 transition-all hover:shadow-teal/50 hover:scale-105"
              >
                <Link href="/sign-up">
                  Generate Your First Proposal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/30 text-white bg-white/5 hover:bg-white/15 h-14 px-8 text-lg backdrop-blur-sm"
              >
                <Link href="#how-it-works">
                  <Play className="mr-2 h-5 w-5" />
                  See How It Works
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-teal" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-teal" />
                <span>3 free proposals monthly</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-teal" />
                <span>Setup in 60 seconds</span>
              </div>
            </div>
          </div>

          {/* Product mockup */}
          <div className="mt-16 lg:mt-20 max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-teal/30 via-teal-dark/20 to-teal/30 rounded-3xl blur-2xl opacity-60" />
              <div className="relative bg-navy-light rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-navy border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white/10 rounded-lg px-4 py-1 text-xs text-white/50">
                      app.propozzy.com
                    </div>
                  </div>
                </div>
                <HeroVideo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <LogoCloud />

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-navy text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-teal/20 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-teal-dark/20 rounded-full blur-3xl -translate-y-1/2" />
        
        <div className="container relative mx-auto px-4 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-4 py-2 text-sm mb-8">
              <Star className="h-4 w-4 text-teal-light fill-teal-light" />
              <span className="text-teal-light font-medium">Join 2,000+ winning freelancers</span>
            </div>

            <h2 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Your next client is waiting.
              <br />
              <span className="text-teal-light">Make that proposal count.</span>
            </h2>

            <p className="mb-10 text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
              Every hour you spend writing proposals is an hour you're not doing billable work. Let Propozzy handle the writing so you can focus on winning.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-teal hover:bg-teal-dark text-white h-14 px-8 text-lg shadow-xl shadow-teal/30 transition-all hover:shadow-teal/50"
            >
              <Link href="/sign-up">
                Start Winning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <p className="mt-6 text-sm text-white/60">
              Free forever plan • No credit card • Setup in 60 seconds
            </p>
          </div>
        </div>
      </section>

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
