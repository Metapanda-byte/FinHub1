import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai',
});

export async function POST(request: NextRequest) {
  try {
    const { text, symbol, industry, documentType } = await request.json();
    
    if (!text || !symbol) {
      return NextResponse.json(
        { error: 'Text and symbol are required' },
        { status: 400 }
      );
    }

    // Build industry-specific prompt
    const prompt = buildKPIExtractionPrompt({
      text,
      symbol,
      industry,
      documentType
    });

    // Call Perplexity for structured extraction
    const response = await perplexity.chat.completions.create({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are an expert financial analyst who extracts key performance indicators from company documents. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    });

    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response content from Perplexity');
    }

    // Parse JSON response
    let extractedData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(responseContent);
      }
    } catch (parseError) {
      console.error('Failed to parse Perplexity response:', responseContent);
      throw new Error('Invalid JSON response from Perplexity');
    }
    
    // Process and validate the extracted KPIs
    const processedKPIs = extractedData.kpis.map((kpi: any) => ({
      ...kpi,
      symbol: symbol.toUpperCase(),
      extractionMethod: 'llm',
      validated: false,
      qualityScore: kpi.confidence,
      anomalyFlags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      extractedKPIs: processedKPIs,
      confidence: calculateOverallConfidence(processedKPIs)
    });

  } catch (error) {
    console.error('Perplexity KPI extraction error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to extract KPIs with Perplexity',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function buildKPIExtractionPrompt(params: {
  text: string;
  symbol: string;
  industry?: string;
  documentType?: string;
}): string {
  const industryContext = getIndustryContext(params.industry);
  const documentContext = getDocumentTypeContext(params.documentType);
  
  return `
Extract key performance indicators (KPIs) from the following ${params.documentType || 'document'} for ${params.symbol}.

${industryContext}

${documentContext}

IMPORTANT EXTRACTION RULES:
1. Focus on operational metrics, NOT standard financial statement items (revenue, net income, etc.)
2. Convert all values to actual numbers (e.g., "52.6 million" becomes 52600000)
3. Extract the exact text where you found each KPI
4. Only extract KPIs with specific numeric values
5. Assign confidence based on how clear and unambiguous the extraction is
6. Include the reporting period if mentioned
7. RESPOND WITH VALID JSON ONLY - NO OTHER TEXT

DOCUMENT TEXT:
${params.text}

Respond with JSON in this exact format:
{
  "kpis": [
    {
      "type": "subscribers",
      "displayName": "Total Subscribers",
      "value": 52600000,
      "unit": "count",
      "period": "quarterly",
      "sourceText": "We ended Q3 with 52.6 million subscribers",
      "confidence": 0.95,
      "category": "customer"
    }
  ]
}

Valid categories: operational, customer, financial, efficiency, growth
Valid units: count, USD, percentage
Valid periods: quarterly, annual, monthly
`;
}

function getIndustryContext(industry?: string): string {
  const industryContexts: Record<string, string> = {
    'technology': `
COMMON TECH KPIs TO LOOK FOR:
- Monthly Active Users (MAU)
- Daily Active Users (DAU) 
- Average Revenue Per User (ARPU)
- Customer Acquisition Cost (CAC)
- Churn Rate
- Conversion Rate
- User Engagement Metrics`,
    
    'retail': `
COMMON RETAIL KPIs TO LOOK FOR:
- Number of stores/locations
- Same-store sales growth
- Sales per square foot
- Customer traffic/footfall
- Average transaction value
- Inventory turnover`,
    
    'gaming': `
COMMON GAMING KPIs TO LOOK FOR:
- Monthly Active Users (MAU)
- Daily Active Users (DAU)
- Average Revenue Per User (ARPU)
- Gross Gaming Revenue (GGR)
- Player retention rates
- In-game purchase metrics`,
    
    'telecom': `
COMMON TELECOM KPIs TO LOOK FOR:
- Subscriber count
- Average Revenue Per User (ARPU)
- Churn rate
- Network coverage
- Data usage per subscriber
- Customer satisfaction scores`,
    
    'streaming': `
COMMON STREAMING KPIs TO LOOK FOR:
- Total subscribers
- Paid subscribers vs free users
- Average Revenue Per User (ARPU)
- Content hours watched
- Churn rate
- Regional subscriber breakdown`
  };
  
  return industry && industryContexts[industry.toLowerCase()] 
    ? industryContexts[industry.toLowerCase()]
    : `
COMMON KPIs TO LOOK FOR:
- Customer/user counts
- Revenue per customer/user
- Operational metrics (locations, employees, etc.)
- Growth metrics
- Efficiency metrics`;
}

function getDocumentTypeContext(documentType?: string): string {
  const typeContexts: Record<string, string> = {
    '10-K': 'This is an annual report. Look for annual KPIs and year-over-year comparisons.',
    '10-Q': 'This is a quarterly report. Look for quarterly KPIs and quarter-over-quarter comparisons.',
    'earnings-release': 'This is an earnings release. Focus on performance highlights and key metrics sections.',
    'investor-presentation': 'This is an investor presentation. Look for slides with operational metrics and performance indicators.'
  };
  
  return documentType && typeContexts[documentType] 
    ? typeContexts[documentType]
    : 'Extract operational performance metrics from this document.';
}

function calculateOverallConfidence(kpis: any[]): number {
  if (kpis.length === 0) return 0;
  return kpis.reduce((sum, kpi) => sum + kpi.confidence, 0) / kpis.length;
}