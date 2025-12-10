import { Badge } from "@/components/ui/badge"
import { Shield, Zap, CheckCircle } from "lucide-react"

export function SocialProofBar() {
  return (
    <div className="border-y bg-muted/50 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              Powered by GPT-4o
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              SOC 2 Compliant
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              No Credit Card Required
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Trusted by <span className="font-semibold text-foreground">2,000+</span> freelancers
          </div>
        </div>
      </div>
    </div>
  )
}

