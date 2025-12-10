import OpenAI from 'openai';
import { PROPOSAL_MODEL } from '@/config/ai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface QualityEvaluation {
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  criteria: {
    clarity: number;
    relevance: number;
    industryAlignment: number;
    toneAccuracy: number;
    differentiatorStrength: number;
    structure: number;
    platformFit: number;
  };
}

export async function evaluateProposalQuality(
  proposal: string,
  rfpText: string,
  platform: string,
  industry: string
): Promise<QualityEvaluation> {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

  const evaluationPrompt = `You are a senior proposal reviewer. Evaluate this proposal based on the following criteria (1-10 scale):
  
  **Proposal Platform:** ${platform}
  **Industry:** ${industry}
  
  **Evaluation Criteria:**
  1. Clarity (1-10) - Is the proposal clear and easy to understand?
  2. Relevance (1-10) - Does it directly address the RFP requirements?
  3. Industry Alignment (1-10) - Does it demonstrate industry knowledge?
  4. Tone Accuracy (1-10) - Is the tone appropriate for the platform and client?
  5. Differentiator Strength (1-10) - Does it effectively differentiate from competitors?
  6. Structure (1-10) - Is it well-organized and logical?
  7. Platform Fit (1-10) - Does it follow best practices for the platform?
  
  **Proposal to evaluate:**
  ${proposal}
  
  **Original RFP:**
  ${rfpText}
  
  Respond in the following JSON format:
  {
    "score": 0-100,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "suggestions": ["suggestion1", "suggestion2"],
    "criteria": {
      "clarity": 1-10,
      "relevance": 1-10,
      "industryAlignment": 1-10,
      "toneAccuracy": 1-10,
      "differentiatorStrength": 1-10,
      "structure": 1-10,
      "platformFit": 1-10
    }
  }`;

  try {
    const completion = await openai.chat.completions.create({
      model: PROPOSAL_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert proposal evaluator with 20+ years of experience in business development and proposal writing.'
        },
        {
          role: 'user',
          content: evaluationPrompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No evaluation result returned from AI');
    }

    return JSON.parse(result) as QualityEvaluation;
  } catch (error) {
    console.error('Error evaluating proposal quality:', error);
    throw new Error('Failed to evaluate proposal quality');
  }
}

// Helper function to get color class based on score
export function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}
