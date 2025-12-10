import { Zap, Target, TrendingUp, Clock } from "lucide-react"

const advantages = [
  {
    icon: Clock,
    title: "Built for Speed, Not Forms",
    description: "Traditional tools force you to fill templates. Propozzy generates complete proposals from scratch in under 2 minutes.",
    contrast: "Other tools: 15–30 minutes per proposal",
  },
  {
    icon: Target,
    title: "AI-Native, Not AI-Bolted",
    description: "We didn't glue AI onto old software. Every feature was engineered for AI proposals from day one.",
    contrast: "Other tools: Outdated software with AI stickers slapped on top",
  },
  {
    icon: TrendingUp,
    title: "Optimized for Freelance Platforms",
    description: "We don't generate generic corporate proposals. We generate Upwork-tight, Fiverr-friendly, RFP-accurate proposals that match real buyer expectations.",
    contrast: "Other tools: Generic walls of text that don't match platform culture",
  },
  {
    icon: Zap,
    title: "Your Voice, Not Robot Voice",
    description: "The AI learns your tone, filters out clichés, and outputs natural, persuasive writing that sounds like you—on your best day.",
    contrast: "Other tools: Obvious AI tone, repetitive phrasing, robotic structure",
  },
]

export function WhyPropozzy() {
  return (
    <section id="why-propozzy" className="py-20 lg:py-28 bg-navy text-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Why Freelancers Choose Propozzy
          </h2>
          <p className="text-lg lg:text-xl text-white/70 max-w-2xl mx-auto">
            Not just another proposal writer. A fundamentally different engine.
          </p>
        </div>

        {/* Advantages - Alternating layout for visual variety */}
        <div className="max-w-4xl mx-auto space-y-12 lg:space-y-16">
          {advantages.map((advantage, index) => (
            <div 
              key={advantage.title}
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center`}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-xl shadow-teal/20">
                  <advantage.icon className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-white">
                  {advantage.title}
                </h3>
                <p className="text-lg text-white/80 leading-relaxed mb-4">
                  {advantage.description}
                </p>
                <p className="text-sm text-teal-light font-medium">
                  {advantage.contrast}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom summary */}
        <div className="mt-20 text-center">
          <div className="inline-block p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <p className="text-xl lg:text-2xl font-medium text-white mb-2">
              The bottom line:
            </p>
            <p className="text-2xl lg:text-3xl font-bold text-teal-light">
              Faster proposals. Higher win rates. Less busywork.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
