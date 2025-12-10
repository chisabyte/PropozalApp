-- Feature Upgrades Migration
-- Adds tables and columns for Features 2-15

-- ============================================================
-- FEATURE 2: Template Style Selector
-- ============================================================
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS style TEXT DEFAULT 'modern_clean';
-- Styles: modern_clean, corporate, minimalist, creative_agency, startup_pitch, technical

-- ============================================================
-- FEATURE 3: AI Pricing Table & Timeline Generator
-- ============================================================
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS pricing_table JSONB;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS timeline JSONB;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS include_pricing BOOLEAN DEFAULT false;

-- ============================================================
-- FEATURE 4: Proposal Intelligence Dashboard (enhancements)
-- ============================================================
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS win_probability DECIMAL(5,2);
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS tone TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS proposal_length INTEGER; -- word count
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS quality_score INTEGER; -- from quality evaluator

-- ============================================================
-- FEATURE 6: Onboarding Walkthrough Video
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_video_dismissed BOOLEAN DEFAULT false;

-- ============================================================
-- FEATURE 8: Prompt Memory ("Write Like Me" Mode)
-- ============================================================
CREATE TABLE IF NOT EXISTS style_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL,
  writing_patterns JSONB NOT NULL, -- AI-extracted style patterns
  sample_proposals TEXT[], -- References to proposal IDs used for training
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_style_profiles_user_id ON style_profiles(user_id);

-- ============================================================
-- FEATURE 9: Team Collaboration (Workspaces)
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor', -- owner, editor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Add team_id to proposals and portfolio_items for sharing
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- ============================================================
-- FEATURE 10: AI Insights
-- ============================================================
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS ai_insights JSONB;
-- Structure: { strengths: [], weaknesses: [], hiddenNeeds: [], recommendations: [] }

-- ============================================================
-- FEATURE 11: PDF Cover Page
-- ============================================================
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS cover_page_data JSONB;
-- Structure: { title: string, clientName: string, summary: string, theme: string }

-- ============================================================
-- FEATURE 12: Multi-Language Support
-- ============================================================
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
-- Languages: en, es, pt, ar, id, hi

-- ============================================================
-- FEATURE 14: AI Semantic Proposal Search
-- ============================================================
-- NOTE: This feature requires the pgvector extension
-- If you don't need semantic search, you can skip this section
-- To enable: Run "CREATE EXTENSION IF NOT EXISTS vector;" first

-- Try to enable pgvector extension (will fail silently if not available)
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not available. Skipping semantic search feature.';
END $$;

-- Only create embeddings table if pgvector is available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    CREATE TABLE IF NOT EXISTS proposal_embeddings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
      embedding vector(1536), -- OpenAI embedding dimension
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_proposal_embeddings_proposal_id ON proposal_embeddings(proposal_id);
  ELSE
    RAISE NOTICE 'Skipping proposal_embeddings table - pgvector extension not available';
  END IF;
END $$;

-- ============================================================
-- FEATURE 15: AI Ecosystem Tools
-- ============================================================
CREATE TABLE IF NOT EXISTS tool_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL, -- follow_up_email, contract_draft, message_reply
  input_data JSONB,
  output_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON tool_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_tool_type ON tool_usage(tool_type);

-- ============================================================
-- FEATURE 7: Chrome Extension Support
-- ============================================================
CREATE TABLE IF NOT EXISTS extension_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extension_tokens_token ON extension_tokens(token);
CREATE INDEX IF NOT EXISTS idx_extension_tokens_user_id ON extension_tokens(user_id);

-- ============================================================
-- RLS Policies for new tables
-- ============================================================
ALTER TABLE style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_tokens ENABLE ROW LEVEL SECURITY;

-- Only enable RLS on proposal_embeddings if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'proposal_embeddings') THEN
    ALTER TABLE proposal_embeddings ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

CREATE POLICY "No public access" ON style_profiles FOR ALL USING (false);
CREATE POLICY "No public access" ON teams FOR ALL USING (false);
CREATE POLICY "No public access" ON team_members FOR ALL USING (false);
CREATE POLICY "No public access" ON tool_usage FOR ALL USING (false);
CREATE POLICY "No public access" ON extension_tokens FOR ALL USING (false);

-- Only create policy for proposal_embeddings if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'proposal_embeddings') THEN
    CREATE POLICY "No public access" ON proposal_embeddings FOR ALL USING (false);
  END IF;
END $$;

