import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PricingFeature {
  text: string
  included: boolean
  comingSoon?: boolean
}

interface PricingCardProps {
  name: string
  description: string
  price: number
  period: string
  proposalLimit: string
  features: PricingFeature[]
  notIncluded: PricingFeature[]
  ctaText: string
  ctaHref: string
  isPopular?: boolean
  trialText?: string
  className?: string
}

export function PricingCard({
  name,
  description,
  price,
  period,
  proposalLimit,
  features,
  notIncluded,
  ctaText,
  ctaHref,
  isPopular = false,
  trialText,
  className,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col h-full border-2 rounded-2xl transition-all duration-300 hover:shadow-xl",
        isPopular
          ? "border-orange-500 shadow-lg shadow-orange-500/10 scale-[1.02] lg:scale-105 z-10"
          : "border-gray-200 hover:border-gray-300 shadow-sm",
        className
      )}
    >
      {/* Most Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <Badge className="bg-orange-500 hover:bg-orange-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md border-0">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2 pt-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-base text-gray-600">{description}</p>
      </CardHeader>

      <CardContent className="flex-1 pt-4 pb-4 px-6">
        {/* Price Section */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-5xl font-bold text-gray-900">${price}</span>
            <span className="text-lg text-gray-500">/{period}</span>
          </div>
          <p className="text-base font-medium text-purple-600">
            {proposalLimit}
          </p>
        </div>

        {/* What's Included Section */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            What's included
          </h4>
          <ul className="space-y-3">
            {features.map((feature, index) => (
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
        {notIncluded.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              Not included
            </h4>
            <ul className="space-y-3">
              {notIncluded.map((feature, index) => (
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
            className={cn(
              "w-full h-12 text-base font-semibold rounded-lg transition-all",
              isPopular
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg"
                : "bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-900"
            )}
            size="lg"
          >
            <Link href={ctaHref}>{ctaText}</Link>
          </Button>
          {trialText && (
            <p className="text-xs text-gray-500 text-center mt-3">
              {trialText}
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
