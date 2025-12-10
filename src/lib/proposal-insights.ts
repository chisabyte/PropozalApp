/**
 * AI Insights: "Why This Proposal Will Win"
 * Feature 10: AI Insights Generator
 */

import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export interface ProposalInsights {
  strengths: string[]
  weaknesses: string[]
  hiddenNeeds: string[]
  recommendations: string[]
  winProbability: number
  overallAssessment: string
}

export async function generateProposalInsights(
  proposalContent: string,
  rfpText: string,
  platform: string
): Promise<ProposalInsights> {
  if (!openai) throw new Error('OpenAI API key not configured')

  const prompt = `You are an expert proposal reviewer. Analyze this proposal and provide strategic insights.

## ORIGINAL REQUEST (RFP)
"""
${rfpText}
"""

## GENERATED PROPOSAL
"""
${proposalContent}
"""

## PLATFORM
${platform}

Analyze this proposal and provide:
1. STRENGTHS: What makes this proposal strong? (3-5 points)
2. WEAKNESSES: What could be improved? (2-4 points)
3. HIDDEN NEEDS: What client needs might not be explicitly stated but are implied? (2-3 points)
4. RECOMMENDATIONS: Specific actions to improve win probability (3-5 recommendations)
5. WIN PROBABILITY: Estimate 0-100% chance of winning
6. OVERALL ASSESSMENT: 2-3 sentence summary

Output JSON:
{
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "hiddenNeeds": ["Need 1", "Need 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "winProbability": 75,
  "overallAssessment": "Brief assessment"
}`

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: 'system', content: 'You are an expert proposal reviewer. Output valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Failed to generate insights')

  return JSON.parse(content)
}

