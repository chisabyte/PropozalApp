/**
 * Proposal Engagement Tracking API
 * Tracks client engagement with public proposals (views, scroll depth, time spent)
 */

import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/db"

export const dynamic = 'force-dynamic'

interface EngagementEvent {
  event_type: "view" | "scroll" | "time_spent" | "exit"
  scroll_depth?: number
  time_spent?: number
  section_viewed?: string
  device_type?: string
  session_id: string
  referrer?: string
  user_agent?: string
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const proposalId = params.id
    const body: EngagementEvent = await req.json()
    
    const { 
      event_type, 
      scroll_depth, 
      time_spent, 
      section_viewed, 
      device_type,
      session_id,
      referrer,
      user_agent
    } = body

    if (!session_id) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Check if proposal exists
    const { data: proposal } = await supabase
      .from("proposals")
      .select("id")
      .eq("id", proposalId)
      .single()

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      )
    }

    // Try to get existing engagement record for this session
    const { data: existingEngagement } = await supabase
      .from("proposal_engagement")
      .select("*")
      .eq("proposal_id", proposalId)
      .eq("session_id", session_id)
      .single()

    if (existingEngagement) {
      // Update existing record
      const updateData: Record<string, any> = {
        last_view_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Update view count on new view event
      if (event_type === "view") {
        updateData.view_count = (existingEngagement.view_count || 0) + 1
      }

      // Update scroll depth if higher
      if (scroll_depth !== undefined && scroll_depth > (existingEngagement.scroll_depth_max || 0)) {
        updateData.scroll_depth_max = scroll_depth
      }

      // Add time spent
      if (time_spent !== undefined) {
        updateData.total_time_spent = (existingEngagement.total_time_spent || 0) + time_spent
      }

      // Add section to viewed sections if not already there
      if (section_viewed) {
        const currentSections = existingEngagement.sections_viewed || []
        if (!currentSections.includes(section_viewed)) {
          updateData.sections_viewed = [...currentSections, section_viewed]
        }
      }

      const { error: updateError } = await supabase
        .from("proposal_engagement")
        .update(updateData)
        .eq("id", existingEngagement.id)

      if (updateError) {
        console.error("Error updating engagement:", updateError)
        return NextResponse.json(
          { error: "Failed to update engagement" },
          { status: 500 }
        )
      }
    } else {
      // Create new engagement record
      const { error: insertError } = await supabase
        .from("proposal_engagement")
        .insert({
          proposal_id: proposalId,
          session_id,
          first_view_at: new Date().toISOString(),
          last_view_at: new Date().toISOString(),
          view_count: 1,
          scroll_depth_max: scroll_depth || 0,
          total_time_spent: time_spent || 0,
          sections_viewed: section_viewed ? [section_viewed] : [],
          device_type: device_type || "unknown",
          user_agent: user_agent || null,
          referrer: referrer || null,
        })

      if (insertError) {
        console.error("Error creating engagement:", insertError)
        return NextResponse.json(
          { error: "Failed to create engagement" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Track engagement error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to track engagement" },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve engagement metrics for a proposal
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const proposalId = params.id
    const supabase = getSupabaseAdmin()

    // Get all engagement records for this proposal
    const { data: engagements, error } = await supabase
      .from("proposal_engagement")
      .select("*")
      .eq("proposal_id", proposalId)
      .order("last_view_at", { ascending: false })

    if (error) {
      console.error("Error fetching engagement:", error)
      return NextResponse.json(
        { error: "Failed to fetch engagement" },
        { status: 500 }
      )
    }

    // Calculate aggregate metrics
    const uniqueSessions = engagements?.length || 0
    const totalViews = engagements?.reduce((sum, e) => sum + (e.view_count || 0), 0) || 0
    const totalTimeSpent = engagements?.reduce((sum, e) => sum + (e.total_time_spent || 0), 0) || 0
    const avgTimeSpent = uniqueSessions > 0 ? Math.round(totalTimeSpent / uniqueSessions) : 0
    const maxScrollDepth = engagements?.reduce((max, e) => Math.max(max, e.scroll_depth_max || 0), 0) || 0
    const avgScrollDepth = uniqueSessions > 0 
      ? Math.round(engagements.reduce((sum, e) => sum + (e.scroll_depth_max || 0), 0) / uniqueSessions) 
      : 0

    // Count device types
    const deviceCounts = {
      mobile: engagements?.filter(e => e.device_type === "mobile").length || 0,
      tablet: engagements?.filter(e => e.device_type === "tablet").length || 0,
      desktop: engagements?.filter(e => e.device_type === "desktop").length || 0,
    }

    // Find most viewed sections
    const sectionCounts: Record<string, number> = {}
    engagements?.forEach(e => {
      (e.sections_viewed || []).forEach((section: string) => {
        sectionCounts[section] = (sectionCounts[section] || 0) + 1
      })
    })
    const mostViewedSection = Object.entries(sectionCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null

    // Get last view timestamp
    const lastViewedAt = engagements?.[0]?.last_view_at || null

    return NextResponse.json({
      uniqueSessions,
      totalViews,
      totalTimeSpent,
      avgTimeSpent,
      maxScrollDepth,
      avgScrollDepth,
      deviceCounts,
      mostViewedSection,
      lastViewedAt,
      recentEngagements: engagements?.slice(0, 10) || [],
    })
  } catch (error: any) {
    console.error("Get engagement error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get engagement" },
      { status: 500 }
    )
  }
}
