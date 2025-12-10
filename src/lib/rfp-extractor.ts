import { openai } from './openai'
import { HELPER_MODEL, MODEL_TEMPERATURES } from '@/config/ai'
import { classifyProjectIndustry, ClassifiedProject, IndustryType } from './industry-classifier'

export interface ExtractedRFP {
  requirements: string[]
  deliverables: string[]
  budget: string | null
  timeline: string | null
  redFlags: string[]
  clientName: string | null
  projectType: string | null
  skills: string[]
  tone: 'formal' | 'casual' | 'professional' | 'friendly'
  // New fields for industry classification
  industry: IndustryType
  industryLabel: string
  coreRequirements: string[]
  techStack: string[]
  classifiedProject?: ClassifiedProject
}

export async function extractRFPData(rfpText: string): Promise<ExtractedRFP> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file. Get your key from https://platform.openai.com/api-keys')
  }

  // STEP 1: Classify the project industry DIRECTLY from the description
  // This is the primary source of truth for industry (70% weight)
  const classifiedProject = await classifyProjectIndustry(rfpText)

  const prompt = `Analyze the following job posting/RFP and extract structured information. Return ONLY valid JSON, no markdown or code blocks.

Job Posting:
"""
${rfpText}
"""

Extract and return JSON with this exact structure:
{
  "requirements": ["requirement 1", "requirement 2", ...],
  "deliverables": ["deliverable 1", "deliverable 2", ...],
  "budget": "budget range or amount if mentioned, else null",
  "timeline": "timeline or deadline if mentioned, else null",
  "redFlags": ["any concerning patterns like 'urgent', 'low budget', 'unclear scope', etc."],
  "clientName": "client or company name if mentioned, else null",
  "projectType": "type of project (e.g., 'SaaS MVP', 'Web Application', 'E-commerce Store', 'Landing Page')",
  "skills": ["required skills or technologies mentioned"],
  "tone": "one of: 'formal', 'casual', 'professional', 'friendly' based on how the posting is written"
}

CRITICAL RULES:
1. projectType must be specific (e.g., "SaaS MVP", "Dashboard Application", "E-commerce Store")
2. NEVER assume construction/trades unless explicitly mentioned
3. For software/tech projects, identify: SaaS, Web App, Mobile App, Dashboard, Landing Page, etc.`

  try {
    const response = await openai.chat.completions.create({
      model: HELPER_MODEL, // Using gpt-4o-mini for quick field extraction
      messages: [
        {
          role: 'system',
          content: `You are an expert at analyzing job postings and RFPs. Extract structured data accurately. Always return valid JSON only.

CRITICAL: Never assume "construction" or "trades" industry unless the text EXPLICITLY mentions construction, contracting, remodeling, roofing, plumbing, electrical, HVAC, or similar trade work.

For tech/software projects, always identify the specific type: SaaS, MVP, Dashboard, Web App, E-commerce, Landing Page, etc.`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: MODEL_TEMPERATURES.helper,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const extracted = JSON.parse(content)
    
    // Merge with classified project data
    return {
      ...extracted,
      // Use classified industry data (extracted directly from description)
      industry: classifiedProject.industry,
      industryLabel: classifiedProject.industryLabel,
      coreRequirements: classifiedProject.coreRequirements,
      techStack: classifiedProject.techStack,
      // Override projectType if classifier found something more specific
      projectType: classifiedProject.projectType || extracted.projectType,
      // Merge deliverables
      deliverables: [...new Set([
        ...(extracted.deliverables || []),
        ...(classifiedProject.deliverables || [])
      ])],
      // Use classifier timeline if RFP extraction didn't find one
      timeline: extracted.timeline || classifiedProject.timeline,
      classifiedProject,
    } as ExtractedRFP
  } catch (error) {
    console.error('RFP extraction error:', error)
    // Fallback using classified project data
    return {
      requirements: classifiedProject.coreRequirements,
      deliverables: classifiedProject.deliverables,
      budget: null,
      timeline: classifiedProject.timeline,
      redFlags: [],
      clientName: null,
      projectType: classifiedProject.projectType,
      skills: classifiedProject.techStack,
      tone: 'professional',
      industry: classifiedProject.industry,
      industryLabel: classifiedProject.industryLabel,
      coreRequirements: classifiedProject.coreRequirements,
      techStack: classifiedProject.techStack,
      classifiedProject,
    }
  }
}

