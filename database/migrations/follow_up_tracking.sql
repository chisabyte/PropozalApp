-- Follow-Up Tracking Migration
-- Adds support for tracking follow-up messages sent for proposals

-- Add last_follow_up_at to track when last follow-up was sent
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS last_follow_up_at TIMESTAMP WITH TIME ZONE;

-- Add follow_up_count to track how many follow-ups have been sent
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS follow_up_count INTEGER DEFAULT 0;

-- Create index for faster queries on follow-up status
CREATE INDEX IF NOT EXISTS idx_proposals_last_follow_up ON proposals(last_follow_up_at);

-- Comments for documentation
COMMENT ON COLUMN proposals.last_follow_up_at IS 'Timestamp of when the last follow-up message was generated';
COMMENT ON COLUMN proposals.follow_up_count IS 'Number of follow-up messages generated for this proposal';

-- ============================================
-- Proposal Follow-ups Table
-- Tracks individual follow-up messages sent
-- ============================================

CREATE TABLE IF NOT EXISTS proposal_followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Follow-up content
  tone TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Timestamps
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Response tracking
  response_received BOOLEAN DEFAULT FALSE,
  response_received_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  mention_engagement BOOLEAN DEFAULT FALSE,
  additional_context TEXT
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_proposal_followups_proposal ON proposal_followups(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_followups_user ON proposal_followups(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_followups_sent ON proposal_followups(sent_at);

-- Comments for documentation
COMMENT ON TABLE proposal_followups IS 'Tracks individual follow-up messages generated and sent for proposals';
COMMENT ON COLUMN proposal_followups.tone IS 'Tone used for generation: friendly_checkin, professional_reminder, etc.';
COMMENT ON COLUMN proposal_followups.subject IS 'Email subject line';
COMMENT ON COLUMN proposal_followups.body IS 'Email body content';
COMMENT ON COLUMN proposal_followups.sent_at IS 'When the user opened the email client (assumed sent)';
COMMENT ON COLUMN proposal_followups.response_received IS 'Whether a response was received after this follow-up';
