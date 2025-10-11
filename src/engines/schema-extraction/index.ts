// Main Schema Extraction Engine - Autonomous exam schema generation

import { SearchLayer } from './search-layer';
import { ContentExtractor } from './content-extractor';
import { SchemaInferenceEngine } from './schema-inference';
import { SchemaBuilder } from './schema-builder';
import type { ExamSchema, ExtractionEngineOptions, SearchResult, ExtractedContent } from './types';

export class SchemaExtractionEngine {
  private searchLayer: SearchLayer;
  private contentExtractor: ContentExtractor;
  private schemaInference: SchemaInferenceEngine;
  private schemaBuilder: SchemaBuilder;
  private options: ExtractionEngineOptions;

  constructor(options?: ExtractionEngineOptions) {
    this.options = {
      maxSearchResults: 10,
      timeout: 60000,
      includeOfficialOnly: true,
      preferPdfs: true,
      ...options
    };

    this.searchLayer = new SearchLayer(this.options);
    this.contentExtractor = new ContentExtractor(this.options);
    this.schemaInference = new SchemaInferenceEngine();
    this.schemaBuilder = new SchemaBuilder();
  }

  /**
   * Main function to generate exam schema from exam name
   */
  async generateExamSchema(examName: string): Promise<ExamSchema> {
    console.log(`🔍 Starting schema extraction for: ${examName}`);
    
    try {
      // Step 1: Search for relevant content
      console.log('📡 Searching for exam content...');
      const searchResults = await this.searchForExamContent(examName);
      
      if (searchResults.length === 0) {
        console.log('⚠️ No relevant content found, generating fallback schema');
        return this.generateFallbackSchema(examName);
      }

      console.log(`✅ Found ${searchResults.length} relevant sources`);

      // Step 2: Extract content from search results
      console.log('📄 Extracting content from sources...');
      const extractedContents = await this.extractContentFromSources(searchResults);
      
      if (extractedContents.length === 0) {
        console.log('⚠️ Content extraction failed, generating fallback schema');
        return this.generateFallbackSchema(examName);
      }

      console.log(`✅ Successfully extracted content from ${extractedContents.length} sources`);

      // Step 3: Infer document requirements
      console.log('🧠 Analyzing content for document requirements...');
      const documentRequirements = await this.inferDocumentRequirements(extractedContents);
      
      console.log(`✅ Identified ${documentRequirements.length} document requirements`);

      // Step 4: Build final schema
      console.log('🏗️ Building final exam schema...');
      const schema = this.buildFinalSchema(examName, documentRequirements, extractedContents);
      
      // Step 5: Validate schema
      const validation = this.schemaBuilder.validateSchema(schema);
      if (!validation.isValid) {
        console.log('⚠️ Schema validation failed:', validation.errors);
        // Try to fix common issues or fall back
        return this.generateFallbackSchema(examName);
      }

      console.log('✅ Schema extraction completed successfully');
      console.log('📊 Schema Summary:');
      console.log(this.schemaBuilder.generateSchemaSummary(schema));
      
      return schema;

    } catch (error) {
      console.error('❌ Schema extraction failed:', error);
      return this.generateFallbackSchema(examName);
    }
  }

  /**
   * Search for exam-related content
   */
  private async searchForExamContent(examName: string): Promise<SearchResult[]> {
    try {
      const results = await this.searchLayer.searchExamContent(examName, this.options);
      
      // Filter and limit results based on options
      let filteredResults = results;
      
      if (this.options.includeOfficialOnly) {
        filteredResults = this.filterOfficialSources(results);
      }
      
      if (this.options.preferPdfs) {
        filteredResults = this.prioritizePdfs(filteredResults);
      }
      
      return filteredResults.slice(0, this.options.maxSearchResults || 10);
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  /**
   * Extract content from search results
   */
  private async extractContentFromSources(searchResults: SearchResult[]): Promise<ExtractedContent[]> {
    const extractedContents: ExtractedContent[] = [];
    const maxConcurrent = 3; // Limit concurrent extractions

    // Process in batches to avoid overwhelming servers
    for (let i = 0; i < searchResults.length; i += maxConcurrent) {
      const batch = searchResults.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (result) => {
        try {
          return await this.contentExtractor.extractWithRetry(result.url, 2);
        } catch (error) {
          console.error(`Failed to extract from ${result.url}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value && result.value.text.trim()) {
          extractedContents.push(result.value);
        }
      }

      // Small delay between batches to be respectful
      if (i + maxConcurrent < searchResults.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return extractedContents;
  }

  /**
   * Infer document requirements from extracted content
   */
  private async inferDocumentRequirements(extractedContents: ExtractedContent[]) {
    try {
      return await this.schemaInference.inferDocumentRequirements(extractedContents);
    } catch (error) {
      console.error('Schema inference failed:', error);
      return [];
    }
  }

  /**
   * Build the final schema
   */
  private buildFinalSchema(
    examName: string, 
    documentRequirements: any[], 
    extractedContents: ExtractedContent[]
  ): ExamSchema {
    return this.schemaBuilder.buildExamSchema(examName, documentRequirements, extractedContents);
  }

  /**
   * Filter to include only official sources
   */
  private filterOfficialSources(results: SearchResult[]): SearchResult[] {
    const officialDomains = [
      'gov.in', 'nic.in', 'ac.in', 'edu.in',
      'ibps.in', 'sbi.co.in', 'rbi.org.in',
      'ssc.nic.in', 'indianrailways.gov.in',
      'nta.ac.in', 'cbse.gov.in'
    ];

    return results.filter(result => 
      officialDomains.some(domain => result.url.includes(domain)) ||
      result.relevanceScore > 0.7 // High relevance score
    );
  }

  /**
   * Prioritize PDF documents
   */
  private prioritizePdfs(results: SearchResult[]): SearchResult[] {
    const pdfs = results.filter(r => r.type === 'pdf');
    const others = results.filter(r => r.type !== 'pdf');
    
    return [...pdfs, ...others];
  }

  /**
   * Generate fallback schema when extraction fails
   */
  private generateFallbackSchema(examName: string): ExamSchema {
    console.log('🔄 Generating fallback schema with standard requirements');
    
    const normalizedName = examName
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Determine exam type for appropriate defaults
    const examType = this.detectExamType(examName.toLowerCase());
    const standardRequirements = this.getStandardRequirementsByType(examType);

    return {
      exam: normalizedName,
      documents: standardRequirements,
      extractedFrom: 'Fallback - Standard Requirements',
      extractedAt: new Date().toISOString()
    };
  }

  /**
   * Detect exam type from name
   */
  private detectExamType(examName: string): string {
    if (examName.includes('ibps') || examName.includes('bank')) return 'banking';
    if (examName.includes('ssc')) return 'ssc';
    if (examName.includes('railway') || examName.includes('rrb')) return 'railway';
    if (examName.includes('upsc') || examName.includes('civil')) return 'upsc';
    if (examName.includes('neet') || examName.includes('jee')) return 'medical_engineering';
    return 'general';
  }

  /**
   * Get standard requirements by exam type
   */
  private getStandardRequirementsByType(examType: string) {
    const bankingRequirements = [
      {
        type: 'photograph',
        requirements: {
          format: ['JPG', 'JPEG'],
          size_kb: { min: 20, max: 50 },
          dimensions: '200x230 pixels',
          color: 'color' as const,
          background: 'light',
          notes: ['Recent colored photograph', 'Passport size', 'Clear face visibility']
        }
      },
      {
        type: 'signature',
        requirements: {
          format: ['JPG', 'JPEG'],
          size_kb: { min: 10, max: 20 },
          dimensions: '140x60 pixels',
          background: 'white',
          notes: ['Clear signature in black ink', 'Sign on white paper']
        }
      },
      {
        type: 'thumb_impression',
        requirements: {
          format: ['JPG', 'JPEG'],
          size_kb: { min: 10, max: 20 },
          dimensions: '240x240 pixels',
          background: 'white',
          notes: ['Left thumb impression', 'Clear impression on white paper']
        }
      }
    ];

    const sscRequirements = [
      {
        type: 'photograph',
        requirements: {
          format: ['JPEG'],
          size_kb: { min: 4, max: 40 },
          dimensions: '3.5x4.5 cm',
          color: 'color' as const,
          background: 'light',
          notes: ['Recent colored photograph', 'Passport size']
        }
      },
      {
        type: 'signature',
        requirements: {
          format: ['JPEG'],
          size_kb: { min: 1, max: 12 },
          dimensions: '4x2 cm',
          background: 'white',
          notes: ['Clear signature in black ink']
        }
      }
    ];

    const generalRequirements = [
      {
        type: 'photograph',
        requirements: {
          format: ['JPG', 'JPEG', 'PNG'],
          size_kb: { min: 10, max: 100 },
          dimensions: 'Passport size',
          color: 'color' as const,
          notes: ['Recent photograph', 'Clear face visibility']
        }
      },
      {
        type: 'signature',
        requirements: {
          format: ['JPG', 'JPEG', 'PNG'],
          size_kb: { min: 5, max: 50 },
          background: 'white',
          notes: ['Clear signature']
        }
      }
    ];

    switch (examType) {
      case 'banking': return bankingRequirements;
      case 'ssc': return sscRequirements;
      case 'railway': return bankingRequirements; // Similar to banking
      default: return generalRequirements;
    }
  }

  /**
   * Get extraction statistics
   */
  getExtractionStats(): any {
    return {
      searchTimeout: this.options.timeout,
      maxResults: this.options.maxSearchResults,
      includeOfficialOnly: this.options.includeOfficialOnly,
      preferPdfs: this.options.preferPdfs
    };
  }
}

/**
 * Main exported function for autonomous schema generation
 */
export async function generateExamSchema(
  examName: string, 
  options?: ExtractionEngineOptions
): Promise<ExamSchema> {
  const engine = new SchemaExtractionEngine(options);
  return await engine.generateExamSchema(examName);
}

// Export all types and classes for external use
export * from './types';
export { SearchLayer } from './search-layer';
export { ContentExtractor } from './content-extractor';
export { SchemaInferenceEngine } from './schema-inference';
export { SchemaBuilder } from './schema-builder';