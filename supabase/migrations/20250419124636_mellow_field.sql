/*
  # Create watchlists and watchlist items tables

  1. New Tables
    - `watchlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `watchlist_items`
      - `id` (uuid, primary key)
      - `watchlist_id` (uuid, references watchlists)
      - `symbol` (text)
      - `added_at` (timestamp)
      - `notes` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their watchlists
*/

-- Create watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create watchlist items table
CREATE TABLE IF NOT EXISTS watchlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id uuid REFERENCES watchlists(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  added_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(watchlist_id, symbol)
);

-- Enable RLS
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;

-- Watchlists policies
CREATE POLICY "Users can view own watchlists"
  ON watchlists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create watchlists"
  ON watchlists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlists"
  ON watchlists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists"
  ON watchlists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Watchlist items policies
CREATE POLICY "Users can view items in own watchlists"
  ON watchlist_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM watchlists
      WHERE id = watchlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add items to own watchlists"
  ON watchlist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM watchlists
      WHERE id = watchlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in own watchlists"
  ON watchlist_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM watchlists
      WHERE id = watchlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from own watchlists"
  ON watchlist_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM watchlists
      WHERE id = watchlist_id
      AND user_id = auth.uid()
    )
  );