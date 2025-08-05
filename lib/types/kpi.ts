// KPI extraction system types
export interface ExtractedKPI {
  id?: string;
  symbol: string;
  kpiType: string;
  displayName: string;
  category: 'operational' | 'customer' | 'financial' | 'efficiency' | 'growth';
  value: number;
  unit: string;
  date: string;
  period: 'quarterly' | 'annual' | 'monthly';
  
  // Extraction metadata
  sourceText: string;
  sourceDocument: string;
  extractionMethod: 'pattern' | 'llm' | 'table' | 'manual';
  confidence: number; // 0-1 score
  
  // Validation
  validated: boolean;
  qualityScore: number; // 0-1 score
  anomalyFlags: string[];
  
  // Change tracking
  yoyChange?: number;
  qoqChange?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface ProcessedDocument {
  id: string;
  symbol: string;
  documentType: '10-K' | '10-Q' | '8-K' | 'earnings-release' | 'investor-presentation' | 'other';
  fileName: string;
  fileUrl?: string;
  reportDate: string;
  fiscalPeriod: string;
  fiscalYear: number;
  
  // Processing status
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt?: string;
  
  // Extracted content
  extractedText?: string;
  sections: DocumentSection[];
  tables: ExtractedTable[];
  
  // KPI extraction results
  extractedKPIs: ExtractedKPI[];
  processingTime: number; // milliseconds
  
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSection {
  title: string;
  content: string;
  pageNumbers: number[];
  kpiLikelihood: number; // 0-1 score indicating likelihood of containing KPIs
}

export interface ExtractedTable {
  headers: string[];
  rows: string[][];
  context: string; // surrounding text
  pageNumber?: number;
}

export interface KPIPattern {
  type: string;
  industry?: string;
  patterns: RegExp[];
  unitPatterns: RegExp[];
  contextKeywords: string[];
  excludeKeywords: string[];
}

export interface KPITemplate {
  industry: string;
  kpiType: string;
  displayName: string;
  category: string;
  unit: string;
  description: string;
  commonNames: string[];
  patterns: string[];
  valueRange: {
    min?: number;
    max?: number;
  };
  seasonality?: 'none' | 'quarterly' | 'annual';
}

export interface ExtractionResult {
  success: boolean;
  document: ProcessedDocument;
  extractedKPIs: ExtractedKPI[];
  processingTime: number;
  confidence: number;
  errors?: string[];
}

export interface ValidationResult {
  kpi: ExtractedKPI;
  isValid: boolean;
  qualityScore: number;
  anomalyFlags: string[];
  validationChecks: {
    dataType: boolean;
    unitConsistency: boolean;
    rangeCheck: boolean;
    historicalConsistency: boolean;
    industryBenchmark: boolean;
  };
}