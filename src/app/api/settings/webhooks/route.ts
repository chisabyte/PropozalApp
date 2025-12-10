import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import crypto from "crypto"

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = getSupabaseAdmin()
    
    // Get settings
    const { data: settings } = await supabase
      .from("webhook_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      
    // Get recent deliveries
    const { data: deliveries } = await supabase
      .from("webhook_deliveries")
      .select("*")
      .eq("user_id", userId)
      .order("delivered_at", { ascending: false })
      .limit(20)

    return NextResponse.json({
      settings: settings || null,
      deliveries: deliveries || []
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const body = await req.json()
    const { webhook_url, events, enabled } = body
    
    const supabase = getSupabaseAdmin()
    
    // Check if settings exist
    const { data: existing } = await supabase
      .from("webhook_settings")
      .select("id, secret")
      .eq("user_id", userId)
      .maybeSingle()
      
    let result
    
    if (existing) {
      // Update
      result = await supabase
        .from("webhook_settings")
        .update({
          webhook_url,
          events,
          enabled,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)
        .select()
        .single()
    } else {
      // Create
      const secret = crypto.randomBytes(32).toString("hex")
      result = await supabase
        .from("webhook_settings")
        .insert({
          user_id: userId,
          webhook_url,
          events,
          enabled,
          secret
        })
        .select()
        .single()
    }
    
    if (result.error) throw result.error
    
    return NextResponse.json(result.data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
