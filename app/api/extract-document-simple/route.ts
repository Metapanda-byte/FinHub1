import { NextRequest, NextResponse } from 'next/server';

interface DocumentExtractionRequest {
  url: string;
  symbol?: string;
  documentType?: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'html' | 'auto';
}

// Detect file type from URL
function detectFileType(url: string): string {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('.pdf')) return 'pdf';
  if (urlLower.includes('.docx')) return 'docx';
  if (urlLower.includes('.xlsx')) return 'xlsx';
  if (urlLower.includes('.pptx')) return 'pptx';
  if (urlLower.includes('.html') || urlLower.includes('.htm')) return 'html';
  return 'unknown';
}

// Simple HTML text extraction
function extractTextFromHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { url, symbol, documentType = 'auto' }: DocumentExtractionRequest = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required', success: false },
        { status: 400 }
      );
    }

    console.log(`[Simple Document Extraction] Processing ${url}`);
    
    // Fetch the document
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FinHub-DocumentExtractor/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
    }
    
    const detectedType = documentType === 'auto' ? detectFileType(url) : documentType;
    
    let content = '';
    let metadata = {};
    
    if (detectedType === 'html' || detectedType === 'unknown') {
      // Handle as HTML/text
      const html = await response.text();
      content = extractTextFromHTML(html);
      metadata = { 
        originalLength: html.length, 
        words: content.split(/\s+/).length 
      };
    } else {
      // For other file types, return a message that advanced parsing is needed
      const buffer = Buffer.from(await response.arrayBuffer());
      content = `This is a ${detectedType.toUpperCase()} file (${buffer.length} bytes). Advanced parsing libraries are needed to extract text content.`;
      metadata = { 
        fileSize: buffer.length, 
        type: detectedType 
      };
    }
    
    const result = {
      success: true,
      url,
      detectedType,
      content,
      metadata,
      extractedAt: new Date().toISOString()
    };
    
    console.log(`[Simple Document Extraction] Successfully processed ${content.length} characters`);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[Simple Document Extraction Error]:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        extractedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}