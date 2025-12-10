-- 1. System Templates (Safe to drop and recreate as they are static config)
DROP TABLE IF EXISTS proposal_templates CASCADE;

CREATE TABLE proposal_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT,
  platform_fit TEXT[],
  default_sections JSONB NOT NULL,
  tone_hint TEXT,
  thumbnail_url TEXT,
  use_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for filtering
CREATE INDEX idx_proposal_templates_category ON proposal_templates(category);
CREATE INDEX idx_proposal_templates_industry ON proposal_templates(industry);

-- 2. User Templates (Personal Templates)
CREATE TABLE IF NOT EXISTS user_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sections JSONB NOT NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user templates
CREATE INDEX IF NOT EXISTS idx_user_templates_user ON user_templates(user_id);

-- 3. Update Proposals Table
-- Add template tracking column safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'template_used_id') THEN
        ALTER TABLE proposals ADD COLUMN template_used_id TEXT;
    END IF;
END $$;

-- Comments
COMMENT ON TABLE proposal_templates IS 'System-wide proposal templates';
COMMENT ON TABLE user_templates IS 'User-created custom templates';
