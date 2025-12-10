import { PROPOSAL_TEMPLATES } from "@/config/templates"

export function buildTemplatePrompt(templateId: string) {
  const template = PROPOSAL_TEMPLATES.find(t => t.id === templateId)
  if (!template) return null

  return `
## REQUIRED TEMPLATE STRUCTURE
You are creating a proposal based on the "${template.name}" template.
This template is designed for: ${template.description}

STRICTLY FOLLOW THIS SECTION STRUCTURE:
${Object.entries(template.default_sections).map(([section, desc]) => `- ${section.toUpperCase()}: ${desc}`).join('\n')}

TONE INSTRUCTION: Adopt a ${template.tone_hint.replace('_', ' ')} tone.

CRITICAL RULE:
- Keep the structure exactly as defined above.
- Customize ALL content to the specific RFP.
- Do NOT use generic placeholder text. Every sentence must be specific to THIS project.
`
}
