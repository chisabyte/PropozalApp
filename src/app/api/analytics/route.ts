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

    // Get all proposals
    const { data: proposals } = await supabaseAdmin
      .from("proposals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    // Generate mock data if no proposals exist (for testing charts)
    const useMockData = !proposals || proposals.length === 0
    let mockProposals: any[] = []
    
    if (useMockData) {
      const now = new Date()
      const platforms = ["Upwork", "Freelancer", "LinkedIn", "Direct"]
      const statuses = ["won", "lost", "sent", "draft"]
      const titles = [
        "E-commerce Website Development",
        "Mobile App Design Project",
        "Marketing Campaign Strategy",
        "Brand Identity Design",
        "Web Application Development",
        "Content Marketing Services",
        "SEO Optimization Project",
        "Social Media Management",
        "Logo Design Package",
        "Full-Stack Development",
        "UI/UX Design Project",
        "Digital Marketing Campaign",
      ]
      
      // Generate 25 mock proposals across last 6 months
      for (let i = 0; i < 25; i++) {
        const monthsAgo = Math.floor(Math.random() * 6)
        const createdDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, Math.floor(Math.random() * 28) + 1)
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const projectValue = status === "won" 
          ? Math.floor(Math.random() * 8000 + 2000) * 100 // $2,000 - $10,000 in cents
          : Math.floor(Math.random() * 10000 + 1000) * 100 // $1,000 - $11,000 in cents
        
        mockProposals.push({
          id: `mock-${i}`,
          title: titles[Math.floor(Math.random() * titles.length)],
          status,
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          project_value: status === "won" ? projectValue : (Math.random() > 0.5 ? projectValue : null),
          created_at: createdDate.toISOString(),
          won_at: status === "won" ? createdDate.toISOString() : null,
          quality_score: Math.floor(Math.random() * 30 + 70), // 70-100
          tone: ["Professional & Formal", "Friendly & Conversational", "Technical & Detailed"][Math.floor(Math.random() * 3)],
        })
      }
    }

    const actualProposals = useMockData ? mockProposals : proposals

    // Calculate statistics
    const totalProposals = actualProposals.length
    const won = actualProposals.filter((p) => p.status === "won" || p.signed_status === 'signed').length
    const lost = actualProposals.filter((p) => p.status === "lost").length
    const sent = actualProposals.filter((p) => (p.status === "sent" || p.status === "submitted" || p.signed_status === "sent" || p.signed_status === "viewed") && p.signed_status !== 'signed').length
    const drafts = actualProposals.filter((p) => p.status === "draft" && p.signed_status === "draft").length
    const declined = actualProposals.filter((p) => p.status === "declined" || p.signed_status === "declined").length
    const signed = actualProposals.filter((p) => p.signed_status === 'signed').length
    const expired = actualProposals.filter((p) => p.signed_status === 'expired').length

    const winRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0

    // Group by status
    const proposalsByStatus: Record<string, number> = {}
    actualProposals.forEach((p) => {
      // Prefer signed_status if it's more specific/advanced than the basic status
      const status = p.signed_status !== 'draft' ? p.signed_status : p.status
      proposalsByStatus[status] = (proposalsByStatus[status] || 0) + 1
    })

    // Group by platform

    const proposalsByPlatform: Record<string, number> = {}
    actualProposals.forEach((p) => {
      const platform = p.platform || "Unknown"
      proposalsByPlatform[platform] = (proposalsByPlatform[platform] || 0) + 1
    })

    // Calculate project values
    const proposalsWithValue = actualProposals.filter((p) => p.project_value && p.project_value > 0)
    const totalProjectValue = proposalsWithValue.reduce((sum, p) => sum + (p.project_value || 0), 0)
    const averageProjectValue =
      proposalsWithValue.length > 0 ? totalProjectValue / proposalsWithValue.length : 0

    // Recent activity (last 10 proposals)
    const recentActivity = actualProposals.slice(0, 10).map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      platform: p.platform,
      created_at: p.created_at,
      won_at: p.won_at,
    }))

    // Calculate total revenue from won proposals
    const wonProposals = actualProposals.filter((p) => p.status === "won" && p.project_value && p.project_value > 0)
    const totalRevenue = wonProposals.reduce((sum, p) => sum + (p.project_value || 0), 0) / 100 // Convert from cents to dollars

    // Monthly breakdown (last 6 months)
    const monthlyStats: Array<{
      month: string
      proposals: number
      won: number
      lost: number
      revenue: number
    }> = []

    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = date.toISOString().slice(0, 7)

      const monthProposals = actualProposals.filter((p) => {
        const proposalDate = new Date(p.created_at)
        return proposalDate.toISOString().slice(0, 7) === monthStr
      })

      const monthWon = monthProposals.filter((p) => p.status === "won")
      const monthRevenue = monthWon.reduce((sum, p) => sum + (p.project_value || 0), 0)

      monthlyStats.push({
        month: monthStr,
        proposals: monthProposals.length,
        won: monthWon.length,
        lost: monthProposals.filter((p) => p.status === "lost").length,
        revenue: Math.round(monthRevenue / 100), // Convert from cents to dollars
      })
    }

    // Calculate quality score trends
    const proposalsWithScores = actualProposals.filter(p => p.quality_score !== null && p.quality_score !== undefined)
    const avgQualityScore = proposalsWithScores.length > 0
      ? Math.round(proposalsWithScores.reduce((sum, p) => sum + (p.quality_score || 0), 0) / proposalsWithScores.length)
      : 0

    // Group by tone
    const proposalsByTone: Record<string, number> = {}
    actualProposals.forEach((p) => {
      const tone = p.tone || "Not specified"
      proposalsByTone[tone] = (proposalsByTone[tone] || 0) + 1
    })

    // Calculate tone effectiveness (win rate by tone)
    const toneEffectiveness: Record<string, { total: number; won: number; winRate: number }> = {}
    actualProposals.forEach((p) => {
      const tone = p.tone || "Not specified"
      if (!toneEffectiveness[tone]) {
        toneEffectiveness[tone] = { total: 0, won: 0, winRate: 0 }
      }
      toneEffectiveness[tone].total++
      if (p.status === "won") {
        toneEffectiveness[tone].won++
      }
    })
    Object.keys(toneEffectiveness).forEach(tone => {
      const stats = toneEffectiveness[tone]
      stats.winRate = stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0
    })

    // Quality score trend (last 6 months)
    const qualityScoreTrend: Array<{ month: string; avgScore: number }> = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = date.toISOString().slice(0, 7)
      
      const monthProposals = actualProposals.filter((p) => {
        const proposalDate = new Date(p.created_at)
        return proposalDate.toISOString().slice(0, 7) === monthStr && p.quality_score !== null
      })
      
      const avgScore = monthProposals.length > 0
        ? Math.round(monthProposals.reduce((sum, p) => sum + (p.quality_score || 0), 0) / monthProposals.length)
        : 0
      
      qualityScoreTrend.push({ month: monthStr, avgScore })
    }

    // Proposal length trends
    const lengthTrend: Array<{ month: string; avgLength: number }> = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = date.toISOString().slice(0, 7)
      
      const monthProposals = actualProposals.filter((p) => {
        const proposalDate = new Date(p.created_at)
        return proposalDate.toISOString().slice(0, 7) === monthStr && p.proposal_length !== null
      })
      
      const avgLength = monthProposals.length > 0
        ? Math.round(monthProposals.reduce((sum, p) => sum + (p.proposal_length || 0), 0) / monthProposals.length)
        : 0
      
      lengthTrend.push({ month: monthStr, avgLength })
    }

    return NextResponse.json({
      totalProposals,
      winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal
      totalWon: won,
      totalLost: lost,
      totalSent: sent,
      drafts,
      declined,
      signed, // Add signed count
      expired, // Add expired count
      proposalsByStatus,
      proposalsByPlatform,
      averageProjectValue: Math.round(averageProjectValue / 100), // Convert from cents
      totalProjectValue: Math.round(totalProjectValue / 100), // Convert from cents
      totalRevenue: Math.round(totalRevenue), // Already in dollars
      recentActivity,
      monthlyStats,
      avgQualityScore,
      proposalsByTone,
      toneEffectiveness,
      qualityScoreTrend,
      lengthTrend,
    })
  } catch (error: any) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

