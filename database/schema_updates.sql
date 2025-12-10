-- Add missing columns for enhanced features

-- Add tone_preference to users (if not already added)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tone_preference TEXT;

-- Add status tracking to proposals (extend beyond draft/final)
-- Status: draft, sent, won, lost, declined
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS won_at TIMESTAMP;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Add analytics tracking
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0;

-- Add RFP extraction data
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS extracted_requirements JSONB;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS extracted_deliverables TEXT[];
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS extracted_budget TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS extracted_timeline TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS extracted_red_flags TEXT[];

-- Add portfolio matching data (store portfolio item UUIDs)
-- Note: Can be UUID[] or TEXT[] depending on preference. UUID[] is more normalized.
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS matched_portfolio_items UUID[];

-- Add proposal templates
CREATE TABLE IF NOT EXISTS proposal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add proposal views tracking (for analytics)
CREATE TABLE IF NOT EXISTS proposal_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  duration_seconds INTEGER
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_sent_at ON proposals(sent_at);
CREATE INDEX IF NOT EXISTS idx_proposals_won_at ON proposals(won_at);
CREATE INDEX IF NOT EXISTS idx_proposal_views_proposal_id ON proposal_views(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_templates_user_id ON proposal_templates(user_id);

-- RLS policies for new tables
ALTER TABLE proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_views ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist, then recreate (to avoid conflicts)
DROP POLICY IF EXISTS "Users can manage their own templates" ON proposal_templates;
CREATE POLICY "Users can manage their own templates"
  ON proposal_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = proposal_templates.user_id
      AND users.clerk_user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can view views for their proposals" ON proposal_views;
CREATE POLICY "Users can view views for their proposals"
  ON proposal_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN users ON users.id = proposals.user_id
      WHERE proposals.id = proposal_views.proposal_id
      AND users.clerk_user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Anyone can insert proposal views" ON proposal_views;
CREATE POLICY "Anyone can insert proposal views"
  ON proposal_views FOR INSERT
  WITH CHECK (true);

