import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { FeedbackChatbot } from "@/lib/feedback-chatbot"
import { z } from "zod"

const SendMessageSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(2000),
})

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
    const { sessionId, message } = SendMessageSchema.parse(body)

    const supabase = getSupabaseAdmin()

    // Verify session belongs to user
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

    // Check rate limit
    const rateLimitCheck = await FeedbackChatbot.checkRateLimit(userId, supabase)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          resetTime: rateLimitCheck.resetTime,
        },
        { status: 429 }
      )
    }

    // Save user message
    const { error: userMsgError } = await supabase
      .from("feedback_messages")
      .insert({
        session_id: sessionId,
        role: "user",
        content: message,
      })

    if (userMsgError) {
      console.error("Error saving user message:", userMsgError)
      throw userMsgError
    }

    // Get conversation history
    const { data: messages } = await supabase
      .from("feedback_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    // Format messages for chatbot
    const conversationHistory = (messages || []).map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content: msg.content,
      timestamp: new Date(msg.created_at),
    }))

    // Generate bot response
    const botResponse = await FeedbackChatbot.generateResponse(
      conversationHistory,
      message
    )

    // Save bot response
    const { error: botMsgError } = await supabase
      .from("feedback_messages")
      .insert({
        session_id: sessionId,
        role: "assistant",
        content: botResponse,
      })

    if (botMsgError) {
      console.error("Error saving bot message:", botMsgError)
      throw botMsgError
    }

    // Update session timestamp
    await supabase
      .from("feedback_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId)

    return NextResponse.json({
      success: true,
      botResponse,
      remainingMessages: rateLimitCheck.remainingMessages,
    })
  } catch (error: any) {
    console.error("Message error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    )
  }
}

