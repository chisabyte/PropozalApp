"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface QualityScoreTrendChartProps {
  qualityScoreTrend: Array<{ month: string; avgScore: number }>
}

export function QualityScoreTrendChart({ qualityScoreTrend }: QualityScoreTrendChartProps) {
  const chartData = qualityScoreTrend.map((item) => {
    const monthDate = new Date(item.month + "-01")
    const monthName = monthDate.toLocaleDateString("en-US", { month: "short" })
    return {
      month: monthName,
      score: item.avgScore,
    }
  })

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Proposal Score Trend</CardTitle>
        <CardDescription>Average quality score over the last 6 months</CardDescription>
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
              domain={[0, 100]}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(173, 80%, 40%)"
              strokeWidth={2}
              name="Avg Score"
              dot={{ fill: "hsl(173, 80%, 40%)", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

