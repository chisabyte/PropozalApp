import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { generateProposalInsights } from "@/lib/proposal-insights"
import { getSupabaseAdmin } from "@/lib/db"
import { z } from "zod"

const insightsSchema = z.object({
  proposalContent: z.string(),
  rfpText: z.string(),
  platform: z.string(),
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
    const validated = insightsSchema.parse(body)

    // Verify proposal belongs to user
    const supabaseAdmin = getSupabaseAdmin()
    const { data: proposal } = await supabaseAdmin
      .from("proposals")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    // Generate insights
    const insights = await generateProposalInsights(
      validated.proposalContent,
      validated.rfpText,
      validated.platform
    )

    // Save insights to proposal
    await supabaseAdmin
      .from("proposals")
      .update({ ai_insights: insights })
      .eq("id", params.id)

    return NextResponse.json(insights)
  } catch (error: any) {
    console.error("Insights generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate insights" },
      { status: 500 }
    )
  }
}

