/**
 * AI PDF Cover Page Generator
 * Feature 11: AI PDF Cover Page Generator
 */

import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export interface CoverPageData {
  title: string
  clientName: string
  summary: string
  theme: string
  date: string
  proposalId?: string
}

export async function generateCoverPage(
  proposalTitle: string,
  rfpText: string,
  proposalContent: string,
  clientName?: string
): Promise<CoverPageData> {
  if (!openai) {
    // Fallback
    return {
      title: proposalTitle,
      clientName: clientName || "Valued Client",
      summary: proposalContent.slice(0, 200) + "...",
      theme: "professional",
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }
  }

  const prompt = `You are a professional proposal designer. Create a cover page for this proposal.

## PROPOSAL TITLE
${proposalTitle}

## CLIENT NAME
${clientName || "To be determined from RFP"}

## ORIGINAL REQUEST
${rfpText.slice(0, 1000)}

## PROPOSAL SUMMARY (first 500 words)
${proposalContent.slice(0, 500)}

Create a professional cover page with:
1. Title: Enhanced version of proposal title (max 80 chars)
2. Client Name: Extract or use provided
3. Summary: 2-3 sentence executive summary (max 150 words)
4. Theme: professional|modern|creative|technical|corporate

Output JSON:
{
  "title": "Enhanced title",
  "clientName": "Client name",
  "summary": "Executive summary",
  "theme": "professional"
}`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: 'system', content: 'You are a professional proposal designer. Output valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (content) {
      const data = JSON.parse(content)
      return {
        ...data,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      }
    }
  } catch (error) {
    console.error('Cover page generation failed, using fallback:', error)
  }

  // Fallback
  return {
    title: proposalTitle,
    clientName: clientName || "Valued Client",
    summary: proposalContent.slice(0, 200) + "...",
    theme: "professional",
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
}

