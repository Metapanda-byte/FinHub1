declare module 'pdf-parse' {
  export interface PDFInfo {
    [key: string]: any;
  }

  export interface PDFMetadata {
    [key: string]: any;
  }

  export interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata?: PDFMetadata;
    text: string;
    version: string;
  }

  export type PDFParseOptions = {
    pagerender?: (pageData: any) => string | Promise<string>;
    max?: number;
    version?: string;
    [key: string]: any;
  };

  function pdfParse(data: Buffer | Uint8Array, options?: PDFParseOptions): Promise<PDFData>;

  export default pdfParse;
} 