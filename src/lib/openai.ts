import OpenAI from 'openai'
import { ExtractedRFP } from './rfp-extractor'
import { PROPOSAL_MODEL, MODEL_TEMPERATURES } from '@/config/ai'

export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

export interface GenerateProposalParams {
  rfpText: string
  userIndustry: string
  companyName: string | null
  portfolioItems: Array<{
    title: string
    description: string
    tags: string[]
  }>
  platform: string
  projectValue?: number
  tonePreference: string
  toneAdjustment?: 'more_formal' | 'same' | 'more_casual'
  lengthAdjustment?: 'shorter' | 'same' | 'longer'
  extractedRFP?: ExtractedRFP
  matchedPortfolioIds?: string[] // Can be UUIDs or titles - used for database storage, not filtering
}

// Industry-specific pain points and language
const INDUSTRY_INSIGHTS: Record<string, { painPoints: string[]; terminology: string[]; outcomes: string[] }> = {
  'Web Development': {
    painPoints: [
      'outdated websites that hurt credibility',
      'poor SEO visibility losing leads to competitors',
      'slow page speeds killing conversions',
      'no mobile optimization in a mobile-first world',
      'difficult-to-update content management',
      'inconsistent branding across pages',
    ],
    terminology: ['responsive design', 'Core Web Vitals', 'conversion optimization', 'SEO-ready architecture', 'headless CMS', 'performance metrics'],
    outcomes: ['90+ Lighthouse score', '3x faster load times', 'mobile-first experience', 'SEO-optimized structure', 'easy content management'],
  },
  'Marketing': {
    painPoints: [
      'inconsistent brand messaging across channels',
      'low conversion rates on landing pages',
      'poor lead tracking and attribution',
      'content that doesn\'t resonate with target audience',
      'social media presence lacking strategy',
    ],
    terminology: ['conversion funnel', 'lead generation', 'brand positioning', 'customer journey', 'A/B testing', 'ROI tracking'],
    outcomes: ['increased lead quality', 'measurable campaign ROI', 'consistent brand voice', 'data-driven decisions'],
  },
  'Construction': {
    painPoints: [
      'website doesn\'t showcase project quality',
      'hard to communicate service areas',
      'no easy way for clients to request quotes',
      'competitors outranking in local search',
      'portfolio photos not doing justice to work',
    ],
    terminology: ['project gallery', 'service area mapping', 'quote request system', 'local SEO', 'before/after showcases'],
    outcomes: ['more qualified leads', 'higher-value projects', 'professional online presence', 'local market dominance'],
  },
  'Consulting': {
    painPoints: [
      'difficulty establishing thought leadership',
      'unclear service offerings confusing prospects',
      'no system for booking consultations',
      'lack of social proof and testimonials',
      'content not demonstrating expertise',
    ],
    terminology: ['thought leadership', 'service productization', 'booking automation', 'case studies', 'expertise positioning'],
    outcomes: ['authority positioning', 'streamlined client acquisition', 'premium pricing justification', 'automated scheduling'],
  },
  'Design': {
    painPoints: [
      'portfolio not showcasing best work effectively',
      'process unclear to potential clients',
      'difficulty communicating design value',
      'no system for project inquiries',
      'brand not reflecting design capabilities',
    ],
    terminology: ['visual storytelling', 'design process', 'creative direction', 'brand identity', 'UX/UI showcase'],
    outcomes: ['portfolio that sells', 'clear design process', 'premium client attraction', 'streamlined inquiries'],
  },
  'Other': {
    painPoints: [
      'outdated online presence',
      'unclear value proposition',
      'poor user experience',
      'low search visibility',
      'difficult content management',
    ],
    terminology: ['digital transformation', 'user experience', 'conversion optimization', 'brand positioning'],
    outcomes: ['professional online presence', 'increased conversions', 'better user engagement', 'improved visibility'],
  },
}

// Platform-specific prompt templates
const PLATFORM_PROMPTS: Record<string, string> = {
  Upwork: `Platform: Upwork
- Be direct and specific—Upwork clients scan proposals quickly
- Lead with understanding of their exact problem
- Reference specific requirements from their posting
- Include concrete timeline and milestone breakdown
- Mention relevant completed projects with measurable results
- End with a clear next step (not a generic "let's connect")`,

  Fiverr: `Platform: Fiverr
- Emphasize speed and value
- Be friendly but professional
- Clearly outline what's included
- Mention revision policy
- Focus on deliverables over process`,

  Thumbtack: `Platform: Thumbtack
- Emphasize local expertise and availability
- Be personable and trustworthy
- Focus on responsiveness and reliability
- Mention relevant local projects
- Include clear pricing or quote process`,

  Houzz: `Platform: Houzz
- Lead with design expertise and aesthetic understanding
- Reference portfolio pieces relevant to their style
- Focus on visual outcomes and project transformations
- Be professional with creative flair
- Emphasize collaboration process`,

  LinkedIn: `Platform: LinkedIn
- Executive-level professionalism
- Focus on business outcomes and ROI
- Reference strategic value, not just deliverables
- Be formal and results-oriented
- Emphasize long-term partnership potential`,

  'Direct RFP': `Platform: Direct RFP
- Follow any specified format requirements
- Be comprehensive and thorough
- Address all stated requirements systematically
- Include detailed credentials and experience
- Professional, formal tone throughout`,

  Other: `Platform: General
- Match the tone of the original posting
- Be clear and professional
- Focus on understanding their specific needs
- Include relevant experience examples`,
}

export async function generateProposal(params: GenerateProposalParams): Promise<string> {
  const {
    rfpText,
    userIndustry,
    companyName,
    portfolioItems,
    platform,
    projectValue,
    tonePreference,
    toneAdjustment,
    lengthAdjustment,
    extractedRFP,
  } = params

  // Use extracted RFP data if available
  const requirements = extractedRFP?.requirements || []
  const deliverables = extractedRFP?.deliverables || []
  const clientName = extractedRFP?.clientName
  const projectType = extractedRFP?.projectType || userIndustry
  const detectedTone = extractedRFP?.tone || 'professional'
  const redFlags = extractedRFP?.redFlags || []

  // Get industry insights
  const industryKey = Object.keys(INDUSTRY_INSIGHTS).find(k => 
    userIndustry.toLowerCase().includes(k.toLowerCase()) || 
    projectType?.toLowerCase().includes(k.toLowerCase())
  ) || 'Other'
  const industryInsights = INDUSTRY_INSIGHTS[industryKey]

  // Build portfolio section with most relevant first
  const portfolioSection = portfolioItems
    .slice(0, 5) // Top 5 most relevant
    .map((item, index) => {
      const relevance = index < 3 ? '[MOST RELEVANT]' : ''
      return `${index + 1}. ${item.title} ${relevance}\n   ${item.description}\n   Skills: ${item.tags.join(', ')}`
    })
    .join('\n\n')

  // Determine tone
  let finalTone = tonePreference
  if (toneAdjustment === 'more_formal') {
    finalTone = 'Professional & Formal'
  } else if (toneAdjustment === 'more_casual') {
    finalTone = 'Friendly & Conversational'
  }

  // Adjust length
  let lengthInstruction = '600-900 words'
  if (lengthAdjustment === 'shorter') {
    lengthInstruction = '400-500 words'
  } else if (lengthAdjustment === 'longer') {
    lengthInstruction = '900-1200 words'
  }

  // Get platform-specific guidance
  const platformGuidance = PLATFORM_PROMPTS[platform] || PLATFORM_PROMPTS.Other

  // Expert-level system prompt
  const systemPrompt = `You are a senior-level ${userIndustry} professional with 10+ years of experience delivering high-quality projects. You've completed 50+ successful projects and understand the business realities your clients face.

## YOUR IDENTITY
- Expert ${userIndustry.toLowerCase()} professional
- ${companyName ? `Founder/Lead at ${companyName}` : 'Independent consultant'}
- Track record of measurable results
- Deep understanding of client industries

## WRITING STYLE RULES
1. NEVER use generic AI phrases like:
   - "I understand your needs"
   - "I'm excited about this opportunity"
   - "I believe I'm the perfect fit"
   - "Looking forward to hearing from you"
   - "Don't hesitate to reach out"

2. INSTEAD write like a real expert:
   - Reference specific industry challenges
   - Use concrete numbers and outcomes
   - Show you've done this exact work before
   - Be confident without being arrogant
   - Use natural, conversational rhythm

3. TONE: ${finalTone}
   - Confident and authoritative
   - Concise but not terse
   - Professional but human
   - Zero fluff or filler

## INDUSTRY CONTEXT
Common pain points in this space:
${industryInsights.painPoints.map(p => `- ${p}`).join('\n')}

Key terminology to use naturally:
${industryInsights.terminology.join(', ')}

Outcomes clients care about:
${industryInsights.outcomes.map(o => `- ${o}`).join('\n')}

## PLATFORM SPECIFICS
${platformGuidance}

## CRITICAL INSTRUCTIONS
- Address the client's SPECIFIC situation, not generic problems
- Reference YOUR portfolio with concrete details
- Include realistic timeline with milestones
- Justify pricing with ROI and value
- End with a specific, confident CTA (not generic "let's chat")`

  // Build the user prompt
  let userPrompt = `## CLIENT'S PROJECT REQUEST
"""
${rfpText}
"""

## EXTRACTED REQUIREMENTS
${requirements.length > 0 ? requirements.map(r => `- ${r}`).join('\n') : 'Not specified - infer from posting'}

## EXPECTED DELIVERABLES
${deliverables.length > 0 ? deliverables.map(d => `- ${d}`).join('\n') : 'Not specified - propose appropriate deliverables'}

${redFlags.length > 0 ? `## POTENTIAL CONCERNS TO ADDRESS\n${redFlags.map(r => `- ${r}`).join('\n')}\n` : ''}

## MY RELEVANT EXPERIENCE
${portfolioSection}

## PROJECT PARAMETERS
- Platform: ${platform}
- Client Name: ${clientName || 'Not specified'}
- Budget Range: ${projectValue ? `$${projectValue.toLocaleString()}` : 'To be determined'}

---

Write a polished, expert-level proposal following this EXACT structure:

### 1. PROJECT SUMMARY (2-3 sentences)
Hook them immediately. Show you understand their specific situation. No generic openings.

### 2. UNDERSTANDING YOUR GOALS
${clientName ? `Address ${clientName} directly. ` : ''}List 3-4 specific goals/challenges from their posting. Show you've read it carefully.

### 3. INDUSTRY-SPECIFIC CHALLENGES
Mention 2-3 pain points specific to their business type that you'll solve. Use industry terminology naturally.

### 4. PROPOSED SOLUTION
Explain your approach in 2-3 paragraphs. Be specific about:
- Technical approach/methodology
- Key features/deliverables
- How it solves their pain points
- What makes your approach effective

### 5. DETAILED DELIVERABLES
Bullet list of everything they'll receive. Be specific:
- Technical specifications
- Features and functionality
- Performance benchmarks
- Support/maintenance included

### 6. TIMELINE & MILESTONES
Break into weekly milestones. Example:
- Week 1: [specific deliverable]
- Week 2: [specific deliverable]
- etc.

### 7. INVESTMENT & ROI JUSTIFICATION
${projectValue ? `Price range around $${projectValue.toLocaleString()}. ` : 'State that pricing is based on requirements. '}
Explain WHY it's worth this investment:
- Long-term ROI
- Competitive advantage
- Time/cost savings
- Revenue potential

### 8. RELEVANT EXPERIENCE
Reference 1-2 specific portfolio projects. Include:
- What you built
- Results achieved (use numbers)
- Why it's relevant to their project

### 9. CLOSING CTA
End with a confident, specific next step. NOT "let me know if you have questions."
Instead: "I have availability starting [timeframe]. Let's schedule a 15-minute call this week to discuss [specific aspect]."

---

LENGTH: ${lengthInstruction}
TONE: ${finalTone} - confident, expert, zero fluff

Write the proposal now:`

  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file. Get your key from https://platform.openai.com/api-keys')
  }

  try {
    const response = await openai.chat.completions.create({
      model: PROPOSAL_MODEL, // Using gpt-4o for high-quality proposal generation
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: MODEL_TEMPERATURES.writing,
      max_tokens: 3000, // Increased for comprehensive proposals
    })

    return response.choices[0]?.message?.content || 'Failed to generate proposal'
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate proposal. Please try again.')
  }
}

