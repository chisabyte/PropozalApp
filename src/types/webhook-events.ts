export type WebhookEvent = 
  | "proposal.created"
  | "proposal.sent"
  | "proposal.viewed"
  | "proposal.won"
  | "proposal.lost"

export interface WebhookPayload<T = any> {
  event: WebhookEvent
  timestamp: string
  data: T
  user_id?: string
}

export interface ProposalCreatedData {
  proposal_id: string
  title: string
  platform: string | null
  status: string
  project_value: number | null
  created_at: string
  rfp_summary?: string
}

export interface ProposalSentData {
  proposal_id: string
  title: string
  status: string
  sent_at: string
  public_url?: string
}

export interface ProposalViewedData {
  proposal_id: string
  title: string
  view_count: number
  last_viewed_at: string
  viewer_location?: string
  device_type?: string
}

export interface ProposalWonData {
  proposal_id: string
  title: string
  status: string
  won_at: string
  project_value_actual?: number
  client_info?: any
}

export interface ProposalLostData {
  proposal_id: string
  title: string
  status: string
  lost_reason?: string
  lost_at: string
}
