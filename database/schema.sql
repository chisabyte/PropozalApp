-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio items table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT, -- Full case study text
  tags TEXT[], -- Array of strings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  original_rfp TEXT NOT NULL,
  generated_proposal TEXT NOT NULL,
  title TEXT,
  platform TEXT, -- Upwork, Fiverr, etc.
  status TEXT DEFAULT 'draft', -- draft, sent, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table (mirrors Stripe)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT, -- active, canceled, past_due
  plan_id TEXT, -- price_xxx
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  proposals_generated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate Limits Table (New for P1)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  requests INTEGER DEFAULT 1,
  window_start TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Proposal Views Table (New for P2)
CREATE TABLE IF NOT EXISTS proposal_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  viewer_ip TEXT,
  user_agent TEXT,
  referer TEXT
);
CREATE INDEX IF NOT EXISTS idx_proposal_views_proposal_id ON proposal_views(proposal_id);

-- Row Level Security (RLS) Policies
-- STRATEGY: Pattern B (Service Role + App-level enforcement)
-- Since we use Clerk for auth and Supabase primarily via Service Role client in Next.js API routes,
-- we delegate authorization to the application layer. RLS is kept enabled but policies allow 
-- operations because the API routes will enforce user_id checks.
-- Direct client-side access (if any) is blocked by default since we don't use Supabase Auth sessions.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_views ENABLE ROW LEVEL SECURITY;

-- POLICIES -----------------------------------------------------------------
-- Note: These policies allow "public" access if RLS is bypassed or if we relied on Supabase Auth.
-- But since we use Service Role Key for all backend ops, these policies act as a safety net
-- ensuring that IF we ever used a client connection, it would default to "no access" unless 
-- we explicitely added `auth.uid()` logic. 

CREATE POLICY "No public access" ON users FOR ALL USING (false);
CREATE POLICY "No public access" ON portfolio_items FOR ALL USING (false);
CREATE POLICY "No public access" ON proposals FOR ALL USING (false);
CREATE POLICY "No public access" ON subscriptions FOR ALL USING (false);
CREATE POLICY "No public access" ON usage_tracking FOR ALL USING (false);
CREATE POLICY "No public access" ON rate_limits FOR ALL USING (false);
CREATE POLICY "No public access" ON proposal_views FOR ALL USING (false);
