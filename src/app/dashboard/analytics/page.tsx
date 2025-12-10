"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp, Search, Bell, FilePlus } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface AnalyticsData {
  totalProposals: number
  winRate: number
  totalWon: number
  totalLost: number
  totalSent: number
  drafts: number
  declined: number
  proposalsByStatus: Record<string, number>
  proposalsByPlatform: Record<string, number>
  averageProjectValue: number
  totalProjectValue: number
  totalRevenue: number
  recentActivity: Array<{
    id: string
    title: string
    status: string
    platform: string | null
    created_at: string
    won_at: string | null
  }>
  monthlyStats: Array<{
    month: string
    proposals: number
    won: number
    lost: number
    revenue: number
  }>
  avgQualityScore?: number
  proposalsByTone?: Record<string, number>
  toneEffectiveness?: Record<string, { total: number; won: number; winRate: number }>
  qualityScoreTrend?: Array<{ month: string; avgScore: number }>
  lengthTrend?: Array<{ month: string; avgLength: number }>
  // Platform performance for detailed stats
  platformPerformance?: Array<{
    platform: string
    proposals: number
    won: number
    winRate: number
    avgDealSize: number
    revenue: number
  }>
}

// Color palette matching the design
const CHART_COLORS = {
  purple: "#9333ea", // Primary purple
  teal: "#14b8a6", // Accepted/Teal
  red: "#ef4444", // Rejected/Red
  gold: "#f59e0b", // Pending/Gold
  gray: "#6b7280", // Draft/Gray
}

const STATUS_COLORS: Record<string, string> = {
  Accepted: CHART_COLORS.teal,
  Rejected: CHART_COLORS.red,
  Pending: CHART_COLORS.gold,
  Draft: CHART_COLORS.gray,
}

// Map database statuses to display statuses
function mapStatusToDisplay(status: string): string {
  const statusMap: Record<string, string> = {
    won: "Accepted",
    lost: "Rejected",
    sent: "Pending",
    submitted: "Pending",
    draft: "Draft",
    declined: "Rejected",
  }
  return statusMap[status] || status
}

// Calculate percentage change for revenue
function calculateRevenueChange(currentRevenue: number, monthlyStats: AnalyticsData["monthlyStats"]): { change: number; isPositive: boolean } {
  if (monthlyStats.length < 2) {
    return { change: 0, isPositive: true }
  }
  
  const currentMonth = monthlyStats[monthlyStats.length - 1]
  const previousMonth = monthlyStats[monthlyStats.length - 2]
  
  if (previousMonth.revenue === 0) {
    return { change: currentMonth.revenue > 0 ? 100 : 0, isPositive: true }
  }
  
  const change = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
  return { change: Math.round(change), isPositive: change >= 0 }
}

// Calculate win rate change
function calculateWinRateChange(currentWinRate: number, monthlyStats: AnalyticsData["monthlyStats"]): { change: number; isPositive: boolean } {
  if (monthlyStats.length < 2) {
    return { change: 0, isPositive: true }
  }
  
  const currentMonth = monthlyStats[monthlyStats.length - 1]
  const previousMonth = monthlyStats[monthlyStats.length - 2]
  
  const currentMonthWinRate = currentMonth.won + currentMonth.lost > 0
    ? (currentMonth.won / (currentMonth.won + currentMonth.lost)) * 100
    : 0
  
  const previousMonthWinRate = previousMonth.won + previousMonth.lost > 0
    ? (previousMonth.won / (previousMonth.won + previousMonth.lost)) * 100
    : 0
  
  if (previousMonthWinRate === 0) {
    return { change: currentMonthWinRate > 0 ? 100 : 0, isPositive: true }
  }
  
  const change = currentMonthWinRate - previousMonthWinRate
  return { change: Math.round(change), isPositive: change >= 0 }
}

// KPI Cards Component
function KpiCards({ data }: { data: AnalyticsData }) {
  const revenueChange = calculateRevenueChange(data.totalRevenue, data.monthlyStats)
  const winRateChange = calculateWinRateChange(data.winRate, data.monthlyStats)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Total Revenue */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</div>
          <div className="text-3xl font-bold mb-1">${data.totalRevenue.toLocaleString()}</div>
          <div className={`text-sm ${revenueChange.isPositive ? "text-green-600" : "text-red-600"}`}>
            {revenueChange.isPositive ? "+" : ""}{revenueChange.change}% from last month
          </div>
        </CardContent>
      </Card>

      {/* Win Rate */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground mb-1">Win Rate</div>
          <div className="text-3xl font-bold mb-1">{Math.round(data.winRate)}%</div>
          <div className={`text-sm ${winRateChange.isPositive ? "text-green-600" : "text-red-600"}`}>
            {winRateChange.isPositive ? "+" : ""}{winRateChange.change}% from last month
          </div>
        </CardContent>
      </Card>

      {/* Avg. Deal Size */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground mb-1">Avg. Deal Size</div>
          <div className="text-3xl font-bold mb-1">${data.averageProjectValue.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Consistent with average</div>
        </CardContent>
      </Card>
    </div>
  )
}

// Revenue Overview Chart Component
function RevenueOverviewChart({ monthlyStats }: { monthlyStats: AnalyticsData["monthlyStats"] }) {
  const chartData = monthlyStats.map((stat) => {
    const monthDate = new Date(stat.month + "-01")
    const monthName = monthDate.toLocaleDateString("en-US", { month: "short" })
    return {
      month: monthName,
      revenue: stat.revenue, // Already in dollars from API
    }
  })

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue from accepted proposals</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLORS.purple}
              fill="url(#revenueGradient)"
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.purple, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Quality Score Trends Chart Component
function QualityScoreTrendsChart({
  qualityScoreTrend,
  monthlyStats
}: {
  qualityScoreTrend: Array<{ month: string; avgScore: number }>
  monthlyStats: AnalyticsData["monthlyStats"]
}) {
  // Combine quality score with win rate data
  const chartData = qualityScoreTrend.map((item, index) => {
    const monthDate = new Date(item.month + "-01")
    const monthName = monthDate.toLocaleDateString("en-US", { month: "short" })
    const monthStat = monthlyStats[index]
    const winRate = monthStat && (monthStat.won + monthStat.lost) > 0
      ? Math.round((monthStat.won / (monthStat.won + monthStat.lost)) * 100)
      : 0

    return {
      month: monthName,
      qualityScore: item.avgScore,
      winRate: winRate
    }
  })

  // Calculate correlation message
  const firstHalf = chartData.slice(0, 3)
  const secondHalf = chartData.slice(3)
  const firstHalfAvgScore = firstHalf.reduce((sum, d) => sum + d.qualityScore, 0) / (firstHalf.length || 1)
  const secondHalfAvgScore = secondHalf.reduce((sum, d) => sum + d.qualityScore, 0) / (secondHalf.length || 1)
  const scoreChange = Math.round(((secondHalfAvgScore - firstHalfAvgScore) / (firstHalfAvgScore || 1)) * 100)

  const firstHalfAvgWinRate = firstHalf.reduce((sum, d) => sum + d.winRate, 0) / (firstHalf.length || 1)
  const secondHalfAvgWinRate = secondHalf.reduce((sum, d) => sum + d.winRate, 0) / (secondHalf.length || 1)
  const winRateChange = Math.round(secondHalfAvgWinRate - firstHalfAvgWinRate)

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quality Score vs Win Rate</CardTitle>
        <CardDescription>Track the correlation between proposal quality and success</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              yAxisId="left"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              domain={[0, 100]}
              label={{ value: 'Quality', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              domain={[0, 100]}
              label={{ value: 'Win %', angle: 90, position: 'insideRight', style: { fill: 'hsl(var(--muted-foreground))' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => [
                name === "qualityScore" ? `${value}/100` : `${value}%`,
                name === "qualityScore" ? "Quality Score" : "Win Rate"
              ]}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="qualityScore"
              stroke={CHART_COLORS.purple}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.purple, r: 4 }}
              name="Quality Score"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="winRate"
              stroke={CHART_COLORS.teal}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.teal, r: 4 }}
              name="Win Rate"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Correlation Insight */}
        {(scoreChange !== 0 || winRateChange !== 0) && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">
              {scoreChange > 0 && winRateChange > 0 ? (
                <>Your quality scores improved by <span className="font-semibold text-green-600">{scoreChange}%</span> and win rate increased by <span className="font-semibold text-green-600">{winRateChange}%</span>. Keep up the great work!</>
              ) : scoreChange < 0 && winRateChange < 0 ? (
                <>Quality scores declined by <span className="font-semibold text-red-600">{Math.abs(scoreChange)}%</span> with win rate down <span className="font-semibold text-red-600">{Math.abs(winRateChange)}%</span>. Focus on improving proposal quality.</>
              ) : (
                <>Quality and win rate trends are showing mixed signals. Keep monitoring your performance.</>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Proposal Status Chart Component
function ProposalStatusChart({ proposalsByStatus }: { proposalsByStatus: Record<string, number> }) {
  // Map statuses and aggregate
  const statusMap: Record<string, number> = {}
  Object.entries(proposalsByStatus).forEach(([status, count]) => {
    const displayStatus = mapStatusToDisplay(status)
    statusMap[displayStatus] = (statusMap[displayStatus] || 0) + count
  })

  const chartData = Object.entries(statusMap).map(([name, value]) => ({
    name,
    value,
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Proposal Status</CardTitle>
        <CardDescription>Distribution of proposal outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.name] || CHART_COLORS.gray}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value} proposals`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {chartData.map((entry) => {
            const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0
            return (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[entry.name] || CHART_COLORS.gray }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics")
      if (!response.ok) throw new Error("Failed to fetch analytics")
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data || data.totalProposals === 0) {
    return (
      <div className="space-y-8">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search proposals..." 
                className="pl-9 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link href="/dashboard/new-proposal">
                <FilePlus className="h-4 w-4 mr-2" />
                New Proposal
              </Link>
            </Button>
          </div>
        </div>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your proposal performance and revenue.
          </p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <div className="max-w-lg mx-auto space-y-6">
              <div className="relative h-64 md:h-80 w-full mx-auto">
                <Image
                  src="/images/propozzy/Empty Analytics State.653Z.png"
                  alt="No analytics data yet"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 512px"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">No Analytics Data Yet</h3>
                <p className="text-muted-foreground">
                  Start creating and submitting proposals to see your performance metrics here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search proposals..." 
              className="pl-9 w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link href="/dashboard/new-proposal">
              <FilePlus className="h-4 w-4 mr-2" />
              New Proposal
            </Link>
          </Button>
        </div>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your proposal performance and revenue.
        </p>
      </div>

      {/* KPI Cards */}
      <KpiCards data={data} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueOverviewChart monthlyStats={data.monthlyStats} />
        <ProposalStatusChart proposalsByStatus={data.proposalsByStatus} />
      </div>

      {/* Quality Score Trends */}
      {data.qualityScoreTrend && data.qualityScoreTrend.length > 0 && (
        <QualityScoreTrendsChart
          qualityScoreTrend={data.qualityScoreTrend}
          monthlyStats={data.monthlyStats}
        />
      )}
    </div>
  )
}
