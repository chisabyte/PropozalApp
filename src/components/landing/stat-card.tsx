import { LucideIcon } from "lucide-react"

interface StatCardProps {
  value: string
  label: string
  icon: LucideIcon
}

export function StatCard({ value, label, icon: Icon }: StatCardProps) {
  return (
    <div className="text-center p-6 rounded-2xl bg-muted/50 border hover:border-teal/30 transition-colors group">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal/10 mb-4 group-hover:bg-teal/20 transition-colors">
        <Icon className="h-6 w-6 text-teal" />
      </div>
      <div className="text-3xl lg:text-4xl font-bold text-navy mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
