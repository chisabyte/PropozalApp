-- ============================================================================
-- PROPOSALFORGE FREE TIER DATABASE UPDATE
-- ============================================================================
-- Run this AFTER the manual_update.sql script.
-- Adds plan fields to users table for Free/Starter/Pro tier enforcement.
-- ============================================================================

-- 1. Add plan columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS proposal_quota_monthly INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMP DEFAULT NOW();

-- 2. Create index for faster plan lookups
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);

-- 3. Update existing users to have the free plan (safe for existing data)
UPDATE users 
SET plan = 'free', proposal_quota_monthly = 3 
WHERE plan IS NULL;

-- 4. Ensure usage_tracking has proper columns
-- (Should already exist, but confirm period_start is indexed)
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(user_id, period_start);

-- 5. Comment for clarity
COMMENT ON COLUMN users.plan IS 'User plan: free, starter, or pro';
COMMENT ON COLUMN users.proposal_quota_monthly IS 'Monthly proposal limit based on plan';
