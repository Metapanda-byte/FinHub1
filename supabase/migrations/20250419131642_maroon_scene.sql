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
    - Add policy for authenticated users to read and write cache data
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

-- Allow authenticated users to read and write cache data
CREATE POLICY "Authenticated users can manage cache data"
  ON api_cache
  FOR ALL
  TO authenticated
  USING (true);

-- Allow public read access to cache data
CREATE POLICY "Public can read cache data"
  ON api_cache
  FOR SELECT
  TO public
  USING (true);