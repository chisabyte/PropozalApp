import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { generateProposalMultiStage } from "@/lib/proposal-engine"
import { generateProposalSchema } from "@/lib/validations"
import { extractRFPData } from "@/lib/rfp-extractor"
import { getTopPortfolioMatches } from "@/lib/portfolio-matcher"
import { canGenerateProposal, incrementProposalUsage } from "@/lib/plan-quota"
import { checkRateLimit } from "@/lib/rate-limit"
import { generatePricingTable, generateTimeline } from "@/lib/pricing-generator"
import { generateSmartCTA } from "@/lib/cta-generator"
import { generateCoverPage } from "@/lib/pdf-cover-generator"
import { addLanguageContextToPrompt } from "@/lib/multi-language"
import { getStylePrompt } from "@/lib/style-formatter"
import { analyzeRFPComplexity, getSmartLengthAdjustment } from "@/lib/proposal-advanced-features"
import { sendWebhook } from "@/lib/webhook-service"

const logError = (label: string, error: unknown) => {
  if (error instanceof Error) {
    console.error(label, {
      message: error.message,
      stack: error.stack,
    })
    return
  }

  try {
    console.error(label, JSON.stringify(error, null, 2))
  } catch {
    console.error(label, error)
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({
        error: "User profile not found. Please complete onboarding first.",
        redirect: "/onboarding"
      }, { status: 404 })
    }

    // ========== RATE LIMIT CHECK ==========
    const { allowed: rateLimitAllowed } = await checkRateLimit(user.id, 'generate_proposal', 10, 60)
    if (!rateLimitAllowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute before trying again." },
        { status: 429 }
      )
    }

    // ========== PLAN QUOTA CHECK (P1.5: Free Tier Enforcement) ==========
    const quotaCheck = await canGenerateProposal(user.id)
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: "Quota exceeded",
          message: quotaCheck.message,
          used: quotaCheck.used,
          limit: quotaCheck.limit,
          plan: quotaCheck.plan,
          upgradeRequired: true,
        },
        { status: 402 } // Payment Required
      )
    }

    const body = await req.json()
    const validated = generateProposalSchema.parse(body)

    // Use admin client to bypass RLS since we're using Clerk auth
    const supabaseAdmin = getSupabaseAdmin()

    // Get portfolio items
    const { data: portfolioItems } = await supabaseAdmin
      .from("portfolio_items")
      .select("*")
      .eq("user_id", user.id)

    if (!portfolioItems || portfolioItems.length === 0) {
      return NextResponse.json(
        {
          error: "No portfolio items found. Please complete onboarding to add your portfolio.",
          redirect: "/onboarding"
        },
        { status: 400 }
      )
    }

    // Extract RFP data
    let extractedRFP
    try {
      extractedRFP = await extractRFPData(validated.rfpText)
    } catch (error) {
      logError("RFP extraction failed, continuing without extraction:", error)
      extractedRFP = undefined
    }

    // Match portfolio items to RFP
    const portfolioItemsFormatted = portfolioItems.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      tags: item.tags || [],
    }))

    const matchedPortfolio = getTopPortfolioMatches(
      portfolioItemsFormatted,
      validated.rfpText,
      extractedRFP?.skills || [],
      3 // Top 3 matches
    )

    // Store portfolio item IDs (UUIDs) instead of titles for database
    const matchedPortfolioIds = matchedPortfolio
      .map(item => {
        // Find the original portfolio item to get its UUID
        const originalItem = portfolioItems.find(p => p.title === item.title)
        return originalItem?.id
      })
      .filter((id): id is string => Boolean(id)) // Filter out undefined and ensure type safety

    // ========== COMPLEXITY ANALYSIS & SMART LENGTH OPTIMIZATION ==========
    const complexityAnalysis = analyzeRFPComplexity({
      rfpText: validated.rfpText,
      platform: validated.platform,
      extractedRequirements: extractedRFP?.requirements,
      extractedDeliverables: extractedRFP?.deliverables,
      timeline: extractedRFP?.timeline,
      budget: extractedRFP?.budget,
      industryType: user.industry || extractedRFP?.industry
    })

    // Get smart length adjustment (user preference overrides AI recommendation)
    // Note: If you add lengthAdjustment to generateProposalSchema, use: validated.lengthAdjustment
    const smartLengthAdjustment = getSmartLengthAdjustment(
      complexityAnalysis,
      undefined // User's manual override (can be added to schema later)
    )

    console.log(`📊 Complexity Score: ${complexityAnalysis.complexityScore}/10`)
    console.log(`💡 Recommended Length: ${complexityAnalysis.recommendedLength}`)
    console.log(`✅ Applying: ${smartLengthAdjustment}`)

    // Generate proposal using multi-stage engine
    const proposalResult = await generateProposalMultiStage({
      rfpText: validated.rfpText,
      userIndustry: user.industry || "General",
      companyName: user.company_name,
      portfolioItems: portfolioItemsFormatted,
      platform: validated.platform,
      projectValue: validated.projectValue,
      tonePreference: user.tone_preference || "Professional & Formal",
      extractedRFP,
      style: validated.style,
      language: validated.language,
      includePricing: validated.includePricing,
      lengthAdjustment: smartLengthAdjustment, // Apply smart length adjustment
      templateId: body.templateId // Pass template ID if present
    })

    // Generate pricing table and timeline if requested
    let pricingTable = null
    let timeline = null
    let pricingTimelineMarkdown = ''
    if (validated.includePricing) {
      try {
        pricingTable = await generatePricingTable(
          validated.rfpText,
          validated.projectValue,
          extractedRFP?.requirements
        )
        timeline = await generateTimeline(
          validated.rfpText,
          extractedRFP?.deliverables,
          extractedRFP?.timeline
        )
        
        // Convert pricing table and timeline to markdown and append to proposal
        if (pricingTable && pricingTable.tiers) {
          pricingTimelineMarkdown += '\n\n## Pricing\n\n'
          pricingTimelineMarkdown += '| Tier | Price | Description |\n'
          pricingTimelineMarkdown += '|------|-------|-------------|\n'
          pricingTable.tiers.forEach(tier => {
            pricingTimelineMarkdown += `| **${tier.name}** | $${tier.price.toLocaleString()} | ${tier.description} |\n`
          })
          if (pricingTable.notes) {
            pricingTimelineMarkdown += `\n*${pricingTable.notes}*\n`
          }
        }
        
        if (timeline && timeline.milestones) {
          pricingTimelineMarkdown += '\n\n## Project Timeline\n\n'
          pricingTimelineMarkdown += `**Total Duration:** ${timeline.totalDuration}\n\n`
          timeline.milestones.forEach((milestone, idx) => {
            pricingTimelineMarkdown += `### ${idx + 1}. ${milestone.phase}\n`
            pricingTimelineMarkdown += `**Duration:** ${milestone.duration}\n\n`
            pricingTimelineMarkdown += '**Deliverables:**\n'
            milestone.deliverables.forEach(deliverable => {
              pricingTimelineMarkdown += `- ${deliverable}\n`
            })
            pricingTimelineMarkdown += '\n'
          })
        }
        
        // Append pricing and timeline to proposal content
        if (pricingTimelineMarkdown) {
          proposalResult.content += pricingTimelineMarkdown
        }
      } catch (error) {
        console.error("Pricing/timeline generation failed:", error)
        // Continue without pricing/timeline
      }
    }
    
    // Use proposalResult as proposalContent for consistency
    const proposalContent = proposalResult

    // Generate smart CTA
    let ctaSuggestion = null
    try {
      ctaSuggestion = await generateSmartCTA(
        validated.platform,
        proposalContent.content,
        validated.rfpText
      )
    } catch (error) {
      console.error("CTA generation failed:", error)
    }

    // Generate cover page data
    let coverPageData = null
    try {
      coverPageData = await generateCoverPage(
        validated.proposalTitle || "Proposal",
        validated.rfpText,
        proposalContent.content,
        extractedRFP?.clientName
      )
    } catch (error) {
      console.error("Cover page generation failed:", error)
    }

    // Calculate proposal length (word count)
    const proposalLength = proposalContent.content.split(/\s+/).length

    // Save proposal to database with extracted data
    const proposalData: any = {
      user_id: user.id,
      title: validated.proposalTitle,
      rfp_text: validated.rfpText,
      generated_proposal: proposalContent.content,
      status: "draft",
      platform: validated.platform,
      project_value: validated.projectValue ? validated.projectValue * 100 : null,
      style: validated.style || "modern_clean",
      language: validated.language || "en",
      proposal_length: proposalLength,
      tone: user.tone_preference || "Professional & Formal",
      quality_score: proposalContent.qualityEvaluation?.score || null,
      template_used_id: body.templateId || null // Track template usage
    }

    // Add optional fields if they exist
    if (extractedRFP) {
      proposalData.extracted_requirements = JSON.stringify(extractedRFP.requirements)
      proposalData.extracted_deliverables = extractedRFP.deliverables || null
      proposalData.extracted_budget = extractedRFP.budget || null
      proposalData.extracted_timeline = extractedRFP.timeline || null
      proposalData.extracted_red_flags = extractedRFP.redFlags || null
      proposalData.client_name = extractedRFP.clientName || null
    }

    if (matchedPortfolioIds.length > 0) {
      proposalData.matched_portfolio_items = matchedPortfolioIds
    }

    // Add pricing table and timeline if generated
    if (pricingTable) {
      proposalData.pricing_table = pricingTable
    }
    if (timeline) {
      proposalData.timeline = timeline
    }
    proposalData.include_pricing = validated.includePricing || false

    // Add cover page data if generated
    if (coverPageData) {
      proposalData.cover_page_data = coverPageData
    }

    const { data: proposal, error: proposalError } = await supabaseAdmin
      .from("proposals")
      .insert(proposalData)
      .select()
      .single()

    if (proposalError) {
      const errorInfo = {
        message: proposalError.message,
        code: proposalError.code,
        details: proposalError.details,
        hint: proposalError.hint,
      }
      logError("Error saving proposal:", errorInfo)
      return NextResponse.json(
        {
          error: "Failed to save proposal",
          details: proposalError.message || "Unknown database error",
          hint: proposalError.hint || "Check if database schema is up to date."
        },
        { status: 500 }
      )
    }

    // ========== INCREMENT USAGE (P1.5: Plan-Based Tracking) ==========
    try {
      await incrementProposalUsage(user.id)
    } catch (usageError: any) {
      logError("Usage tracking error (non-fatal):", { message: usageError.message })
    }

    // ========== WEBHOOK TRIGGER ==========
    try {
      await sendWebhook(user.id, "proposal.created", {
        proposal_id: proposal.id,
        title: proposal.title,
        platform: proposal.platform,
        status: proposal.status,
        project_value: proposal.project_value ? proposal.project_value / 100 : null,
        created_at: proposal.created_at,
        rfp_summary: validated.rfpText.substring(0, 200) + "..."
      })
    } catch (webhookError) {
      logError("Webhook trigger failed (non-fatal):", webhookError)
    }

    return NextResponse.json({
      proposalId: proposal.id,
      content: proposalContent,
      usage: {
        used: quotaCheck.used + 1,
        limit: quotaCheck.limit,
        remaining: quotaCheck.remaining - 1,
      }
    })
  } catch (error: any) {
    logError("Generate proposal error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate proposal" },
      { status: 500 }
    )
  }
}
