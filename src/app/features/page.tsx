import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Brain,
  Zap,
  Target,
  BarChart3,
  Shield,
  Rocket,
  Crown,
  Star,
  Users,
  Clock,
  TrendingUp,
  FileText,
  ArrowRight,
  Menu,
} from "lucide-react"
import { FeatureCard } from "@/components/landing/feature-card"

export default function FeaturesPage() {
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

      {/* FEATURES Section */}
      <section className="py-20 lg:py-28 bg-muted/30 border-y">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-4 py-2 text-sm mb-6">
              <Zap className="h-4 w-4 text-teal" />
              <span className="text-teal font-medium">Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-navy">
              What Propozzy Can Do
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Twelve core capabilities that power every proposal you generate.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={Brain}
              title="Industry Intelligence"
              description="Recognizes 15+ industries and adapts terminology, structure, and strategy to match domain-expert expectations."
              gradient="from-teal to-teal-dark"
            />
            <FeatureCard
              icon={Target}
              title="RFP Deep Parsing"
              description="Extracts requirements, deliverables, risks, budgets, scope, and timelines—automatically."
              gradient="from-teal-dark to-navy"
            />
            <FeatureCard
              icon={Users}
              title="Smart Portfolio Matching"
              description="Highlights your top 3 most relevant projects using a 70/30 intelligence model (keywords + semantic relevance)."
              gradient="from-navy to-teal"
            />
            <FeatureCard
              icon={Rocket}
              title="Platform-Optimized Output"
              description="Upwork, Fiverr, LinkedIn, Thumbtack, Email RFPs. Propozzy adapts tone, structure, CTA, and length to each platform's culture."
              gradient="from-teal to-navy"
            />
            <FeatureCard
              icon={Zap}
              title="2-Minute Proposal Generation"
              description="A complete, polished proposal generated before you can even write your opening sentence."
              gradient="from-navy to-teal-dark"
            />
            <FeatureCard
              icon={FileText}
              title="Regenerate Any Section"
              description="Fix a paragraph—or overhaul the opening hook—without touching the rest of the proposal."
              gradient="from-teal-dark to-teal"
            />
            <FeatureCard
              icon={Shield}
              title="Human-Quality Writing"
              description="Our quality filters eliminate AI clichés, repetitive phrasing, and robotic tone. Everything reads like your best work, not 'ChatGPT-flavoured soup.'"
              gradient="from-teal to-teal-dark"
            />
            <FeatureCard
              icon={BarChart3}
              title="AI Quality Score"
              description="Every proposal is scored on clarity, relevance, tone, platform fit, and differentiators—so you know what to improve."
              gradient="from-teal-dark to-navy"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Real Pricing & Timeline Builder"
              description="Automatically generates a project timeline and a 3-tier pricing table based on your industry."
              gradient="from-navy to-teal"
            />
            <FeatureCard
              icon={Crown}
              title="A/B Testing Engine"
              description="Instantly create two variations of your proposal with different strategies—evidence-based hook vs. strategic hook."
              gradient="from-teal to-navy"
            />
            <FeatureCard
              icon={Clock}
              title="Smart Length Optimization"
              description="The AI analyzes RFP complexity and tells you whether the proposal should be shorter, normal, or longer."
              gradient="from-navy to-teal-dark"
            />
            <FeatureCard
              icon={Star}
              title="Public Proposal Pages"
              description="Share a clean, professional proposal page with clients—complete with view tracking."
              gradient="from-teal-dark to-teal"
            />
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
