import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { createServerClient, getSupabaseAdmin } from "@/lib/db"
import { getOrCreateUser } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { companyName, industry, portfolioItems, tonePreference } = body

    const supabase = createServerClient()
    const supabaseAdmin = getSupabaseAdmin() // Use admin client for RLS bypass

    // Get or create user
    let user
    try {
      user = await getOrCreateUser(userId)
    } catch (error: any) {
      console.error('Error in getOrCreateUser:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create user' },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get or create user' },
        { status: 500 }
      )
    }

    // Update user with onboarding data + set FREE plan as default (P1.5)
    const { error: userError } = await supabaseAdmin
      .from("users")
      .update({
        company_name: companyName || null,
        industry: industry,
        tone_preference: tonePreference || null,
        plan: 'free',                    // P1.5: Default to free plan
        proposal_quota_monthly: 3,       // P1.5: 3 proposals/month
        plan_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (userError) {
      console.error("Error updating user:", userError)
      return NextResponse.json(
        { error: `Failed to update user: ${userError.message || JSON.stringify(userError)}` },
        { status: 500 }
      )
    }

    // Check if user already has portfolio items (to avoid duplicates)
    const { data: existingPortfolio } = await supabaseAdmin
      .from("portfolio_items")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)

    // Insert portfolio items only if they don't exist (use admin to bypass RLS)
    if (portfolioItems && portfolioItems.length > 0 && !existingPortfolio?.length) {
      console.log('Inserting portfolio items for user:', user.id)

      const portfolioData = portfolioItems.map((item: any) => ({
        user_id: user.id,
        title: item.title,
        description: item.description,
        tags: item.tags || [],
      }))

      const { data: insertedData, error: portfolioError } = await supabaseAdmin
        .from("portfolio_items")
        .insert(portfolioData)
        .select()

      if (portfolioError) {
        console.error("Error inserting portfolio items:", portfolioError)
        return NextResponse.json(
          { error: `Failed to save portfolio items: ${portfolioError.message || JSON.stringify(portfolioError)}` },
          { status: 500 }
        )
      }

      console.log('Successfully inserted portfolio items:', insertedData)
    }

    // P1.5: Do NOT create a subscription for free users
    // Subscriptions are only created when user upgrades via Stripe checkout
    // This removes the old "trial" subscription logic

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to complete onboarding" },
      { status: 500 }
    )
  }
}
