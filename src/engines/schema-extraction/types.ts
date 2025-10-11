// Type definitions for the Schema Extraction Engine

export interface ExamSchema {
  exam: string;
  documents: DocumentRequirement[];
  extractedFrom?: string;
  extractedAt?: string;
}

export interface DocumentRequirement {
  type: string;
  requirements: {
    format?: string[];
    size_kb?: {
      min?: number;
      max?: number;
    };
    size_mb?: {
      min?: number;
      max?: number;
    };
    dimensions?: string;
    resolution?: string;
    color?: 'color' | 'black-white' | 'any';
    background?: string;
    notes?: string[];
  };
}

export interface SearchResult {
  url: string;
  title: string;
  content: string;
  type: 'pdf' | 'html';
  relevanceScore: number;
}

export interface ExtractedContent {
  text: string;
  url: string;
  type: 'pdf' | 'html';
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
  };
}

export interface DocumentPattern {
  type: string;
  patterns: string[];
  extractedText: string;
  confidence: number;
}

export interface ExtractionEngineOptions {
  maxSearchResults?: number;
  timeout?: number;
  includeOfficialOnly?: boolean;
  preferPdfs?: boolean;
}

export interface SearchQuery {
  examName: string;
  searchTerms: string[];
  excludeTerms?: string[];
  fileTypes?: string[];
  domains?: string[];
}