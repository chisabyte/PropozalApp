/**
 * Needs Follow-Up API
 * Returns proposals that were viewed 3+ days ago but not marked won/lost
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

    // Get proposals that are sent and haven't had follow-ups yet
    const { data: activeProposals, error: proposalsError } = await supabase
      .from("proposals")
      .select("id, title, platform, status, sent_at, follow_up_count, last_follow_up_at")
      .eq("user_id", user.id)
      .eq("status", "sent")
      .lt("follow_up_count", 1) // Only if no follow-ups sent yet

    if (proposalsError || !activeProposals) {
      console.error("Error fetching proposals:", proposalsError)
      return NextResponse.json({ proposals: [] })
    }

    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)

    // Check each proposal
    const proposalsNeedingFollowUp = await Promise.all(
      activeProposals.map(async (proposal) => {
        // Get the most recent engagement
        const { data: engagements } = await supabase
          .from("proposal_engagement")
          .select("*")
          .eq("proposal_id", proposal.id)
          .order("last_view_at", { ascending: false })
          .limit(1)

        const hasViews = engagements && engagements.length > 0
        const lastView = hasViews ? engagements[0] : null
        
        let shouldFollowUp = false
        let daysSinceAction = 0
        let reason = ""

        if (hasViews && lastView) {
          // Case 1: Viewed but no response -> follow up after 3 days
          const lastViewDate = new Date(lastView.last_view_at)
          if (lastViewDate < threeDaysAgo) {
            shouldFollowUp = true
            daysSinceAction = Math.floor((now.getTime() - lastViewDate.getTime()) / (1000 * 60 * 60 * 24))
            reason = "viewed"
          }
        } else if (proposal.sent_at) {
          // Case 2: Not viewed -> follow up after 5 days
          const sentDate = new Date(proposal.sent_at)
          if (sentDate < fiveDaysAgo) {
            shouldFollowUp = true
            daysSinceAction = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24))
            reason = "sent"
          }
        }

        if (!shouldFollowUp) {
          return null
        }

        // Get total view count
        const { count: viewCount } = await supabase
          .from("proposal_engagement")
          .select("*", { count: "exact", head: true })
          .eq("proposal_id", proposal.id)

        return {
          id: proposal.id,
          title: proposal.title,
          platform: proposal.platform,
          status: proposal.status,
          lastViewedAt: lastView?.last_view_at || null,
          daysSinceView: daysSinceAction, // Reusing this field for "days since action"
          viewCount: viewCount || 0,
          reason // 'viewed' or 'sent'
        }
      })
    )

    // Filter out nulls and sort by days since action (oldest first)
    const followUpProposals = proposalsNeedingFollowUp
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.daysSinceView - a.daysSinceView)
      .slice(0, 3) // Top 3

    return NextResponse.json({ proposals: followUpProposals })
  } catch (error: any) {
    console.error("Needs follow-up error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch follow-up proposals" },
      { status: 500 }
    )
  }
}
