declare module 'pdf-parse' {
  export interface PdfMetadata {
    numpages?: number;
    numrender?: number;
    info?: any;
    metadata?: any;
    version?: string;
    text: string;
  }

  function pdfParse(data: Buffer | Uint8Array | ArrayBuffer): Promise<PdfMetadata>;
  export default pdfParse;
} 