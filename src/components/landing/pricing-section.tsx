import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for trying out Propozzy",
    proposalLimit: "3 proposals per month",
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
    cta: "Start 7-Day Trial",
    ctaLink: "/sign-up",
    popular: false,
    trialText: "7-day free trial. No credit card required",
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg lg:text-xl text-gray-600">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
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
                <div className="text-center">
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

        {/* Link to full pricing page */}
        <div className="text-center">
          <Link
            href="/pricing"
            className="text-orange-600 hover:text-orange-700 font-medium text-base inline-flex items-center gap-1 transition-colors"
          >
            See full feature comparison
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
