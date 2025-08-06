import { NextRequest, NextResponse } from 'next/server';

const FMP_API_KEY = process.env.FMP_API_KEY;

interface TranscriptAnalysisRequest {
  symbol: string;
  quarter: number;
  year: number;
}

// Analyze earnings transcript content
async function analyzeTranscriptContent(symbol: string, quarter: number, year: number) {
  try {
    console.log(`[Transcript Analysis] Processing ${symbol} Q${quarter} ${year}`);
    
    // Fetch transcript content from FMP
    const baseUrl = `https://financialmodelingprep.com/api/v3`;
    const url = `${baseUrl}/earning_call_transcript/${symbol}?quarter=${quarter}&year=${year}&apikey=${FMP_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.status}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No transcript data available');
    }
    
    const transcript = data[0];
    const content = transcript.content;
    
    if (!content) {
      throw new Error('Transcript content is empty');
    }
    
    // Analyze the transcript content
    const analysis = parseTranscriptContent(content);
    
    return {
      success: true,
      symbol,
      quarter,
      year,
      date: transcript.date,
      analysis,
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Transcript Analysis Error]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      symbol,
      quarter,
      year
    };
  }
}

function parseTranscriptContent(content: string) {
  const analysis: Record<string, any> = {};
  
  // Extract management commentary
  analysis.managementHighlights = extractManagementHighlights(content);
  
  // Extract financial guidance
  analysis.guidance = extractGuidance(content);
  
  // Extract Q&A insights
  analysis.qaInsights = extractQAInsights(content);
  
  // Extract risk discussions
  analysis.riskDiscussions = extractRiskDiscussions(content);
  
  // Extract strategic updates
  analysis.strategicUpdates = extractStrategicUpdates(content);
  
  return analysis;
}

function extractManagementHighlights(content: string): string[] {
  const highlights: string[] = [];
  const lines = content.split('\n');
  
  // Look for key phrases that indicate important management statements
  const keyPhrases = [
    'we are pleased to announce',
    'strong performance',
    'record revenue',
    'exceeded expectations',
    'delivered strong results',
    'significant growth',
    'improved margins',
    'successful launch',
    'strategic initiative'
  ];
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (keyPhrases.some(phrase => lowerLine.includes(phrase))) {
      if (line.length > 50 && line.length < 300) {
        highlights.push(line.trim());
      }
    }
  });
  
  return highlights.slice(0, 10); // Return top 10 highlights
}

function extractGuidance(content: string): string[] {
  const guidance: string[] = [];
  const lines = content.split('\n');
  
  // Look for forward-looking statements and guidance
  const guidanceKeywords = [
    'expect',
    'anticipate',
    'guidance',
    'outlook',
    'forecast',
    'project',
    'target',
    'estimate',
    'going forward',
    'next quarter',
    'full year',
    'fiscal year'
  ];
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (guidanceKeywords.some(keyword => lowerLine.includes(keyword))) {
      // Look for sentences with numbers (likely financial guidance)
      if (/\d/.test(line) && line.length > 50 && line.length < 400) {
        guidance.push(line.trim());
      }
    }
  });
  
  return guidance.slice(0, 8); // Return top 8 guidance statements
}

function extractQAInsights(content: string): string[] {
  const insights: string[] = [];
  
  // Find Q&A section
  const qaStartRegex = /q&a|question.{0,20}answer|analyst.{0,20}question/i;
  const qaMatch = content.match(qaStartRegex);
  
  if (qaMatch) {
    const qaSection = content.substring(qaMatch.index || 0);
    const lines = qaSection.split('\n');
    
    // Extract analyst questions and management responses
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes('question') || 
          line.toLowerCase().includes('analyst') ||
          line.toLowerCase().includes('answer')) {
        if (line.length > 30 && line.length < 300) {
          insights.push(line.trim());
        }
      }
    });
  }
  
  return insights.slice(0, 10); // Return top 10 Q&A insights
}

function extractRiskDiscussions(content: string): string[] {
  const risks: string[] = [];
  const lines = content.split('\n');
  
  const riskKeywords = [
    'risk',
    'challenge',
    'headwind',
    'pressure',
    'concern',
    'uncertainty',
    'volatility',
    'competitive',
    'regulation',
    'macro environment'
  ];
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (riskKeywords.some(keyword => lowerLine.includes(keyword))) {
      if (line.length > 50 && line.length < 300) {
        risks.push(line.trim());
      }
    }
  });
  
  return risks.slice(0, 8); // Return top 8 risk discussions
}

function extractStrategicUpdates(content: string): string[] {
  const updates: string[] = [];
  const lines = content.split('\n');
  
  const strategyKeywords = [
    'strategy',
    'strategic',
    'initiative',
    'investment',
    'expansion',
    'acquisition',
    'partnership',
    'new product',
    'innovation',
    'transformation',
    'digital',
    'technology'
  ];
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (strategyKeywords.some(keyword => lowerLine.includes(keyword))) {
      if (line.length > 50 && line.length < 300) {
        updates.push(line.trim());
      }
    }
  });
  
  return updates.slice(0, 8); // Return top 8 strategic updates
}

export async function POST(req: NextRequest) {
  try {
    const { symbol, quarter, year }: TranscriptAnalysisRequest = await req.json();
    
    if (!symbol || !quarter || !year) {
      return NextResponse.json(
        { error: 'Missing required parameters: symbol, quarter, year' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Analyzing transcript for ${symbol} Q${quarter} ${year}`);
    
    const result = await analyzeTranscriptContent(symbol, quarter, year);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Analyze Transcript API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transcript content' },
      { status: 500 }
    );
  }
}