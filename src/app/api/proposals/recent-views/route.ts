/**
 * Recent Views API
 * Returns recent proposal views for real-time notifications
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

    // Get views from the last 5 minutes for real-time notifications
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    // Get recent engagement from proposal_engagement table
    const { data: recentEngagements, error: engagementError } = await supabase
      .from("proposal_engagement")
      .select(`
        id,
        proposal_id,
        first_view_at,
        last_view_at,
        device_type,
        proposals!inner (
          id,
          title,
          user_id
        )
      `)
      .eq("proposals.user_id", user.id)
      .gte("last_view_at", fiveMinutesAgo)
      .order("last_view_at", { ascending: false })
      .limit(10)

    if (engagementError) {
      console.error("Error fetching recent engagements:", engagementError)
      // Fall back to legacy proposal_views table
      const { data: legacyViews, error: viewsError } = await supabase
        .from("proposal_views")
        .select(`
          id,
          proposal_id,
          viewed_at,
          proposals!inner (
            id,
            title,
            user_id
          )
        `)
        .eq("proposals.user_id", user.id)
        .gte("viewed_at", fiveMinutesAgo)
        .order("viewed_at", { ascending: false })
        .limit(10)

      if (viewsError) {
        console.error("Error fetching legacy views:", viewsError)
        return NextResponse.json({ recentViews: [] })
      }

      return NextResponse.json({
        recentViews: (legacyViews || []).map(view => ({
          id: view.id,
          proposalId: view.proposal_id,
          proposalTitle: (view.proposals as any)?.title || "Untitled Proposal",
          viewedAt: view.viewed_at,
          deviceType: "unknown",
        })),
      })
    }

    return NextResponse.json({
      recentViews: (recentEngagements || []).map(engagement => ({
        id: engagement.id,
        proposalId: engagement.proposal_id,
        proposalTitle: (engagement.proposals as any)?.title || "Untitled Proposal",
        viewedAt: engagement.last_view_at,
        deviceType: engagement.device_type,
        isFirstView: engagement.first_view_at === engagement.last_view_at,
      })),
    })
  } catch (error: any) {
    console.error("Recent views error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch recent views" },
      { status: 500 }
    )
  }
}
