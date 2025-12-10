import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { evaluatePortfolioStrength } from "@/lib/portfolio-intelligence"

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: portfolioItems } = await supabaseAdmin
      .from("portfolio_items")
      .select("title, description, tags")
      .eq("user_id", user.id)

    if (!portfolioItems || portfolioItems.length === 0) {
      return NextResponse.json({
        score: 0,
        clarity: 0,
        differentiation: 0,
        clientRelevance: 0,
        suggestions: ["Add portfolio items to get a strength score"]
      })
    }

    const strength = await evaluatePortfolioStrength(portfolioItems)
    return NextResponse.json(strength)
  } catch (error: any) {
    console.error("Portfolio intelligence error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to evaluate portfolio" },
      { status: 500 }
    )
  }
}

