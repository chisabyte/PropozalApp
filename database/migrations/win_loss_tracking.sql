-- Win/Loss Tracking Migration
-- Adds columns to track actual project values, win timestamps, and loss reasons

-- Add project_value_actual column (actual won amount in cents)
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS project_value_actual DECIMAL(12, 2);

-- Add won_at column (timestamp when marked as won)
-- Note: This column may already exist, so we use IF NOT EXISTS
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proposals' AND column_name = 'won_at'
  ) THEN
    ALTER TABLE proposals ADD COLUMN won_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add lost_reason column (why the proposal was lost)
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS lost_reason TEXT;

-- Add win_notes column (notes about what made the proposal successful)
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS win_notes TEXT;

-- Add add_to_portfolio flag (whether user wants to add won project to portfolio)
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS add_to_portfolio BOOLEAN DEFAULT FALSE;

-- Create index for faster analytics queries
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_won_at ON proposals(won_at);
CREATE INDEX IF NOT EXISTS idx_proposals_platform_status ON proposals(platform, status);

-- Comment on columns for documentation
COMMENT ON COLUMN proposals.project_value_actual IS 'Actual project value when won (in cents)';
COMMENT ON COLUMN proposals.won_at IS 'Timestamp when proposal was marked as won';
COMMENT ON COLUMN proposals.lost_reason IS 'Reason why the proposal was lost';
COMMENT ON COLUMN proposals.win_notes IS 'Notes about what made this proposal successful';
COMMENT ON COLUMN proposals.add_to_portfolio IS 'Whether user wants to add this won project to portfolio';
