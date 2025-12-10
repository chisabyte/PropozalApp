/**
 * Smart CTA Generation by Platform
 * Feature 13: Smart CTA Generation (By Platform)
 */

import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export interface CTASuggestion {
  primary: string
  secondary?: string
  tone: string
  reasoning: string
}

const PLATFORM_CTA_GUIDANCE: Record<string, string> = {
  Upwork: `UPWORK CTA STRATEGY:
- Friendly connection tone
- Offer value-first action (free audit, strategy call, wireframe)
- Avoid generic "let me know" or "contact me"
- Be specific about next step
- Emphasize quick response time
- Example: "I'd love to schedule a 15-minute discovery call to discuss your project goals and share some initial ideas. Would Tuesday work for you?"`,

  Fiverr: `FIVERR CTA STRATEGY:
- Action-focused, direct tone
- Emphasize speed and delivery
- Clear next step (order now, message me)
- Include revision policy mention
- Example: "Ready to get started? Click 'Order Now' and I'll begin work within 24 hours. I offer unlimited revisions until you're 100% satisfied."`,

  LinkedIn: `LINKEDIN CTA STRATEGY:
- Professional, partnership-oriented tone
- Focus on long-term value
- Executive-level language
- Suggest strategic discussion
- Example: "I'd welcome the opportunity to discuss how we can partner to achieve your strategic objectives. Would you be available for a brief call this week to explore how we can drive measurable results?"`,

  'Direct RFP': `DIRECT RFP CTA STRATEGY:
- Formal business tone
- Professional closing
- Reference proposal submission
- Suggest next steps in process
- Example: "We're excited about the opportunity to partner with [Client Name] on this initiative. We've prepared a comprehensive proposal addressing all requirements. We're available to schedule a presentation or answer any questions at your convenience."`,

  Thumbtack: `THUMBTACK CTA STRATEGY:
- Local, personal, trustworthy tone
- Emphasize availability and response time
- Offer consultation or quote
- Example: "I'm available for a free consultation this week to discuss your project in detail. I can provide a detailed quote and answer any questions you have. What day works best for you?"`,

  Houzz: `HOUZZ CTA STRATEGY:
- Design-focused, collaborative tone
- Emphasize visual consultation
- Offer portfolio review or site visit
- Example: "I'd love to schedule a design consultation to discuss your vision and show you some relevant portfolio pieces. I'm available for in-person or virtual meetings. When would be convenient?"`,

  'Email Outreach': `EMAIL OUTREACH CTA STRATEGY:
- Brief, value-led, personal
- One clear, easy action
- Low commitment ask
- Example: "Would you be open to a quick 10-minute call this week? I'd love to share how we've helped similar companies achieve [specific outcome]."`,

  'Agency Pitch': `AGENCY PITCH CTA STRATEGY:
- Partnership mindset
- Strategic discussion framing
- Long-term vision
- Example: "We'd welcome the opportunity to present our strategic approach and discuss how we can become a long-term partner in achieving your goals. Are you available for a 30-minute strategy session next week?"`,

  Other: `GENERAL CTA STRATEGY:
- Match the formality of the request
- Clear, specific next step
- Appropriate tone for context
- Example: "I'd love to discuss this opportunity further. Would you be available for a call this week?"`
}

export async function generateSmartCTA(
  platform: string,
  proposalContent: string,
  rfpText: string
): Promise<CTASuggestion> {
  if (!openai) {
    // Fallback to static guidance
    const guidance = PLATFORM_CTA_GUIDANCE[platform] || PLATFORM_CTA_GUIDANCE.Other
    return {
      primary: "I'd love to discuss this opportunity further. Would you be available for a call this week?",
      tone: "professional",
      reasoning: guidance
    }
  }

  const platformGuidance = PLATFORM_CTA_GUIDANCE[platform] || PLATFORM_CTA_GUIDANCE.Other

  const prompt = `You are a conversion optimization expert. Generate the perfect call-to-action (CTA) for this proposal.

## PLATFORM: ${platform}

## PLATFORM CTA GUIDANCE
${platformGuidance}

## PROPOSAL CONTENT (excerpt)
${proposalContent.slice(0, 1000)}

## ORIGINAL REQUEST
${rfpText.slice(0, 500)}

Generate a primary CTA and optional secondary CTA that:
1. Matches the platform tone
2. Is specific and actionable
3. Offers clear value
4. Is appropriate for the context

Output JSON:
{
  "primary": "Primary CTA text",
  "secondary": "Optional secondary CTA",
  "tone": "friendly|professional|formal|casual",
  "reasoning": "Brief explanation of why this CTA works"
}`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: 'system', content: 'You are a conversion optimization expert. Output valid JSON only.' },
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
    console.error('CTA generation failed, using fallback:', error)
  }

  // Fallback
  return {
    primary: "I'd love to discuss this opportunity further. Would you be available for a call this week?",
    tone: "professional",
    reasoning: platformGuidance
  }
}

