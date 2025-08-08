import { NextRequest, NextResponse } from 'next/server';

interface DocumentAnalysisRequest {
  url: string;
  symbol: string;
  industry?: string;
  documentType?: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'html' | 'auto';
  analysisType?: 'kpi' | 'sentiment' | 'full';
}

interface DocumentAnalysisResponse {
  success: boolean;
  url: string;
  symbol: string;
  documentInfo: {
    detectedType: string;
    contentLength: number;
    metadata: any;
  };
  analysis: {
    kpis?: any[];
    sentiment?: any;
    summary?: string;
  };
  extractedAt: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { 
      url, 
      symbol, 
      industry, 
      documentType = 'auto', 
      analysisType = 'kpi' 
    }: DocumentAnalysisRequest = await request.json();
    
    if (!url || !symbol) {
      return NextResponse.json(
        { error: 'URL and symbol are required', success: false },
        { status: 400 }
      );
    }

    console.log(`[Document Analysis] Analyzing ${url} for ${symbol}`);
    
    // Step 1: Extract document content
    const extractionResponse = await fetch('http://localhost:3001/api/extract-document-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        symbol,
        documentType
      }),
    });
    
    if (!extractionResponse.ok) {
      throw new Error(`Document extraction failed: ${extractionResponse.status}`);
    }
    
    const extractionResult = await extractionResponse.json();
    
    if (!extractionResult.success) {
      throw new Error(`Document extraction failed: ${extractionResult.error}`);
    }
    
    console.log(`[Document Analysis] Extracted ${extractionResult.content.length} characters`);
    
    // Step 2: Analyze content based on type
    let analysis: any = {};
    
    if (analysisType === 'kpi' || analysisType === 'full') {
      try {
        // Call KPI extraction endpoint
        const kpiResponse = await fetch('http://localhost:3001/api/kpi/extract-llm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: extractionResult.content,
            symbol,
            industry,
            documentType: 'investor-presentation'
          }),
        });
        
        if (kpiResponse.ok) {
          const kpiResult = await kpiResponse.json();
          analysis.kpis = kpiResult.kpis || [];
          analysis.summary = `Extracted ${analysis.kpis.length} KPIs from ${extractionResult.detectedType} document`;
          console.log(`[Document Analysis] Extracted ${analysis.kpis.length} KPIs`);
        } else {
          console.log(`[Document Analysis] KPI extraction failed: ${kpiResponse.status}`);
          analysis.kpis = [];
          analysis.summary = `Document processed but KPI extraction failed (status: ${kpiResponse.status})`;
        }
      } catch (kpiError) {
        console.error(`[Document Analysis] KPI extraction error:`, kpiError);
        analysis.kpis = [];
        analysis.summary = `Document processed but KPI extraction encountered an error`;
      }
    }
    
    if (analysisType === 'sentiment' || analysisType === 'full') {
      // Add sentiment analysis if needed (placeholder)
      analysis.sentiment = {
        overall: 'neutral',
        confidence: 0.5,
        note: 'Sentiment analysis not yet implemented'
      };
    }
    
    // Step 3: Compile final result
    const result: DocumentAnalysisResponse = {
      success: true,
      url,
      symbol,
      documentInfo: {
        detectedType: extractionResult.detectedType,
        contentLength: extractionResult.content.length,
        metadata: extractionResult.metadata
      },
      analysis,
      extractedAt: new Date().toISOString()
    };
    
    console.log(`[Document Analysis] Complete analysis for ${symbol}`);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[Document Analysis Error]:', error);
    
    const result: DocumentAnalysisResponse = {
      success: false,
      url: '',
      symbol: '',
      documentInfo: {
        detectedType: 'unknown',
        contentLength: 0,
        metadata: {}
      },
      analysis: {},
      error: error instanceof Error ? error.message : 'Unknown error',
      extractedAt: new Date().toISOString()
    };
    
    return NextResponse.json(result, { status: 500 });
  }
}