/**
 * AI Ecosystem Tools - Follow-Up Email Generator
 * Feature 15: AI Ecosystem Tools
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import OpenAI from "openai"
import { z } from "zod"

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const followUpSchema = z.object({
  proposalId: z.string().uuid().optional(),
  clientName: z.string().optional(),
  proposalTitle: z.string().optional(),
  daysSinceSent: z.number().optional(),
  context: z.string().optional(),
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

    // Check plan (Starter+ only)
    const supabaseAdmin = getSupabaseAdmin()
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (!subscription || subscription.plan_id === "free") {
      return NextResponse.json(
        { error: "This feature requires Starter or Pro plan" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validated = followUpSchema.parse(body)

    if (!openai) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      )
    }

    // Get proposal context if proposalId provided
    let proposalContext = ""
    if (validated.proposalId) {
      const { data: proposal } = await supabaseAdmin
        .from("proposals")
        .select("title, generated_proposal, rfp_text")
        .eq("id", validated.proposalId)
        .eq("user_id", user.id)
        .single()

      if (proposal) {
        proposalContext = `Proposal: ${proposal.title}\n${proposal.generated_proposal.slice(0, 500)}`
      }
    }

    const prompt = `You are a professional email writer. Generate a follow-up email for a proposal.

${validated.clientName ? `Client Name: ${validated.clientName}` : ''}
${validated.proposalTitle ? `Proposal: ${validated.proposalTitle}` : ''}
${validated.daysSinceSent ? `Days since sent: ${validated.daysSinceSent}` : 'Recently sent'}
${proposalContext ? `\nProposal Context:\n${proposalContext}` : ''}
${validated.context ? `\nAdditional Context:\n${validated.context}` : ''}

Generate a professional, friendly follow-up email that:
- Is brief and respectful
- Adds value (insight, resource, or update)
- Has a clear, low-pressure CTA
- Maintains professional tone

Output JSON:
{
  "subject": "Email subject line",
  "body": "Email body text",
  "tone": "professional|friendly|casual"
}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: 'system', content: 'You are a professional email writer. Output valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: "Failed to generate email" },
        { status: 500 }
      )
    }

    const emailData = JSON.parse(content)

    // Save usage
    await supabaseAdmin.from("tool_usage").insert({
      user_id: user.id,
      tool_type: "follow_up_email",
      input_data: validated,
      output_data: emailData,
    })

    return NextResponse.json(emailData)
  } catch (error: any) {
    console.error("Follow-up email generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate email" },
      { status: 500 }
    )
  }
}

