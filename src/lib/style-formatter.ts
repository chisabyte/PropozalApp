/**
 * Style Formatter for Proposal Templates
 * Feature 2: Template Style Selector
 */

export type ProposalStyle = 'modern_clean' | 'corporate' | 'minimalist' | 'creative_agency' | 'startup_pitch' | 'technical'

export interface StyleFormatting {
  headingStyle: string
  paragraphStyle: string
  listStyle: string
  emphasisStyle: string
  structureGuidance: string
}

const STYLE_GUIDANCE: Record<ProposalStyle, StyleFormatting> = {
  modern_clean: {
    headingStyle: "Clear, bold headings with ample spacing. Use ## for main sections, ### for subsections.",
    paragraphStyle: "Short paragraphs (2-3 sentences). Clean line breaks. Minimal formatting.",
    listStyle: "Bullet points with clear hierarchy. Use - for main items,  - for sub-items.",
    emphasisStyle: "Bold for key points. No italics unless necessary.",
    structureGuidance: "Organize with clear sections: Introduction, Approach, Deliverables, Timeline, Why Us, Next Steps."
  },
  corporate: {
    headingStyle: "Formal numbered sections (1.0, 1.1, 1.2). Use ## for main sections.",
    paragraphStyle: "Professional, detailed paragraphs. Formal language throughout.",
    listStyle: "Numbered lists for processes. Bullet points for features/benefits.",
    emphasisStyle: "Conservative use of bold. Formal terminology.",
    structureGuidance: "Executive Summary, Background, Methodology, Team Qualifications, Timeline, Budget, Conclusion."
  },
  minimalist: {
    headingStyle: "Simple, unadorned headings. Use ## sparingly.",
    paragraphStyle: "Concise, direct sentences. Maximum clarity with minimum words.",
    listStyle: "Simple dashes. No nesting. One level only.",
    emphasisStyle: "Minimal formatting. Let content speak.",
    structureGuidance: "Problem, Solution, Approach, Deliverables, Timeline. Keep it simple."
  },
  creative_agency: {
    headingStyle: "Bold, engaging headings. Use creative formatting with emojis where appropriate (## 🎨 Section).",
    paragraphStyle: "Dynamic, energetic writing. Varied sentence length.",
    listStyle: "Visual hierarchy with bullets and sub-bullets. Use checkmarks (✓) for benefits.",
    emphasisStyle: "Bold for impact. Creative use of formatting.",
    structureGuidance: "Vision, Creative Approach, Portfolio Highlights, Process, Timeline, Investment, Let's Create."
  },
  startup_pitch: {
    headingStyle: "Energetic, growth-focused headings. Use ## with action verbs.",
    paragraphStyle: "Forward-looking, optimistic tone. Focus on growth and innovation.",
    listStyle: "Bullet points emphasizing speed, scalability, innovation.",
    emphasisStyle: "Bold for metrics and growth indicators.",
    structureGuidance: "Opportunity, Our Approach, Why Now, Rapid Execution, Milestones, Partnership Model, Next Steps."
  },
  technical: {
    headingStyle: "Precise, hierarchical headings. Use ## for major sections, ### for technical details.",
    paragraphStyle: "Detailed, precise language. Technical terminology where appropriate.",
    listStyle: "Numbered lists for processes. Bullet points for technical specifications.",
    emphasisStyle: "Code formatting for technical terms. Bold for key technical concepts.",
    structureGuidance: "Technical Overview, Architecture, Implementation Plan, Technical Specifications, Testing Approach, Deployment, Support."
  }
}

export function getStyleFormatting(style: ProposalStyle): StyleFormatting {
  return STYLE_GUIDANCE[style] || STYLE_GUIDANCE.modern_clean
}

export function applyStyleFormatting(content: string, style: ProposalStyle): string {
  const formatting = getStyleFormatting(style)
  
  // This is a basic implementation - in production, you'd use a markdown parser
  // to apply more sophisticated formatting based on the style guide
  
  // For now, we'll add style-specific instructions to the AI prompt
  // The actual formatting will be handled by the AI during generation
  
  return content
}

export function getStylePrompt(style: ProposalStyle): string {
  const formatting = STYLE_GUIDANCE[style]
  return `
FORMATTING STYLE: ${style.toUpperCase().replace('_', ' ')}

${formatting.structureGuidance}

HEADING STYLE: ${formatting.headingStyle}
PARAGRAPH STYLE: ${formatting.paragraphStyle}
LIST STYLE: ${formatting.listStyle}
EMPHASIS STYLE: ${formatting.emphasisStyle}

Apply this style consistently throughout the proposal.
`
}

