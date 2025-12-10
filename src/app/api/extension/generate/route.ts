/**
 * Chrome Extension API Endpoint
 * Feature 7: Chrome Extension API Endpoint
 */

import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/db"
import { generateProposalMultiStage } from "@/lib/proposal-engine"
import { extractRFPData } from "@/lib/rfp-extractor"
import { getTopPortfolioMatches } from "@/lib/portfolio-matcher"
import { z } from "zod"

const extensionSchema = z.object({
  token: z.string().min(1),
  jobText: z.string().min(50),
  platform: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = extensionSchema.parse(body)

    // Verify token
    const supabaseAdmin = getSupabaseAdmin()
    const { data: tokenData } = await supabaseAdmin
      .from("extension_tokens")
      .select("user_id, expires_at")
      .eq("token", validated.token)
      .single()

    if (!tokenData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 })
    }

    // Get user
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", tokenData.user_id)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get portfolio items
    const { data: portfolioItems } = await supabaseAdmin
      .from("portfolio_items")
      .select("*")
      .eq("user_id", user.id)

    if (!portfolioItems || portfolioItems.length === 0) {
      return NextResponse.json(
        { error: "No portfolio items found" },
        { status: 400 }
      )
    }

    // Extract RFP
    let extractedRFP
    try {
      extractedRFP = await extractRFPData(validated.jobText)
    } catch (error) {
      console.error("RFP extraction failed:", error)
    }

    // Match portfolio
    const portfolioItemsFormatted = portfolioItems.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      tags: item.tags || [],
    }))

    const matchedPortfolio = getTopPortfolioMatches(
      portfolioItemsFormatted,
      validated.jobText,
      extractedRFP?.skills || [],
      3
    )

    // Generate proposal
    const proposalResult = await generateProposalMultiStage({
      rfpText: validated.jobText,
      userIndustry: user.industry || "General",
      companyName: user.company_name,
      portfolioItems: portfolioItemsFormatted,
      platform: validated.platform,
      tonePreference: user.tone_preference || "Professional & Formal",
      extractedRFP,
    })

    // Save proposal
    const { data: proposal } = await supabaseAdmin
      .from("proposals")
      .insert({
        user_id: user.id,
        title: extractedRFP?.clientName || "Extension Proposal",
        rfp_text: validated.jobText,
        generated_proposal: proposalResult.content,
        status: "draft",
        platform: validated.platform,
      })
      .select()
      .single()

    return NextResponse.json({
      proposalId: proposal.id,
      content: proposalResult.content,
    })
  } catch (error: any) {
    console.error("Extension API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate proposal" },
      { status: 500 }
    )
  }
}

