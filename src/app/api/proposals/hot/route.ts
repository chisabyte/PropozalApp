/**
 * Hot Proposals API
 * Returns proposals with highest engagement in the last 7 days
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

    const supabase = getSupabaseAdmin()

    // Get proposals from last 7 days with engagement data
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // First get user's proposals
    const { data: userProposals, error: proposalsError } = await supabase
      .from("proposals")
      .select("id, title, platform, status")
      .eq("user_id", user.id)
      .in("status", ["sent", "draft", "final"])

    if (proposalsError || !userProposals) {
      console.error("Error fetching proposals:", proposalsError)
      return NextResponse.json({ proposals: [] })
    }

    // Get engagement data for each proposal
    const proposalsWithEngagement = await Promise.all(
      userProposals.map(async (proposal) => {
        const { data: engagements } = await supabase
          .from("proposal_engagement")
          .select("*")
          .eq("proposal_id", proposal.id)
          .gte("last_view_at", sevenDaysAgo)

        if (!engagements || engagements.length === 0) {
          return null
        }

        const uniqueSessions = engagements.length
        const totalTimeSpent = engagements.reduce((sum, e) => sum + (e.total_time_spent || 0), 0)
        const avgScrollDepth = Math.round(
          engagements.reduce((sum, e) => sum + (e.scroll_depth_max || 0), 0) / uniqueSessions
        )
        const lastViewedAt = engagements.sort(
          (a, b) => new Date(b.last_view_at).getTime() - new Date(a.last_view_at).getTime()
        )[0]?.last_view_at

        return {
          ...proposal,
          uniqueSessions,
          totalTimeSpent,
          avgScrollDepth,
          lastViewedAt,
          // Score for sorting (weighted combination)
          engagementScore: uniqueSessions * 10 + totalTimeSpent + avgScrollDepth,
        }
      })
    )

    // Filter out nulls and sort by engagement score
    const hotProposals = proposalsWithEngagement
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5)

    return NextResponse.json({ proposals: hotProposals })
  } catch (error: any) {
    console.error("Hot proposals error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch hot proposals" },
      { status: 500 }
    )
  }
}
