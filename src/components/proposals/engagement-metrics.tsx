"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Eye, 
  Clock, 
  ScrollText, 
  Smartphone, 
  Monitor, 
  Tablet,
  Copy,
  Check,
  Share2,
  Flame
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface EngagementMetrics {
  uniqueSessions: number
  totalViews: number
  totalTimeSpent: number
  avgTimeSpent: number
  maxScrollDepth: number
  avgScrollDepth: number
  deviceCounts: {
    mobile: number
    tablet: number
    desktop: number
  }
  mostViewedSection: string | null
  lastViewedAt: string | null
}

interface EngagementMetricsProps {
  proposalId: string
  onShareClick?: () => void
}

export function EngagementMetrics({ proposalId, onShareClick }: EngagementMetricsProps) {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchMetrics()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [proposalId])

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/track-engagement`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error("Failed to fetch engagement metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const copyLink = async () => {
    const link = `${window.location.origin}/p/${proposalId}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasEngagement = metrics && metrics.uniqueSessions > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base">Client Engagement</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={onShareClick} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
        <CardDescription>
          Track how clients interact with your proposal
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : hasEngagement ? (
          <div className="space-y-4">
            {/* Main metrics grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Views */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground">Views</span>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  {metrics.uniqueSessions}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ({metrics.totalViews} total)
                  </span>
                </p>
              </div>

              {/* Avg Time */}
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-muted-foreground">Avg Time</span>
                </div>
                <p className="text-xl font-bold text-emerald-600">
                  {formatTime(metrics.avgTimeSpent)}
                </p>
              </div>
            </div>

            {/* Scroll Depth */}
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-muted-foreground">Scroll Depth</span>
                </div>
                <span className="text-sm font-bold text-purple-600">{metrics.avgScrollDepth}%</span>
              </div>
              <Progress value={metrics.avgScrollDepth} className="h-2" />
            </div>

            {/* Device breakdown */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span>{metrics.deviceCounts.mobile}</span>
              </div>
              <div className="flex items-center gap-1">
                <Tablet className="h-4 w-4 text-muted-foreground" />
                <span>{metrics.deviceCounts.tablet}</span>
              </div>
              <div className="flex items-center gap-1">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span>{metrics.deviceCounts.desktop}</span>
              </div>
            </div>

            {/* Most viewed section */}
            {metrics.mostViewedSection && (
              <div className="text-sm">
                <span className="text-muted-foreground">🔥 Most viewed: </span>
                <span className="font-medium capitalize">
                  {metrics.mostViewedSection.replace(/-/g, " ")}
                </span>
              </div>
            )}

            {/* Last viewed */}
            {metrics.lastViewedAt && (
              <div className="text-sm text-muted-foreground">
                ⏰ Last viewed: {formatDistanceToNow(new Date(metrics.lastViewedAt), { addSuffix: true })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Eye className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No views yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Share this link to track engagement
              </p>
            </div>
            <div className="flex items-center gap-2 max-w-sm mx-auto">
              <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm truncate">
                {typeof window !== "undefined" ? `${window.location.origin}/p/${proposalId}` : `/p/${proposalId}`}
              </div>
              <Button size="sm" variant="outline" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You'll see when your client views this proposal
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
