/**
 * Templates API
 * Returns user's saved proposal templates
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

    // Get templates (proposals marked as templates)
    const { data: templates, error } = await supabase
      .from("proposals")
      .select("id, title, platform, tone, clone_count, status, template_category")
      .eq("user_id", user.id)
      .eq("is_template", true)
      .order("clone_count", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error fetching templates:", error)
      return NextResponse.json({ templates: [] })
    }

    return NextResponse.json({ templates: templates || [] })
  } catch (error: any) {
    console.error("Templates error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch templates" },
      { status: 500 }
    )
  }
}
