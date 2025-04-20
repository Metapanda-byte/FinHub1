-- Drop existing policies
DROP POLICY IF EXISTS "Public can manage cache data" ON api_cache;

-- Create new policy for public access
CREATE POLICY "Anyone can access cache"
  ON api_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled but allows public access
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;