"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "How does AI proposal generation work?",
    answer:
      "Propozzy analyzes your RFP or job posting, extracts key requirements, matches relevant portfolio items, and generates a personalized proposal tailored to the client's needs and your experience. The entire process takes under 2 minutes.",
  },
  {
    question: "Can I customize the generated proposals?",
    answer:
      "Yes. Every word is editable. You can tweak the text directly or regenerate specific sections—like the opening hook, approach, or pricing—without changing the rest of the proposal.",
  },
  {
    question: "Which freelance platforms does Propozzy support?",
    answer:
      "Propozzy is optimized for Upwork, Fiverr, LinkedIn, Thumbtack, direct RFPs, email outreach, and more. The AI adjusts tone, structure, and CTAs based on the platform.",
  },
  {
    question: "What if I don't have portfolio items yet?",
    answer:
      "You can still generate strong proposals without a portfolio. As you add projects later, Propozzy will begin matching them to new RFPs automatically.",
  },
  {
    question: "How accurate is the portfolio matching?",
    answer:
      "Propozzy uses a 70/30 intelligence model that combines keyword matching with semantic relevance. It automatically surfaces your 3 most relevant projects for each proposal.",
  },
  {
    question: "Can I track my proposal performance?",
    answer:
      "Yes. You can track proposal views, status, and key analytics like win rate, platform performance, and quality scores over time.",
  },
  {
    question: "Is there really a free plan?",
    answer:
      "Yes. The Free plan includes 3 proposals per month, forever, with no credit card required.",
  },
  {
    question: "What happens if I exceed my plan limits?",
    answer:
      "You'll see a clear usage indicator in your dashboard. You can upgrade to a higher plan in a few clicks to unlock more monthly proposals.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-4 py-2 text-sm mb-6">
            <HelpCircle className="h-4 w-4 text-teal" />
            <span className="text-teal font-medium">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-navy">
            Questions? We've Got Answers.
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about getting started with Propozzy.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card 
              key={index} 
              className={cn(
                "border-2 transition-all duration-300 overflow-hidden",
                openIndex === index ? "border-teal/30 shadow-md" : "border-transparent hover:border-muted"
              )}
            >
              <CardContent className="p-0">
                <button
                  className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className={cn(
                    "font-semibold text-lg transition-colors",
                    openIndex === index ? "text-teal" : "text-navy"
                  )}>
                    {faq.question}
                  </span>
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    openIndex === index ? "bg-teal text-white rotate-180" : "bg-muted text-muted-foreground"
                  )}>
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

