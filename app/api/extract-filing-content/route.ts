import { NextRequest, NextResponse } from 'next/server';

const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;

interface FilingContentRequest {
  symbol: string;
  filingUrl: string;
  filingType: string;
}

// Extract key sections from SEC filings
async function extractFilingContent(url: string, filingType: string) {
  try {
    console.log(`[Filing Extraction] Processing ${filingType} from ${url}`);
    
    // Fetch the filing content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch filing: ${response.status}`);
    }
    
    const content = await response.text();
    
    // Parse HTML and extract key sections based on filing type
    const extractedSections = parseFilingContent(content, filingType);
    
    return {
      success: true,
      filingType,
      url,
      extractedSections,
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Filing Extraction Error]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      filingType,
      url
    };
  }
}

function parseFilingContent(htmlContent: string, filingType: string) {
  // Remove HTML tags and clean the content
  const cleanText = htmlContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const sections: Record<string, string> = {};
  
  if (filingType === '10-K') {
    // Extract key 10-K sections
    sections.businessOverview = extractSection(cleanText, [
      'ITEM 1. BUSINESS',
      'Item 1. Business',
      'BUSINESS OVERVIEW'
    ]);
    
    sections.riskFactors = extractSection(cleanText, [
      'ITEM 1A. RISK FACTORS',
      'Item 1A. Risk Factors',
      'RISK FACTORS'
    ]);
    
    sections.managementDiscussion = extractSection(cleanText, [
      'ITEM 7. MANAGEMENT',
      'Item 7. Management',
      'MANAGEMENT\'S DISCUSSION AND ANALYSIS'
    ]);
    
    sections.financialStatements = extractSection(cleanText, [
      'ITEM 8. FINANCIAL STATEMENTS',
      'Item 8. Financial Statements',
      'CONSOLIDATED FINANCIAL STATEMENTS'
    ]);
  } 
  else if (filingType === '10-Q') {
    // Extract key 10-Q sections
    sections.managementDiscussion = extractSection(cleanText, [
      'ITEM 2. MANAGEMENT',
      'Item 2. Management',
      'MANAGEMENT\'S DISCUSSION AND ANALYSIS'
    ]);
    
    sections.financialStatements = extractSection(cleanText, [
      'ITEM 1. FINANCIAL STATEMENTS',
      'Item 1. Financial Statements',
      'CONDENSED CONSOLIDATED FINANCIAL STATEMENTS'
    ]);
    
    sections.controls = extractSection(cleanText, [
      'ITEM 4. CONTROLS',
      'Item 4. Controls',
      'CONTROLS AND PROCEDURES'
    ]);
  }
  else if (filingType === '8-K') {
    // Extract key 8-K sections
    sections.eventDescription = extractSection(cleanText, [
      'ITEM 2.02',
      'Item 2.02',
      'Results of Operations and Financial Condition'
    ]);
    
    sections.materialAgreements = extractSection(cleanText, [
      'ITEM 1.01',
      'Item 1.01',
      'Entry into a Material Definitive Agreement'
    ]);
    
    sections.corporateChanges = extractSection(cleanText, [
      'ITEM 5.02',
      'Item 5.02',
      'Departure of Directors or Certain Officers'
    ]);
  }
  
  return sections;
}

function extractSection(content: string, sectionHeaders: string[]): string {
  for (const header of sectionHeaders) {
    const regex = new RegExp(`${header}[\\s\\S]*?(?=ITEM|Item|$)`, 'i');
    const match = content.match(regex);
    if (match) {
      // Return first 5000 characters to avoid overwhelming the AI
      return match[0].substring(0, 5000).trim();
    }
  }
  return '';
}

export async function POST(req: NextRequest) {
  try {
    const { symbol, filingUrl, filingType }: FilingContentRequest = await req.json();
    
    if (!symbol || !filingUrl || !filingType) {
      return NextResponse.json(
        { error: 'Missing required parameters: symbol, filingUrl, filingType' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Extracting content for ${symbol} ${filingType}`);
    
    const result = await extractFilingContent(filingUrl, filingType);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Extract Filing Content API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to extract filing content' },
      { status: 500 }
    );
  }
}