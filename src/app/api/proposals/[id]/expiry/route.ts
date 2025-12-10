/**
 * Proposal Expiry Settings API
 * Manages expiry date and actions for proposals
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"

export async function PATCH(
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
    const { expiresAt, expiredAction, expiryMessage } = body

    // Validate expired_action
    const validActions = ["show_message", "hide", "redirect"]
    if (expiredAction && !validActions.includes(expiredAction)) {
      return NextResponse.json(
        { error: `Invalid expired_action. Must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Verify user owns this proposal
    const { data: proposal, error: fetchError } = await supabase
      .from("proposals")
      .select("id, user_id")
      .eq("id", proposalId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      )
    }

    // Update expiry settings
    const { data: updatedProposal, error: updateError } = await supabase
      .from("proposals")
      .update({
        expires_at: expiresAt || null,
        expired_action: expiredAction || "show_message",
        expiry_message: expiryMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposalId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating expiry settings:", updateError)
      return NextResponse.json(
        { error: "Failed to update expiry settings" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
    })
  } catch (error: any) {
    console.error("Expiry settings error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update expiry settings" },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve expiry settings
export async function GET(
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
    const supabase = getSupabaseAdmin()

    const { data: proposal, error } = await supabase
      .from("proposals")
      .select("expires_at, expired_action, expiry_message")
      .eq("id", proposalId)
      .eq("user_id", user.id)
      .single()

    if (error || !proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      expiresAt: proposal.expires_at,
      expiredAction: proposal.expired_action,
      expiryMessage: proposal.expiry_message,
    })
  } catch (error: any) {
    console.error("Get expiry settings error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get expiry settings" },
      { status: 500 }
    )
  }
}
