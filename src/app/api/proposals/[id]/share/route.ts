/**
 * Proposal Share Tracking API
 * Tracks when and how proposals are shared
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const proposalId = params.id
    const body = await req.json()
    const { method } = body // "link" | "email" | "qr"

    const supabase = getSupabaseAdmin()

    // Verify user owns this proposal
    const { data: proposal, error: fetchError } = await supabase
      .from("proposals")
      .select("id, user_id, share_count")
      .eq("id", proposalId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      )
    }

    // Update share tracking
    const { error: updateError } = await supabase
      .from("proposals")
      .update({
        shared_at: new Date().toISOString(),
        share_method: method,
        share_count: (proposal.share_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposalId)

    if (updateError) {
      console.error("Error updating share tracking:", updateError)
      return NextResponse.json(
        { error: "Failed to track share" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Share tracking error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to track share" },
      { status: 500 }
    )
  }
}
