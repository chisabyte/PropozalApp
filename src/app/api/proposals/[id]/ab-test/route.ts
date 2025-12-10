import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { generateABTestVariations } from "@/lib/proposal-advanced-features"

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

    // Fetch the proposal with all context
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

    // Get portfolio items
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

    // Parse extracted RFP data (stored as JSON in your schema)
    let extractedRFP = null
    try {
      if (proposal.extracted_requirements) {
        const requirements = typeof proposal.extracted_requirements === 'string'
          ? JSON.parse(proposal.extracted_requirements)
          : proposal.extracted_requirements
        
        extractedRFP = {
          requirements,
          deliverables: proposal.extracted_deliverables || [],
          timeline: proposal.extracted_timeline,
          budget: proposal.extracted_budget,
          industry: user.industry || 'general-business'
        }
      }
    } catch (e) {
      console.warn("Failed to parse extracted RFP data:", e)
    }

    // Generate variations
    const variations = await generateABTestVariations({
      rfpText: proposal.rfp_text,
      userIndustry: user.industry || "general-business",
      companyName: user.company_name || null,
      portfolioItems: formattedPortfolioItems,
      platform: proposal.platform || "Other",
      projectValue: proposal.project_value ? proposal.project_value / 100 : undefined,
      tonePreference: user.tone_preference || "professional",
      stageAOutput: extractedRFP || {},
      stageBOutput: {} // This would ideally come from stored proposal generation data
    })

    // Optionally save variations to database for comparison tracking
    // Note: You may need to create a proposal_variations table if it doesn't exist
    // For now, we'll just return the variations without saving
    try {
      // Check if proposal_variations table exists by attempting to query it
      const { error: tableCheckError } = await supabase
        .from("proposal_variations")
        .select("id")
        .limit(1)

      if (!tableCheckError) {
        // Table exists, so we can save
        const { error: saveError } = await supabase
          .from("proposal_variations")
          .insert(
            variations.map((v) => ({
              proposal_id: params.id,
              user_id: user.id,
              variant: v.variant,
              hook_strategy: v.hookStrategy,
              content: v.proposal,
              differentiating_factor: v.differentiatingFactor,
              created_at: new Date().toISOString()
            }))
          )

        if (saveError) {
          console.warn("Failed to save variations (table may not exist):", saveError)
        }
      }
    } catch (e) {
      console.warn("Variations table may not exist, skipping save:", e)
    }

    return NextResponse.json({ 
      success: true,
      variations,
      message: "Generated 2 proposal variations"
    })

  } catch (error: any) {
    console.error("A/B test generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate variations" },
      { status: 500 }
    )
  }
}

