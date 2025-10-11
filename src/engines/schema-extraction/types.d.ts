// Type declarations for modules that might have import issues
declare module 'pdf-parse' {
  interface PDFInfo {
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
  }

  interface PDFData {
    text: string;
    info?: PDFInfo;
  }

  function parse(buffer: Buffer): Promise<PDFData>;
  export = parse;
}