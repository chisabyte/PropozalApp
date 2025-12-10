import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { sendWebhook } from "@/lib/webhook-service"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    const user = userId ? await getCurrentUser() : null

    const supabaseAdmin = getSupabaseAdmin()

    // Get proposal to verify it exists
    const { data: proposal } = await supabaseAdmin
      .from("proposals")
      .select("id, user_id, views, title")
      .eq("id", params.id)
      .single()

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    // Increment view count
    await supabaseAdmin
      .from("proposals")
      .update({
        views: (proposal.views || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    // Log view (optional - for detailed analytics)
    if (user && proposal.user_id === user.id) {
      // Only log views for proposal owner (internal tracking)
      const userAgent = req.headers.get("user-agent") || ""
      const forwarded = req.headers.get("x-forwarded-for")
      const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || ""

      await supabaseAdmin.from("proposal_views").insert({
        proposal_id: params.id,
        user_agent: userAgent.substring(0, 500), // Limit length
        ip_address: ip,
      })
    }

    // Trigger Webhook
    // Note: proposal.user_id is the owner of the proposal
    try {
      await sendWebhook(proposal.user_id, "proposal.viewed", {
        proposal_id: proposal.id,
        title: proposal.title, // Note: fetch above might need to select title if not already
        view_count: (proposal.views || 0) + 1,
        last_viewed_at: new Date().toISOString(),
        viewer_location: "Unknown", // GeoIP requires external service
        device_type: req.headers.get("user-agent") || "Unknown"
      })
    } catch (webhookError) {
      console.error("Webhook trigger failed:", webhookError)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Track view error:", error)
    // Don't fail the request if tracking fails
    return NextResponse.json({ success: false }, { status: 200 })
  }
}

