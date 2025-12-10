"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, ArrowRight, Menu } from "lucide-react"
import { FeatureComparisonTable } from "@/components/landing/feature-comparison-table"

// Plan configuration with all features
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for trying out Propozzy",
    proposalLimit: "3 proposals per month",
    features: [
      { text: "3 proposals per month", included: true },
      { text: "All core AI features", included: true },
      { text: "3-stage AI pipeline", included: true },
      { text: "Industry classification", included: true },
      { text: "Platform optimization", included: true },
      { text: "Quality scoring", included: true },
      { text: "Rich text editing", included: true },
      { text: "PDF export", included: true },
      { text: "Email support", included: true },
    ],
    notIncluded: [
      { text: "Public share links", included: false },
      { text: "Analytics dashboard", included: false },
      { text: "Limited to 3 proposals", included: false },
    ],
    cta: "Start Free",
    ctaLink: "/sign-up",
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 19,
    period: "per month",
    description: "For freelancers and small teams",
    proposalLimit: "100 proposals per month",
    features: [
      { text: "Everything in Free", included: true },
      { text: "100 proposals per month", included: true },
      { text: "Public share links", included: true },
      { text: "Portfolio matching", included: true },
      { text: "Regenerate with options", included: true },
      { text: "Priority email support", included: true },
      { text: "Advanced quality analysis", included: true },
      { text: "Tone & length adjustments", included: true },
      { text: "Custom branding", included: true, comingSoon: true },
    ],
    notIncluded: [
      { text: "No analytics dashboard", included: false },
      { text: "No team features", included: false },
    ],
    cta: "Start 7-Day Trial",
    ctaLink: "/sign-up",
    popular: true,
    trialText: "7-day free trial. No credit card required",
  },
  {
    id: "pro",
    name: "Pro",
    price: 39,
    period: "per month",
    description: "For agencies and power users",
    proposalLimit: "300 proposals per month",
    features: [
      { text: "Everything in Starter", included: true },
      { text: "300 proposals per month", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Performance tracking", included: true },
      { text: "Win rate optimization", included: true },
      { text: "Team collaboration", included: true, comingSoon: true },
      { text: "API access", included: true, comingSoon: true },
      { text: "Dedicated account manager", included: true },
      { text: "Priority support", included: true },
    ],
    notIncluded: [],
    cta: "Start 7-Day Trial",
    ctaLink: "/sign-up",
    popular: false,
    trialText: "7-day free trial. No credit card required",
  },
]

export default function PricingPage() {
  const { isSignedIn } = useUser()

  return (
    <div className="flex min-h-screen flex-col bg-white">
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
              <Link href="/#how-it-works">How It Works</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
              <Link href="/#features">Features</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:text-white hover:bg-white/10">
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
              <Link href="/#why-propozzy">Why Us</Link>
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

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
          {/* Hero Section */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600">
              Start free and upgrade as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative flex flex-col h-full border-2 rounded-2xl transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? "border-orange-500 shadow-lg shadow-orange-500/10 scale-[1.02] lg:scale-105 z-10"
                    : "border-gray-200 hover:border-gray-300 shadow-sm"
                }`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <Badge className="bg-orange-500 hover:bg-orange-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2 pt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-base text-gray-600">{plan.description}</p>
                </CardHeader>

                <CardContent className="flex-1 pt-4 pb-4 px-6">
                  {/* Price Section */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-5xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      {plan.price > 0 ? (
                        <span className="text-lg text-gray-500">/month</span>
                      ) : (
                        <span className="text-lg text-gray-500 ml-1">
                          forever
                        </span>
                      )}
                    </div>
                    <p className="text-base font-medium text-purple-600">
                      {plan.proposalLimit}
                    </p>
                  </div>

                  {/* What's Included Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">
                      What&apos;s included
                    </h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700 leading-relaxed">
                            {feature.text}
                            {feature.comingSoon && (
                              <span className="text-xs text-gray-500 ml-1.5 italic">
                                (coming soon)
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Not Included Section */}
                  {plan.notIncluded.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">
                        Not included
                      </h4>
                      <ul className="space-y-3">
                        {plan.notIncluded.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <X className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-500 leading-relaxed">
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-4 pb-6 px-6">
                  <div className="w-full">
                    <Button
                      asChild
                      className={`w-full h-12 text-base font-semibold rounded-lg transition-all ${
                        plan.popular
                          ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg"
                          : "bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-900"
                      }`}
                      size="lg"
                    >
                      <Link href={plan.ctaLink}>{plan.cta}</Link>
                    </Button>
                    {plan.trialText && (
                      <p className="text-xs text-gray-500 text-center mt-3">
                        {plan.trialText}
                      </p>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <div className="max-w-6xl mx-auto">
            <FeatureComparisonTable />
          </div>
        </div>
      </main>

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
                <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
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
