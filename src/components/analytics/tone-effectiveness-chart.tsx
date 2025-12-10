"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface ToneEffectivenessChartProps {
  toneEffectiveness: Record<string, { total: number; won: number; winRate: number }>
}

export function ToneEffectivenessChart({ toneEffectiveness }: ToneEffectivenessChartProps) {
  const chartData = Object.entries(toneEffectiveness)
    .filter(([_, stats]) => stats.total >= 2) // Only show tones with at least 2 proposals
    .map(([tone, stats]) => ({
      tone: tone.length > 15 ? tone.substring(0, 15) + "..." : tone,
      winRate: stats.winRate,
      total: stats.total,
    }))
    .sort((a, b) => b.winRate - a.winRate)

  if (chartData.length === 0) return null

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Tone Effectiveness</CardTitle>
        <CardDescription>Win rate by proposal tone</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="tone"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              angle={-45}
              textAnchor="end"
              height={80}
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
              formatter={(value: number, name: string, props: any) => [
                `${value}% (${props.payload.total} proposals)`,
                "Win Rate"
              ]}
            />
            <Bar
              dataKey="winRate"
              fill="hsl(173, 80%, 40%)"
              name="Win Rate"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

