# Project Name

Describe your project here.

# Add at the end:

## Perplexity API Integration

The Peer Overview feature in the Competitor Analysis tab can use Perplexity AI to generate concise, substantive company descriptions.

### Setup

1. Get a Perplexity API key from [https://www.perplexity.ai/](https://www.perplexity.ai/)
2. Add these environment variables to your `.env.local`:

```bash
PERPLEXITY_API_KEY=your_perplexity_api_key_here
USE_PERPLEXITY=true
```

### Features

When enabled, the Perplexity API will:
- Process company descriptions into concise summaries (under 120 characters)
- Focus on core products/services, key markets, and target customers
- Remove marketing fluff and vague language
- Provide fallback to regex extraction if API is unavailable

### Usage

The API is called automatically when loading the Competitor Analysis > Peer Overview tab. Results are cached for 24 hours to minimize API calls.
