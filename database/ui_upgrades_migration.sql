-- UI Upgrades Database Migration
-- Adds columns for Portfolio, Settings, and Branding features

-- ============================================================
-- Portfolio Enhancements
-- ============================================================
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS use_in_proposals BOOLEAN DEFAULT true;

-- ============================================================
-- User Branding & Preferences
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_color TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS footer_info TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_cta TEXT;

-- ============================================================
-- Indexes for Performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_portfolio_items_industry ON portfolio_items(industry);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_use_in_proposals ON portfolio_items(use_in_proposals);

