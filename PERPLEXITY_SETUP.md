# Perplexity API Setup for Laura (Research Analyst)

## Overview
Laura, the Senior Research Analyst in your AI Analyst Team, uses Perplexity AI for real-time research capabilities. This provides her with access to current web data, citations, and comprehensive industry analysis.

## Setup Instructions

### 1. Get Your Perplexity API Key
1. Visit [Perplexity AI](https://www.perplexity.ai/)
2. Sign up for an account if you don't have one
3. Navigate to API settings or developer section
4. Generate your API key
5. Copy the API key for use in the next step

### 2. Configure Environment Variables
Add your Perplexity API key to your environment file:

```bash
# In your .env.local or .env file
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

### 3. Verify Configuration
After adding the API key and restarting your development server:
1. Open the Analyst Team panel
2. Ask Laura a research question (e.g., "I need a report on the robotics industry")
3. Laura should now provide comprehensive research with citations

## Features When Properly Configured

### Laura's Enhanced Capabilities:
- **Real-time Web Research**: Access to current market data and news
- **Industry Analysis**: Comprehensive reports on any industry or sector
- **Competitive Intelligence**: Deep dives into company landscapes
- **Supply Chain Analysis**: Detailed supply chain and vendor research
- **Regulatory Updates**: Current regulatory and compliance information
- **Market Trends**: Up-to-date trend analysis with citations

### Example Queries for Laura:
- "Provide a comprehensive report on the electric vehicle industry"
- "Research the key players in cloud computing and their market positions"
- "Analyze the supply chain for semiconductor manufacturing"
- "What are the latest regulatory changes affecting fintech companies?"
- "Deep dive into the robotics industry and emerging technologies"

## API Models Used

Laura uses the `pplx-70b-online` model which provides:
- Real-time web access
- Citation support
- Related question suggestions
- Up to 1500 tokens per response

## Troubleshooting

### If Laura shows "unavailable" or connection errors:
1. **Check API Key**: Ensure `PERPLEXITY_API_KEY` is set in your environment
2. **Restart Server**: After adding the key, restart your development server
3. **Check API Limits**: Verify your Perplexity account has available credits
4. **Network Issues**: Ensure your network can reach `api.perplexity.ai`

### Fallback Mode
If the Perplexity API is unavailable, Laura will:
- Provide a structured outline of research areas
- Suggest key topics to investigate
- List major players and trends based on the query
- Indicate that real-time data is temporarily unavailable

## Cost Considerations
- Perplexity API usage is billed per request
- The `pplx-70b-online` model pricing varies
- Monitor your usage in the Perplexity dashboard
- Consider implementing rate limiting for production use

## Security Notes
- Never commit your API key to version control
- Use environment variables for all API keys
- Rotate keys regularly for production environments
- Consider using a key management service for enterprise deployments

## Support
For Perplexity API issues: [Perplexity Support](https://docs.perplexity.ai/)
For FinHub integration issues: Check the application logs in the console 