-- Migration: Add e-signature fields to proposals table
-- File: database/migrations/add_signature_fields.sql

-- Create enum for proposal status if it doesn't exist
DO $$ BEGIN
  CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'viewed', 'signed', 'expired', 'declined');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add signature fields to proposals table
ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS signed_by_name TEXT,
ADD COLUMN IF NOT EXISTS signed_by_email TEXT,
ADD COLUMN IF NOT EXISTS signed_ip TEXT,
ADD COLUMN IF NOT EXISTS signed_user_agent TEXT,
ADD COLUMN IF NOT EXISTS signed_signature_image TEXT,
ADD COLUMN IF NOT EXISTS signed_status proposal_status DEFAULT 'draft';

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_proposals_signed_status ON proposals(signed_status);

-- Create index for signed_at for analytics
CREATE INDEX IF NOT EXISTS idx_proposals_signed_at ON proposals(signed_at) WHERE signed_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN proposals.signed_signature_image IS 'Base64 encoded signature image data URI';
COMMENT ON COLUMN proposals.signed_ip IS 'IP address of signer for audit trail';
COMMENT ON COLUMN proposals.signed_user_agent IS 'Browser user agent for audit trail';
