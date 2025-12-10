-- Create events table for analytics tracking
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  proposal_id UUID REFERENCES proposals(id),
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_proposal ON events(proposal_id);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow public access since using Clerk for auth
-- Authorization is handled at application layer
CREATE POLICY "Allow public access to events" ON events FOR ALL
USING (true);
