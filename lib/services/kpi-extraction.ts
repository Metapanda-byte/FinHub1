import type { ExtractedKPI, ProcessedDocument, ExtractionResult, KPIPattern } from '@/lib/types/kpi';

// KPI Patterns for different industries and metrics
const KPI_PATTERNS: KPIPattern[] = [
  // Subscriber metrics
  {
    type: 'subscribers',
    patterns: [
      /(?:total\s+)?subscribers?:?\s*([\d,]+\.?\d*)\s*(million|thousand|M|K|mil)/i,
      /ended\s+(?:the\s+)?(?:quarter|period|year)\s+with\s+([\d,]+\.?\d*)\s*(million|thousand|M|K|mil)\s+subscribers/i,
      /subscriber\s+count:?\s*([\d,]+\.?\d*)\s*(million|thousand|M|K|mil)/i,
      /we\s+have\s+([\d,]+\.?\d*)\s*(million|thousand|M|K|mil)\s+subscribers/i,
    ],
    unitPatterns: [/million|M|mil/i, /thousand|K/i],
    contextKeywords: ['subscriber', 'customer', 'user', 'member'],
    excludeKeywords: ['former', 'ex-', 'lost', 'churned']
  },
  
  // Store count
  {
    type: 'stores',
    patterns: [
      /(?:total\s+)?stores?:?\s*([\d,]+)/i,
      /operate\s+([\d,]+)\s+stores/i,
      /store\s+count:?\s*([\d,]+)/i,
      /locations?:?\s*([\d,]+)/i,
      /ended\s+with\s+([\d,]+)\s+stores/i,
    ],
    unitPatterns: [/stores?|locations?|outlets?/i],
    contextKeywords: ['store', 'location', 'outlet', 'retail'],
    excludeKeywords: ['closed', 'shuttered', 'former']
  },
  
  // Revenue per user metrics
  {
    type: 'arpu',
    patterns: [
      /ARPU:?\s*\$?([\d,]+\.?\d*)/i,
      /average\s+revenue\s+per\s+user:?\s*\$?([\d,]+\.?\d*)/i,
      /revenue\s+per\s+subscriber:?\s*\$?([\d,]+\.?\d*)/i,
      /per\s+user\s+revenue:?\s*\$?([\d,]+\.?\d*)/i,
    ],
    unitPatterns: [/\$|USD|dollars?/i],
    contextKeywords: ['ARPU', 'revenue per user', 'per subscriber'],
    excludeKeywords: []
  },
  
  // Monthly Active Users
  {
    type: 'mau',
    patterns: [
      /MAU:?\s*([\d,]+\.?\d*)\s*(million|thousand|M|K|bil)/i,
      /monthly\s+active\s+users?:?\s*([\d,]+\.?\d*)\s*(million|thousand|M|K|bil)/i,
      /active\s+users\s+per\s+month:?\s*([\d,]+\.?\d*)\s*(million|thousand|M|K|bil)/i,
    ],
    unitPatterns: [/million|M|bil|billion/i, /thousand|K/i],
    contextKeywords: ['MAU', 'monthly active', 'active users'],
    excludeKeywords: ['daily', 'weekly', 'DAU', 'WAU']
  },
  
  // Daily Active Users  
  {
    type: 'dau',
    patterns: [
      /DAU:?\s*([\d,]+\.?\d*)\s*(million|thousand|M|K|bil)/i,
      /daily\s+active\s+users?:?\s*([\d,]+\.?\d*)\s*(million|thousand|M|K|bil)/i,
      /active\s+users\s+per\s+day:?\s*([\d,]+\.?\d*)\s*(million|thousand|M|K|bil)/i,
    ],
    unitPatterns: [/million|M|bil|billion/i, /thousand|K/i],
    contextKeywords: ['DAU', 'daily active', 'active users'],
    excludeKeywords: ['monthly', 'weekly', 'MAU', 'WAU']
  },
  
  // Gaming metrics
  {
    type: 'ggr',
    industry: 'gaming',
    patterns: [
      /GGR:?\s*\$?([\d,]+\.?\d*)\s*(million|thousand|M|K|bil)/i,
      /gross\s+gaming\s+revenue:?\s*\$?([\d,]+\.?\d*)\s*(million|thousand|M|K|bil)/i,
      /gaming\s+revenue:?\s*\$?([\d,]+\.?\d*)\s*(million|thousand|M|K|bil)/i,
    ],
    unitPatterns: [/\$|USD|dollars?/i, /million|M|bil|billion/i],
    contextKeywords: ['GGR', 'gaming revenue', 'gross gaming'],
    excludeKeywords: ['net', 'loss', 'expense']
  },
  
  // Employee count
  {
    type: 'employees',
    patterns: [
      /(?:total\s+)?employees?:?\s*([\d,]+)/i,
      /headcount:?\s*([\d,]+)/i,
      /workforce:?\s*([\d,]+)/i,
      /team\s+size:?\s*([\d,]+)/i,
      /employ\s+([\d,]+)\s+people/i,
      /employed\s+approximately\s+([\d,]+)\s+partners/i,
      /we\s+employ(?:ed)?\s+approximately\s+([\d,]+)/i,
      /([\d,]+)\s+partners\s+worldwide/i,
    ],
    unitPatterns: [/employees?|people|staff|headcount|partners/i],
    contextKeywords: ['employee', 'headcount', 'workforce', 'staff', 'partners'],
    excludeKeywords: ['former', 'laid off', 'terminated']
  }
];

export class KPIExtractionService {
  async processDocument(params: {
    file: File;
    metadata: {
      symbol: string;
      documentType: string;
      reportDate: string;
      fiscalPeriod: string;
      fiscalYear: number;
    };
  }): Promise<ExtractionResult> {
    const startTime = Date.now();
    
    try {
      // Extract text from document
      const extractedText = await this.extractTextFromFile(params.file);
      
      // Create processed document
      const document: ProcessedDocument = {
        id: this.generateId(),
        symbol: params.metadata.symbol,
        documentType: params.metadata.documentType as any,
        fileName: params.file.name,
        reportDate: params.metadata.reportDate,
        fiscalPeriod: params.metadata.fiscalPeriod,
        fiscalYear: params.metadata.fiscalYear,
        processingStatus: 'processing',
        extractedText,
        sections: await this.extractSections(extractedText),
        tables: await this.extractTables(extractedText),
        extractedKPIs: [],
        processingTime: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Extract KPIs using patterns
      const extractedKPIs = await this.extractKPIsWithPatterns(
        document,
        params.metadata.symbol
      );
      
      const processingTime = Date.now() - startTime;
      
      // Update document with results
      document.extractedKPIs = extractedKPIs;
      document.processingTime = processingTime;
      document.processingStatus = 'completed';
      document.processedAt = new Date().toISOString();
      
      const overallConfidence = this.calculateOverallConfidence(extractedKPIs);
      
      return {
        success: true,
        document,
        extractedKPIs,
        processingTime,
        confidence: overallConfidence
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        document: {} as ProcessedDocument,
        extractedKPIs: [],
        processingTime,
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  
  private async extractTextFromFile(file: File): Promise<string> {
    if (file.type === 'text/plain') {
      return await file.text();
    }
    
    // For demo purposes, just read as text
    // In real implementation, would handle PDF, HTML, etc.
    return await file.text();
  }
  
  private async extractSections(text: string): Promise<any[]> {
    // Simple section extraction based on common patterns
    const sections = [];
    const lines = text.split('\n');
    
    let currentSection = { title: '', content: '', pageNumbers: [], kpiLikelihood: 0 };
    
    for (const line of lines) {
      // Check if line looks like a section header
      if (this.isSectionHeader(line)) {
        if (currentSection.content.trim()) {
          currentSection.kpiLikelihood = this.calculateKPILikelihood(currentSection);
          sections.push(currentSection);
        }
        
        currentSection = {
          title: line.trim(),
          content: '',
          pageNumbers: [],
          kpiLikelihood: 0
        };
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    // Add final section
    if (currentSection.content.trim()) {
      currentSection.kpiLikelihood = this.calculateKPILikelihood(currentSection);
      sections.push(currentSection);
    }
    
    return sections;
  }
  
  private isSectionHeader(line: string): boolean {
    const headerPatterns = [
      /^[A-Z\s]{3,}$/,  // All caps headers
      /^\d+\.\s+[A-Z]/,  // Numbered sections
      /^[A-Z][a-z]+\s+[A-Z][a-z]+/,  // Title case headers
    ];
    
    return headerPatterns.some(pattern => pattern.test(line.trim()));
  }
  
  private calculateKPILikelihood(section: any): number {
    const kpiKeywords = [
      'metrics', 'performance', 'operational', 'highlights', 'key indicators',
      'subscribers', 'users', 'customers', 'stores', 'locations', 'revenue per',
      'active users', 'monthly active', 'daily active', 'engagement'
    ];
    
    const content = (section.title + ' ' + section.content).toLowerCase();
    const keywordMatches = kpiKeywords.filter(keyword => 
      content.includes(keyword.toLowerCase())
    ).length;
    
    return Math.min(keywordMatches / kpiKeywords.length * 2, 1);
  }
  
  private async extractTables(text: string): Promise<any[]> {
    // Simple table extraction - look for tab-separated or pipe-separated data
    const tables = [];
    const lines = text.split('\n');
    
    let currentTable: string[] = [];
    
    for (const line of lines) {
      if (line.includes('\t') || line.includes('|')) {
        currentTable.push(line);
      } else if (currentTable.length > 0) {
        if (currentTable.length >= 2) { // At least header + one row
          tables.push(this.parseTable(currentTable));
        }
        currentTable = [];
      }
    }
    
    return tables;
  }
  
  private parseTable(lines: string[]): any {
    const separator = lines[0].includes('\t') ? '\t' : '|';
    const headers = lines[0].split(separator).map(h => h.trim());
    const rows = lines.slice(1).map(line => 
      line.split(separator).map(cell => cell.trim())
    );
    
    return {
      headers,
      rows,
      context: ''
    };
  }
  
  private async extractKPIsWithPatterns(
    document: ProcessedDocument,
    symbol: string
  ): Promise<ExtractedKPI[]> {
    const extractedKPIs: ExtractedKPI[] = [];
    const text = document.extractedText || '';
    
    // Try each pattern
    for (const pattern of KPI_PATTERNS) {
      for (const regex of pattern.patterns) {
        const matches = Array.from(text.matchAll(new RegExp(regex.source, regex.flags + 'g')));
        
        for (const match of matches) {
          const kpi = this.parseKPIMatch(match, pattern, document, symbol);
          if (kpi) {
            extractedKPIs.push(kpi);
          }
        }
      }
    }
    
    // Deduplicate similar KPIs
    return this.deduplicateKPIs(extractedKPIs);
  }
  
  private parseKPIMatch(
    match: RegExpMatchArray,
    pattern: KPIPattern,
    document: ProcessedDocument,
    symbol: string
  ): ExtractedKPI | null {
    try {
      const fullMatch = match[0];
      const valueStr = match[1];
      const unitStr = match[2] || '';
      
      // Parse the numeric value
      let value = parseFloat(valueStr.replace(/,/g, ''));
      
      // Convert units to actual numbers
      const unit = this.normalizeUnit(unitStr);
      if (unit.includes('million') || unit.includes('M')) {
        value *= 1000000;
      } else if (unit.includes('thousand') || unit.includes('K')) {
        value *= 1000;
      } else if (unit.includes('billion') || unit.includes('bil')) {
        value *= 1000000000;
      }
      
      // Determine display name
      const displayName = this.generateDisplayName(pattern.type);
      
      // Calculate confidence based on pattern strength and context
      const confidence = this.calculateConfidence(match, pattern, fullMatch);
      
      return {
        symbol: symbol.toUpperCase(),
        kpiType: pattern.type,
        displayName,
        category: this.getKPICategory(pattern.type),
        value,
        unit: this.getStandardUnit(pattern.type),
        date: document.reportDate,
        period: document.fiscalPeriod as any,
        sourceText: fullMatch,
        sourceDocument: document.fileName,
        extractionMethod: 'pattern',
        confidence,
        validated: false,
        qualityScore: confidence,
        anomalyFlags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Failed to parse KPI match:', error);
      return null;
    }
  }
  
  private normalizeUnit(unit: string): string {
    return unit.toLowerCase().trim();
  }
  
  private generateDisplayName(kpiType: string): string {
    const displayNames: Record<string, string> = {
      'subscribers': 'Total Subscribers',
      'stores': 'Store Count',
      'arpu': 'Average Revenue Per User',
      'mau': 'Monthly Active Users',
      'dau': 'Daily Active Users',
      'ggr': 'Gross Gaming Revenue',
      'employees': 'Employee Count'
    };
    
    return displayNames[kpiType] || kpiType.charAt(0).toUpperCase() + kpiType.slice(1);
  }
  
  private getKPICategory(kpiType: string): 'operational' | 'customer' | 'financial' | 'efficiency' | 'growth' {
    const categoryMap: Record<string, any> = {
      'subscribers': 'customer',
      'mau': 'customer',
      'dau': 'customer',
      'stores': 'operational',
      'employees': 'operational',
      'arpu': 'financial',
      'ggr': 'financial'
    };
    
    return categoryMap[kpiType] || 'operational';
  }
  
  private getStandardUnit(kpiType: string): string {
    const unitMap: Record<string, string> = {
      'subscribers': 'count',
      'mau': 'count',
      'dau': 'count',
      'stores': 'count',
      'employees': 'count',
      'arpu': 'USD',
      'ggr': 'USD'
    };
    
    return unitMap[kpiType] || 'count';
  }
  
  private calculateConfidence(
    match: RegExpMatchArray,
    pattern: KPIPattern,
    fullMatch: string
  ): number {
    let confidence = 0.7; // Base confidence
    
    // Boost confidence if context keywords are present
    const context = fullMatch.toLowerCase();
    const contextMatches = pattern.contextKeywords.filter(keyword =>
      context.includes(keyword.toLowerCase())
    ).length;
    
    confidence += (contextMatches / pattern.contextKeywords.length) * 0.2;
    
    // Reduce confidence if exclude keywords are present
    const excludeMatches = pattern.excludeKeywords.filter(keyword =>
      context.includes(keyword.toLowerCase())
    ).length;
    
    confidence -= excludeMatches * 0.15;
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }
  
  private deduplicateKPIs(kpis: ExtractedKPI[]): ExtractedKPI[] {
    const deduped: ExtractedKPI[] = [];
    
    for (const kpi of kpis) {
      const existing = deduped.find(existing => 
        existing.kpiType === kpi.kpiType &&
        Math.abs(existing.value - kpi.value) < existing.value * 0.01 // Within 1%
      );
      
      if (!existing) {
        deduped.push(kpi);
      } else if (kpi.confidence > existing.confidence) {
        // Replace with higher confidence version
        const index = deduped.indexOf(existing);
        deduped[index] = kpi;
      }
    }
    
    return deduped;
  }
  
  private calculateOverallConfidence(kpis: ExtractedKPI[]): number {
    if (kpis.length === 0) return 0;
    
    const avgConfidence = kpis.reduce((sum, kpi) => sum + kpi.confidence, 0) / kpis.length;
    return avgConfidence;
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}