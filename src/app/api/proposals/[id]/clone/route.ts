/**
 * Clone Proposal API
 * Creates a duplicate of an existing proposal with different clone types
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { addDays } from "date-fns"

type CloneType = "structure_and_portfolio" | "structure_only" | "full_clone"

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
    const { 
      clone_type = "structure_and_portfolio",
      mark_as_template = false,
      new_title 
    }: {
      clone_type?: CloneType
      mark_as_template?: boolean
      new_title?: string
    } = body

    const supabase = getSupabaseAdmin()

    // Fetch the original proposal
    const { data: original, error: fetchError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", proposalId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !original) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      )
    }

    // Build clone data based on clone type
    const baseCloneData: Record<string, any> = {
      user_id: user.id,
      status: "draft",
      cloned_from_id: proposalId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Reset these for new proposal
      quality_score: null,
      quality_analysis: null,
      sent_at: null,
      won_at: null,
      project_value_actual: null,
      lost_reason: null,
      win_notes: null,
      // Set new expiry (7 days from now)
      expires_at: addDays(new Date(), 7).toISOString(),
      expired_action: "show_message",
    }

    let cloneData: Record<string, any>

    switch (clone_type) {
      case "structure_and_portfolio":
        // Copy structure and portfolio matches, but not RFP/proposal content
        cloneData = {
          ...baseCloneData,
          title: new_title || `${original.title} - Copy`,
          platform: original.platform,
          tone: original.tone,
          language: original.language,
          proposal_length: original.proposal_length,
          matched_portfolio_items: original.matched_portfolio_items,
          complexity_score: original.complexity_score,
          // Don't copy RFP-specific content
          original_rfp: "",
          generated_proposal: "",
          extracted_requirements: null,
          extracted_rfp_data: null,
          project_value: null,
        }
        break

      case "structure_only":
        // Copy only structure settings, not portfolio or content
        cloneData = {
          ...baseCloneData,
          title: new_title || `${original.title} - Copy`,
          platform: original.platform,
          tone: original.tone,
          language: original.language,
          proposal_length: original.proposal_length,
          // Don't copy portfolio or content
          matched_portfolio_items: null,
          original_rfp: "",
          generated_proposal: "",
          extracted_requirements: null,
          extracted_rfp_data: null,
          project_value: null,
          complexity_score: null,
        }
        break

      case "full_clone":
      default:
        // Copy everything
        cloneData = {
          ...baseCloneData,
          title: new_title || `${original.title} - Copy`,
          original_rfp: original.original_rfp,
          generated_proposal: original.generated_proposal 
            ? `${original.generated_proposal}\n\n---\n(Cloned from original proposal)`
            : "",
          platform: original.platform,
          tone: original.tone,
          language: original.language,
          proposal_length: original.proposal_length,
          matched_portfolio_items: original.matched_portfolio_items,
          complexity_score: original.complexity_score,
          extracted_requirements: original.extracted_requirements,
          extracted_rfp_data: original.extracted_rfp_data,
          project_value: original.project_value,
          client_name: original.client_name,
          client_email: original.client_email,
        }
        break
    }

    // Create the cloned proposal
    const { data: cloned, error: insertError } = await supabase
      .from("proposals")
      .insert(cloneData)
      .select()
      .single()

    if (insertError) {
      console.error("Error cloning proposal:", insertError)
      return NextResponse.json(
        { error: "Failed to clone proposal" },
        { status: 500 }
      )
    }

    // If mark_as_template is true, update the original proposal
    if (mark_as_template) {
      await supabase
        .from("proposals")
        .update({ 
          is_template: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", proposalId)
    }

    // Increment clone_count on original
    await supabase
      .from("proposals")
      .update({ 
        clone_count: (original.clone_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposalId)

    return NextResponse.json({
      success: true,
      proposal: cloned,
      clone_type,
      marked_as_template: mark_as_template,
    })
  } catch (error: any) {
    console.error("Clone proposal error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to clone proposal" },
      { status: 500 }
    )
  }
}
