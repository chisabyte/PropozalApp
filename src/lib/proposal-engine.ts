/**
 * Multi-Stage Proposal Generation Engine
 * 
 * A 3-stage, senior-level, GPT-optimized writing engine for
 * producing high-conversion, expert-quality proposals.
 * 
 * Stage A: Deep Analysis
 * Stage B: Strategic Structuring  
 * Stage C: Final Senior-Level Writing
 */

import OpenAI from 'openai'
import {
  PROPOSAL_MODEL,
  MODEL_TEMPERATURES,
  BANNED_PHRASES,
  SENIOR_CONSULTANT_PERSONA
} from '@/config/ai'
import { ExtractedRFP } from './rfp-extractor'
import {
  getIndustryIntelligence,
  formatIndustryContext,
  IndustryIntelligence
} from './industry-intelligence'
import { IndustryType, INDUSTRY_LABELS } from './industry-classifier'
import { evaluateProposalQuality, QualityEvaluation } from './quality-evaluator'
import { getStylePrompt } from './style-formatter'
import { addLanguageContextToPrompt } from './multi-language'
import { buildProposalPrompt } from './proposal-templates'
import { buildTemplatePrompt } from './template-engine'

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// ============================================================
// TYPES
// ============================================================

export interface ProposalEngineParams {
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
  evaluateQuality?: boolean // Whether to evaluate the proposal quality
  style?: 'modern_clean' | 'corporate' | 'minimalist' | 'creative_agency' | 'startup_pitch' | 'technical'
  language?: 'en' | 'es' | 'pt' | 'ar' | 'id' | 'hi'
  includePricing?: boolean
  styleProfile?: any // For Feature 8: Write Like Me mode
  templateId?: string // For Feature: Proposal Templates
}

interface StageAOutput {
  clientNeeds: string[]
  inferredGoals: string[]
  hiddenProblems?: string[]
  missingInfo: string[]
  industryContext: IndustryIntelligence
  clientProfile: string
  projectComplexity: 'simple' | 'moderate' | 'complex'
  riskFactors?: string[]
  differentiationOpportunity?: string
  recommendedApproach: string
}

interface StageBOutput {
  openingHook?: string
  proposalOutline: string
  keyMessages: string[]
  hiddenValueProps?: string[]
  objectionHandlers?: string[]
  differentiators: string[]
  pricingStrategy: string
  timelineApproach: string
  proofPoints?: string[]
  ctaStrategy: string
}

// ============================================================
// PLATFORM-SPECIFIC STRATEGIES
// ============================================================

const PLATFORM_STRATEGIES: Record<string, string> = {
  Upwork: `UPWORK PLATFORM ADAPTATION:
TONE: Concise, milestone-driven, credibility-focused
LENGTH: 400-600 words (scannable)

CRITICAL RULES:
- First 2 lines must hook—clients scan 20+ proposals in minutes
- Lead with strategic insight, not "I read your job post"
- Be direct and scannable—use short paragraphs and bullets
- Include concrete timeline with weekly milestones
- Reference specific similar projects with measurable outcomes
- End with a value-first CTA (audit, wireframe, strategy call)

STRUCTURE EMPHASIS:
- Problem understanding (2-3 sentences max)
- Your unique approach (why it works)
- Deliverables + timeline (clear breakdown)
- Relevant proof (1-2 projects with metrics)
- Specific next step (not "let me know")`,

  Fiverr: `FIVERR PLATFORM ADAPTATION:
TONE: Benefit-forward, fast delivery emphasis, friendly-professional
LENGTH: 300-400 words (short and punchy)

CRITICAL RULES:
- Lead with the outcome they'll get
- Emphasize speed and reliability
- Clear deliverables with what's included
- Mention revision policy
- Quick turnaround as differentiator

STRUCTURE EMPHASIS:
- Outcome promise (1-2 sentences)
- What's included (bullet list)
- Timeline (fast + realistic)
- Why you (brief proof)
- Simple CTA`,

  Thumbtack: `THUMBTACK PLATFORM ADAPTATION:
TONE: Local, trustworthy, personal, service-oriented
LENGTH: 300-500 words

CRITICAL RULES:
- Emphasize local expertise and availability
- Trust signals: reviews, years in business, licenses
- Personal but professional tone
- Clear pricing or quote process
- Response time and availability emphasis

STRUCTURE EMPHASIS:
- Local credibility (area served, years active)
- Service understanding
- Clear pricing/quote approach
- Trust signals
- Easy next step (call, visit, quote)`,

  Houzz: `HOUZZ PLATFORM ADAPTATION:
TONE: Design-focused, aesthetic-aware, collaborative
LENGTH: 400-600 words

CRITICAL RULES:
- Lead with design understanding and style matching
- Reference portfolio with visual outcomes
- Emphasize collaboration process
- Professional with creative sensibility
- Focus on transformation and results

STRUCTURE EMPHASIS:
- Design approach and aesthetic alignment
- Process overview (consultation to completion)
- Portfolio references (relevant style)
- Timeline and collaboration points
- Visual-focused CTA`,

  LinkedIn: `LINKEDIN PLATFORM ADAPTATION:
TONE: Executive-level, ROI-heavy, strategic, partnership-oriented
LENGTH: 500-700 words

CRITICAL RULES:
- Write for decision-makers and executives
- Lead with business impact and ROI
- Strategic value over tactical features
- Formal but not stiff
- Long-term partnership framing
- Reference enterprise-level experience

STRUCTURE EMPHASIS:
- Strategic summary (business impact)
- Problem analysis (strategic lens)
- Solution approach (ROI-focused)
- Credentials and enterprise experience
- Partnership-oriented CTA`,

  'Direct RFP': `DIRECT RFP PLATFORM ADAPTATION:
TONE: Formal, structured, compliance-aligned, comprehensive
LENGTH: 600-900 words

CRITICAL RULES:
- Address all stated requirements systematically
- Formal business tone throughout
- Detailed credentials and qualifications
- Compliance with any specified format
- Professional formatting and structure
- Reference relevant certifications/experience

STRUCTURE EMPHASIS:
- Executive summary
- Requirements compliance matrix
- Technical approach
- Team qualifications
- Timeline and milestones
- Pricing structure
- References/case studies`,

  'Email Outreach': `EMAIL OUTREACH PLATFORM ADAPTATION:
TONE: Brief, value-led, minimal fluff, personal
LENGTH: 200-350 words

CRITICAL RULES:
- Subject line must earn the open
- First line must hook—no "I hope this finds you well"
- Lead with specific value or insight
- One clear ask
- Easy to respond to

STRUCTURE EMPHASIS:
- Hook (specific insight or value)
- Brief context (why reaching out)
- Value proposition (1-2 sentences)
- Proof point (one relevant example)
- Simple CTA (one action)`,

  'Agency Pitch': `AGENCY PITCH PLATFORM ADAPTATION:
TONE: Storytelling, vision-driven, metrics-backed, differentiated
LENGTH: 600-800 words

CRITICAL RULES:
- Lead with strategic vision, not capabilities
- Tell a story of transformation
- Metrics and case studies as proof
- Clear differentiation from competitors
- Partnership mindset over vendor mindset

STRUCTURE EMPHASIS:
- Vision/opportunity framing
- Strategic approach (unique POV)
- Relevant case studies with metrics
- Team and capabilities
- Partnership model
- Investment and ROI`,

  Other: `GENERAL PLATFORM ADAPTATION:
TONE: Professional, clear, adaptable to context
LENGTH: 400-600 words

CRITICAL RULES:
- Match the formality level of the original request
- Focus on specific needs mentioned
- Include relevant experience
- Clear deliverables and timeline
- Appropriate CTA for context

STRUCTURE EMPHASIS:
- Problem understanding
- Proposed solution
- Relevant experience
- Timeline and deliverables
- Clear next step`
}

// ============================================================
// STAGE A: DEEP ANALYSIS
// ============================================================

async function stageA_DeepAnalysis(params: ProposalEngineParams): Promise<StageAOutput> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  const { rfpText, userIndustry, extractedRFP } = params

  const classifiedIndustry = extractedRFP?.industry || 'general-business'
  const classifiedIndustryLabel = extractedRFP?.industryLabel || 'General Business'

  const industryContext = getIndustryIntelligence(
    classifiedIndustry,
    extractedRFP?.projectType,
    rfpText
  )

  const projectContext = {
    industry: classifiedIndustryLabel,
    projectType: extractedRFP?.projectType || 'Web Project',
    coreRequirements: extractedRFP?.coreRequirements || extractedRFP?.requirements || [],
    techStack: extractedRFP?.techStack || extractedRFP?.skills || [],
    timeline: extractedRFP?.timeline || 'Not specified',
    deliverables: extractedRFP?.deliverables || [],
  }

  const analysisPrompt = `You are an elite business strategist. Analyze this project request with the depth of a McKinsey consultant.

## PROJECT REQUEST
"""
${rfpText}
"""

## CLASSIFIED PROJECT CONTEXT
Industry: ${projectContext.industry}
Project Type: ${projectContext.projectType}
Core Requirements: ${projectContext.coreRequirements.join(', ') || 'To be determined'}
Timeline: ${projectContext.timeline}
Deliverables: ${projectContext.deliverables.join(', ') || 'To be determined'}

## EXTRACTED DATA
Requirements: ${extractedRFP?.requirements?.join(', ') || 'Not extracted'}
Budget: ${extractedRFP?.budget || 'Not specified'}
Client Name: ${extractedRFP?.clientName || 'Not specified'}

## ANALYSIS REQUIRED
Identify:
1. What they SAID they need (explicit)
2. What they ACTUALLY need (implicit)
3. What they DON'T KNOW they need (hidden opportunities)
4. What could go wrong if done poorly (risks)
5. What would make this project transformative

Provide analysis in JSON format matching the StageAOutput interface.`

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: 'system', content: 'You are a senior business analyst. Output valid JSON only.' },
      { role: 'user', content: analysisPrompt },
    ],
    temperature: 0.4,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Stage A failed: No response')

  const analysis = JSON.parse(content)

  return {
    ...analysis,
    industryContext,
  }
}

// ============================================================
// STAGE B: STRATEGIC STRUCTURING
// ============================================================

async function stageB_StrategicStructuring(
  params: ProposalEngineParams,
  stageAOutput: StageAOutput
): Promise<StageBOutput> {
  if (!openai) throw new Error('OpenAI API key not configured')

  const { platform, projectValue, portfolioItems } = params
  const platformStrategy = PLATFORM_STRATEGIES[platform] || PLATFORM_STRATEGIES.Other
  const industryContext = formatIndustryContext(stageAOutput.industryContext)

  const structuringPrompt = `You are an elite proposal strategist.
  
## DEEP CLIENT ANALYSIS
${JSON.stringify(stageAOutput, null, 2)}

## INDUSTRY INTELLIGENCE
${industryContext}

## PLATFORM STRATEGY
${platformStrategy}

## PORTFOLIO
${portfolioItems.slice(0, 3).map((p, i) => `${i + 1}. ${p.title}: ${p.description}`).join('\n')}

Create a proposal structure that wins. Output exact JSON matching StageBOutput interface.`

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: 'system', content: 'You are a senior proposal strategist. Output valid JSON only.' },
      { role: 'user', content: structuringPrompt },
    ],
    temperature: 0.5,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Stage B failed: No response')

  return JSON.parse(content)
}

// ============================================================
// STAGE C: FINAL WRITING (with template enforcement)
// ============================================================

async function stageC_FinalWriting(
  params: ProposalEngineParams,
  stageAOutput: StageAOutput,
  stageBOutput: StageBOutput
): Promise<string> {
  if (!openai) throw new Error('OpenAI API key not configured')

  const {
    rfpText,
    companyName,
    portfolioItems,
    platform,
    projectValue,
    toneAdjustment,
    lengthAdjustment,
    style,
    language,
    userIndustry,
    templateId
  } = params

  // Build structural template with platform/industry/tone/length overlays
  // If templateId is provided, use the template prompt builder instead
  const structuralTemplate = templateId
    ? buildTemplatePrompt(templateId) || buildProposalPrompt(platform, userIndustry, toneAdjustment, lengthAdjustment)
    : buildProposalPrompt(platform, userIndustry, toneAdjustment, lengthAdjustment)

  // Format industry context for better integration
  const industryContext = stageAOutput.industryContext
  const industryGuidance = industryContext ? `
## INDUSTRY-SPECIFIC INTELLIGENCE
${formatIndustryContext(industryContext)}

**CRITICAL**: Use industry terminology naturally. Reference common challenges, tools, and metrics specific to ${userIndustry}.
` : ''

  // Format matched portfolio items
  const portfolioContext = portfolioItems.length > 0 ? `
## YOUR BEST-MATCHING PORTFOLIO PROJECTS
${portfolioItems.slice(0, 3).map((p, i) => `
**${i + 1}. ${p.title}**
${p.description}
Tags: ${p.tags.join(', ')}
`).join('\n')}

**CRITICAL**: Reference AT LEAST ONE of these projects in your Proof Section. Make the connection to their RFP explicit.
` : ''

  // Build the strategic context
  const strategicContext = `
## DEEP CLIENT ANALYSIS (from Stage A)
${JSON.stringify(stageAOutput, null, 2)}

## STRATEGIC STRUCTURE (from Stage B)
${JSON.stringify(stageBOutput, null, 2)}

**CRITICAL**: The structure above is your strategic blueprint. Now translate it into compelling prose following the template below.
`

  // Add style formatting guidance
  const styleGuidance = style ? getStylePrompt(style) : ''

  // Build final writing prompt
  const writingPrompt = `${SENIOR_CONSULTANT_PERSONA}

${structuralTemplate}

${industryGuidance}

${portfolioContext}

${strategicContext}

${styleGuidance}

## ORIGINAL CLIENT REQUEST
"""
${rfpText.slice(0, 5000)}
"""

${projectValue ? `## PROJECT VALUE CONTEXT\nClient's stated budget/value: $${projectValue.toLocaleString()}\nUse this to inform your pricing strategy and ROI framing.\n` : ''}

${companyName ? `## YOUR COMPANY\nYour company name: ${companyName}\nUse this naturally in the proposal.\n` : ''}

## BANNED PHRASE ENFORCEMENT
IMMEDIATELY DISCARD any output containing these phrases:
${BANNED_PHRASES.slice(0, 10).map(p => `- "${p}"`).join('\n')}
...(+${BANNED_PHRASES.length - 10} more)

If you accidentally use a banned phrase, STOP and rewrite that section.

## FINAL INSTRUCTION
Write the complete proposal in markdown format. Follow the structural template EXACTLY. Make every sentence count.`

  // Apply language context if not English
  const finalPrompt = language && language !== 'en'
    ? addLanguageContextToPrompt(writingPrompt, language)
    : writingPrompt

  // Determine max tokens based on length adjustment
  let maxTokens = 2000
  if (lengthAdjustment === 'shorter') maxTokens = 1200
  if (lengthAdjustment === 'longer') maxTokens = 2800

  const response = await openai.chat.completions.create({
    model: PROPOSAL_MODEL,
    messages: [
      {
        role: 'system',
        content: `${SENIOR_CONSULTANT_PERSONA}

You are writing a high-stakes business proposal. Every sentence must justify its existence. Follow the provided template structure exactly—do not improvise new sections or skip required sections.

Your output will be evaluated on:
1. Structural compliance (did you follow the template?)
2. Strategic insight (do you show deep understanding?)
3. Persuasive power (does every sentence move toward "yes"?)
4. Professionalism (would a Fortune 500 executive respect this?)
5. Banned phrase avoidance (zero tolerance)

Write in markdown. Begin with the Opening Hook section.`
      },
      { role: 'user', content: finalPrompt },
    ],
    temperature: MODEL_TEMPERATURES.writing,
    max_tokens: maxTokens,
  })

  let proposal = response.choices[0]?.message?.content || ''

  // Post-generation cleanup
  proposal = cleanupProposal(proposal)

  return proposal
}

// ============================================================
// PROPOSAL CLEANUP HELPERS
// ============================================================

function cleanupProposal(proposal: string): string {
  let cleaned = proposal

  // Remove any AI self-references that slipped through
  const selfReferences = [
    /As an AI/gi,
    /As a language model/gi,
    /I cannot/gi,
    /I apologize, but/gi
  ]

  selfReferences.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '')
  })

  // Remove excessive spacing
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n')

  // Ensure proper markdown heading hierarchy
  cleaned = cleaned.replace(/^#{4,}/gm, '###')

  // Remove any template instructions that leaked through
  cleaned = cleaned.replace(/\*\*CRITICAL\*\*:.*?\n/gi, '')
  cleaned = cleaned.replace(/## MANDATORY STRUCTURE.*?\n/gi, '')

  return cleaned.trim()
}

// ============================================================
// VALIDATION & HELPERS
// ============================================================

function validateProposalQuality(proposal: string): { valid: boolean; issues: string[] } {
  const issues: string[] = []

  // Basic length check
  const wordCount = proposal.split(/\s+/).length
  if (wordCount < 100) issues.push('Proposal too short')

  // Banned phrases check
  BANNED_PHRASES.forEach(phrase => {
    if (proposal.toLowerCase().includes(phrase.toLowerCase())) {
      issues.push(`Contains banned phrase: ${phrase}`)
    }
  })

  return { valid: issues.length === 0, issues }
}
// MAIN ENGINE
// ============================================================

export interface ProposalGenerationResult {
  content: string;
  qualityEvaluation?: QualityEvaluation;
}

export async function generateProposalMultiStage(
  params: ProposalEngineParams
): Promise<ProposalGenerationResult> {
  console.log("🚀 Starting Multi-Stage Proposal Generation...");

  // SAFETY: Input truncation
  if (params.rfpText.length > 15000) {
    console.warn("RFP text truncated to 15000 chars");
    params.rfpText = params.rfpText.slice(0, 15000) + "...(truncated)";
  }

  try {
    const stageA = await stageA_DeepAnalysis(params);
    const stageB = await stageB_StrategicStructuring(params, stageA);
    const finalProposal = await stageC_FinalWriting(params, stageA, stageB);

    const validation = validateProposalQuality(finalProposal);
    if (!validation.valid) {
      console.warn("⚠️  Proposal validation warnings:", validation.issues);
    }

    // Stage D: Quality Evaluation (if enabled)
    let qualityEvaluation: QualityEvaluation | undefined;
    if (params.evaluateQuality !== false) { // Default to true if not specified
      try {
        console.log('📈 Evaluating proposal quality...');
        qualityEvaluation = await evaluateProposalQuality(
          finalProposal,
          params.rfpText,
          params.platform,
          params.userIndustry
        );
        console.log(`✅ Proposal quality score: ${qualityEvaluation.score}/100`);
      } catch (error) {
        console.error('⚠️  Failed to evaluate proposal quality:', error);
        // Continue without failing the whole generation if evaluation fails
      }
    }

    console.log('✅ Proposal generation complete!');
    return {
      content: finalProposal,
      qualityEvaluation
    };
  } catch (error) {
    console.error("Proposal generation failed", error);
    throw error;
  }
}

export { generateProposalMultiStage as generateProposal }
