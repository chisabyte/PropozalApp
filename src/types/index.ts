export interface User {
  id: string
  clerk_user_id: string
  email: string
  full_name: string | null
  company_name: string | null
  industry: string | null
  tone_preference: string | null
  created_at: string
  updated_at: string
}

export interface PortfolioItem {
  id: string
  user_id: string
  title: string
  description: string
  tags: string[]
  created_at: string
}

export type SignatureStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'expired' | 'declined';

export interface ProposalSignature {
  signed_at: string | null
  signed_by_name: string | null
  signed_by_email: string | null
  signed_ip: string | null
  signed_user_agent: string | null
  signed_signature_image: string | null
  signed_status: SignatureStatus
}

export interface Proposal extends ProposalSignature {
  id: string
  user_id: string
  title: string
  rfp_text: string
  generated_proposal: string
  status: 'draft' | 'sent' | 'won' | 'lost' | 'declined' | 'final' | 'submitted'
  platform: string | null
  project_value: number | null
  sent_at: string | null
  won_at: string | null
  expires_at: string | null
  expired_action: 'show_message' | 'hide' | 'redirect' | null
  expiry_message: string | null
  client_name: string | null
  client_email: string | null
  views: number
  last_viewed_at: string | null
  time_spent_seconds: number
  extracted_requirements: string | null // JSON string
  extracted_deliverables: string[] | null
  extracted_budget: string | null
  extracted_timeline: string | null
  extracted_red_flags: string[] | null
  matched_portfolio_items: string[] | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string | null
  plan_id: 'starter' | 'pro' | 'agency'
  status: 'active' | 'canceled' | 'past_due'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface UsageTracking {
  id: string
  user_id: string
  month: string
  proposals_generated: number
  created_at: string
}

export interface SignProposalRequest {
  name: string
  email: string
  agreed_to_terms: boolean
  signature_image?: string
}

export interface SignProposalResponse {
  success: boolean
  proposal: Proposal
  message?: string
}

