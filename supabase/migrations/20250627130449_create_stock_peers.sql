-- Create stock_peers table for storing competitor relationships
CREATE TABLE IF NOT EXISTS stock_peers (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  peers TEXT[] NOT NULL DEFAULT '{}',
  sector VARCHAR(100),
  industry VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on symbol for fast lookups
CREATE INDEX IF NOT EXISTS idx_stock_peers_symbol ON stock_peers(symbol);

-- Add some sample data
INSERT INTO stock_peers (symbol, name, peers, sector, industry) VALUES
('AAPL', 'Apple Inc.', ARRAY['MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META'], 'Technology', 'Consumer Electronics'),
('ZGN', 'Ermenegildo Zegna N.V.', ARRAY['LVMH', 'KORS', 'COH', 'TPR', 'CPRI'], 'Consumer Discretionary', 'Luxury Goods'),
('MSFT', 'Microsoft Corporation', ARRAY['AAPL', 'GOOGL', 'AMZN', 'META', 'NFLX'], 'Technology', 'Software'),
('GOOGL', 'Alphabet Inc.', ARRAY['AAPL', 'MSFT', 'META', 'AMZN', 'NFLX'], 'Technology', 'Internet Services'),
('TSLA', 'Tesla, Inc.', ARRAY['GM', 'F', 'NIO', 'RIVN', 'LCID'], 'Consumer Discretionary', 'Electric Vehicles'),
('META', 'Meta Platforms, Inc.', ARRAY['GOOGL', 'SNAP', 'PINS', 'SPOT', 'NFLX'], 'Technology', 'Social Media'),
('NVDA', 'NVIDIA Corporation', ARRAY['AMD', 'INTC', 'QCOM', 'AVGO', 'MU'], 'Technology', 'Semiconductors'),
('AMZN', 'Amazon.com, Inc.', ARRAY['AAPL', 'GOOGL', 'MSFT', 'WMT', 'EBAY'], 'Consumer Discretionary', 'E-commerce'),
('LVMH', 'LVMH Moët Hennessy Louis Vuitton', ARRAY['ZGN', 'KORS', 'COH', 'TPR', 'CPRI'], 'Consumer Discretionary', 'Luxury Goods')
ON CONFLICT (symbol) DO UPDATE SET
  name = EXCLUDED.name,
  peers = EXCLUDED.peers,
  sector = EXCLUDED.sector,
  industry = EXCLUDED.industry,
  updated_at = NOW();
