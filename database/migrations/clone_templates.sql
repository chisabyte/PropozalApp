-- Clone & Templates Migration
-- Adds support for cloning proposals and template system

-- Add is_template flag
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;

-- Add template category for organization
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS template_category TEXT;
-- Values: 'web_dev', 'design', 'marketing', 'consulting', 'writing', 'other'

-- Add cloned_from_id to track clone history
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS cloned_from_id UUID REFERENCES proposals(id) ON DELETE SET NULL;

-- Add clone_count to track how many times a proposal was cloned
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS clone_count INTEGER DEFAULT 0;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_proposals_is_template ON proposals(is_template) WHERE is_template = true;
CREATE INDEX IF NOT EXISTS idx_proposals_cloned_from ON proposals(cloned_from_id);
CREATE INDEX IF NOT EXISTS idx_proposals_template_category ON proposals(template_category);

-- Comments for documentation
COMMENT ON COLUMN proposals.is_template IS 'Whether this proposal is saved as a reusable template';
COMMENT ON COLUMN proposals.template_category IS 'Category for organizing templates: web_dev, design, marketing, consulting, writing, other';
COMMENT ON COLUMN proposals.cloned_from_id IS 'ID of the original proposal this was cloned from';
COMMENT ON COLUMN proposals.clone_count IS 'Number of times this proposal has been cloned';
