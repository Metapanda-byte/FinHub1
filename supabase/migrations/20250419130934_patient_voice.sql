/*
  # Cache System for Financial Data

  1. New Tables
    - `api_cache`
      - `id` (uuid, primary key)
      - `ticker` (text, indexed)
      - `endpoint` (text, indexed)
      - `data` (jsonb)
      - `timestamp` (timestamptz)
      - `expires_at` (timestamptz)

  2. Security
    - Enable RLS on `api_cache` table
    - Add policies for read/write access
*/

CREATE TABLE IF NOT EXISTS api_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text NOT NULL,
  endpoint text NOT NULL,
  data jsonb NOT NULL,
  timestamp timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE(ticker, endpoint)
);

CREATE INDEX idx_api_cache_ticker ON api_cache(ticker);
CREATE INDEX idx_api_cache_endpoint ON api_cache(endpoint);
CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);

ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow read access to everyone"
  ON api_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow insert/update access to authenticated users
CREATE POLICY "Allow insert/update access to authenticated users"
  ON api_cache
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM api_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to clean expired cache entries every hour
SELECT cron.schedule(
  'cleanup-cache',
  '0 * * * *', -- Every hour
  $$SELECT clean_expired_cache()$$
);