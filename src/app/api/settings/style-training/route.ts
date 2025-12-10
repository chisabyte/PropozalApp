/**
 * Writing Style Training API
 * Feature 6: Prompt Memory ("Write Like Me" Mode)
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

const styleTrainingSchema = z.object({
  proposalIds: z.array(z.string().uuid()).min(2).max(3),
  profileName: z.string().min(1),
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
    const validated = styleTrainingSchema.parse(body)

    const supabaseAdmin = getSupabaseAdmin()

    // Get the proposal contents
    const { data: proposals } = await supabaseAdmin
      .from("proposals")
      .select("generated_proposal, rfp_text")
      .in("id", validated.proposalIds)
      .eq("user_id", user.id)

    if (!proposals || proposals.length < 2) {
      return NextResponse.json(
        { error: "Could not find the specified proposals" },
        { status: 404 }
      )
    }

    if (!openai) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      )
    }

    // Extract writing patterns using AI
    const proposalsText = proposals.map((p, i) => 
      `Proposal ${i + 1}:\n${p.generated_proposal}`
    ).join("\n\n---\n\n")

    const prompt = `You are a writing style analyst. Analyze these proposals and extract the user's unique writing patterns.

## USER'S PROPOSALS
${proposalsText}

Extract:
1. Sentence structure patterns (short vs long, simple vs complex)
2. Tone characteristics (formal, casual, technical, etc.)
3. Vocabulary preferences (specific words/phrases they use)
4. Paragraph organization style
5. Opening/closing patterns
6. Any unique stylistic elements

Output JSON:
{
  "sentenceStructure": "description",
  "toneCharacteristics": ["characteristic1", "characteristic2"],
  "vocabularyPreferences": ["word1", "phrase1"],
  "paragraphStyle": "description",
  "openingPatterns": "description",
  "closingPatterns": "description",
  "uniqueElements": ["element1", "element2"]
}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: 'system', content: 'You are a writing style analyst. Output valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: "Failed to extract writing patterns" },
        { status: 500 }
      )
    }

    const writingPatterns = JSON.parse(content)

    // Save style profile
    const { data: styleProfile } = await supabaseAdmin
      .from("style_profiles")
      .insert({
        user_id: user.id,
        profile_name: validated.profileName,
        writing_patterns: writingPatterns,
        sample_proposals: validated.proposalIds,
      })
      .select()
      .single()

    return NextResponse.json(styleProfile)
  } catch (error: any) {
    console.error("Style training error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to train style profile" },
      { status: 500 }
    )
  }
}

