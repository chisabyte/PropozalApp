import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { regenerateProposalSection, ProposalSection } from "@/lib/proposal-advanced-features"
import { z } from "zod"

const RegenerateSectionSchema = z.object({
  section: z.enum([
    'opening_hook',
    'problem_reframe', 
    'approach',
    'proof',
    'deliverables',
    'investment',
    'cta'
  ]),
  instruction: z.string().optional() // e.g., "make it more data-driven"
})

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

    const body = await req.json()
    const { section, instruction } = RegenerateSectionSchema.parse(body)

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

    // Get portfolio items for context (needed for proof section)
    const { data: portfolioItems } = await supabase
      .from("portfolio_items")
      .select("title, description, tags")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    // Format portfolio items (handle tags as array or JSON string)
    const formattedPortfolioItems = (portfolioItems || []).map((item) => ({
      title: item.title,
      description: item.description,
      tags: Array.isArray(item.tags) 
        ? item.tags 
        : (typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : [])
    }))

    // Regenerate the section
    const updatedProposal = await regenerateProposalSection({
      currentProposal: proposal.generated_proposal || proposal.content || "",
      sectionToRegenerate: section as ProposalSection,
      rfpText: proposal.rfp_text,
      platform: proposal.platform || "Other",
      portfolioItems: formattedPortfolioItems,
      projectValue: proposal.project_value ? proposal.project_value / 100 : undefined,
      regenerationInstruction: instruction
    })

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
      content: updatedProposal,
      message: `${section} regenerated successfully`
    })

  } catch (error: any) {
    console.error("Section regeneration error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to regenerate section" },
      { status: 500 }
    )
  }
}

