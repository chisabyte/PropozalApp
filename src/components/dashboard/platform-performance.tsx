"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Loader2,
  Trophy,
  AlertCircle
} from "lucide-react"

interface PlatformStats {
  platform: string
  proposals: number
  won: number
  lost: number
  winRate: number
  avgDealSize: number
  revenue: number
}

interface PlatformPerformanceData {
  platforms: PlatformStats[]
  bestPlatform: string | null
  worstPlatform: string | null
  insight: string | null
}

export function PlatformPerformance() {
  const [data, setData] = useState<PlatformPerformanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlatformData()
  }, [])

  const fetchPlatformData = async () => {
    try {
      const response = await fetch("/api/analytics")
      if (!response.ok) throw new Error("Failed to fetch analytics")
      const analyticsData = await response.json()

      // Use the detailed platformStats from the API
      let platforms: PlatformStats[] = []
      
      if (analyticsData.platformStats) {
        platforms = Object.entries(analyticsData.platformStats).map(([platform, stats]: [string, any]) => ({
          platform,
          proposals: stats.proposals,
          won: stats.won,
          lost: stats.lost,
          winRate: stats.winRate,
          avgDealSize: stats.avgDealSize,
          revenue: stats.revenue
        }))
        .filter(p => p.proposals > 0)
        .sort((a, b) => b.proposals - a.proposals)
      } else if (analyticsData.proposalsByPlatform) {
        // Fallback to old format
        platforms = Object.entries(analyticsData.proposalsByPlatform).map(([platform, count]) => ({
          platform,
          proposals: count as number,
          won: 0,
          lost: 0,
          winRate: 0,
          avgDealSize: 0,
          revenue: 0
        }))
        .filter(p => p.proposals > 0)
        .sort((a, b) => b.proposals - a.proposals)
      }

      // Determine best and worst platforms
      const withWinRates = platforms.filter(p => p.proposals >= 1)
      let bestPlatform: string | null = null
      let worstPlatform: string | null = null
      let insight: string | null = null

      if (withWinRates.length > 0) {
        const sorted = [...withWinRates].sort((a, b) => b.winRate - a.winRate)
        bestPlatform = sorted[0].winRate > 0 ? sorted[0].platform : null
        if (sorted.length > 1 && sorted[sorted.length - 1].winRate < sorted[0].winRate) {
          worstPlatform = sorted[sorted.length - 1].platform
        }

        if (bestPlatform && sorted[0].winRate > 0) {
          insight = `${bestPlatform} has your highest win rate at ${sorted[0].winRate}%. Consider focusing more effort here.`
        }
      }

      setData({
        platforms,
        bestPlatform,
        worstPlatform,
        insight
      })
    } catch (error) {
      console.error("Error fetching platform data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.platforms.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Platform Performance</CardTitle>
          </div>
          <CardDescription>
            Track win rates across different platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No platform data yet. Create proposals on different platforms to see performance comparisons.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Platform Performance</CardTitle>
        </div>
        <CardDescription>
          Compare your win rates across different platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Proposals</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right hidden md:table-cell">Avg Deal Size</TableHead>
                <TableHead className="text-right hidden md:table-cell">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.platforms.map((platform) => {
                const isBest = platform.platform === data.bestPlatform
                const isWorst = platform.platform === data.worstPlatform && data.platforms.length > 1

                return (
                  <TableRow
                    key={platform.platform}
                    className={
                      isBest ? "bg-emerald-500/5" :
                      isWorst ? "bg-amber-500/5" : ""
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{platform.platform}</span>
                        {isBest && (
                          <Badge className="bg-emerald-500/20 text-emerald-700 border-0 gap-1">
                            <Trophy className="h-3 w-3" />
                            Best
                          </Badge>
                        )}
                        {isWorst && (
                          <Badge className="bg-amber-500/20 text-amber-700 border-0">
                            Needs Work
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {platform.proposals}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className={
                          platform.winRate >= 50 ? "text-emerald-600 font-semibold" :
                          platform.winRate >= 30 ? "text-amber-600" :
                          "text-red-600"
                        }>
                          {platform.winRate}%
                        </span>
                        {platform.winRate >= 50 ? (
                          <TrendingUp className="h-3 w-3 text-emerald-600" />
                        ) : platform.winRate > 0 && platform.winRate < 30 ? (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      ${(platform.avgDealSize / 100).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell font-semibold">
                      ${(platform.revenue / 100).toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Insight callout */}
        {data.insight && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {data.insight}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
