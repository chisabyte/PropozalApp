"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Sparkles,
  DollarSign,
  Trophy,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Zap,
  X,
  RefreshCw,
  ChevronRight,
  Loader2
} from "lucide-react"

interface AIInsight {
  type: "success" | "warning" | "tip"
  title: string
  description: string
  action: string
  impact: "low" | "medium" | "high"
  actionRoute?: string
}

interface AIInsightsResponse {
  insights: AIInsight[]
  generated_at: string
  next_refresh: string
  metrics: {
    totalProposals: number
    winRate: number
    avgQualityScore: number
    avgDealSize: number
    totalRevenue: number
  }
}

interface DashboardInsights {
  avgQualityScore: number
  winProbabilityTrend: "up" | "down" | "stable"
  mostResponsivePlatform: string | null
  totalRevenue: number
  winRate: number
  avgDealSize: number
  bestPlatform: { name: string; winRate: number } | null
  suggestions: string[]
}

export function SmartInsights() {
  const router = useRouter()
  const [basicInsights, setBasicInsights] = useState<DashboardInsights | null>(null)
  const [aiInsights, setAIInsights] = useState<AIInsightsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAILoading] = useState(true)
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Load dismissed insights from localStorage
    const stored = localStorage.getItem("dismissedInsights")
    if (stored) {
      setDismissedInsights(new Set(JSON.parse(stored)))
    }

    fetchBasicInsights()
    fetchAIInsights()
  }, [])

  const fetchBasicInsights = async () => {
    try {
      const response = await fetch("/api/dashboard/insights")
      if (!response.ok) throw new Error("Failed to fetch insights")
      const data = await response.json()
      setBasicInsights(data)
    } catch (error) {
      console.error("Error fetching basic insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAIInsights = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true)
      const response = await fetch("/api/insights/generate" + (forceRefresh ? "?refresh=1" : ""))
      if (!response.ok) throw new Error("Failed to fetch AI insights")
      const data = await response.json()
      setAIInsights(data)
    } catch (error) {
      console.error("Error fetching AI insights:", error)
    } finally {
      setAILoading(false)
      setRefreshing(false)
    }
  }

  const dismissInsight = (insightTitle: string) => {
    const newDismissed = new Set(dismissedInsights)
    newDismissed.add(insightTitle)
    setDismissedInsights(newDismissed)
    localStorage.setItem("dismissedInsights", JSON.stringify([...newDismissed]))
  }

  const handleAction = (insight: AIInsight) => {
    if (insight.actionRoute) {
      router.push(insight.actionRoute)
    }
  }

  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      case "tip":
        return <Zap className="h-5 w-5 text-blue-600" />
    }
  }

  const getInsightBg = (type: AIInsight["type"]) => {
    switch (type) {
      case "success":
        return "bg-emerald-500/10 border-emerald-500/20"
      case "warning":
        return "bg-amber-500/10 border-amber-500/20"
      case "tip":
        return "bg-blue-500/10 border-blue-500/20"
    }
  }

  const getImpactBadge = (impact: AIInsight["impact"]) => {
    switch (impact) {
      case "high":
        return <Badge className="bg-purple-500/20 text-purple-700 border-0 text-xs">High Impact</Badge>
      case "medium":
        return <Badge className="bg-slate-500/20 text-slate-700 border-0 text-xs">Medium</Badge>
      case "low":
        return <Badge className="bg-gray-500/20 text-gray-600 border-0 text-xs">Low</Badge>
    }
  }

  if (loading && aiLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Analyzing your proposals...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filter out dismissed insights
  const activeInsights = aiInsights?.insights.filter(
    insight => !dismissedInsights.has(insight.title)
  ) || []

  const TrendIcon = basicInsights?.winProbabilityTrend === "up"
    ? TrendingUp
    : basicInsights?.winProbabilityTrend === "down"
    ? TrendingDown
    : Minus

  const trendColor = basicInsights?.winProbabilityTrend === "up"
    ? "text-emerald-600"
    : basicInsights?.winProbabilityTrend === "down"
    ? "text-red-600"
    : "text-muted-foreground"

  return (
    <div className="space-y-6">
      {/* Quick Stats Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-teal-500/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-lg">Smart Insights</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchAIInsights(true)}
              disabled={refreshing}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            AI-powered recommendations to improve your proposal performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Revenue & Win Rate Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-1 mb-1">
                <DollarSign className="h-3 w-3 text-emerald-600" />
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                ${((basicInsights?.totalRevenue || aiInsights?.metrics.totalRevenue || 0) / 100).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-1 mb-1">
                <BarChart3 className="h-3 w-3 text-blue-600" />
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {basicInsights?.winRate || aiInsights?.metrics.winRate || 0}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-1 mb-1">
                <DollarSign className="h-3 w-3 text-amber-600" />
                <p className="text-xs text-muted-foreground">Avg Deal Size</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                ${((basicInsights?.avgDealSize || aiInsights?.metrics.avgDealSize || 0) / 100).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-1 mb-1">
                <Trophy className="h-3 w-3 text-purple-600" />
                <p className="text-xs text-muted-foreground">Best Platform</p>
              </div>
              <p className="text-sm font-semibold text-purple-600 truncate">
                {basicInsights?.bestPlatform
                  ? `${basicInsights.bestPlatform.name} (${basicInsights.bestPlatform.winRate}%)`
                  : basicInsights?.mostResponsivePlatform || "N/A"}
              </p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-background/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Avg Quality Score</p>
              <p className="text-xl font-bold">
                {basicInsights?.avgQualityScore || aiInsights?.metrics.avgQualityScore || 0}
                <span className="text-sm text-muted-foreground font-normal">/100</span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Win Trend</p>
              <div className="flex items-center gap-1">
                <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                <p className="text-sm font-semibold capitalize">{basicInsights?.winProbabilityTrend || "stable"}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Active Insights</p>
              <p className="text-sm font-semibold">{activeInsights.length} recommendations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Cards */}
      {activeInsights.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-lg">Personalized Recommendations</CardTitle>
            </div>
            <CardDescription>
              Based on your last {aiInsights?.metrics.totalProposals || 0} proposals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all hover:shadow-md ${getInsightBg(insight.type)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        {getImpactBadge(insight.impact)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(insight)}
                        className="gap-1"
                      >
                        {insight.action}
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => dismissInsight(insight.title)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Fallback to basic suggestions if no AI insights */}
      {activeInsights.length === 0 && basicInsights?.suggestions && basicInsights.suggestions.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-lg">Quick Tips</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {basicInsights.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-teal-600 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
