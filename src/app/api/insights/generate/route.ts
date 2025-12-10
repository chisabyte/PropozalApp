/**
 * AI-Powered Insights Generation API
 * Generates personalized, actionable recommendations to improve win rates
 * Cached for 24 hours per user
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import OpenAI from "openai"

export const dynamic = 'force-dynamic'

// Cache for user insights (in production, use Redis)
const insightsCache = new Map<string, { data: any; expires: number }>()

interface Insight {
  type: "success" | "warning" | "tip"
  title: string
  description: string
  action: string
  impact: "low" | "medium" | "high"
  actionRoute?: string // Optional route to navigate to
}

interface InsightsResponse {
  insights: Insight[]
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

    // Check cache first
    const cacheKey = `insights_${user.id}`
    const cached = insightsCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data)
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Fetch last 30 proposals with comprehensive data
    const { data: proposals } = await supabaseAdmin
      .from("proposals")
      .select(`
        id,
        title,
        status,
        platform,
        industry,
        tone,
        proposal_length,
        quality_score,
        project_value,
        project_value_actual,
        created_at,
        won_at,
        sent_at,
        follow_up_count,
        is_from_template
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30)

    // If not enough data, return default insights
    if (!proposals || proposals.length < 3) {
      const defaultResponse: InsightsResponse = {
        insights: [
          {
            type: "tip",
            title: "Build Your Proposal History",
            description: "Create more proposals to unlock personalized AI insights. We need at least 3 proposals to start analyzing patterns.",
            action: "Create your next proposal now",
            impact: "high",
            actionRoute: "/dashboard/new-proposal"
          },
          {
            type: "tip",
            title: "Add Portfolio Items",
            description: "Portfolio items help the AI write more compelling proposals that showcase your relevant experience.",
            action: "Add your first portfolio item",
            impact: "medium",
            actionRoute: "/dashboard/portfolio"
          }
        ],
        generated_at: new Date().toISOString(),
        next_refresh: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metrics: {
          totalProposals: proposals?.length || 0,
          winRate: 0,
          avgQualityScore: 0,
          avgDealSize: 0,
          totalRevenue: 0
        }
      }
      return NextResponse.json(defaultResponse)
    }

    // Calculate comprehensive metrics
    const metrics = calculateMetrics(proposals)

    // Generate AI insights
    const insights = await generateAIInsights(metrics, proposals)

    const response: InsightsResponse = {
      insights,
      generated_at: new Date().toISOString(),
      next_refresh: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        totalProposals: proposals.length,
        winRate: metrics.overallWinRate,
        avgQualityScore: metrics.avgQualityScore,
        avgDealSize: metrics.avgDealSize,
        totalRevenue: metrics.totalRevenue
      }
    }

    // Cache for 24 hours
    insightsCache.set(cacheKey, {
      data: response,
      expires: Date.now() + 24 * 60 * 60 * 1000
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Insights generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate insights" },
      { status: 500 }
    )
  }
}

interface ProposalMetrics {
  // Overall stats
  totalProposals: number
  overallWinRate: number
  avgQualityScore: number
  avgDealSize: number
  totalRevenue: number

  // Win rates by category
  winRateByPlatform: Record<string, { total: number; won: number; winRate: number; revenue: number }>
  winRateByIndustry: Record<string, { total: number; won: number; winRate: number }>
  winRateByTone: Record<string, { total: number; won: number; winRate: number }>
  winRateByLength: { short: { total: number; won: number }; medium: { total: number; won: number }; long: { total: number; won: number } }

  // Behavior metrics
  avgTimeToRespond: number // hours
  followUpCorrelation: { withFollowUp: number; withoutFollowUp: number }
  templateVsCustom: { template: { total: number; won: number }; custom: { total: number; won: number } }
  qualityVsWinRate: { lowQuality: number; mediumQuality: number; highQuality: number }

  // Trends
  recentTrend: "improving" | "declining" | "stable"
  daysSinceLastProposal: number
  proposalsThisWeek: number
  proposalsLastWeek: number
}

function calculateMetrics(proposals: any[]): ProposalMetrics {
  const wonProposals = proposals.filter(p => p.status === "won")
  const lostProposals = proposals.filter(p => p.status === "lost")
  const decidedProposals = [...wonProposals, ...lostProposals]

  // Overall win rate
  const overallWinRate = decidedProposals.length > 0
    ? Math.round((wonProposals.length / decidedProposals.length) * 100)
    : 0

  // Average quality score
  const withQuality = proposals.filter(p => p.quality_score != null)
  const avgQualityScore = withQuality.length > 0
    ? Math.round(withQuality.reduce((sum, p) => sum + p.quality_score, 0) / withQuality.length)
    : 0

  // Revenue metrics
  const wonWithValue = wonProposals.filter(p => p.project_value_actual != null)
  const totalRevenue = wonWithValue.reduce((sum, p) => sum + (Number(p.project_value_actual) || 0), 0)
  const avgDealSize = wonWithValue.length > 0 ? Math.round(totalRevenue / wonWithValue.length) : 0

  // Win rate by platform
  const winRateByPlatform: Record<string, { total: number; won: number; winRate: number; revenue: number }> = {}
  proposals.forEach(p => {
    if (!p.platform) return
    if (!winRateByPlatform[p.platform]) {
      winRateByPlatform[p.platform] = { total: 0, won: 0, winRate: 0, revenue: 0 }
    }
    winRateByPlatform[p.platform].total++
    if (p.status === "won") {
      winRateByPlatform[p.platform].won++
      winRateByPlatform[p.platform].revenue += Number(p.project_value_actual) || 0
    }
  })
  Object.values(winRateByPlatform).forEach(stats => {
    const decided = stats.total // Simplified for brevity
    stats.winRate = decided > 0 ? Math.round((stats.won / decided) * 100) : 0
  })

  // Win rate by industry
  const winRateByIndustry: Record<string, { total: number; won: number; winRate: number }> = {}
  proposals.forEach(p => {
    const industry = p.industry || "other"
    if (!winRateByIndustry[industry]) {
      winRateByIndustry[industry] = { total: 0, won: 0, winRate: 0 }
    }
    winRateByIndustry[industry].total++
    if (p.status === "won") winRateByIndustry[industry].won++
  })
  Object.values(winRateByIndustry).forEach(stats => {
    stats.winRate = stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0
  })

  // Win rate by tone
  const winRateByTone: Record<string, { total: number; won: number; winRate: number }> = {}
  proposals.forEach(p => {
    const tone = p.tone || "professional"
    if (!winRateByTone[tone]) {
      winRateByTone[tone] = { total: 0, won: 0, winRate: 0 }
    }
    winRateByTone[tone].total++
    if (p.status === "won") winRateByTone[tone].won++
  })
  Object.values(winRateByTone).forEach(stats => {
    stats.winRate = stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0
  })

  // Win rate by length
  const winRateByLength = {
    short: { total: 0, won: 0 },   // < 400 words
    medium: { total: 0, won: 0 },  // 400-800 words
    long: { total: 0, won: 0 }     // > 800 words
  }
  proposals.forEach(p => {
    const length = p.proposal_length || 0
    const bucket = length < 400 ? "short" : length < 800 ? "medium" : "long"
    winRateByLength[bucket].total++
    if (p.status === "won") winRateByLength[bucket].won++
  })

  // Average time to respond (sent_at - created_at)
  const withSentTime = proposals.filter(p => p.sent_at && p.created_at)
  const avgTimeToRespond = withSentTime.length > 0
    ? withSentTime.reduce((sum, p) => {
        const created = new Date(p.created_at).getTime()
        const sent = new Date(p.sent_at).getTime()
        return sum + (sent - created) / (1000 * 60 * 60) // hours
      }, 0) / withSentTime.length
    : 0

  // Follow-up correlation
  const withFollowUp = decidedProposals.filter(p => (p.follow_up_count || 0) > 0)
  const withoutFollowUp = decidedProposals.filter(p => (p.follow_up_count || 0) === 0)
  const followUpCorrelation = {
    withFollowUp: withFollowUp.length > 0
      ? Math.round((withFollowUp.filter(p => p.status === "won").length / withFollowUp.length) * 100)
      : 0,
    withoutFollowUp: withoutFollowUp.length > 0
      ? Math.round((withoutFollowUp.filter(p => p.status === "won").length / withoutFollowUp.length) * 100)
      : 0
  }

  // Template vs custom
  const templateProposals = decidedProposals.filter(p => p.is_from_template)
  const customProposals = decidedProposals.filter(p => !p.is_from_template)
  const templateVsCustom = {
    template: {
      total: templateProposals.length,
      won: templateProposals.filter(p => p.status === "won").length
    },
    custom: {
      total: customProposals.length,
      won: customProposals.filter(p => p.status === "won").length
    }
  }

  // Quality score vs win rate
  const lowQualityDecided = decidedProposals.filter(p => (p.quality_score || 0) < 60)
  const mediumQualityDecided = decidedProposals.filter(p => (p.quality_score || 0) >= 60 && (p.quality_score || 0) < 80)
  const highQualityDecided = decidedProposals.filter(p => (p.quality_score || 0) >= 80)
  const qualityVsWinRate = {
    lowQuality: lowQualityDecided.length > 0
      ? Math.round((lowQualityDecided.filter(p => p.status === "won").length / lowQualityDecided.length) * 100)
      : 0,
    mediumQuality: mediumQualityDecided.length > 0
      ? Math.round((mediumQualityDecided.filter(p => p.status === "won").length / mediumQualityDecided.length) * 100)
      : 0,
    highQuality: highQualityDecided.length > 0
      ? Math.round((highQualityDecided.filter(p => p.status === "won").length / highQualityDecided.length) * 100)
      : 0
  }

  // Trends
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const proposalsThisWeek = proposals.filter(p => new Date(p.created_at) >= oneWeekAgo).length
  const proposalsLastWeek = proposals.filter(p => {
    const created = new Date(p.created_at)
    return created >= twoWeeksAgo && created < oneWeekAgo
  }).length

  const recentWins = decidedProposals.filter(p => new Date(p.created_at) >= oneWeekAgo)
  const olderWins = decidedProposals.filter(p => {
    const created = new Date(p.created_at)
    return created >= twoWeeksAgo && created < oneWeekAgo
  })

  const recentWinRate = recentWins.length > 0
    ? recentWins.filter(p => p.status === "won").length / recentWins.length
    : 0
  const olderWinRate = olderWins.length > 0
    ? olderWins.filter(p => p.status === "won").length / olderWins.length
    : 0

  const recentTrend: "improving" | "declining" | "stable" =
    recentWinRate > olderWinRate + 0.1 ? "improving" :
    recentWinRate < olderWinRate - 0.1 ? "declining" : "stable"

  const mostRecentProposal = proposals[0]
  const daysSinceLastProposal = mostRecentProposal
    ? Math.floor((now.getTime() - new Date(mostRecentProposal.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  return {
    totalProposals: proposals.length,
    overallWinRate,
    avgQualityScore,
    avgDealSize,
    totalRevenue,
    winRateByPlatform,
    winRateByIndustry,
    winRateByTone,
    winRateByLength,
    avgTimeToRespond,
    followUpCorrelation,
    templateVsCustom,
    qualityVsWinRate,
    recentTrend,
    daysSinceLastProposal,
    proposalsThisWeek,
    proposalsLastWeek
  }
}

async function generateAIInsights(metrics: ProposalMetrics, proposals: any[]): Promise<Insight[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const prompt = `You are a proposal strategy expert analyzing a freelancer's performance.

DATA:
${JSON.stringify(metrics, null, 2)}

Generate 3-5 specific, actionable insights:
1. What's working well (reinforce positive patterns)
2. What's underperforming (identify problems)
3. Specific recommendations (concrete next steps)

Format each insight as a JSON object:
{
  "type": "success" | "warning" | "tip",
  "title": "Short headline (max 8 words)",
  "description": "2-3 sentence explanation with specific numbers from the data",
  "action": "Specific thing to do (imperative, max 10 words)",
  "impact": "low" | "medium" | "high",
  "actionRoute": "optional route like /dashboard/new-proposal"
}

Rules:
- Be specific and data-driven. Use actual numbers from the data.
- Be encouraging but honest about problems.
- Focus on actionable advice, not generic tips.
- Example good insight: "Your Upwork proposals have a 45% win rate vs 25% on Fiverr. Focus more effort on Upwork where you're already strong."
- Example bad insight: "Improve your proposals" (too vague)
- If win rate is 0% or very low, focus on improving quality and consistency rather than dwelling on failure.
- If someone hasn't sent proposals recently, encourage them to stay active.
- If quality scores are low, suggest adding portfolio items or more detail.
- If longer proposals win more, recommend that length.

Return ONLY a valid JSON array of insights, no other text.`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a proposal strategy expert. Return only valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const content = response.choices[0]?.message?.content || "[]"

    // Parse JSON, handling potential markdown code blocks
    let cleanContent = content.trim()
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.slice(7)
    }
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.slice(3)
    }
    if (cleanContent.endsWith("```")) {
      cleanContent = cleanContent.slice(0, -3)
    }
    cleanContent = cleanContent.trim()

    const insights: Insight[] = JSON.parse(cleanContent)

    // Validate and limit to 5 insights
    return insights.slice(0, 5).map(insight => ({
      type: insight.type || "tip",
      title: insight.title || "Insight",
      description: insight.description || "",
      action: insight.action || "Review your proposals",
      impact: insight.impact || "medium",
      actionRoute: insight.actionRoute
    }))
  } catch (error) {
    console.error("AI insights generation failed:", error)

    // Fallback to rule-based insights
    return generateFallbackInsights(metrics)
  }
}

function generateFallbackInsights(metrics: ProposalMetrics): Insight[] {
  const insights: Insight[] = []

  // Best platform insight
  const platforms = Object.entries(metrics.winRateByPlatform)
  if (platforms.length > 0) {
    const best = platforms.sort((a, b) => b[1].winRate - a[1].winRate)[0]
    if (best[1].winRate > 0) {
      insights.push({
        type: "success",
        title: `${best[0]} Is Your Strongest Platform`,
        description: `You have a ${best[1].winRate}% win rate on ${best[0]} with ${best[1].total} proposals. This platform is performing above average for you.`,
        action: `Focus more effort on ${best[0]}`,
        impact: "high",
        actionRoute: "/dashboard/new-proposal"
      })
    }
  }

  // Quality score insight
  if (metrics.avgQualityScore < 70) {
    insights.push({
      type: "warning",
      title: "Improve Your Quality Scores",
      description: `Your average quality score is ${metrics.avgQualityScore}/100. Proposals with higher quality scores tend to win more. Add more detail to your RFPs.`,
      action: "Add portfolio items to boost scores",
      impact: "high",
      actionRoute: "/dashboard/portfolio"
    })
  } else if (metrics.avgQualityScore >= 80) {
    insights.push({
      type: "success",
      title: "Excellent Quality Scores",
      description: `Your average quality score of ${metrics.avgQualityScore}/100 is impressive! Keep up the detailed, well-structured proposals.`,
      action: "Maintain your high standards",
      impact: "medium"
    })
  }

  // Length insight
  const lengthStats = metrics.winRateByLength
  const shortWinRate = lengthStats.short.total > 0 ? (lengthStats.short.won / lengthStats.short.total) * 100 : 0
  const longWinRate = lengthStats.long.total > 0 ? (lengthStats.long.won / lengthStats.long.total) * 100 : 0

  if (longWinRate > shortWinRate + 20) {
    insights.push({
      type: "tip",
      title: "Longer Proposals Win More",
      description: `Your proposals over 800 words have a ${Math.round(longWinRate)}% win rate vs ${Math.round(shortWinRate)}% for shorter ones. Consider adding more detail.`,
      action: "Write more comprehensive proposals",
      impact: "medium"
    })
  }

  // Inactivity warning
  if (metrics.daysSinceLastProposal >= 5) {
    insights.push({
      type: "warning",
      title: `${metrics.daysSinceLastProposal} Days Since Last Proposal`,
      description: "Staying active is key to winning more work. Set aside 30 minutes today to apply to a few jobs.",
      action: "Create a proposal today",
      impact: "high",
      actionRoute: "/dashboard/new-proposal"
    })
  }

  // Follow-up insight
  if (metrics.followUpCorrelation.withFollowUp > metrics.followUpCorrelation.withoutFollowUp + 10) {
    insights.push({
      type: "tip",
      title: "Follow-Ups Boost Win Rate",
      description: `Proposals with follow-ups have a ${metrics.followUpCorrelation.withFollowUp}% win rate vs ${metrics.followUpCorrelation.withoutFollowUp}% without. Following up makes a difference!`,
      action: "Send follow-ups on pending proposals",
      impact: "medium",
      actionRoute: "/dashboard/proposals"
    })
  }

  return insights.slice(0, 5)
}
