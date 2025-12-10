-- Proposal Expiry Migration
-- Adds expiry date functionality to create urgency and improve conversion

-- Add expires_at column (when proposal expires)
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add expired_action column (what happens when expired)
-- Values: 'show_message', 'hide', 'redirect'
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS expired_action TEXT DEFAULT 'show_message';

-- Add expiry_message column (custom message to show when expired)
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS expiry_message TEXT;

-- Add expired status to valid statuses (for tracking)
-- Note: The status column already exists, we just need to allow 'expired' as a value

-- Create index for faster expiry queries
CREATE INDEX IF NOT EXISTS idx_proposals_expires_at ON proposals(expires_at);
CREATE INDEX IF NOT EXISTS idx_proposals_expires_at_status ON proposals(expires_at, status);

-- Comments for documentation
COMMENT ON COLUMN proposals.expires_at IS 'Timestamp when the proposal expires and becomes unavailable';
COMMENT ON COLUMN proposals.expired_action IS 'Action to take when expired: show_message, hide, or redirect';
COMMENT ON COLUMN proposals.expiry_message IS 'Custom message to display when proposal has expired';
