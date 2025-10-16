/**
 * PDF Extractor Module
 * Handles extraction of text content from PDF files using pdf-parse
 */

import pdfParse from 'pdf-parse';
import { ExtractionResult } from './types';

export class PdfExtractor {
  /**
   * Extract text content from PDF buffer or base64 string
   */
  async extractText(input: Buffer | string): Promise<string> {
    try {
      let buffer: Buffer;
      
      if (typeof input === 'string') {
        // Assume base64 encoded PDF
        buffer = Buffer.from(input, 'base64');
      } else {
        buffer = input;
      }

      const data = await pdfParse(buffer, {
        // Options to improve text extraction
        max: 0, // Extract all pages
        version: 'v1.10.100' // Use specific version for consistency
      });

      return this.cleanExtractedText(data.text);
    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${error}`);
    }
  }

  /**
   * Process ExtractionResult from fetcher and extract text
   */
  async processExtractionResult(result: ExtractionResult): Promise<string> {
    if (result.contentType !== 'pdf') {
      throw new Error('Expected PDF content type');
    }

    return this.extractText(result.rawText);
  }

  /**
   * Clean and normalize extracted PDF text
   */
  private cleanExtractedText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive newlines but preserve paragraph breaks
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  }

  /**
   * Extract text with metadata (page numbers, structure info)
   */
  async extractWithMetadata(input: Buffer | string): Promise<{
    text: string;
    pages: number;
    info: any;
    metadata: any;
  }> {
    try {
      let buffer: Buffer;
      
      if (typeof input === 'string') {
        buffer = Buffer.from(input, 'base64');
      } else {
        buffer = input;
      }

      const data = await pdfParse(buffer);

      return {
        text: this.cleanExtractedText(data.text),
        pages: data.numpages,
        info: data.info,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('PDF extraction with metadata failed:', error);
      throw new Error(`Failed to extract PDF with metadata: ${error}`);
    }
  }

  /**
   * Check if content appears to be a valid PDF
   */
  isValidPdf(input: Buffer | string): boolean {
    try {
      let buffer: Buffer;
      
      if (typeof input === 'string') {
        buffer = Buffer.from(input, 'base64');
      } else {
        buffer = input;
      }

      // Check for PDF header
      const header = buffer.slice(0, 5).toString();
      return header === '%PDF-';
    } catch {
      return false;
    }
  }
}

export const pdfExtractor = new PdfExtractor();