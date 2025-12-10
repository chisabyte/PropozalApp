/**
 * AI Proposal Advisor API
 * Answers user questions about their proposal performance with personalized, data-driven advice
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import OpenAI from "openai"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { question } = await req.json()

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Fetch user's proposal data
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
      .limit(50)

    // Calculate metrics
    const metrics = calculateUserMetrics(proposals || [])

    // Generate AI response
    const answer = await generateAdvisorResponse(question, metrics, user.full_name || "there")

    return NextResponse.json({ answer })
  } catch (error: any) {
    console.error("AI Advisor error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get advice" },
      { status: 500 }
    )
  }
}

interface UserMetrics {
  totalProposals: number
  wonCount: number
  lostCount: number
  pendingCount: number
  winRate: number
  totalRevenue: number
  avgDealSize: number
  avgQualityScore: number
  platformStats: Record<string, { total: number; won: number; winRate: number; avgDealSize: number }>
  toneStats: Record<string, { total: number; won: number; winRate: number }>
  lengthStats: { short: number; medium: number; long: number; bestLength: string }
  recentActivity: { lastProposalDays: number; proposalsLast7Days: number; proposalsLast30Days: number }
  followUpStats: { withFollowUp: number; withoutFollowUp: number }
  templateStats: { fromTemplate: number; custom: number }
}

function calculateUserMetrics(proposals: any[]): UserMetrics {
  const wonProposals = proposals.filter(p => p.status === "won")
  const lostProposals = proposals.filter(p => p.status === "lost")
  const pendingProposals = proposals.filter(p => ["sent", "submitted", "draft"].includes(p.status))
  const decidedProposals = [...wonProposals, ...lostProposals]

  // Win rate
  const winRate = decidedProposals.length > 0
    ? Math.round((wonProposals.length / decidedProposals.length) * 100)
    : 0

  // Revenue
  const wonWithValue = wonProposals.filter(p => p.project_value_actual != null)
  const totalRevenue = wonWithValue.reduce((sum, p) => sum + (Number(p.project_value_actual) || 0), 0)
  const avgDealSize = wonWithValue.length > 0 ? Math.round(totalRevenue / wonWithValue.length) : 0

  // Quality score
  const withQuality = proposals.filter(p => p.quality_score != null)
  const avgQualityScore = withQuality.length > 0
    ? Math.round(withQuality.reduce((sum, p) => sum + p.quality_score, 0) / withQuality.length)
    : 0

  // Platform stats
  const platformStats: Record<string, { total: number; won: number; winRate: number; avgDealSize: number }> = {}
  proposals.forEach(p => {
    if (!p.platform) return
    if (!platformStats[p.platform]) {
      platformStats[p.platform] = { total: 0, won: 0, winRate: 0, avgDealSize: 0 }
    }
    platformStats[p.platform].total++
    if (p.status === "won") {
      platformStats[p.platform].won++
    }
  })
  Object.entries(platformStats).forEach(([platform, stats]) => {
    const platformWon = proposals.filter(p => p.platform === platform && p.status === "won")
    const platformLost = proposals.filter(p => p.platform === platform && p.status === "lost")
    const platformDecided = platformWon.length + platformLost.length
    stats.winRate = platformDecided > 0 ? Math.round((platformWon.length / platformDecided) * 100) : 0
    const wonWithValue = platformWon.filter(p => p.project_value_actual != null)
    stats.avgDealSize = wonWithValue.length > 0
      ? Math.round(wonWithValue.reduce((sum, p) => sum + (Number(p.project_value_actual) || 0), 0) / wonWithValue.length / 100)
      : 0
  })

  // Tone stats
  const toneStats: Record<string, { total: number; won: number; winRate: number }> = {}
  proposals.forEach(p => {
    const tone = p.tone || "professional"
    if (!toneStats[tone]) {
      toneStats[tone] = { total: 0, won: 0, winRate: 0 }
    }
    toneStats[tone].total++
    if (p.status === "won") toneStats[tone].won++
  })
  Object.values(toneStats).forEach(stats => {
    stats.winRate = stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0
  })

  // Length stats
  const shortProposals = decidedProposals.filter(p => (p.proposal_length || 0) < 400)
  const mediumProposals = decidedProposals.filter(p => (p.proposal_length || 0) >= 400 && (p.proposal_length || 0) < 800)
  const longProposals = decidedProposals.filter(p => (p.proposal_length || 0) >= 800)

  const shortWinRate = shortProposals.length > 0 ? shortProposals.filter(p => p.status === "won").length / shortProposals.length : 0
  const mediumWinRate = mediumProposals.length > 0 ? mediumProposals.filter(p => p.status === "won").length / mediumProposals.length : 0
  const longWinRate = longProposals.length > 0 ? longProposals.filter(p => p.status === "won").length / longProposals.length : 0

  let bestLength = "medium"
  if (longWinRate > mediumWinRate && longWinRate > shortWinRate) bestLength = "long"
  if (shortWinRate > mediumWinRate && shortWinRate > longWinRate) bestLength = "short"

  const lengthStats = {
    short: Math.round(shortWinRate * 100),
    medium: Math.round(mediumWinRate * 100),
    long: Math.round(longWinRate * 100),
    bestLength
  }

  // Recent activity
  const now = new Date()
  const lastProposal = proposals[0]
  const lastProposalDays = lastProposal
    ? Math.floor((now.getTime() - new Date(lastProposal.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 999
  const proposalsLast7Days = proposals.filter(p => {
    const created = new Date(p.created_at)
    return (now.getTime() - created.getTime()) <= 7 * 24 * 60 * 60 * 1000
  }).length
  const proposalsLast30Days = proposals.filter(p => {
    const created = new Date(p.created_at)
    return (now.getTime() - created.getTime()) <= 30 * 24 * 60 * 60 * 1000
  }).length

  // Follow-up stats
  const withFollowUp = decidedProposals.filter(p => (p.follow_up_count || 0) > 0)
  const withoutFollowUp = decidedProposals.filter(p => (p.follow_up_count || 0) === 0)
  const followUpStats = {
    withFollowUp: withFollowUp.length > 0
      ? Math.round((withFollowUp.filter(p => p.status === "won").length / withFollowUp.length) * 100)
      : 0,
    withoutFollowUp: withoutFollowUp.length > 0
      ? Math.round((withoutFollowUp.filter(p => p.status === "won").length / withoutFollowUp.length) * 100)
      : 0
  }

  // Template stats
  const fromTemplate = proposals.filter(p => p.is_from_template).length
  const custom = proposals.filter(p => !p.is_from_template).length

  return {
    totalProposals: proposals.length,
    wonCount: wonProposals.length,
    lostCount: lostProposals.length,
    pendingCount: pendingProposals.length,
    winRate,
    totalRevenue: Math.round(totalRevenue / 100), // Convert to dollars
    avgDealSize: Math.round(avgDealSize / 100),
    avgQualityScore,
    platformStats,
    toneStats,
    lengthStats,
    recentActivity: { lastProposalDays, proposalsLast7Days, proposalsLast30Days },
    followUpStats,
    templateStats: { fromTemplate, custom }
  }
}

async function generateAdvisorResponse(question: string, metrics: UserMetrics, userName: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const systemPrompt = `You are a friendly, expert proposal advisor for freelancers. You have access to the user's actual proposal performance data and should give specific, data-driven advice.

USER'S DATA:
${JSON.stringify(metrics, null, 2)}

GUIDELINES:
1. Be specific and reference their actual numbers (e.g., "Your 45% win rate on Upwork is strong")
2. Be encouraging but honest - acknowledge problems and offer solutions
3. Give actionable advice they can implement today
4. Keep responses concise (2-4 paragraphs max)
5. Use their name occasionally to personalize
6. If they don't have enough data for a specific question, suggest they need more proposals first
7. Compare their performance across different dimensions (platform, tone, length) when relevant
8. Suggest specific next steps at the end

The user's name is: ${userName}`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    return response.choices[0]?.message?.content || "I couldn't generate advice at this time."
  } catch (error) {
    console.error("OpenAI error:", error)

    // Fallback response based on common questions
    if (question.toLowerCase().includes("win") || question.toLowerCase().includes("losing")) {
      return `Based on your data, you have a ${metrics.winRate}% win rate from ${metrics.totalProposals} proposals. ${
        metrics.winRate < 30
          ? "This is below average. Try focusing on quality over quantity - ensure your proposals directly address the client's needs."
          : metrics.winRate < 50
          ? "This is decent, but there's room for improvement. Look at what's working on your best platform and apply those patterns elsewhere."
          : "This is a strong win rate! Keep doing what you're doing."
      }`
    }

    if (question.toLowerCase().includes("price") || question.toLowerCase().includes("rate")) {
      return `Your average deal size is $${metrics.avgDealSize}. ${
        metrics.avgDealSize < 500
          ? "Consider targeting higher-value projects or bundling services to increase your average."
          : "This seems healthy. Test raising your rates by 10-15% on your next few proposals to see if it affects your win rate."
      }`
    }

    return "I couldn't analyze your data at this time. Please try again in a moment."
  }
}
