/**
 * AI Portfolio Intelligence
 * Feature 5: Portfolio Strength Scoring
 */

import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export interface PortfolioStrengthScore {
  score: number // 0-100
  clarity: number // 0-10
  differentiation: number // 0-10
  clientRelevance: number // 0-10
  suggestions: string[]
}

export async function evaluatePortfolioStrength(
  portfolioItems: Array<{ title: string; description: string; tags: string[] }>
): Promise<PortfolioStrengthScore> {
  if (!openai) {
    // Fallback scoring
    return {
      score: 70,
      clarity: 7,
      differentiation: 7,
      clientRelevance: 7,
      suggestions: ["Add more specific results and metrics to your portfolio items"]
    }
  }

  const portfolioText = portfolioItems.map((item, i) => 
    `${i + 1}. ${item.title}\n   ${item.description}\n   Tags: ${item.tags.join(', ')}`
  ).join('\n\n')

  const prompt = `You are a portfolio reviewer. Evaluate this portfolio for proposal generation effectiveness.

## PORTFOLIO ITEMS
${portfolioText}

Evaluate on:
1. Clarity (1-10): How clear and specific are the descriptions?
2. Differentiation (1-10): How well do items stand out from competitors?
3. Client Relevance (1-10): How useful are these for matching to client needs?

Provide:
- Overall score (0-100)
- Individual scores for each criterion
- 3-5 specific improvement suggestions

Output JSON:
{
  "score": 75,
  "clarity": 8,
  "differentiation": 7,
  "clientRelevance": 8,
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: 'system', content: 'You are a portfolio reviewer. Output valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (content) {
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('Portfolio evaluation failed:', error)
  }

  // Fallback
  return {
    score: 70,
    clarity: 7,
    differentiation: 7,
    clientRelevance: 7,
    suggestions: ["Add more specific results and metrics to your portfolio items"]
  }
}

