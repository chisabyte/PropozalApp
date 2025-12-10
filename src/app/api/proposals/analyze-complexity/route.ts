import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { analyzeRFPComplexity } from "@/lib/proposal-advanced-features"
import { z } from "zod"

const ComplexityAnalysisSchema = z.object({
  rfpText: z.string(),
  platform: z.string(),
  requirements: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  industry: z.string().optional()
})

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = ComplexityAnalysisSchema.parse(body)

    const analysis = analyzeRFPComplexity({
      rfpText: validated.rfpText,
      platform: validated.platform,
      extractedRequirements: validated.requirements,
      extractedDeliverables: validated.deliverables,
      timeline: validated.timeline,
      budget: validated.budget,
      industryType: validated.industry
    })

    return NextResponse.json({ 
      success: true,
      analysis,
      recommendation: {
        lengthAdjustment: analysis.recommendedLength,
        targetWordCount: analysis.targetWordCount,
        reasoning: analysis.reasoning
      }
    })

  } catch (error: any) {
    console.error("Complexity analysis error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to analyze complexity" },
      { status: 500 }
    )
  }
}

