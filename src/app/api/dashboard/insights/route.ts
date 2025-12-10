/**
 * Dashboard Smart Insights API
 * Provides AI-driven insights for the dashboard including real revenue and win rate calculations
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get all proposals with quality scores and win/loss tracking data
    const { data: proposals } = await supabaseAdmin
      .from("proposals")
      .select("quality_score, tone, platform, proposal_length, status, created_at, project_value_actual, won_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!proposals || proposals.length === 0) {
      return NextResponse.json({
        avgQualityScore: 0,
        winProbabilityTrend: "stable",
        mostResponsivePlatform: null,
        totalRevenue: 0,
        winRate: 0,
        avgDealSize: 0,
        bestPlatform: null,
        suggestions: [
          "Create your first proposal to start tracking performance",
          "Add portfolio items to improve proposal quality"
        ]
      })
    }

    // Calculate average quality score
    const scoresWithValues = proposals.filter(p => p.quality_score !== null && p.quality_score !== undefined)
    const avgQualityScore = scoresWithValues.length > 0
      ? Math.round(scoresWithValues.reduce((sum, p) => sum + (p.quality_score || 0), 0) / scoresWithValues.length)
      : 0

    // Calculate win probability trend (compare last 5 vs previous 5)
    const recentProposals = proposals.slice(0, 5)
    const previousProposals = proposals.slice(5, 10)
    const recentWins = recentProposals.filter(p => p.status === "won").length
    const previousWins = previousProposals.filter(p => p.status === "won").length
    const winProbabilityTrend = recentWins > previousWins ? "up" : recentWins < previousWins ? "down" : "stable"

    // Find most responsive platform (highest win rate)
    const platformStats: Record<string, { total: number; won: number }> = {}
    proposals.forEach(p => {
      if (p.platform) {
        if (!platformStats[p.platform]) {
          platformStats[p.platform] = { total: 0, won: 0 }
        }
        platformStats[p.platform].total++
        if (p.status === "won") {
          platformStats[p.platform].won++
        }
      }
    })

    let mostResponsivePlatform: string | null = null
    let highestWinRate = 0
    Object.entries(platformStats).forEach(([platform, stats]) => {
      if (stats.total >= 2) { // Need at least 2 proposals to be meaningful
        const winRate = stats.won / stats.total
        if (winRate > highestWinRate) {
          highestWinRate = winRate
          mostResponsivePlatform = platform
        }
      }
    })

    // ============================================
    // REAL WIN/LOSS TRACKING CALCULATIONS
    // ============================================
    
    // Calculate total revenue from won proposals (using project_value_actual)
    const wonProposalsWithValue = proposals.filter(
      p => p.status === "won" && p.project_value_actual !== null && p.project_value_actual !== undefined
    )
    const totalRevenue = wonProposalsWithValue.reduce(
      (sum, p) => sum + (Number(p.project_value_actual) || 0), 
      0
    )
    
    // Calculate win rate: won / (won + lost)
    const wonCount = proposals.filter(p => p.status === "won").length
    const lostCount = proposals.filter(p => p.status === "lost").length
    const winRate = (wonCount + lostCount) > 0 
      ? Math.round((wonCount / (wonCount + lostCount)) * 100) 
      : 0
    
    // Calculate average deal size from won proposals
    const avgDealSize = wonProposalsWithValue.length > 0
      ? Math.round(totalRevenue / wonProposalsWithValue.length)
      : 0
    
    // Find best platform (highest win rate with at least 2 proposals)
    let bestPlatform: { name: string; winRate: number } | null = null
    let bestPlatformWinRate = 0
    for (const [platform, stats] of Object.entries(platformStats)) {
      if (stats.total >= 2) {
        const platformWinRate = Math.round((stats.won / stats.total) * 100)
        if (platformWinRate > bestPlatformWinRate) {
          bestPlatformWinRate = platformWinRate
          bestPlatform = { name: platform, winRate: platformWinRate }
        }
      }
    }

    // Generate suggestions
    const suggestions: string[] = []
    
    // Check quality score trend
    const recentScores = recentProposals.filter(p => p.quality_score !== null).map(p => p.quality_score || 0)
    const previousScores = previousProposals.filter(p => p.quality_score !== null).map(p => p.quality_score || 0)
    if (recentScores.length > 0 && previousScores.length > 0) {
      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      const previousAvg = previousScores.reduce((a, b) => a + b, 0) / previousScores.length
      if (recentAvg < previousAvg - 5) {
        suggestions.push("Your proposal scores have declined this week. Try adding more portfolio items.")
      }
    }

    // Check proposal length performance
    const wonProposalsWithLength = proposals.filter(p => p.status === "won" && p.proposal_length)
    const lostProposalsWithLength = proposals.filter(p => p.status === "lost" && p.proposal_length)
    if (wonProposalsWithLength.length >= 3 && lostProposalsWithLength.length >= 2) {
      const avgWonLength = wonProposalsWithLength.reduce((sum, p) => sum + (p.proposal_length || 0), 0) / wonProposalsWithLength.length
      const avgLostLength = lostProposalsWithLength.reduce((sum, p) => sum + (p.proposal_length || 0), 0) / lostProposalsWithLength.length
      if (avgWonLength < avgLostLength - 50) {
        suggestions.push("Shorter proposals have performed better in your last 5 submissions.")
      }
    }
    
    // Add win rate suggestions
    if (winRate > 0 && winRate < 30) {
      suggestions.push("Your win rate is below 30%. Consider reviewing your pricing strategy or proposal quality.")
    }
    
    // Add platform-specific suggestions
    if (bestPlatform && bestPlatformWinRate > 50) {
      suggestions.push(`Focus on ${bestPlatform.name} - you have a ${bestPlatformWinRate}% win rate there!`)
    }

    // Default suggestions if none generated
    if (suggestions.length === 0) {
      suggestions.push("Keep creating proposals to unlock personalized insights")
      if (avgQualityScore < 70) {
        suggestions.push("Focus on adding more detail to your RFPs for higher quality scores")
      }
    }

    return NextResponse.json({
      avgQualityScore,
      winProbabilityTrend,
      mostResponsivePlatform,
      // New win/loss tracking metrics
      totalRevenue,
      winRate,
      avgDealSize,
      bestPlatform,
      suggestions
    })
  } catch (error: any) {
    console.error("Dashboard insights error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch insights" },
      { status: 500 }
    )
  }
}

