-- ============================================================================
-- PROPOSALFORGE PRODUCTION UPDATE SCRIPT
-- ============================================================================
-- Run this script in the Supabase SQL Editor to apply P1/P2 fixes.
-- This script:
-- 1. Adds 'rate_limits' and 'proposal_views' tables.
-- 2. Updates RLS policies to be compatible with Clerk/Service Role architecture.
-- ============================================================================

-- 1. Create Rate Limits Table (for P1 Rate Limiting)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  requests INTEGER DEFAULT 1,
  window_start TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- 2. Create Proposal Views Table (for P2 Public Viewer)
CREATE TABLE IF NOT EXISTS proposal_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  viewer_ip TEXT,
  user_agent TEXT,
  referer TEXT
);
ALTER TABLE proposal_views ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_proposal_views_proposal_id ON proposal_views(proposal_id);

-- 3. Reset RLS Policies
-- We drop existing policies to remove dependencies on auth.uid() which is not used with Clerk.
-- Since we use the Supabase Service Role (Admin) key for all backend operations, 
-- we set default policies to DENY public access as a safety measure.

-- Drop old potential policies (ignoring errors if they don't exist)
DO $$ 
BEGIN
  -- Users
  DROP POLICY IF EXISTS "Users can view their own data" ON users;
  DROP POLICY IF EXISTS "Users can insert their own data" ON users;
  DROP POLICY IF EXISTS "Users can update their own data" ON users;
  
  -- Portfolio
  DROP POLICY IF EXISTS "Users can view their own portfolio items" ON portfolio_items;
  DROP POLICY IF EXISTS "Users can insert their own portfolio items" ON portfolio_items;
  DROP POLICY IF EXISTS "Users can update their own portfolio items" ON portfolio_items;
  DROP POLICY IF EXISTS "Users can delete their own portfolio items" ON portfolio_items;

  -- Proposals
  DROP POLICY IF EXISTS "Users can view their own proposals" ON proposals;
  DROP POLICY IF EXISTS "Users can insert their own proposals" ON proposals;
  DROP POLICY IF EXISTS "Users can update their own proposals" ON proposals;
  DROP POLICY IF EXISTS "Users can delete their own proposals" ON proposals;

  -- Subscriptions
  DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
  
  -- Usage
  DROP POLICY IF EXISTS "Users can view their own usage" ON usage_tracking;
  DROP POLICY IF EXISTS "Users can insert their own usage" ON usage_tracking;
  DROP POLICY IF EXISTS "Users can update their own usage" ON usage_tracking;
END $$;

-- Create new SAFETY NET policies (Deny all public access)
-- Application Logic via Service Role handles all access control.
CREATE POLICY "No public access" ON users FOR ALL USING (false);
CREATE POLICY "No public access" ON portfolio_items FOR ALL USING (false);
CREATE POLICY "No public access" ON proposals FOR ALL USING (false);
CREATE POLICY "No public access" ON subscriptions FOR ALL USING (false);
CREATE POLICY "No public access" ON usage_tracking FOR ALL USING (false);
CREATE POLICY "No public access" ON rate_limits FOR ALL USING (false);
CREATE POLICY "No public access" ON proposal_views FOR ALL USING (false);
