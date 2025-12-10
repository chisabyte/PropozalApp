import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"

export async function GET(
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

    // Use admin client to bypass RLS (we verify ownership with user_id check)
    const supabase = getSupabaseAdmin()
    const { data: proposal, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("Error fetching proposal:", error)
      return NextResponse.json(
        { error: "Proposal not found", details: error.message },
        { status: 404 }
      )
    }

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      )
    }

    // Check if proposal has been viewed
    const { count } = await supabase
      .from("proposal_engagement")
      .select("*", { count: "exact", head: true })
      .eq("proposal_id", proposal.id)

    return NextResponse.json({
      ...proposal,
      has_been_viewed: (count || 0) > 0
    })
  } catch (error: any) {
    console.error("Fetch proposal error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch proposal" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    // Use admin client to bypass RLS
    const supabase = getSupabaseAdmin()

    const { data: proposal, error: fetchError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      )
    }

    const { error: updateError } = await supabase
      .from("proposals")
      .update({
        generated_proposal: body.content || proposal.generated_proposal,
        title: body.title || proposal.title,
        status: body.status || proposal.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (updateError) {
      console.error("Error updating proposal:", updateError)
      return NextResponse.json(
        { error: "Failed to update proposal" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Update proposal error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update proposal" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Use admin client to bypass RLS
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from("proposals")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting proposal:", error)
      return NextResponse.json(
        { error: "Failed to delete proposal" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete proposal error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete proposal" },
      { status: 500 }
    )
  }
}

