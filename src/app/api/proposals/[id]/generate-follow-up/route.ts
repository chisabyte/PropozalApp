/**
 * Generate Follow-Up Message API
 * Uses AI to generate professional follow-up messages for proposals
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface FollowUpRequest {
  tone: string
  mention_engagement: boolean
  offer_questions: boolean
  offer_call: boolean
  mention_availability: boolean
  mention_timeline: boolean
  additional_context: string
}

const TONE_DESCRIPTIONS: Record<string, string> = {
  friendly_checkin: "warm, friendly, and approachable - like checking in with a colleague",
  professional_reminder: "formal, business-like, and respectful of their time",
  value_reinforcement: "focused on highlighting the value and benefits you can provide",
  urgent: "creating gentle urgency without being pushy - mentioning time-sensitive factors",
  casual: "relaxed, personable, and conversational - like texting a friend",
}

export async function POST(
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

    const proposalId = params.id
    const body: FollowUpRequest = await req.json()
    const {
      tone,
      mention_engagement,
      offer_questions,
      offer_call,
      mention_availability,
      mention_timeline,
      additional_context,
    } = body

    const supabase = getSupabaseAdmin()

    // Fetch the proposal
    const { data: proposal, error: fetchError } = await supabase
      .from("proposals")
      .select("*, users(full_name, company_name, email)")
      .eq("id", proposalId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      )
    }

    // Get engagement data if available
    const { data: engagements } = await supabase
      .from("proposal_engagement")
      .select("last_view_at, total_time_spent, scroll_depth_max")
      .eq("proposal_id", proposalId)
      .order("last_view_at", { ascending: false })
      .limit(1)

    const lastEngagement = engagements?.[0]
    const hasEngagement = !!lastEngagement

    // Build the AI prompt
    const toneDescription = TONE_DESCRIPTIONS[tone] || TONE_DESCRIPTIONS.friendly_checkin

    let contextParts: string[] = []
    
    if (mention_engagement && hasEngagement) {
      contextParts.push(`- Naturally mention they viewed the proposal (e.g. "saw you had a chance to look at the proposal")`)
    }
    if (offer_questions) {
      contextParts.push(`- Offer to answer any questions they might have`)
    }
    if (offer_call) {
      contextParts.push(`- Suggest a quick 15-min call`)
    }
    if (mention_availability) {
      contextParts.push(`- Mention limited spots/timeline`)
    }
    if (mention_timeline) {
      contextParts.push(`- Reference project timeline`)
    }
    if (additional_context) {
      contextParts.push(`- Additional context: ${additional_context}`)
    }

    const prompt = `You are writing a follow-up email for a freelancer/agency who sent a proposal.

CONTEXT:
Project: "${proposal.title}"
Platform: ${proposal.platform || "Direct client"}
Sent: ${proposal.sent_at ? Math.floor((Date.now() - new Date(proposal.sent_at).getTime()) / (1000 * 60 * 60 * 24)) : "a few"} days ago
${proposal.client_name ? `Client name: ${proposal.client_name}` : ""}
${hasEngagement ? `Client viewed: ${lastEngagement.total_time_spent ? Math.round(lastEngagement.total_time_spent / 60) + ' mins' : 'Yes'} (last viewed ${Math.floor((Date.now() - new Date(lastEngagement.last_view_at).getTime()) / (1000 * 60 * 60 * 24))} days ago)` : "Client has not viewed yet"}

TONE: ${toneDescription}

REQUIREMENTS:
Length: 3-5 sentences maximum (short and respectful of their time)
${contextParts.length > 0 ? contextParts.join("\n") : ""}

RULES:
NO generic corporate speak
NO desperation or pushiness
NO discounting or price negotiations (unless explicitly mentioned)
Be human, warm, and professional
Focus on THEIR needs, not yours
End with a clear, easy next step

Write the follow-up email. Subject line + body.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
SUBJECT: [Your subject line here]

BODY:
[Your email body here]`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert at writing professional, effective follow-up messages that get responses without being pushy. You write in a natural, human voice.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const generatedMessage = completion.choices[0]?.message?.content?.trim()

    if (!generatedMessage) {
      return NextResponse.json(
        { error: "Failed to generate follow-up message" },
        { status: 500 }
      )
    }

    // Parse subject and body from response
    let emailSubject = ""
    let emailBody = ""
    
    const subjectMatch = generatedMessage.match(/SUBJECT:\s*(.+?)(?:\n|$)/i)
    const bodyMatch = generatedMessage.match(/BODY:\s*([\s\S]+)/i)
    
    if (subjectMatch && bodyMatch) {
      emailSubject = subjectMatch[1].trim()
      emailBody = bodyMatch[1].trim()
    } else {
      // Fallback: use first line as subject, rest as body
      emailSubject = `Following up: ${proposal.title}`
      emailBody = generatedMessage
    }

    // Create preview (first 50 chars of body)
    const preview = emailBody.substring(0, 50).replace(/\n/g, " ") + (emailBody.length > 50 ? "..." : "")

    // Track that a follow-up was generated
    await supabase
      .from("proposals")
      .update({
        last_follow_up_at: new Date().toISOString(),
        follow_up_count: (proposal.follow_up_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposalId)

    // Save to proposal_followups table
    const { data: followup, error: followupError } = await supabase
      .from("proposal_followups")
      .insert({
        proposal_id: proposalId,
        user_id: user.id,
        tone,
        subject: emailSubject,
        body: emailBody,
        mention_engagement: mention_engagement,
        additional_context: additional_context || null,
      })
      .select()
      .single()

    if (followupError) {
      console.error("Error saving follow-up:", followupError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      subject: emailSubject,
      body: emailBody,
      preview,
      followup_id: followup?.id || null,
      tone,
      proposal_title: proposal.title,
    })
  } catch (error: any) {
    console.error("Generate follow-up error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate follow-up" },
      { status: 500 }
    )
  }
}

// PATCH endpoint to mark follow-up as sent
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
    const { followup_id } = body

    if (!followup_id) {
      return NextResponse.json({ error: "followup_id required" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Update the follow-up as sent
    const { error } = await supabase
      .from("proposal_followups")
      .update({
        sent_at: new Date().toISOString(),
      })
      .eq("id", followup_id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error marking follow-up as sent:", error)
      return NextResponse.json({ error: "Failed to update follow-up" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Mark follow-up sent error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to mark follow-up as sent" },
      { status: 500 }
    )
  }
}
