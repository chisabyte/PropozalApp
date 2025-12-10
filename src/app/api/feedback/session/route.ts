import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { clerkClient } from "@clerk/nextjs/server"

// Get or create feedback session
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

    const supabase = getSupabaseAdmin()

    // Get most recent unresolved session or create new one
    const { data: existingSession } = await supabase
      .from("feedback_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingSession) {
      // Get messages for existing session
      const { data: messages } = await supabase
        .from("feedback_messages")
        .select("*")
        .eq("session_id", existingSession.id)
        .order("created_at", { ascending: true })

      return NextResponse.json({
        session: existingSession,
        messages: messages || [],
      })
    }

    // Get user info from Clerk
    let clerkUser
    try {
      clerkUser = await clerkClient().users.getUser(userId)
    } catch (error) {
      console.warn("Failed to fetch Clerk user:", error)
    }

    const userName = clerkUser?.firstName && clerkUser?.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
      : clerkUser?.firstName || user.full_name || null

    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || user.email || null

    // Create new session
    const { data: newSession, error } = await supabase
      .from("feedback_sessions")
      .insert({
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        resolved: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating session:", error)
      throw error
    }

    // Add initial bot message
    const { error: msgError } = await supabase
      .from("feedback_messages")
      .insert({
        session_id: newSession.id,
        role: "assistant",
        content:
          "Hi! I'm here to help. Whether you've found a bug, have a feature idea, or just want to share feedback—I'm all ears. What's on your mind?",
      })

    if (msgError) {
      console.error("Error creating initial message:", msgError)
    }

    // Fetch messages
    const { data: messages } = await supabase
      .from("feedback_messages")
      .select("*")
      .eq("session_id", newSession.id)
      .order("created_at", { ascending: true })

    return NextResponse.json({
      session: newSession,
      messages: messages || [],
    })
  } catch (error: any) {
    console.error("Session error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create session" },
      { status: 500 }
    )
  }
}

