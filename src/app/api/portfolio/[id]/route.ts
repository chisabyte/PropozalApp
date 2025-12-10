import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"

/**
 * Generate a reliable image URL using Picsum Photos with industry-based seed
 * This ensures consistent images for the same industry
 */
function generateReliableImageUrl(title: string | null | undefined, industry: string | null | undefined): string {
  // Create a consistent seed based on industry and title
  const industrySeed = (industry || "other").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const titleSeed = (title || "project").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const seed = industrySeed + titleSeed
  
  // Use Picsum Photos with seed for consistent, reliable images
  return `https://picsum.photos/seed/${seed}/800/600`
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

    // Use admin client to bypass RLS since we're using Clerk auth
    const supabaseAdmin = getSupabaseAdmin()

    // Ensure image_url is always set - use provided one or generate based on industry
    let imageUrl = body.image_url?.trim() || ""
    if (!imageUrl) {
      // Generate a reliable image based on industry (or "Other" if no industry)
      imageUrl = generateReliableImageUrl(body.title || "project", body.industry || "Other")
    }

    // Ensure we always have an image URL
    if (!imageUrl) {
      imageUrl = generateReliableImageUrl("project", "Other")
    }

    const { error } = await supabaseAdmin
      .from("portfolio_items")
      .update({
        title: body.title,
        description: body.description,
        tags: body.tags || [],
        industry: body.industry || null,
        use_in_proposals: body.use_in_proposals !== undefined ? body.use_in_proposals : true,
        image_url: imageUrl, // Always set image_url, never null
      })
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json(
        { error: "Failed to update portfolio item" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update portfolio item" },
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

    // Use admin client to bypass RLS since we're using Clerk auth
    const supabaseAdmin = getSupabaseAdmin()

    // Check minimum portfolio items
    const { count } = await supabaseAdmin
      .from("portfolio_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if ((count || 0) <= 2) {
      return NextResponse.json(
        { error: "You must have at least 2 portfolio items" },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from("portfolio_items")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete portfolio item" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete portfolio item" },
      { status: 500 }
    )
  }
}

