/**
 * AI Pricing Table & Timeline Generator
 * Feature 3: AI Pricing Table & Timeline Generator
 */

import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export interface PricingTier {
  name: string
  price: number
  features: string[]
  description: string
}

export interface TimelineMilestone {
  phase: string
  duration: string
  deliverables: string[]
  dependencies?: string[]
}

export interface PricingTableData {
  tiers: PricingTier[]
  currency: string
  notes?: string
}

export interface TimelineData {
  milestones: TimelineMilestone[]
  totalDuration: string
  startDate?: string
}

export async function generatePricingTable(
  rfpText: string,
  projectValue?: number,
  extractedRequirements?: string[]
): Promise<PricingTableData> {
  if (!openai) throw new Error('OpenAI API key not configured')

  const prompt = `You are a pricing strategist. Analyze this project request and create a pricing table with 3 tiers: Basic, Standard, Premium.

## PROJECT REQUEST
"""
${rfpText}
"""

${projectValue ? `## ESTIMATED PROJECT VALUE
$${projectValue}
` : ''}

${extractedRequirements ? `## REQUIREMENTS
${extractedRequirements.join(', ')}
` : ''}

Create a pricing table with 3 tiers that makes sense for this project. Each tier should have:
- Name (Basic, Standard, Premium)
- Price (in USD)
- 3-5 key features
- Brief description

Output JSON matching this structure:
{
  "tiers": [
    {
      "name": "Basic",
      "price": 1000,
      "features": ["Feature 1", "Feature 2"],
      "description": "Brief description"
    }
  ],
  "currency": "USD",
  "notes": "Optional pricing notes"
}`

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: 'system', content: 'You are a pricing strategist. Output valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Failed to generate pricing table')

  return JSON.parse(content)
}

export async function generateTimeline(
  rfpText: string,
  extractedDeliverables?: string[],
  extractedTimeline?: string
): Promise<TimelineData> {
  if (!openai) throw new Error('OpenAI API key not configured')

  const prompt = `You are a project manager. Analyze this project request and create a milestone-based timeline.

## PROJECT REQUEST
"""
${rfpText}
"""

${extractedDeliverables ? `## DELIVERABLES
${extractedDeliverables.join(', ')}
` : ''}

${extractedTimeline ? `## CLIENT TIMELINE REQUIREMENT
${extractedTimeline}
` : ''}

Create a realistic timeline with 3-5 milestones. Each milestone should have:
- Phase name
- Duration (e.g., "2 weeks", "1 month")
- Deliverables (array of 2-4 items)
- Optional dependencies

Output JSON matching this structure:
{
  "milestones": [
    {
      "phase": "Phase 1: Discovery",
      "duration": "2 weeks",
      "deliverables": ["Deliverable 1", "Deliverable 2"],
      "dependencies": []
    }
  ],
  "totalDuration": "8 weeks"
}`

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: 'system', content: 'You are a project manager. Output valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Failed to generate timeline')

  return JSON.parse(content)
}

