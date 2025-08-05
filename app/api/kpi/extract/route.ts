import { NextRequest, NextResponse } from 'next/server';
import { KPIExtractionService } from '@/lib/services/kpi-extraction';
import { ProcessedDocument, ExtractedKPI } from '@/lib/types/kpi';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const symbol = formData.get('symbol') as string;
    const documentType = formData.get('documentType') as string;
    const reportDate = formData.get('reportDate') as string;
    const fiscalPeriod = formData.get('fiscalPeriod') as string;
    
    if (!file || !symbol) {
      return NextResponse.json(
        { error: 'File and symbol are required' },
        { status: 400 }
      );
    }

    // Initialize extraction service
    const extractionService = new KPIExtractionService();
    
    // Process the document
    const result = await extractionService.processDocument({
      file,
      metadata: {
        symbol,
        documentType: documentType as any,
        reportDate,
        fiscalPeriod,
        fiscalYear: new Date(reportDate).getFullYear()
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('KPI extraction error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // Mock response for now - in real implementation, this would query the database
    const mockKPIs: ExtractedKPI[] = [
      {
        symbol: symbol.toUpperCase(),
        kpiType: 'subscribers',
        displayName: 'Total Subscribers',
        category: 'customer',
        value: 52600000,
        unit: 'count',
        date: '2024-09-30',
        period: 'quarterly',
        sourceText: 'We ended Q3 with 52.6 million subscribers',
        sourceDocument: 'Q3-2024-earnings.pdf',
        extractionMethod: 'pattern',
        confidence: 0.95,
        validated: true,
        qualityScore: 0.92,
        anomalyFlags: [],
        yoyChange: 8.5,
        qoqChange: 2.1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      kpis: mockKPIs,
      total: mockKPIs.length
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPIs' },
      { status: 500 }
    );
  }
}