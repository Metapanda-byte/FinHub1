# Project Name

Describe your project here.

# Add at the end:

## Perplexity API Integration

The Competitor Analysis feature uses Perplexity AI for intelligent peer selection and company description processing.

### Setup

1. Get a Perplexity API key from [https://www.perplexity.ai/](https://www.perplexity.ai/)
2. Add to your `.env.local`:

```bash
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

### Features

#### 1. **Intelligent Peer Validation**
- Analyzes suggested peers and ranks them by business similarity (1-10 scale)
- Filters out irrelevant companies (keeps only scores ≥ 5)
- Suggests missing major competitors
- Identifies peers that should be excluded

#### 2. **Peer Discovery**
When traditional methods find no peers, Perplexity will:
- Analyze the company's business model
- Identify 5-8 publicly traded competitors
- Focus on companies with similar products, markets, and business models

#### 3. **Company Description Processing**
- Generates concise, substantive descriptions (under 120 characters)
- Focuses on core products/services and key markets
- Removes marketing language and citations
- Results cached for 24 hours

### How It Works

1. **Initial Selection**: Uses FMP APIs and database to find peers
2. **AI Validation**: Perplexity analyzes and refines the peer list
3. **Smart Discovery**: If no peers found, Perplexity suggests competitors
4. **Description Enhancement**: Processes all company descriptions for clarity

### Example Flow

```
Traditional Methods → Find 10 peers
↓
Perplexity Analysis → Ranks peers, suggests GOOGL, excludes SONO
↓
Final List → 8 most relevant peers + GOOGL
```

## Performance Optimizations

The Competitor Analysis API is optimized for speed:

### 1. **Parallel Data Fetching**
- All API calls execute in parallel instead of sequentially
- Fetches profiles, metrics, ratios, statements, and segments simultaneously
- Reduces load time from ~10 seconds to ~2-3 seconds for 10 companies

### 2. **Batch Processing**
- Perplexity processes all company descriptions in a single API call
- Reduces 10 individual calls to 1 batch call
- Significantly faster and more cost-effective

### 3. **Smart Caching**
- **Response Cache**: 5-minute cache for complete API responses
- **Description Cache**: 24-hour cache for processed descriptions
- Prevents redundant API calls during navigation

### 4. **Optional Features**
- Peer validation via Perplexity is opt-in (`validatePeers=true`)
- Reduces default load time by skipping validation
- Use validation only when peer quality is critical

### API Parameters
- `symbol`: Company ticker (required)
- `additionalTickers`: Comma-separated manual peers
- `preferredPeers`: Comma-separated preferred peers
- `excludePeers`: Comma-separated peers to exclude
- `validatePeers`: Enable AI peer validation (true/false)

## Enhanced Competitor Selection

The competitor analysis feature has been significantly improved to provide more relevant peer selections.

### FMP API Endpoints for Segment Data

The application uses FMP v4 API endpoints to fetch geographic and segment revenue data:

```
# Geographic Revenue Data
https://financialmodelingprep.com/api/v4/revenue-geographic-segmentation?symbol={SYMBOL}&structure=flat&period=annual&apikey={API_KEY}

# Product/Segment Revenue Data
https://financialmodelingprep.com/api/v4/revenue-product-segmentation?symbol={SYMBOL}&structure=flat&period=annual&apikey={API_KEY}
```

These endpoints return data in the following format:
```json
[
  {
    "2024-12-31": {
      "US & Canada": 63207000000,
      "Europe": 38361000000,
      "Asia Pacific": 45009000000,
      "Rest Of World": 17924000000
    }
  }
]
```

The data is processed to show percentages (e.g., "US & Canada 38%, Europe 23%, Asia-Pacific 27%").

### Selection Priority:

1. **User-Preferred Peers**: Manually specified peers via `preferredPeers` parameter
2. **Database Peers**: Pre-configured peer relationships stored in Supabase
3. **FMP Stock Peers API**: FMP's dedicated peer suggestions endpoint
4. **Industry Matching**: Companies in same industry with similar market cap (0.1x to 10x range)
5. **Sector Matching**: Broader sector peers if industry peers are insufficient

### Key Improvements:

- **Market Cap Range**: Uses logarithmic scale for better size comparison
- **Liquidity Filter**: Excludes illiquid stocks (volume < 100k for industry, < 50k for sector)
- **Exclusion List**: Ability to exclude specific competitors via `excludePeers` parameter
- **No Generic Fallbacks**: Removed pure market cap matching for more relevant peers

### API Parameters:

- `symbol`: The main company to analyze (required)
- `additionalTickers`: Extra companies to include (comma-separated)
- `preferredPeers`: Prioritized peer companies (comma-separated)
- `excludePeers`: Companies to exclude from analysis (comma-separated)

Example:
```
/api/competitors?symbol=AAPL&preferredPeers=MSFT,GOOGL&excludePeers=SONO,LPL
```
