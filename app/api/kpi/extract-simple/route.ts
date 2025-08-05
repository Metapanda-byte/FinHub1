import { NextRequest, NextResponse } from 'next/server';

interface ExtractedKPI {
  symbol: string;
  kpiType: string;
  displayName: string;
  category: string;
  value: number;
  unit: string;
  date: string;
  period: string;
  sourceText: string;
  sourceDocument: string;
  extractionMethod: string;
  confidence: number;
  validated: boolean;
  qualityScore: number;
  anomalyFlags: string[];
  createdAt: string;
  updatedAt: string;
}

// Simple KPI patterns
const KPI_PATTERNS = [
  {
    type: 'subscribers',
    patterns: [
      /(?:total\s+)?subscribers?:?\s*([\d,]+\.?\d*)\s*(million|thousand|M|K|mil)/i,
      /ended\s+(?:the\s+)?(?:quarter|period|year)\s+with\s+([\d,]+\.?\d*)\s*(million|thousand|M|K|mil)\s+subscribers/i,
      /subscriber\s+count:?\s*([\d,]+\.?\d*)\s*(million|thousand|M|K|mil)/i,
    ],
    displayName: 'Total Subscribers',
    category: 'customer',
    unit: 'count'
  },
  {
    type: 'stores',
    patterns: [
      /(?:total\s+)?stores?:?\s*([\d,]+)/i,
      /operate[d]?\s+([\d,]+)\s+stores/i,
      /store\s+count:?\s*([\d,]+)/i,
      /we\s+operated\s+([\d,]+)\s+stores/i,
      /([\d,]+)\s+company-operated\s+stores/i,
      /([\d,]+)\s+licensed\s+stores/i,
    ],
    displayName: 'Store Count',
    category: 'operational',
    unit: 'count'
  },
  {
    type: 'arpu',
    patterns: [
      /ARPU:?\s*\$?([\d,]+\.?\d*)/i,
      /average\s+revenue\s+per\s+user:?\s*\$?([\d,]+\.?\d*)/i,
      /revenue\s+per\s+subscriber:?\s*\$?([\d,]+\.?\d*)/i,
    ],
    displayName: 'Average Revenue Per User',
    category: 'financial',
    unit: 'USD'
  },
  {
    type: 'mau',
    patterns: [
      /MAU:?\s*([\d,]+\.?\d*)\s*(million|thousand|M|K|bil)/i,
      /monthly\s+active\s+users?:?\s*([\d,]+\.?\d*)\s*(million|thousand|M|K|bil)/i,
    ],
    displayName: 'Monthly Active Users',
    category: 'customer',
    unit: 'count'
  },
  {
    type: 'employees',
    patterns: [
      /(?:total\s+)?employees?:?\s*([\d,]+)/i,
      /headcount:?\s*([\d,]+)/i,
      /employ\s+([\d,]+)\s+people/i,
      /employed\s+approximately\s+([\d,]+)\s+partners/i,
      /we\s+employ(?:ed)?\s+approximately\s+([\d,]+)/i,
      /([\d,]+)\s+partners\s+worldwide/i,
    ],
    displayName: 'Employee Count',
    category: 'operational',
    unit: 'count'
  }
];

export async function POST(request: NextRequest) {
  try {
    console.log('Received request to extract KPIs');
    
    const formData = await request.formData();
    console.log('FormData parsed successfully');
    
    const file = formData.get('file') as File;
    const symbol = formData.get('symbol') as string;
    const documentType = formData.get('documentType') as string;
    const reportDate = formData.get('reportDate') as string;
    const fiscalPeriod = formData.get('fiscalPeriod') as string;
    
    console.log('Form data:', { 
      hasFile: !!file, 
      fileName: file?.name,
      fileSize: file?.size,
      symbol, 
      documentType, 
      reportDate, 
      fiscalPeriod 
    });
    
    if (!file || !symbol) {
      return NextResponse.json(
        { error: 'File and symbol are required' },
        { status: 400 }
      );
    }

    // Extract text from file
    console.log('Extracting text from file...');
    const text = await file.text();
    console.log('Text extracted, length:', text.length);
    console.log('First 200 chars:', text.substring(0, 200));
    
    // Extract KPIs using patterns
    const extractedKPIs: ExtractedKPI[] = [];
    
    for (const pattern of KPI_PATTERNS) {
      for (const regex of pattern.patterns) {
        const matches = text.matchAll(new RegExp(regex.source, regex.flags + 'g'));
        
        for (const match of matches) {
          if (match[1]) {
            let value = parseFloat(match[1].replace(/,/g, ''));
            const unit = match[2] || '';
            
            // Convert units
            if (unit.toLowerCase().includes('million') || unit.toLowerCase().includes('m')) {
              value *= 1000000;
            } else if (unit.toLowerCase().includes('thousand') || unit.toLowerCase().includes('k')) {
              value *= 1000;
            } else if (unit.toLowerCase().includes('bil')) {
              value *= 1000000000;
            }
            
            extractedKPIs.push({
              symbol: symbol.toUpperCase(),
              kpiType: pattern.type,
              displayName: pattern.displayName,
              category: pattern.category as any,
              value,
              unit: pattern.unit,
              date: reportDate,
              period: fiscalPeriod as any,
              sourceText: match[0],
              sourceDocument: file.name,
              extractionMethod: 'pattern',
              confidence: 0.85,
              validated: false,
              qualityScore: 0.85,
              anomalyFlags: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }
      }
    }

    console.log('Total KPIs extracted before deduplication:', extractedKPIs.length);
    
    // Remove duplicates
    const deduped = extractedKPIs.filter((kpi, index, array) => 
      index === array.findIndex(k => k.kpiType === kpi.kpiType && Math.abs(k.value - kpi.value) < kpi.value * 0.01)
    );
    
    console.log('KPIs after deduplication:', deduped.length);
    console.log('Deduped KPIs:', deduped.map(k => ({ type: k.kpiType, value: k.value })));

    return NextResponse.json({
      success: true,
      document: {
        id: Math.random().toString(36).substr(2, 9),
        symbol,
        documentType,
        fileName: file.name,
        reportDate,
        fiscalPeriod,
        fiscalYear: new Date(reportDate).getFullYear(),
        processingStatus: 'completed',
        sections: [],
        tables: [],
        extractedKPIs: deduped,
        processingTime: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      extractedKPIs: deduped,
      processingTime: 100,
      confidence: deduped.length > 0 ? 0.85 : 0
    });

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