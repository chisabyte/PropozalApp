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

    // Use admin client to bypass RLS since we're using Clerk auth
    const supabaseAdmin = getSupabaseAdmin()
    const { data: portfolioItems, error } = await supabaseAdmin
      .from("portfolio_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch portfolio items" },
        { status: 500 }
      )
    }

    return NextResponse.json(portfolioItems || [])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch portfolio" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
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
    const { title, description, tags, industry, use_in_proposals, image_url } = body

    // Use admin client to bypass RLS since we're using Clerk auth
    const supabaseAdmin = getSupabaseAdmin()

    // Check portfolio limit
    const { count } = await supabaseAdmin
      .from("portfolio_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if ((count || 0) >= 10) {
      return NextResponse.json(
        { error: "Maximum 10 portfolio items allowed" },
        { status: 400 }
      )
    }

    // Always generate an image URL - use provided one or generate based on industry
    let finalImageUrl = image_url?.trim() || ""
    if (!finalImageUrl) {
      // Always generate a reliable image based on industry (or "Other" if no industry)
      finalImageUrl = generateReliableImageUrl(title || "project", industry || "Other")
      console.log("Generated image URL:", finalImageUrl, "for industry:", industry || "Other")
    }

    // Ensure we always have an image URL
    if (!finalImageUrl) {
      finalImageUrl = generateReliableImageUrl("project", "Other")
    }

    const insertData = {
      user_id: user.id,
      title,
      description,
      tags: tags || [],
      industry: industry || null,
      use_in_proposals: use_in_proposals !== undefined ? use_in_proposals : true,
      image_url: finalImageUrl, // Always set image_url, never null
    }

    console.log("Creating portfolio item with data:", { 
      ...insertData, 
      user_id: "[hidden]",
      image_url: finalImageUrl.substring(0, 50) + "..."
    })

    const { data: portfolioItem, error } = await supabaseAdmin
      .from("portfolio_items")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("Database error creating portfolio item:", error)
      return NextResponse.json(
        { error: error.message || "Failed to create portfolio item" },
        { status: 500 }
      )
    }

    console.log("Portfolio item created successfully:", portfolioItem?.id)
    return NextResponse.json(portfolioItem)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create portfolio item" },
      { status: 500 }
    )
  }
}

