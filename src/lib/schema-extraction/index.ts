/**
 * Main Schema Extraction Module
 * Orchestrates all components to extract document requirements from URLs
 */

import { ExamSchema, FetchOptions } from './types';
import { contentFetcher } from './fetcher';
import { pdfExtractor } from './pdf-extractor';
import { htmlParser } from './html-parser';
import { textAnalyzer } from './text-analyzer';
import { schemaBuilder } from './schema-builder';

// Export the class for advanced usage
export class SchemaExtractor {
  /**
   * Generate exam schema from a URL or PDF link
   */
  async generateSchemaFromLink(
    link: string, 
    options: FetchOptions = {}
  ): Promise<ExamSchema> {
    console.log(`🔍 Starting schema extraction from: ${link}`);
    
    try {
      // Step 1: Fetch content from the URL
      console.log('📥 Fetching content...');
      const extractionResult = await contentFetcher.fetchContent(link, options);
      
      // Step 2: Extract text based on content type
      console.log(`📄 Extracting text from ${extractionResult.contentType}...`);
      let extractedText: string;
      let examTitle: string = 'Unknown Exam';
      
      if (extractionResult.contentType === 'pdf') {
        extractedText = await pdfExtractor.processExtractionResult(extractionResult);
        // For PDFs, try to extract title from first few lines
        examTitle = this.extractTitleFromText(extractedText);
      } else {
        // For HTML, extract both text and title
        const structuredData = htmlParser.extractStructuredText(extractionResult.rawText);
        extractedText = structuredData.text;
        examTitle = htmlParser.extractTitle(extractionResult.rawText);
        
        // Also include relevant sections for better analysis
        const documentSections = htmlParser.extractDocumentSections(extractionResult.rawText);
        if (documentSections.length > 0) {
          extractedText += '\n\n' + documentSections.join('\n\n');
        }
      }
      
      console.log(`📊 Extracted ${extractedText.length} characters of text`);
      console.log(`📄 First 200 chars: ${extractedText.substring(0, 200)}...`);
      
      // Check if we got meaningful content
      if (extractedText.length < 100 || !this.containsDocumentKeywords(extractedText)) {
        console.warn('⚠️ Low quality or generic content detected');
        console.log('📝 Raw content preview:', extractedText.substring(0, 500));
      }
      
      // Step 3: Analyze text for document requirements
      console.log('🔬 Analyzing text for document requirements...');
      const parsedRequirements = textAnalyzer.analyzeText(extractedText);
      
      console.log(`📋 Found ${parsedRequirements.length} document requirements`);
      if (parsedRequirements.length > 0) {
        console.log('📝 Requirements found:', parsedRequirements.map(r => `${r.documentType} (${r.confidence})`).join(', '));
      }
      
      // Step 4: Build structured schema
      console.log('🏗️ Building structured schema...');
      const schema = schemaBuilder.buildSchema(
        parsedRequirements,
        examTitle,
        link,
        extractionResult.contentType === 'pdf' ? 'pdf' : 
        options.enableJavascript ? 'dynamic' : 'html'
      );
      
      // Step 5: Validate schema
      const validation = schemaBuilder.validateSchema(schema);
      if (!validation.isValid) {
        console.warn('⚠️ Schema validation warnings:', validation.errors);
      }
      
      console.log('✅ Schema extraction completed successfully');
      console.log(`📈 Confidence: ${schema.metadata?.confidence || 0}`);
      console.log(`📑 Documents found: ${schema.documents.length}`);
      
      return schema;
      
    } catch (error) {
      console.error('❌ Schema extraction failed:', error);
      
      // Return a minimal schema with error information
      return {
        exam: 'Extraction Failed',
        source: link,
        extractedAt: new Date().toISOString(),
        documents: [],
        metadata: {
          url: link,
          contentType: 'unknown',
          extractionMethod: 'html',
          confidence: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Check if text contains document-related keywords
   */
  private containsDocumentKeywords(text: string): boolean {
    const keywords = [
      'document', 'upload', 'photo', 'signature', 'certificate', 
      'marksheet', 'attachment', 'file', 'image', 'requirement',
      'format', 'size', 'dimension', 'jpg', 'jpeg', 'png', 'pdf'
    ];
    
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Extract exam title from raw text (for PDFs)
   */
  private extractTitleFromText(text: string): string {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for lines that might be titles
    for (const line of lines.slice(0, 10)) { // Check first 10 lines
      if (line.length > 10 && line.length < 100) {
        // Check if it contains exam-related keywords
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('exam') || 
            lowerLine.includes('recruitment') || 
            lowerLine.includes('notification') ||
            lowerLine.includes('application') ||
            lowerLine.includes('clerk') ||
            lowerLine.includes('officer') ||
            lowerLine.includes('ibps') ||
            lowerLine.includes('sbi') ||
            lowerLine.includes('upsc') ||
            lowerLine.includes('ssc')) {
          return line;
        }
      }
    }
    
    // Fallback to first substantial line
    const firstLine = lines.find(line => line.length > 10 && line.length < 100);
    return firstLine || 'Unknown Exam';
  }

  /**
   * Batch process multiple URLs
   */
  async processMultipleLinks(
    links: string[], 
    options: FetchOptions = {}
  ): Promise<ExamSchema[]> {
    const schemas: ExamSchema[] = [];
    
    for (const link of links) {
      try {
        const schema = await this.generateSchemaFromLink(link, options);
        schemas.push(schema);
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to process ${link}:`, error);
        // Continue with other links
      }
    }
    
    return schemas;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    await contentFetcher.destroy();
  }
}

// Export main function for easy usage
export async function generateSchemaFromLink(
  link: string, 
  options: FetchOptions = {}
): Promise<ExamSchema> {
  const extractor = new SchemaExtractor();
  try {
    return await extractor.generateSchemaFromLink(link, options);
  } finally {
    await extractor.cleanup();
  }
}

// Export the class for advanced usage

// Re-export all types for convenience
export * from './types';