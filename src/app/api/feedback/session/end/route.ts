import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { FeedbackChatbot } from "@/lib/feedback-chatbot"
import { z } from "zod"

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
    const { sessionId } = z.object({ sessionId: z.string().uuid() }).parse(body)

    const supabase = getSupabaseAdmin()

    // Get session and messages
    const { data: session, error: sessionError } = await supabase
      .from("feedback_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    const { data: messages, error: messagesError } = await supabase
      .from("feedback_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (messagesError) {
      console.error("Error fetching messages:", messagesError)
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      )
    }

    // Format messages for analysis
    const conversationHistory = (messages || []).map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content: msg.content,
      timestamp: new Date(msg.created_at),
    }))

    // Analyze feedback
    const analysis = await FeedbackChatbot.analyzeFeedback(conversationHistory)

    // Update session with analysis
    const { error: updateError } = await supabase
      .from("feedback_sessions")
      .update({
        category: analysis.category,
        sentiment: analysis.sentiment,
        priority: analysis.priority,
        keywords: analysis.keywords,
        summary: analysis.summary,
        requires_follow_up: analysis.requiresFollowUp,
        resolved: false, // Admin will mark as resolved
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)

    if (updateError) {
      console.error("Error updating session:", updateError)
      throw updateError
    }

    // Send email notification if needed
    if (FeedbackChatbot.shouldNotify(analysis)) {
      const adminEmail =
        process.env.ADMIN_EMAIL || process.env.FEEDBACK_EMAIL || "admin@propozzy.com"
      const conversationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/feedback/${sessionId}`

      await FeedbackChatbot.sendNotification({
        to: adminEmail,
        userName: session.user_name || undefined,
        userEmail: session.user_email || undefined,
        category: analysis.category,
        priority: analysis.priority,
        summary: analysis.summary,
        conversationUrl,
      })
    }

    return NextResponse.json({
      success: true,
      analysis,
      message:
        "Thank you for your feedback! Our team will review it shortly.",
    })
  } catch (error: any) {
    console.error("End session error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to end session" },
      { status: 500 }
    )
  }
}

