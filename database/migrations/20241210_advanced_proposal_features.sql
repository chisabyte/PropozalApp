-- ============================================================
-- ADVANCED PROPOSAL FEATURES MIGRATION
-- ============================================================
-- Run this in your Supabase SQL editor
-- Adds tables and columns for section regeneration, A/B testing, and complexity analysis
-- ============================================================

-- ============================================================
-- 1. Proposal Variations Table (for A/B testing tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS proposal_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
  hook_strategy TEXT NOT NULL,
  content TEXT NOT NULL,
  differentiating_factor TEXT,
  views_count INTEGER DEFAULT 0,
  selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposal_variations_proposal_id ON proposal_variations(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_variations_user_id ON proposal_variations(user_id);

-- Enable RLS (optional - API routes use admin client which bypasses RLS)
ALTER TABLE proposal_variations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Note: Since this codebase uses Clerk and getSupabaseAdmin() (which bypasses RLS),
-- these policies are optional. The API routes handle authorization via Clerk.
-- If you want to add RLS policies for additional security, uncomment and adjust:
--
-- CREATE POLICY "Users can view their own variations"
--   ON proposal_variations FOR SELECT
--   USING (user_id IN (SELECT clerk_id::text FROM users WHERE clerk_id = current_setting('app.user_id', true)));
--
-- CREATE POLICY "Users can insert their own variations"
--   ON proposal_variations FOR INSERT
--   WITH CHECK (user_id IN (SELECT clerk_id::text FROM users WHERE clerk_id = current_setting('app.user_id', true)));
--
-- CREATE POLICY "Users can update their own variations"
--   ON proposal_variations FOR UPDATE
--   USING (user_id IN (SELECT clerk_id::text FROM users WHERE clerk_id = current_setting('app.user_id', true)));

-- ============================================================
-- 2. Add complexity analysis fields to proposals table
-- ============================================================

ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS complexity_score INTEGER,
ADD COLUMN IF NOT EXISTS recommended_length TEXT CHECK (recommended_length IN ('shorter', 'same', 'longer')),
ADD COLUMN IF NOT EXISTS applied_length TEXT CHECK (applied_length IN ('shorter', 'same', 'longer'));

-- ============================================================
-- 3. Section regeneration history (optional - for tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS section_regenerations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  section_name TEXT NOT NULL,
  previous_content TEXT,
  new_content TEXT,
  instruction TEXT,
  regenerated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_section_regenerations_proposal_id ON section_regenerations(proposal_id);

ALTER TABLE section_regenerations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (see note above about Clerk - optional since admin client is used)
-- Uncomment and adjust if you want RLS policies:
--
-- CREATE POLICY "Users can view their own regeneration history"
--   ON section_regenerations FOR SELECT
--   USING (user_id IN (SELECT clerk_id::text FROM users WHERE clerk_id = current_setting('app.user_id', true)));
--
-- CREATE POLICY "Users can insert their own regeneration history"
--   ON section_regenerations FOR INSERT
--   WITH CHECK (user_id IN (SELECT clerk_id::text FROM users WHERE clerk_id = current_setting('app.user_id', true)));

