-- Proposal Engagement Tracking Migration
-- Enhanced tracking for client engagement with public proposals

-- Create proposal_engagement table for detailed session tracking
CREATE TABLE IF NOT EXISTS proposal_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- Client-side generated session ID
  
  -- View tracking
  first_view_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_view_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count INTEGER DEFAULT 1,
  
  -- Time tracking
  total_time_spent INTEGER DEFAULT 0, -- Total seconds on page
  
  -- Scroll tracking
  scroll_depth_max INTEGER DEFAULT 0, -- Highest % scrolled (0-100)
  sections_viewed JSONB DEFAULT '[]'::jsonb, -- Array of section names viewed
  
  -- Device & source info
  device_type TEXT, -- mobile, tablet, desktop
  user_agent TEXT,
  referrer TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint on proposal + session
  UNIQUE(proposal_id, session_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_proposal_engagement_proposal_id ON proposal_engagement(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_engagement_last_view ON proposal_engagement(last_view_at);
CREATE INDEX IF NOT EXISTS idx_proposal_engagement_session ON proposal_engagement(session_id);

-- Add sharing tracking columns to proposals table
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS shared_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS share_method TEXT; -- link, email, qr

ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE proposal_engagement ENABLE ROW LEVEL SECURITY;

-- RLS Policy (same pattern as other tables - service role access)
CREATE POLICY "No public access" ON proposal_engagement FOR ALL USING (false);

-- Comments for documentation
COMMENT ON TABLE proposal_engagement IS 'Tracks detailed client engagement with public proposals';
COMMENT ON COLUMN proposal_engagement.session_id IS 'Client-side generated unique session identifier';
COMMENT ON COLUMN proposal_engagement.scroll_depth_max IS 'Maximum scroll depth reached (0-100%)';
COMMENT ON COLUMN proposal_engagement.sections_viewed IS 'JSON array of section names that were scrolled into view';
COMMENT ON COLUMN proposal_engagement.total_time_spent IS 'Cumulative seconds spent viewing the proposal';
