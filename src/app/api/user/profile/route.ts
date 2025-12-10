import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { createServerClient, getSupabaseAdmin } from "@/lib/db"

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

    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
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
    const supabase = createServerClient()

    const { error } = await supabase
      .from("users")
      .update({
        full_name: body.fullName || null,
        company_name: body.companyName || null,
        industry: body.industry || null,
        tone_preference: body.tonePreference || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Use admin client to delete all user data
    const supabaseAdmin = getSupabaseAdmin()

    // Delete all user data (cascade will handle related records)
    const { error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", user.id)

    if (error) {
      console.error("Error deleting user:", error)
      return NextResponse.json(
        { error: "Failed to delete account data" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in DELETE /api/user/profile:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete account" },
      { status: 500 }
    )
  }
}

