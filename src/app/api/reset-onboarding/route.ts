import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getSupabaseAdmin } from "@/lib/db"

// Temporary endpoint to reset onboarding for testing
export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Reset user's onboarding fields
    const { error: userError } = await supabaseAdmin
      .from("users")
      .update({
        industry: null,
        company_name: null,
        tone_preference: null,
        updated_at: new Date().toISOString(),
      })
      .eq("clerk_user_id", userId)

    if (userError) {
      console.error("Error resetting user:", userError)
      return NextResponse.json(
        { error: "Failed to reset onboarding" },
        { status: 500 }
      )
    }

    // Delete portfolio items
    const { error: portfolioError } = await supabaseAdmin
      .from("portfolio_items")
      .delete()
      .eq("user_id", (await supabaseAdmin
        .from("users")
        .select("id")
        .eq("clerk_user_id", userId)
        .single()).data?.id)

    if (portfolioError) {
      console.error("Error deleting portfolio items:", portfolioError)
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding reset successfully. You can now go through onboarding again."
    })
  } catch (error: any) {
    console.error("Reset onboarding error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to reset onboarding" },
      { status: 500 }
    )
  }
}
