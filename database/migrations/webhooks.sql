-- Webhook Settings Table
CREATE TABLE IF NOT EXISTS webhook_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  secret TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_webhook_settings_user ON webhook_settings(user_id);

-- Webhook Deliveries Table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  webhook_settings_id UUID REFERENCES webhook_settings(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  failed BOOLEAN DEFAULT FALSE,
  retry_count INTEGER DEFAULT 0
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_user ON webhook_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_settings ON webhook_deliveries(webhook_settings_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created ON webhook_deliveries(delivered_at);

-- Comments
COMMENT ON TABLE webhook_settings IS 'Stores user webhook configuration for external integrations';
COMMENT ON TABLE webhook_deliveries IS 'Log of all webhook events sent to user endpoints';
