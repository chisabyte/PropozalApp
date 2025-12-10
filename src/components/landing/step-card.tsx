import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StepCardProps {
  step: number
  title: string
  description: string
  icon: LucideIcon
}

export function StepCard({ step, title, description, icon: Icon }: StepCardProps) {
  return (
    <Card className="relative h-full bg-background border-2 border-transparent hover:border-teal/30 transition-all duration-300 group overflow-hidden">
      {/* Step number badge */}
      <div className="absolute -top-px -left-px">
        <div className="flex h-12 w-12 items-center justify-center rounded-br-2xl bg-gradient-to-br from-teal to-teal-dark text-white font-bold text-lg shadow-lg">
          {step}
        </div>
      </div>

      <CardContent className="pt-16 pb-8 px-6">
        {/* Icon */}
        <div className="mb-6 h-14 w-14 rounded-2xl bg-navy/5 flex items-center justify-center group-hover:bg-teal/10 transition-colors">
          <Icon className="h-7 w-7 text-navy group-hover:text-teal transition-colors" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-navy mb-3">{title}</h3>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>

      {/* Decorative gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal via-teal-dark to-navy opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  )
}
