import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"

export async function GET() {
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
    const { data: proposals } = await supabaseAdmin
      .from("proposals")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    return NextResponse.json(proposals || [])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch proposals" },
      { status: 500 }
    )
  }
}

