-- Fix matched_portfolio_items column type
-- This handles the case where the column might exist as TEXT[] but needs to be UUID[]

-- Step 1: Drop the column if it exists (safe - data will be lost but it's just matching data)
ALTER TABLE proposals DROP COLUMN IF EXISTS matched_portfolio_items;

-- Step 2: Add it back as UUID[] (correct type)
ALTER TABLE proposals ADD COLUMN matched_portfolio_items UUID[];

