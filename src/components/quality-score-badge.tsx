import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface QualityScoreBadgeProps {
  score: number
  className?: string
  showLabel?: boolean
}

export function QualityScoreBadge({ score, className, showLabel = true }: QualityScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    if (score >= 60) return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    return "bg-red-500/10 text-red-600 border-red-500/20"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    return "Needs Work"
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        getScoreColor(score),
        "font-semibold",
        className
      )}
    >
      {showLabel ? `Score: ${score} (${getScoreLabel(score)})` : score}
    </Badge>
  )
}
