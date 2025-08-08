import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import XLSX from 'xlsx';

interface DocumentExtractionRequest {
  url: string;
  symbol?: string;
  documentType?: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'html' | 'auto';
}

interface ExtractionResult {
  success: boolean;
  url: string;
  detectedType?: string;
  content?: string;
  metadata?: {
    pages?: number;
    words?: number;
    sheets?: string[];
    slides?: number;
  };
  error?: string;
  extractedAt: string;
}

// Detect file type from URL
function detectFileType(url: string): string {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('.pdf')) return 'pdf';
  if (urlLower.includes('.docx')) return 'docx';
  if (urlLower.includes('.doc')) return 'doc';
  if (urlLower.includes('.xlsx')) return 'xlsx';
  if (urlLower.includes('.xls')) return 'xls';
  if (urlLower.includes('.pptx')) return 'pptx';
  if (urlLower.includes('.ppt')) return 'ppt';
  if (urlLower.includes('.html') || urlLower.includes('.htm')) return 'html';
  
  return 'unknown';
}

// Extract text from PDF buffer
async function extractPDF(buffer: Buffer): Promise<{ content: string; metadata: any }> {
  try {
    const data = await pdfParse(buffer);
    return {
      content: data.text,
      metadata: {
        pages: data.numpages,
        words: data.text.split(/\s+/).length,
        info: data.info
      }
    };
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract text from Word document
async function extractWord(buffer: Buffer): Promise<{ content: string; metadata: any }> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      content: result.value,
      metadata: {
        words: result.value.split(/\s+/).length,
        messages: result.messages
      }
    };
  } catch (error) {
    throw new Error(`Word extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract text from Excel file
async function extractExcel(buffer: Buffer): Promise<{ content: string; metadata: any }> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let content = '';
    const sheets: string[] = [];
    
    workbook.SheetNames.forEach(sheetName => {
      sheets.push(sheetName);
      const worksheet = workbook.Sheets[sheetName];
      const sheetText = XLSX.utils.sheet_to_txt(worksheet);
      content += `\n--- Sheet: ${sheetName} ---\n${sheetText}\n`;
    });
    
    return {
      content: content.trim(),
      metadata: {
        sheets,
        words: content.split(/\s+/).length
      }
    };
  } catch (error) {
    throw new Error(`Excel extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract text from PowerPoint (placeholder - pptx-parser can be unstable)
async function extractPowerPoint(buffer: Buffer): Promise<{ content: string; metadata: any }> {
  try {
    // For now, return a placeholder. The pptx-parser library can be unreliable
    // You could integrate a more stable solution or use a service
    return {
      content: 'PowerPoint extraction not yet implemented - please convert to PDF first',
      metadata: {
        slides: 0,
        note: 'PPTX parsing requires additional setup'
      }
    };
  } catch (error) {
    throw new Error(`PowerPoint extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract text from HTML
async function extractHTML(buffer: Buffer): Promise<{ content: string; metadata: any }> {
  try {
    const html = buffer.toString('utf-8');
    // Simple HTML text extraction (remove tags)
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
    
    return {
      content: text,
      metadata: {
        words: text.split(/\s+/).length,
        originalLength: html.length
      }
    };
  } catch (error) {
    throw new Error(`HTML extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { url, symbol, documentType = 'auto' }: DocumentExtractionRequest = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' } as ExtractionResult,
        { status: 400 }
      );
    }

    console.log(`[Document Extraction] Processing ${url} (type: ${documentType})`);
    
    // Fetch the document
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FinHub-DocumentExtractor/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Detect file type
    const detectedType = documentType === 'auto' ? detectFileType(url) : documentType;
    
    console.log(`[Document Extraction] Detected type: ${detectedType}`);
    
    // Extract content based on type
    let extraction: { content: string; metadata: any };
    
    switch (detectedType) {
      case 'pdf':
        extraction = await extractPDF(buffer);
        break;
      case 'docx':
      case 'doc':
        extraction = await extractWord(buffer);
        break;
      case 'xlsx':
      case 'xls':
        extraction = await extractExcel(buffer);
        break;
      case 'pptx':
      case 'ppt':
        extraction = await extractPowerPoint(buffer);
        break;
      case 'html':
      case 'htm':
        extraction = await extractHTML(buffer);
        break;
      default:
        // Try HTML as fallback
        extraction = await extractHTML(buffer);
        break;
    }
    
    const result: ExtractionResult = {
      success: true,
      url,
      detectedType,
      content: extraction.content,
      metadata: extraction.metadata,
      extractedAt: new Date().toISOString()
    };
    
    console.log(`[Document Extraction] Successfully extracted ${extraction.content.length} characters`);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[Document Extraction Error]:', error);
    
    const result: ExtractionResult = {
      success: false,
      url: request.url,
      error: error instanceof Error ? error.message : 'Unknown error',
      extractedAt: new Date().toISOString()
    };
    
    return NextResponse.json(result, { status: 500 });
  }
}