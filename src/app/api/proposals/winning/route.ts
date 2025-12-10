/**
 * Winning Proposals API
 * Returns user's winning proposals for the "Reuse Your Winners" widget
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"

export const dynamic = 'force-dynamic'

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

    const supabase = getSupabaseAdmin()

    // Get winning proposals, sorted by project value
    const { data: proposals, error } = await supabase
      .from("proposals")
      .select("id, title, platform, project_value_actual, won_at, clone_count")
      .eq("user_id", user.id)
      .eq("status", "won")
      .order("project_value_actual", { ascending: false, nullsFirst: false })
      .limit(10)

    if (error) {
      console.error("Error fetching winning proposals:", error)
      return NextResponse.json({ proposals: [] })
    }

    return NextResponse.json({ proposals: proposals || [] })
  } catch (error: any) {
    console.error("Winning proposals error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch winning proposals" },
      { status: 500 }
    )
  }
}
