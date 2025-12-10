import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { sendWebhook } from "@/lib/webhook-service"

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

    const body = await req.json()
    const { 
      status, 
      clientName, 
      clientEmail,
      // Win tracking fields
      projectValueActual,
      addToPortfolio,
      winNotes,
      // Loss tracking fields
      lostReason,
    } = body

    const validStatuses = ["draft", "sent", "won", "lost", "declined", "final", "submitted"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Build update object
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === "sent") {
      updateData.sent_at = new Date().toISOString()
    }

    if (status === "won") {
      updateData.won_at = new Date().toISOString()
      
      // Handle win-specific fields
      if (projectValueActual !== undefined) {
        updateData.project_value_actual = projectValueActual
      }
      if (addToPortfolio !== undefined) {
        updateData.add_to_portfolio = addToPortfolio
      }
      if (winNotes !== undefined) {
        updateData.win_notes = winNotes
      }
    }

    if (status === "lost") {
      // Handle loss-specific fields
      if (lostReason !== undefined) {
        updateData.lost_reason = lostReason
      }
    }

    if (clientName) {
      updateData.client_name = clientName
    }

    if (clientEmail) {
      updateData.client_email = clientEmail
    }

    // Update proposal
    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .update(updateData)
      .eq("id", params.id)
      .eq("user_id", user.id) // Ensure user owns this proposal
      .select()
      .single()

    if (error) {
      console.error("Error updating proposal status:", error)
      return NextResponse.json(
        { error: "Failed to update proposal status" },
        { status: 500 }
      )
    }

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    // Trigger Webhooks
    try {
      if (status === "sent") {
        await sendWebhook(user.id, "proposal.sent", {
          proposal_id: proposal.id,
          title: proposal.title,
          status: "sent",
          sent_at: proposal.sent_at,
          public_url: `${process.env.NEXT_PUBLIC_APP_URL}/p/${proposal.id}`
        })
      } else if (status === "won") {
        await sendWebhook(user.id, "proposal.won", {
          proposal_id: proposal.id,
          title: proposal.title,
          status: "won",
          won_at: proposal.won_at,
          project_value_actual: proposal.project_value_actual,
          client_info: {
            name: proposal.client_name,
            email: proposal.client_email
          }
        })
      } else if (status === "lost") {
        await sendWebhook(user.id, "proposal.lost", {
          proposal_id: proposal.id,
          title: proposal.title,
          status: "lost",
          lost_reason: proposal.lost_reason,
          lost_at: proposal.updated_at
        })
      }
    } catch (webhookError) {
      console.error("Webhook trigger failed:", webhookError)
    }

    return NextResponse.json({
      success: true,
      proposal,
    })
  } catch (error: any) {
    console.error("Update proposal status error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update proposal status" },
      { status: 500 }
    )
  }
}

