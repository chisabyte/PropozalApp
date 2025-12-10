-- Row Level Security Policies for E-Signature Feature
-- Note: Using Clerk for auth, so RLS policies allow public access
-- Authorization is enforced at the application layer

-- Allow public read access (for viewing proposals)
-- Application layer controls what users can see
CREATE POLICY "Allow public read access" 
ON proposals FOR SELECT
USING (true);

-- Allow public update access (for signing proposals)
-- Application layer validates signing logic in API routes
CREATE POLICY "Allow public update access" 
ON proposals FOR UPDATE
USING (true);

-- Allow public insert access (for creating proposals)
-- Application layer validates user ownership
CREATE POLICY "Allow public insert access" 
ON proposals FOR INSERT
WITH CHECK (true);

-- Allow public delete access (for deleting proposals)
-- Application layer validates user ownership
CREATE POLICY "Allow public delete access" 
ON proposals FOR DELETE
USING (true);
