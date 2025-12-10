/**
 * PROPOZZY FEEDBACK CHATBOT SYSTEM
 * 
 * AI-powered chatbot for collecting user feedback, complaints, and feature requests.
 * Uses GPT-4o-mini for cost-effective, empathetic conversations.
 * 
 * Features:
 * - Natural conversation flow
 * - Sentiment analysis
 * - Auto-categorization (bug, feature request, complaint, praise)
 * - Priority scoring
 * - Admin dashboard integration
 * - Email notifications for critical issues
 */

import OpenAI from 'openai'
import { HELPER_MODEL } from '@/config/ai'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// ============================================================
// TYPES
// ============================================================

export type FeedbackCategory = 
  | 'bug'
  | 'feature_request'
  | 'complaint'
  | 'praise'
  | 'question'
  | 'unclear'

export type FeedbackSentiment = 'positive' | 'neutral' | 'negative'
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface FeedbackMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface FeedbackAnalysis {
  category: FeedbackCategory
  sentiment: FeedbackSentiment
  priority: FeedbackPriority
  keywords: string[]
  summary: string
  requiresFollowUp: boolean
}

export interface FeedbackSession {
  id: string
  userId: string
  userName?: string
  userEmail?: string
  messages: FeedbackMessage[]
  analysis?: FeedbackAnalysis
  resolved: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================
// CHATBOT PERSONA & SYSTEM PROMPT
// ============================================================

const FEEDBACK_BOT_PERSONA = `You are the Propozzy Support Assistant—a friendly, empathetic AI that helps users share feedback, report issues, and request features.

## YOUR PERSONALITY

- Warm and approachable (like a helpful teammate)
- Patient and understanding (never dismissive)
- Solutions-oriented (always try to help)
- Concise but not robotic (2-4 sentences per response)
- Professional but conversational

## YOUR ROLE

1. **Listen actively** - Let users explain fully before asking questions
2. **Categorize intelligently** - Determine if it's a bug, feature request, complaint, or praise
3. **Ask clarifying questions** - Get specific details when needed
4. **Acknowledge emotions** - Validate frustration, celebrate praise
5. **Set expectations** - Tell them what happens next

## CONVERSATION FLOW

**First Message (Always):**

"Hi! I'm here to help. Whether you've found a bug, have a feature idea, or just want to share feedback—I'm all ears. What's on your mind?"

**Follow-Up Questions (Use when needed):**

- For bugs: "Can you share what happened right before the error? Which page were you on?"
- For features: "That's a great idea! What problem would this solve for you?"
- For complaints: "I understand that's frustrating. Can you tell me more about what you were trying to do?"

**Closing (After collecting info):**

"Thanks for sharing this! I've passed it to our team [with HIGH priority / for review]. We typically [respond within 24 hours / include this in our next update]. Anything else I can help with?"

## CRITICAL RULES

- NEVER promise specific features or timelines
- NEVER blame the user (even if it's user error)
- NEVER say "I'm just a bot" (you're the support assistant)
- ALWAYS acknowledge their input as valuable
- Keep responses under 4 sentences unless explaining something complex

## EXAMPLES

**User:** "The proposal generator is broken! It just spins forever."

**You:** "That's definitely not supposed to happen—let's figure this out. Can you tell me what platform you selected and roughly how long your RFP text was? This will help me pinpoint the issue."

**User:** "I love this app but wish I could export proposals as Word docs."

**You:** "Glad you're enjoying Propozzy! Word export is a great idea—especially for clients who prefer editing in Word. I've logged this as a feature request. Is there a specific use case where PDF doesn't work for you?"

**User:** "This is amazing! Saved me 3 hours today."

**You:** "That's exactly what we're aiming for! 🎉 Thanks for letting us know—hearing wins like this keeps our team motivated. Feel free to reach out anytime you need help!"

## SENTIMENT DETECTION

- Positive: "love," "amazing," "great," "perfect," "saved me time"
- Negative: "broken," "frustrated," "doesn't work," "waste of time," "horrible"
- Neutral: "how do I," "can you," "is it possible," "I have a question"`

// ============================================================
// CHATBOT CORE LOGIC
// ============================================================

export async function generateChatbotResponse(
  conversationHistory: FeedbackMessage[],
  userMessage: string
): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  // Build conversation context
  const messages = conversationHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
    content: msg.content
  }))

  // Add new user message
  messages.push({
    role: 'user' as const,
    content: userMessage
  })

  try {
    const response = await openai.chat.completions.create({
      model: HELPER_MODEL,
      messages: [
        { role: 'system', content: FEEDBACK_BOT_PERSONA },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 300, // Keep responses concise
    })

    return response.choices[0]?.message?.content || 
      "I'm here to help! Could you tell me more about what you're experiencing?"
  } catch (error) {
    console.error('Chatbot response error:', error)
    throw new Error('Failed to generate response')
  }
}

// ============================================================
// FEEDBACK ANALYSIS (Runs after conversation ends)
// ============================================================

export async function analyzeFeedback(
  conversationHistory: FeedbackMessage[]
): Promise<FeedbackAnalysis> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  const conversationText = conversationHistory
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n')

  const analysisPrompt = `Analyze this user feedback conversation and provide a structured analysis.

CONVERSATION:

"""
${conversationText}
"""

Provide a JSON response with:

{
  "category": "bug" | "feature_request" | "complaint" | "praise" | "question" | "unclear",
  "sentiment": "positive" | "neutral" | "negative",
  "priority": "low" | "medium" | "high" | "urgent",
  "keywords": ["keyword1", "keyword2", ...] (2-5 key terms),
  "summary": "One sentence summary of the feedback",
  "requiresFollowUp": true/false (true if user expects a response or has an unresolved issue)
}

PRIORITY GUIDELINES:
- urgent: App is broken/unusable, data loss, security issue
- high: Major feature broken, paying customer complaint, revenue-impacting
- medium: Feature request from active user, minor bugs, UX issues
- low: Nice-to-have features, general questions, praise

CATEGORY GUIDELINES:
- bug: Something doesn't work as expected
- feature_request: User wants new capability
- complaint: User is unhappy with existing functionality
- praise: Positive feedback about the product
- question: User asking how to do something
- unclear: Can't determine from conversation`

  try {
    const response = await openai.chat.completions.create({
      model: HELPER_MODEL,
      messages: [
        { role: 'system', content: 'You are a feedback analysis expert. Output valid JSON only.' },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No analysis generated')

    return JSON.parse(content) as FeedbackAnalysis
  } catch (error) {
    console.error('Feedback analysis error:', error)
    // Return default analysis on error
    return {
      category: 'unclear',
      sentiment: 'neutral',
      priority: 'medium',
      keywords: [],
      summary: 'Analysis failed - manual review needed',
      requiresFollowUp: true
    }
  }
}

// ============================================================
// UTILITY: EMAIL NOTIFICATION (for urgent feedback)
// ============================================================

export interface EmailNotificationParams {
  to: string // Admin email
  userName?: string
  userEmail?: string
  category: FeedbackCategory
  priority: FeedbackPriority
  summary: string
  conversationUrl: string
}

export function shouldSendEmailNotification(analysis: FeedbackAnalysis): boolean {
  // Send email for urgent issues or high priority bugs
  return analysis.priority === 'urgent' || 
         (analysis.priority === 'high' && analysis.category === 'bug')
}

export async function sendFeedbackNotificationEmail(
  params: EmailNotificationParams
): Promise<void> {
  // If you have Resend configured, use it
  // Otherwise, this is a placeholder for your email service
  
  const { to, userName, userEmail, category, priority, summary, conversationUrl } = params

  const subject = `[${priority.toUpperCase()}] New ${category.replace('_', ' ')}: ${summary.slice(0, 50)}`
  
  const html = `
    <h2>New Feedback Alert</h2>
    <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
    <p><strong>Category:</strong> ${category.replace('_', ' ')}</p>
    <p><strong>User:</strong> ${userName || 'Anonymous'} ${userEmail ? `(${userEmail})` : ''}</p>
    <p><strong>Summary:</strong> ${summary}</p>
    <p><a href="${conversationUrl}">View Full Conversation →</a></p>
  `

  // Example with Resend (optional)
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      await resend.emails.send({
        from: 'Propozzy Feedback <feedback@propozzy.com>',
        to: [to],
        subject,
        html
      })
    } catch (error) {
      console.error('Email notification failed:', error)
    }
  } else {
    console.log('Email notification (not configured):', { to, subject, summary })
  }
}

// ============================================================
// RATE LIMITING (prevent spam)
// ============================================================

export interface RateLimitCheck {
  allowed: boolean
  remainingMessages?: number
  resetTime?: Date
}

export async function checkFeedbackRateLimit(
  userId: string,
  supabase: any
): Promise<RateLimitCheck> {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  // Get message count in last hour for this user
  // Join through sessions to get user's messages
  const { data: sessions, error: sessionsError } = await supabase
    .from('feedback_sessions')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo.toISOString())

  if (sessionsError) {
    console.error('Rate limit check error:', sessionsError)
    return { allowed: true } // Fail open
  }

  const sessionIds = (sessions || []).map(s => s.id)
  
  if (sessionIds.length === 0) {
    return {
      allowed: true,
      remainingMessages: 50,
      resetTime: new Date(now.getTime() + 60 * 60 * 1000)
    }
  }

  const { count, error } = await supabase
    .from('feedback_messages')
    .select('id', { count: 'exact', head: true })
    .in('session_id', sessionIds)
    .eq('role', 'user')
    .gte('created_at', oneHourAgo.toISOString())

  if (error) {
    console.error('Rate limit check error:', error)
    return { allowed: true } // Fail open
  }

  const limit = 50 // 50 messages per hour per user
  const remaining = limit - (count || 0)

  return {
    allowed: remaining > 0,
    remainingMessages: Math.max(0, remaining),
    resetTime: new Date(now.getTime() + 60 * 60 * 1000)
  }
}

// ============================================================
// EXPORT ALL
// ============================================================

export const FeedbackChatbot = {
  generateResponse: generateChatbotResponse,
  analyzeFeedback,
  shouldNotify: shouldSendEmailNotification,
  sendNotification: sendFeedbackNotificationEmail,
  checkRateLimit: checkFeedbackRateLimit
}

export default FeedbackChatbot

