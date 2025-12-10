/**
 * ADVANCED PROPOSAL FEATURES
 * 
 * 1. Section Regeneration - Rewrite specific sections without full regen
 * 2. A/B Test Variations - Generate multiple hook/approach variants
 * 3. Platform-specific CTAs - Auto-generate optimized CTAs
 * 4. Dynamic Length Optimization - Auto-adjust based on RFP complexity
 */

import OpenAI from 'openai'
import {
  PROPOSAL_MODEL,
  MODEL_TEMPERATURES,
  SENIOR_CONSULTANT_PERSONA
} from '@/config/ai'
import { buildProposalPrompt } from './proposal-templates'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// ============================================================
// 1. SECTION REGENERATION
// ============================================================

export type ProposalSection = 
  | 'opening_hook'
  | 'problem_reframe'
  | 'approach'
  | 'proof'
  | 'deliverables'
  | 'investment'
  | 'cta'

interface SectionRegenerationParams {
  currentProposal: string
  sectionToRegenerate: ProposalSection
  rfpText: string
  platform: string
  portfolioItems?: Array<{
    title: string
    description: string
    tags: string[]
  }>
  projectValue?: number
  regenerationInstruction?: string // Optional: "make it more data-driven", "add humor", etc.
}

const SECTION_EXTRACTION_PATTERNS: Record<ProposalSection, RegExp[]> = {
  opening_hook: [
    /^##?\s*Opening Hook[\s\S]*?(?=\n##?\s*\w)/i,
    /^[\s\S]*?(?=\n##?\s*Problem|Deliverables|Approach)/i // First 2-3 paragraphs
  ],
  problem_reframe: [
    /##?\s*Problem Reframe[\s\S]*?(?=\n##?\s*\w)/i,
    /##?\s*Understanding[\s\S]*?(?=\n##?\s*\w)/i,
    /##?\s*Challenge[\s\S]*?(?=\n##?\s*\w)/i
  ],
  approach: [
    /##?\s*(?:Your |Our )?Approach[\s\S]*?(?=\n##?\s*\w)/i,
    /##?\s*(?:How |Strategy|Methodology)[\s\S]*?(?=\n##?\s*\w)/i,
    /##?\s*Solution[\s\S]*?(?=\n##?\s*\w)/i
  ],
  proof: [
    /##?\s*Proof[\s\S]*?(?=\n##?\s*\w)/i,
    /##?\s*(?:Case Studies|Portfolio|Experience|Track Record)[\s\S]*?(?=\n##?\s*\w)/i,
    /##?\s*(?:Relevant Projects|Past Work)[\s\S]*?(?=\n##?\s*\w)/i
  ],
  deliverables: [
    /##?\s*Deliverables[\s\S]*?(?=\n##?\s*\w)/i,
    /##?\s*(?:Timeline|Scope|What You'll Get)[\s\S]*?(?=\n##?\s*\w)/i,
    /##?\s*(?:Project Plan|Milestones)[\s\S]*?(?=\n##?\s*\w)/i
  ],
  investment: [
    /##?\s*Investment[\s\S]*?(?=\n##?\s*\w)/i,
    /##?\s*(?:Pricing|Cost|Budget)[\s\S]*?(?=\n##?\s*\w)/i,
    /##?\s*(?:Quote|Estimate)[\s\S]*?(?=\n##?\s*\w)/i
  ],
  cta: [
    /##?\s*(?:Call to Action|Next Steps|Let's Connect)[\s\S]*?$/i,
    /##?\s*(?:Getting Started|Take Action)[\s\S]*?$/i,
    /[\s\S]*?(?=\n##?\s*\w)[^\n]*$/  // Last section
  ]
}

const SECTION_INSTRUCTIONS: Record<ProposalSection, string> = {
  opening_hook: `
## REGENERATE: OPENING HOOK (2-3 sentences)

**YOUR TASK**: Write a fresh, attention-grabbing opening that:

- Leads with a strategic insight about their challenge
- References a specific detail from the RFP
- Avoids generic "I understand your needs" statements
- Makes them want to read more

**STYLE**: Confident, insightful, specific. Like the first line of a great article.

`,

  problem_reframe: `
## REGENERATE: PROBLEM REFRAME (1 paragraph)

**YOUR TASK**: Restate their need through a strategic lens they haven't considered:

- What's the hidden problem beneath their stated request?
- What business outcome does this really tie to?
- What happens if they solve this wrong?

**STYLE**: Strategic consultant energy. Show you see deeper than surface requirements.

`,

  approach: `
## REGENERATE: YOUR APPROACH (2-3 paragraphs)

**YOUR TASK**: Explain WHY your method works, not just WHAT you'll do:

- Mention 2-3 specific methodologies/frameworks by name
- Tie each step to a client outcome
- Include 1 risk you'll mitigate that others miss
- Use narrative flow (no bullet lists here)

**STYLE**: Expert practitioner. You've done this 50+ times and know what works.

`,

  proof: `
## REGENERATE: PROOF SECTION (1-2 portfolio highlights)

**YOUR TASK**: Prove you've done this successfully before:

- Format: [Project Name] → [Quantified Outcome]
- Include exact metric: "Reduced X by Y% in Z timeframe"
- Show relevance: "Similar [platform/industry/challenge] to yours"
- Keep each proof point to 3-4 sentences MAX

**STYLE**: Let the numbers do the talking. Concrete, verifiable, relevant.

`,

  deliverables: `
## REGENERATE: DELIVERABLES & TIMELINE (scannable format)

**YOUR TASK**: Break down exactly what they'll get and when:

- Use phase-based structure (Phase 1, Phase 2, etc.)
- Include specific outputs and milestones
- Make it scannable (use formatting strategically)
- Connect deliverables to outcomes

**STYLE**: Clear, organized, confidence-inspiring. No ambiguity.

`,

  investment: `
## REGENERATE: INVESTMENT (pricing section)

**YOUR TASK**: Present pricing in a value-driven way:

- Lead with value context first
- Provide range OR fixed price (match RFP style)
- Optionally break down by phase
- Include what's NOT included (scope clarity)

**STYLE**: Transparent, justified, no awkwardness. This is what excellence costs.

`,

  cta: `
## REGENERATE: CALL TO ACTION (2-3 sentences)

**YOUR TASK**: Give them an easy, valuable next step:

- Offer something specific and low-friction
- Frame it as valuable to THEM (not "let's chat")
- No "let me know if you're interested" language
- Create urgency without desperation

**STYLE**: Confident invitation. You're offering value, not begging for a response.

`
}

export async function regenerateProposalSection(
  params: SectionRegenerationParams
): Promise<string> {
  if (!openai) throw new Error('OpenAI API key not configured')

  const { 
    currentProposal, 
    sectionToRegenerate, 
    rfpText, 
    platform,
    portfolioItems,
    projectValue,
    regenerationInstruction 
  } = params

  // Extract current section content for context
  let currentSectionContent = ''
  const patterns = SECTION_EXTRACTION_PATTERNS[sectionToRegenerate]
  
  for (const pattern of patterns) {
    const match = currentProposal.match(pattern)
    if (match) {
      currentSectionContent = match[0]
      break
    }
  }

  // Build context
  const portfolioContext = portfolioItems && portfolioItems.length > 0 ? `
## AVAILABLE PORTFOLIO PROJECTS
${portfolioItems.slice(0, 3).map((p, i) => `
**${i + 1}. ${p.title}**
${p.description}
Tags: ${p.tags.join(', ')}
`).join('\n')}
` : ''

  const valueContext = projectValue ? `
## PROJECT VALUE
Client's stated budget/value: $${projectValue.toLocaleString()}
` : ''

  const regenerationContext = regenerationInstruction ? `
## SPECIFIC REGENERATION INSTRUCTION
${regenerationInstruction}

**IMPORTANT**: Apply this instruction while maintaining professional quality.
` : ''

  const prompt = `${SENIOR_CONSULTANT_PERSONA}

${SECTION_INSTRUCTIONS[sectionToRegenerate]}

## CURRENT VERSION (for context - you're improving on this)
${currentSectionContent || 'No current content - write from scratch'}

## FULL PROPOSAL CONTEXT
${currentProposal.slice(0, 2000)}...

## ORIGINAL RFP
"""
${rfpText.slice(0, 3000)}
"""

${portfolioContext}
${valueContext}
${regenerationContext}

## PLATFORM
${platform} - adjust tone and structure accordingly

## YOUR TASK
Write ONLY the ${sectionToRegenerate.replace('_', ' ')} section. Do not include any other sections. Output the section content directly in markdown format.`

  const response = await openai.chat.completions.create({
    model: PROPOSAL_MODEL,
    messages: [
      { 
        role: 'system', 
        content: `You are rewriting one specific section of a business proposal. Output ONLY that section content. No preamble, no other sections, no explanations.` 
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 800
  })

  const regeneratedSection = response.choices[0]?.message?.content || ''
  
  // Replace the section in the original proposal
  const updatedProposal = replaceSection(
    currentProposal, 
    sectionToRegenerate, 
    regeneratedSection
  )

  return updatedProposal
}

function replaceSection(
  proposal: string, 
  section: ProposalSection, 
  newContent: string
): string {
  const patterns = SECTION_EXTRACTION_PATTERNS[section]
  
  for (const pattern of patterns) {
    if (pattern.test(proposal)) {
      return proposal.replace(pattern, newContent.trim())
    }
  }
  
  // If section not found, append at appropriate location
  return appendSectionAtCorrectPosition(proposal, section, newContent)
}

function appendSectionAtCorrectPosition(
  proposal: string,
  section: ProposalSection,
  content: string
): string {
  const sectionOrder: ProposalSection[] = [
    'opening_hook',
    'problem_reframe', 
    'approach',
    'proof',
    'deliverables',
    'investment',
    'cta'
  ]
  
  const targetIndex = sectionOrder.indexOf(section)
  
  // Find where to insert by looking for next section
  for (let i = targetIndex + 1; i < sectionOrder.length; i++) {
    const nextSection = sectionOrder[i]
    const patterns = SECTION_EXTRACTION_PATTERNS[nextSection]
    
    for (const pattern of patterns) {
      const match = proposal.match(pattern)
      if (match && match.index !== undefined) {
        return proposal.slice(0, match.index) + 
               '\n\n' + content.trim() + '\n\n' + 
               proposal.slice(match.index)
      }
    }
  }
  
  // If no later section found, append at end
  return proposal + '\n\n' + content.trim()
}

// ============================================================
// 2. A/B TEST VARIATIONS
// ============================================================

export interface ABTestVariation {
  variant: 'A' | 'B'
  hookStrategy: string
  proposal: string
  differentiatingFactor: string
}

export interface ABTestParams {
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
  stageAOutput: any // From your existing analysis
  stageBOutput: any // From your existing structuring
}

export async function generateABTestVariations(
  params: ABTestParams
): Promise<ABTestVariation[]> {
  if (!openai) throw new Error('OpenAI API key not configured')

  // Define two contrasting strategies
  const strategies = [
    {
      variant: 'A' as const,
      hookStrategy: 'data_driven_insight',
      instruction: `
**VARIANT A: DATA-DRIVEN INSIGHT HOOK**

Lead with a surprising statistic, benchmark, or data insight that reframes their challenge.

Examples:
- "73% of [industry] projects fail in month 6 because teams optimize for launch speed over scalability—here's the pattern I see in your requirements:"
- "Your timeline suggests a $200K opportunity cost if deployment delays by 4 weeks—here's how we de-risk that:"
- "Companies in your segment spend 2.3x more fixing rushed implementations than investing in the right architecture upfront—"

**STYLE**: Consultant-analyst. Numbers first, credibility through data.

`
    },
    {
      variant: 'B' as const,
      hookStrategy: 'strategic_question',
      instruction: `
**VARIANT B: STRATEGIC QUESTION HOOK**

Lead with a provocative question or contrarian perspective that challenges their assumptions.

Examples:
- "What if the real problem isn't your website's conversion rate, but the quality of traffic your SEO strategy attracts?"
- "Most teams would tackle this as a front-end redesign. But your support ticket patterns suggest the issue lives in your API layer—"
- "Here's the question your stakeholders are probably debating: build fast to test the market, or build right to scale when it works?"

**STYLE**: Strategic advisor. Questions that make them think differently.

`
    }
  ]

  const variations: ABTestVariation[] = []

  for (const strategy of strategies) {
    const structuralTemplate = buildProposalPrompt(params.platform)
    
    const prompt = `${SENIOR_CONSULTANT_PERSONA}

${strategy.instruction}

${structuralTemplate}

## STRATEGIC CONTEXT
${JSON.stringify(params.stageBOutput, null, 2)}

## ANALYSIS
${JSON.stringify(params.stageAOutput, null, 2)}

## ORIGINAL RFP
"""
${params.rfpText.slice(0, 3000)}
"""

## PORTFOLIO
${params.portfolioItems.slice(0, 3).map((p, i) => `${i + 1}. ${p.title}: ${p.description}`).join('\n')}

## YOUR TASK
Write a complete proposal following the structural template, but apply the **${strategy.hookStrategy}** opening hook strategy. Make the opening hook notably different from a generic approach.

Output in markdown format.`

    const response = await openai.chat.completions.create({
      model: PROPOSAL_MODEL,
      messages: [
        { 
          role: 'system', 
          content: SENIOR_CONSULTANT_PERSONA 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.75,
      max_tokens: 2000
    })

    const proposalContent = response.choices[0]?.message?.content || ''

    variations.push({
      variant: strategy.variant,
      hookStrategy: strategy.hookStrategy,
      proposal: proposalContent,
      differentiatingFactor: strategy.hookStrategy === 'data_driven_insight' 
        ? 'Opens with quantified insight/benchmark'
        : 'Opens with strategic question/reframe'
    })
  }

  return variations
}

// ============================================================
// 3. PLATFORM-SPECIFIC CTA GENERATOR
// ============================================================

export interface CTAGenerationParams {
  platform: string
  proposalContext: string // Brief summary of the proposal
  projectValue?: number
  clientName?: string
  hasPortfolioExamples?: boolean
}

const PLATFORM_CTA_STRATEGIES: Record<string, string> = {
  Upwork: `
**UPWORK CTA BEST PRACTICES:**
- Offer a tangible deliverable they can evaluate (audit, wireframe, strategy doc)
- Create urgency by mentioning your availability ("I have capacity this week")
- Make it easy to say yes ("Reply with 'interested' and I'll send X by Friday")
- Reference the proposal process ("Let's discuss milestones in a 15-min call")

**FORMAT**: 2-3 sentences, action-oriented, professional but approachable
`,

  Fiverr: `
**FIVERR CTA BEST PRACTICES:**
- Ultra-simple action ("Order now" or "Message me your brand colors")
- Emphasize fast start ("I'll begin your mockup today")
- Remove friction ("No questionnaire needed—just hit order")
- Create scarcity ("2 slots available this week")

**FORMAT**: 1-2 sentences, urgent, friendly
`,

  LinkedIn: `
**LINKEDIN CTA BEST PRACTICES:**
- Frame as strategic discussion, not sales call
- Offer to share preliminary analysis/framework
- Make it peer-to-peer ("Let's schedule 30 minutes to explore fit")
- Reference decision-making process ("Share this with your team")

**FORMAT**: 2-3 sentences, executive-appropriate, partnership-oriented
`,

  'Direct RFP': `
**DIRECT RFP CTA BEST PRACTICES:**
- Formal next steps language
- Reference RFP timeline and process
- Offer Q&A availability
- Professional close with contact info

**FORMAT**: 2-3 sentences, formal, procedural
`,

  'Email Outreach': `
**EMAIL OUTREACH CTA BEST PRACTICES:**
- Single, ultra-clear ask
- Low friction response ("Reply 'yes' and I'll send the audit")
- Create immediate value ("I'll include X in my next email")
- Time-bound urgency ("This week only")

**FORMAT**: 1 sentence, dead simple action
`,

  'Agency Pitch': `
**AGENCY PITCH CTA BEST PRACTICES:**
- Propose collaborative workshop or strategy session
- Offer preliminary deliverable (framework, audit, positioning brief)
- Frame as co-creation, not vendor pitch
- Create excitement about partnership potential

**FORMAT**: 2-3 sentences, collaborative, vision-focused
`,

  Thumbtack: `
**THUMBTACK CTA BEST PRACTICES:**
- Emphasize availability ("Free consultation this Thursday/Friday")
- Make scheduling easy ("Reply with your preferred time")
- Local/personal touch ("I'm in your area this week")
- Remove commitment friction ("No-obligation quote")

**FORMAT**: 2 sentences, friendly, service-oriented
`,

  Houzz: `
**HOUZZ CTA BEST PRACTICES:**
- Offer design deliverable (mood board, preliminary sketch)
- Frame as creative collaboration ("Let's explore this together")
- Reference portfolio/visual examples ("I'll share similar projects")
- Make it about their vision ("Ensure we're aligned on aesthetic")

**FORMAT**: 2-3 sentences, creative, collaborative
`,

  Other: `
**GENERAL CTA BEST PRACTICES:**
- Clear next step
- Low friction
- Value-focused
- Professional

**FORMAT**: 2 sentences, adaptable to context
`
}

export async function generatePlatformCTA(
  params: CTAGenerationParams
): Promise<string> {
  if (!openai) throw new Error('OpenAI API key not configured')

  const { platform, proposalContext, projectValue, clientName, hasPortfolioExamples } = params

  const strategyGuide = PLATFORM_CTA_STRATEGIES[platform] || PLATFORM_CTA_STRATEGIES.Other

  const prompt = `You are an expert at crafting compelling calls-to-action for business proposals.

${strategyGuide}

## PROPOSAL CONTEXT
${proposalContext}

${projectValue ? `Project Value: $${projectValue.toLocaleString()}` : ''}
${clientName ? `Client Name: ${clientName}` : ''}
${hasPortfolioExamples ? 'You referenced specific portfolio examples in the proposal.' : ''}

## YOUR TASK
Write a compelling CTA that:
1. Follows the platform best practices above
2. Feels natural given the proposal context
3. Creates urgency without desperation
4. Offers specific value, not generic "let's chat"

Output ONLY the CTA text (2-3 sentences max). No preamble, no section headers.`

  const response = await openai.chat.completions.create({
    model: PROPOSAL_MODEL,
    messages: [
      { role: 'system', content: 'You write compelling CTAs. Output only the CTA text.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 200
  })

  return response.choices[0]?.message?.content?.trim() || ''
}

// ============================================================
// 4. DYNAMIC LENGTH OPTIMIZATION
// ============================================================

export interface LengthOptimizationResult {
  recommendedLength: 'shorter' | 'same' | 'longer'
  targetWordCount: { min: number; max: number }
  reasoning: string
  complexityScore: number // 1-10
}

export interface RFPComplexityFactors {
  rfpText: string
  platform: string
  extractedRequirements?: string[]
  extractedDeliverables?: string[]
  timeline?: string
  budget?: string
  industryType?: string
}

export function analyzeRFPComplexity(
  factors: RFPComplexityFactors
): LengthOptimizationResult {
  const { rfpText, platform, extractedRequirements, extractedDeliverables, timeline, budget, industryType } = factors

  let complexityScore = 0
  const reasoningFactors: string[] = []

  // Factor 1: RFP length (0-2 points)
  const wordCount = rfpText.split(/\s+/).length
  if (wordCount < 100) {
    complexityScore += 0
    reasoningFactors.push('Brief RFP (likely simple request)')
  } else if (wordCount < 300) {
    complexityScore += 1
    reasoningFactors.push('Moderate RFP length')
  } else {
    complexityScore += 2
    reasoningFactors.push('Detailed RFP (complex requirements)')
  }

  // Factor 2: Number of requirements (0-2 points)
  const reqCount = extractedRequirements?.length || 0
  if (reqCount === 0) {
    complexityScore += 0
  } else if (reqCount <= 3) {
    complexityScore += 1
    reasoningFactors.push(`Simple scope (${reqCount} requirements)`)
  } else {
    complexityScore += 2
    reasoningFactors.push(`Complex scope (${reqCount}+ requirements)`)
  }

  // Factor 3: Deliverables count (0-2 points)
  const delivCount = extractedDeliverables?.length || 0
  if (delivCount > 5) {
    complexityScore += 2
    reasoningFactors.push('Many deliverables (needs detailed breakdown)')
  } else if (delivCount > 2) {
    complexityScore += 1
  }

  // Factor 4: Platform expectations (0-2 points)
  const platformComplexity: Record<string, number> = {
    'Fiverr': 0,          // Expects brevity
    'Email Outreach': 0,  // Must be short
    'Thumbtack': 0,       // Quick and simple
    'Upwork': 1,          // Moderate detail
    'Houzz': 1,           // Moderate detail
    'Agency Pitch': 2,    // Expects depth
    'Direct RFP': 2,      // Requires comprehensive
    'LinkedIn': 1,        // Moderate-high detail
    'Other': 1
  }
  const platformPoints = platformComplexity[platform] || 1
  complexityScore += platformPoints
  
  if (platformPoints === 0) {
    reasoningFactors.push(`${platform} expects concise proposals`)
  } else if (platformPoints === 2) {
    reasoningFactors.push(`${platform} expects comprehensive proposals`)
  }

  // Factor 5: Industry complexity (0-2 points)
  const complexIndustries = ['saas', 'fintech', 'healthcare', 'enterprise', 'ai-tools']
  if (industryType && complexIndustries.some(ind => industryType.toLowerCase().includes(ind))) {
    complexityScore += 2
    reasoningFactors.push('Technical/regulated industry (needs detail)')
  } else {
    complexityScore += 1
  }

  // Normalize score to 1-10
  complexityScore = Math.min(10, Math.max(1, complexityScore))

  // Determine recommendation
  let recommendedLength: 'shorter' | 'same' | 'longer' = 'same'
  let targetWordCount = { min: 500, max: 700 }

  if (complexityScore <= 3) {
    recommendedLength = 'shorter'
    targetWordCount = { min: 300, max: 450 }
    reasoningFactors.push('→ Recommend SHORTER format for quick scanning')
  } else if (complexityScore >= 7) {
    recommendedLength = 'longer'
    targetWordCount = { min: 700, max: 900 }
    reasoningFactors.push('→ Recommend LONGER format for comprehensive coverage')
  } else {
    targetWordCount = { min: 500, max: 700 }
    reasoningFactors.push('→ Standard length is appropriate')
  }

  return {
    recommendedLength,
    targetWordCount,
    complexityScore,
    reasoning: reasoningFactors.join(' • ')
  }
}

// ============================================================
// SMART LENGTH ADJUSTMENT (Auto-applies to Stage C)
// ============================================================

export function getSmartLengthAdjustment(
  rfpComplexity: LengthOptimizationResult,
  userPreference?: 'shorter' | 'same' | 'longer'
): 'shorter' | 'same' | 'longer' {
  // User preference always wins if explicitly set
  if (userPreference && userPreference !== 'same') {
    return userPreference
  }

  // Otherwise use the AI recommendation
  return rfpComplexity.recommendedLength
}

// ============================================================
// USAGE EXAMPLES & EXPORT
// ============================================================

export const ProposalAdvancedFeatures = {
  // Section regeneration
  regenerateSection: regenerateProposalSection,
  
  // A/B testing
  generateABVariations: generateABTestVariations,
  
  // CTA generation
  generateCTA: generatePlatformCTA,
  
  // Length optimization
  analyzeComplexity: analyzeRFPComplexity,
  getSmartLength: getSmartLengthAdjustment
}

export default ProposalAdvancedFeatures

