-- ============================================================
-- FEEDBACK CHATBOT SYSTEM MIGRATION
-- ============================================================
-- Run this in your Supabase SQL editor
-- Creates tables for feedback sessions and messages
-- ============================================================

-- Feedback sessions table
CREATE TABLE IF NOT EXISTS feedback_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  category TEXT,
  sentiment TEXT,
  priority TEXT,
  keywords TEXT[], -- Array of keywords
  summary TEXT,
  requires_follow_up BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback messages table (chat history)
CREATE TABLE IF NOT EXISTS feedback_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES feedback_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_user_id ON feedback_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_priority ON feedback_sessions(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_resolved ON feedback_sessions(resolved);
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_created_at ON feedback_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_session_id ON feedback_messages(session_id);

-- RLS Policies
-- Note: Since this codebase uses Clerk and getSupabaseAdmin() (which bypasses RLS),
-- these policies are optional. The API routes handle authorization via Clerk.
-- If you want to add RLS policies for additional security, uncomment and adjust:
--
-- ALTER TABLE feedback_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE feedback_messages ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Users can view their own feedback sessions"
--   ON feedback_sessions FOR SELECT
--   USING (user_id IN (SELECT clerk_id::text FROM users WHERE clerk_id = current_setting('app.user_id', true)));
--
-- CREATE POLICY "Users can create feedback sessions"
--   ON feedback_sessions FOR INSERT
--   WITH CHECK (user_id IN (SELECT clerk_id::text FROM users WHERE clerk_id = current_setting('app.user_id', true)));
--
-- CREATE POLICY "Users can update their own feedback sessions"
--   ON feedback_sessions FOR UPDATE
--   USING (user_id IN (SELECT clerk_id::text FROM users WHERE clerk_id = current_setting('app.user_id', true)));
--
-- CREATE POLICY "Users can view messages from their sessions"
--   ON feedback_messages FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM feedback_sessions
--       WHERE feedback_sessions.id = feedback_messages.session_id
--       AND feedback_sessions.user_id IN (SELECT clerk_id::text FROM users WHERE clerk_id = current_setting('app.user_id', true))
--     )
--   );
--
-- CREATE POLICY "Users can insert messages to their sessions"
--   ON feedback_messages FOR INSERT
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM feedback_sessions
--       WHERE feedback_sessions.id = feedback_messages.session_id
--       AND feedback_sessions.user_id IN (SELECT clerk_id::text FROM users WHERE clerk_id = current_setting('app.user_id', true))
--     )
--   );

