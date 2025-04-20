/*
  # Create API Cache Table

  1. New Tables
    - `api_cache`
      - `id` (uuid, primary key)
      - `ticker` (text, not null)
      - `endpoint` (text, not null)
      - `data` (jsonb, not null)
      - `expires_at` (timestamptz, not null)
      - `created_at` (timestamptz, default now())
      - Composite unique constraint on (ticker, endpoint)

  2. Security
    - Enable RLS on `api_cache` table
    - Add policy for authenticated users to read cache data
    - Add policy for service role to manage cache data
*/

CREATE TABLE IF NOT EXISTS api_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text NOT NULL,
  endpoint text NOT NULL,
  data jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(ticker, endpoint)
);

ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

-- Allow all users to read cache data
CREATE POLICY "Anyone can read cache data"
  ON api_cache
  FOR SELECT
  TO public
  USING (true);

-- Allow service role to manage cache data
CREATE POLICY "Service role can manage cache data"
  ON api_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);