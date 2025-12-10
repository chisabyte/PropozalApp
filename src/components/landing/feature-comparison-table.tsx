"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComparisonFeature {
  name: string
  free: boolean
  starter: boolean
  pro: boolean
}

interface ComparisonCategory {
  category: string
  features: ComparisonFeature[]
}

const COMPARISON_FEATURES: ComparisonCategory[] = [
  {
    category: "Core Features",
    features: [
      { name: "3-Stage AI Pipeline", free: true, starter: true, pro: true },
      { name: "Industry Classification", free: true, starter: true, pro: true },
      { name: "Platform Optimization", free: true, starter: true, pro: true },
      { name: "Quality Scoring", free: true, starter: true, pro: true },
      { name: "Rich Text Editor", free: true, starter: true, pro: true },
    ],
  },
  {
    category: "Advanced Features",
    features: [
      { name: "PDF Export", free: true, starter: true, pro: true },
      { name: "Public Share Links", free: false, starter: true, pro: true },
      { name: "Portfolio Matching", free: false, starter: true, pro: true },
      { name: "Tone Adjustments", free: false, starter: true, pro: true },
      { name: "Length Options", free: false, starter: true, pro: true },
      { name: "Advanced Quality Analysis", free: false, starter: true, pro: true },
      { name: "Regenerate with Options", free: false, starter: true, pro: true },
      { name: "Custom Branding", free: false, starter: true, pro: true },
    ],
  },
  {
    category: "Analytics & Insights",
    features: [
      { name: "Analytics Dashboard", free: false, starter: false, pro: true },
      { name: "Performance Tracking", free: false, starter: false, pro: true },
      { name: "Win Rate Optimization", free: false, starter: false, pro: true },
    ],
  },
  {
    category: "Support",
    features: [
      { name: "Email Support", free: true, starter: true, pro: true },
      { name: "Priority Email Support", free: false, starter: true, pro: true },
      { name: "Dedicated Account Manager", free: false, starter: false, pro: true },
    ],
  },
]

interface FeatureCheckProps {
  included: boolean
  highlighted?: boolean
}

function FeatureCheck({ included, highlighted = false }: FeatureCheckProps) {
  if (included) {
    return (
      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <Check className="h-4 w-4 text-green-600" />
      </div>
    )
  }
  return <X className="h-5 w-5 text-gray-300 mx-auto" />
}

export function FeatureComparisonTable() {
  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          Compare All Features
        </h2>
        <p className="text-lg text-gray-600">
          See exactly what's included in each plan.
        </p>
      </div>

      {/* Desktop Table View */}
      <Card className="border border-gray-200 shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Feature
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900 w-28">
                  Free
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900 bg-orange-50 w-28">
                  Starter
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900 w-28">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {COMPARISON_FEATURES.map((category, categoryIndex) => (
                <React.Fragment key={categoryIndex}>
                  {/* Category Header Row */}
                  <tr>
                    <td
                      colSpan={4}
                      className="py-3 px-6 bg-gray-50 font-semibold text-gray-900 border-b border-gray-200"
                    >
                      {category.category}
                    </td>
                  </tr>
                  {/* Feature Rows */}
                  {category.features.map((feature, featureIndex) => (
                    <tr
                      key={featureIndex}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {feature.name}
                      </td>
                      <td className="text-center py-4 px-6">
                        <FeatureCheck included={feature.free} />
                      </td>
                      <td className="text-center py-4 px-6 bg-orange-50/30">
                        <FeatureCheck included={feature.starter} highlighted />
                      </td>
                      <td className="text-center py-4 px-6">
                        <FeatureCheck included={feature.pro} />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Stacked View */}
      <div className="md:hidden space-y-6">
        {COMPARISON_FEATURES.map((category, categoryIndex) => (
          <Card
            key={categoryIndex}
            className="border border-gray-200 shadow-sm overflow-hidden"
          >
            <CardHeader className="bg-gray-50 border-b border-gray-200 py-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {category.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="p-4">
                    <div className="font-medium text-gray-900 mb-3">
                      {feature.name}
                    </div>
                    <div className="flex items-center gap-6">
                      {/* Free */}
                      <div className="flex items-center gap-2">
                        {feature.free ? (
                          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )}
                        <span className="text-sm text-gray-600">Free</span>
                      </div>
                      {/* Starter */}
                      <div className="flex items-center gap-2">
                        {feature.starter ? (
                          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )}
                        <span className="text-sm text-orange-600 font-medium">
                          Starter
                        </span>
                      </div>
                      {/* Pro */}
                      <div className="flex items-center gap-2">
                        {feature.pro ? (
                          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )}
                        <span className="text-sm text-gray-600">Pro</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
