-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can access cache" ON api_cache;

-- Create a more permissive policy for the api_cache table
CREATE POLICY "Enable read access for all users"
  ON api_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON api_cache
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON api_cache
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON api_cache
  FOR DELETE
  TO anon, authenticated
  USING (true);