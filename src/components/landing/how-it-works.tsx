"use client"

import { FileText, Brain, Send, ArrowDown } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Paste Any Job Posting",
    description: "Copy a job description, RFP, or project brief from any platform. That's it—no forms, no templates to fill out.",
    detail: "Works with Upwork, Fiverr, LinkedIn, direct emails, and any text-based opportunity.",
    icon: FileText,
  },
  {
    number: "02", 
    title: "AI Writes Your Proposal",
    description: "Propozzy analyzes the requirements, matches your portfolio, and generates a personalized proposal in your voice.",
    detail: "The AI adapts tone, highlights relevant experience, and structures everything professionally.",
    icon: Brain,
  },
  {
    number: "03",
    title: "Review, Edit & Send",
    description: "Fine-tune anything you want, then export as PDF or copy directly. Submit and track your results.",
    detail: "Full editing control. Export options. Analytics to see what's working.",
    icon: Send,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-navy">
            Three Steps. Two Minutes. Done.
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto">
            No learning curve. No complicated setup. Just results.
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 lg:left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-teal to-teal/20" />
              )}
              
              <div className="flex gap-6 lg:gap-8 pb-16 lg:pb-20">
                {/* Step number circle */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow-lg shadow-teal/30">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1 lg:pt-3">
                  <div className="flex items-center gap-3 mb-3">
                    <step.icon className="h-5 w-5 text-teal" />
                    <h3 className="text-xl lg:text-2xl font-bold text-navy">
                      {step.title}
                    </h3>
                  </div>
                  
                  <p className="text-lg text-foreground mb-3 leading-relaxed">
                    {step.description}
                  </p>
                  
                  <p className="text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
              </div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 lg:left-8 -translate-x-1/2 bottom-4 lg:bottom-6">
                  <ArrowDown className="h-5 w-5 text-teal/40" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Result callout */}
        <div className="max-w-2xl mx-auto mt-8 p-6 lg:p-8 rounded-2xl bg-navy text-white text-center">
          <p className="text-lg lg:text-xl font-medium mb-2">
            Average time from job posting to submitted proposal:
          </p>
          <p className="text-4xl lg:text-5xl font-bold text-teal-light">
            Under 2 minutes
          </p>
        </div>
      </div>
    </section>
  )
}
