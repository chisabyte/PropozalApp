-- Add quality score and analysis columns to proposals table
ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS quality_score INTEGER,
ADD COLUMN IF NOT EXISTS quality_analysis JSONB;
