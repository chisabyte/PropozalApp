import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { generateProposalMultiStage } from "@/lib/proposal-engine"
import { extractRFPData } from "@/lib/rfp-extractor"
import { getTopPortfolioMatches } from "@/lib/portfolio-matcher"

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
    const { tone, length } = body

    // Use admin client to bypass RLS (we verify ownership with user_id check)
    const supabase = getSupabaseAdmin()

    // Get original proposal
    const { data: proposal, error: fetchError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      )
    }

    // Get portfolio items
    const { data: portfolioItems } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("user_id", user.id)

    if (!portfolioItems || portfolioItems.length === 0) {
      return NextResponse.json(
        { error: "No portfolio items found" },
        { status: 400 }
      )
    }

    // Extract RFP data (or use stored data if available)
    let extractedRFP
    try {
      extractedRFP = await extractRFPData(proposal.rfp_text)
    } catch (error) {
      console.error("RFP extraction failed, continuing without extraction:", error)
      extractedRFP = undefined
    }

    // Format portfolio items for matching
    const portfolioItemsFormatted = portfolioItems.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      tags: item.tags || [],
    }))

    // Match portfolio items to RFP
    const matchedPortfolio = getTopPortfolioMatches(
      portfolioItemsFormatted,
      proposal.rfp_text,
      extractedRFP?.skills || [],
      3 // Top 3 matches
    )

    // Regenerate proposal using multi-stage engine
    const proposalResult = await generateProposalMultiStage({
      rfpText: proposal.rfp_text,
      userIndustry: user.industry || "General",
      companyName: user.company_name,
      portfolioItems: portfolioItems.map((item) => ({
        title: item.title,
        description: item.description,
        tags: item.tags || [],
      })),
      platform: proposal.platform || "Other",
      projectValue: proposal.project_value ? proposal.project_value / 100 : undefined,
      tonePreference: user.tone_preference || "Professional & Formal",
      toneAdjustment: tone,
      lengthAdjustment: length,
      extractedRFP,
    })

    // Extract the content string from the result object
    const proposalContent = proposalResult.content

    if (!proposalContent || proposalContent.trim() === '') {
      console.error('Generated proposal content is empty')
      return NextResponse.json(
        { error: "Generated proposal is empty. Please try again." },
        { status: 500 }
      )
    }

    // Build update object - only include fields that exist
    const updateData: any = {
      generated_proposal: proposalContent,
      updated_at: new Date().toISOString(),
    }

    // Only add quality_score if quality evaluation exists
    // We'll skip quality_analysis since the column might not exist
    if (proposalResult.qualityEvaluation?.score) {
      updateData.quality_score = proposalResult.qualityEvaluation.score
    }

    // Update proposal
    const { error: updateError } = await supabase
      .from("proposals")
      .update(updateData)
      .eq("id", params.id)

    if (updateError) {
      console.error('Error updating proposal:', updateError)
      return NextResponse.json(
        { error: "Failed to update proposal" },
        { status: 500 }
      )
    }

    return NextResponse.json({ content: proposalContent })
  } catch (error: any) {
    // Safe error logging
    const errorInfo = {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.split('\n')[0],
    }
    console.error("Regenerate proposal error:", JSON.stringify(errorInfo, null, 2))
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to regenerate proposal" },
      { status: 500 }
    )
  }
}

