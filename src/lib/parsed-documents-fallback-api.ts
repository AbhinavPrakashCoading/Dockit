/**
 * Client utility for interacting with the Fallback Parsed Documents CRUD API
 * This is a temporary solution while Prisma client regeneration issues are resolved
 */

interface ParsedDocumentData {
  id: string;
  examName: string;
  examType: string | null;
  source: string;
  parsedJson: any;
  originalText: string | null;
  confidence: number | null;
  documentCount: number | null;
  method: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  extractedAt: string;
  accessCount: number;
  lastAccessed: string | null;
}

interface CreateParsedDocumentRequest {
  examName: string;
  examType?: string;
  source?: string;
  parsedJson: any;
  originalText?: string;
  confidence?: number;
  documentCount?: number;
  method?: string;
  userId?: string;
}

interface UpdateParsedDocumentRequest {
  examName?: string;
  examType?: string;
  source?: string;
  parsedJson?: any;
  originalText?: string;
  confidence?: number;
  documentCount?: number;
  method?: string;
}

interface ListParsedDocumentsResponse {
  data: ParsedDocumentData[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

class ParsedDocumentsFallbackAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/parsed-documents-fallback') {
    this.baseUrl = baseUrl;
  }

  /**
   * Create a new parsed document
   */
  async create(data: CreateParsedDocumentRequest): Promise<ParsedDocumentData> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get a parsed document by ID
   */
  async getById(id: string): Promise<ParsedDocumentData> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update a parsed document
   */
  async update(id: string, data: UpdateParsedDocumentRequest): Promise<ParsedDocumentData> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Delete a parsed document
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
  }

  /**
   * List parsed documents with optional filtering
   */
  async list(options: {
    userId?: string;
    examType?: string;
    examName?: string;
    source?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ListParsedDocumentsResponse> {
    const params = new URLSearchParams();
    
    if (options.userId) params.set('userId', options.userId);
    if (options.examType) params.set('examType', options.examType);
    if (options.examName) params.set('examName', options.examName);
    if (options.source) params.set('source', options.source);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());

    const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Search parsed documents by exam name
   */
  async searchByExamName(examName: string, limit: number = 10): Promise<ParsedDocumentData[]> {
    const result = await this.list({ examName, limit });
    return result.data;
  }

  /**
   * Get parsed documents by user
   */
  async getByUserId(userId: string, limit: number = 50): Promise<ParsedDocumentData[]> {
    const result = await this.list({ userId, limit });
    return result.data;
  }

  /**
   * Get recent parsed documents
   */
  async getRecent(limit: number = 20): Promise<ParsedDocumentData[]> {
    const result = await this.list({ limit });
    return result.data;
  }

  /**
   * Get documents by exam type
   */
  async getByExamType(examType: string, limit: number = 20): Promise<ParsedDocumentData[]> {
    const result = await this.list({ examType, limit });
    return result.data;
  }

  /**
   * Get parsing analytics
   */
  async getAnalytics(): Promise<{
    total: number;
    byExamType: Record<string, number>;
    bySource: Record<string, number>;
    avgConfidence: number;
    avgDocumentCount: number;
  }> {
    const result = await this.list({ limit: 1000 }); // Get all for analytics
    const docs = result.data;

    const analytics = {
      total: docs.length,
      byExamType: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      avgConfidence: 0,
      avgDocumentCount: 0
    };

    let totalConfidence = 0;
    let totalDocCount = 0;
    let confidenceCount = 0;
    let docCountCount = 0;

    docs.forEach(doc => {
      // Count by exam type
      const examType = doc.examType || 'unknown';
      analytics.byExamType[examType] = (analytics.byExamType[examType] || 0) + 1;

      // Count by source
      analytics.bySource[doc.source] = (analytics.bySource[doc.source] || 0) + 1;

      // Average confidence
      if (doc.confidence !== null) {
        totalConfidence += doc.confidence;
        confidenceCount++;
      }

      // Average document count
      if (doc.documentCount !== null) {
        totalDocCount += doc.documentCount;
        docCountCount++;
      }
    });

    analytics.avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
    analytics.avgDocumentCount = docCountCount > 0 ? totalDocCount / docCountCount : 0;

    return analytics;
  }
}

// Export singleton instance
export const parsedDocumentsFallbackAPI = new ParsedDocumentsFallbackAPI();

// Export types for use in other files
export type {
  ParsedDocumentData,
  CreateParsedDocumentRequest,
  UpdateParsedDocumentRequest,
  ListParsedDocumentsResponse
};

// Export class for custom instances
export { ParsedDocumentsFallbackAPI };