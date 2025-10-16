/**
 * Schema Extraction Module Types
 * Defines interfaces for exam document requirement extraction
 */

export interface DocumentRequirement {
  type: string;
  requirements: {
    format?: string[];
    maxSize?: string;
    minSize?: string;
    dimensions?: {
      width?: number;
      height?: number;
      ratio?: string;
    };
    description?: string;
    mandatory?: boolean;
  };
}

export interface ExamSchema {
  exam: string;
  source: string;
  extractedAt: string;
  documents: DocumentRequirement[];
  metadata?: {
    url: string;
    contentType: string;
    extractionMethod: 'html' | 'pdf' | 'dynamic';
    confidence: number;
    error?: string;
  };
}

export interface ExtractionResult {
  rawText: string;
  contentType: 'html' | 'pdf';
  source: string;
}

export interface ParsedRequirement {
  documentType: string;
  formats: string[];
  sizeConstraints: {
    max?: string;
    min?: string;
  };
  dimensions?: {
    width?: number;
    height?: number;
    ratio?: string;
  };
  description: string;
  confidence: number;
}

export interface FetchOptions {
  timeout?: number;
  userAgent?: string;
  enableJavascript?: boolean;
  waitForSelector?: string;
  headers?: Record<string, string>;
}

export interface AnalysisPattern {
  name: string;
  regex: RegExp;
  confidence: number;
  extractor: (match: RegExpMatchArray, context: string) => Partial<ParsedRequirement>;
}