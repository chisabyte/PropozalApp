import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { generatePlatformCTA } from "@/lib/proposal-advanced-features"

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

    // Fetch the proposal
    const supabase = getSupabaseAdmin()
    const { data: proposal, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error || !proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      )
    }

    // Extract a brief context summary (first 500 chars)
    const proposalContent = proposal.generated_proposal || proposal.content || ""
    const proposalContext = proposalContent.slice(0, 500) + "..."

    // Check if portfolio was referenced
    const hasPortfolioExamples = proposal.matched_portfolio_items && 
      (Array.isArray(proposal.matched_portfolio_items) 
        ? proposal.matched_portfolio_items.length > 0
        : JSON.parse(proposal.matched_portfolio_items || '[]').length > 0)

    // Get client name from extracted RFP data
    let clientName: string | undefined
    try {
      if (proposal.client_name) {
        clientName = proposal.client_name
      } else if (proposal.extracted_requirements) {
        const extracted = typeof proposal.extracted_requirements === 'string'
          ? JSON.parse(proposal.extracted_requirements)
          : proposal.extracted_requirements
        // Try to extract client name from various fields
        clientName = extracted.clientName || extracted.client_name
      }
    } catch (e) {
      console.warn("Failed to extract client name:", e)
    }

    // Generate optimized CTA
    const optimizedCTA = await generatePlatformCTA({
      platform: proposal.platform || "Other",
      proposalContext,
      projectValue: proposal.project_value ? proposal.project_value / 100 : undefined,
      clientName,
      hasPortfolioExamples: Boolean(hasPortfolioExamples)
    })

    // Replace the CTA section in the proposal
    const updatedProposal = proposalContent.replace(
      /##?\s*(?:Call to Action|Next Steps|Let's Connect)[\s\S]*?$/i,
      `## Next Steps\n\n${optimizedCTA}`
    )

    // Save the updated proposal
    const { error: updateError } = await supabase
      .from("proposals")
      .update({ 
        generated_proposal: updatedProposal,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ 
      success: true,
      optimizedCTA,
      content: updatedProposal,
      message: "CTA optimized successfully"
    })

  } catch (error: any) {
    console.error("CTA optimization error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to optimize CTA" },
      { status: 500 }
    )
  }
}

