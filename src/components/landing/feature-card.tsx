import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  gradient?: string
  className?: string
}

export function FeatureCard({ icon: Icon, title, description, gradient = "from-teal to-teal-dark", className }: FeatureCardProps) {
  return (
    <Card className={cn(
      "h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group overflow-hidden border-2 border-transparent hover:border-teal/20",
      className
    )}>
      <CardContent className="p-6 lg:p-8">
        {/* Icon with gradient background */}
        <div className={cn(
          "mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
          gradient
        )}>
          <Icon className="h-7 w-7 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-navy mb-3 group-hover:text-teal transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

