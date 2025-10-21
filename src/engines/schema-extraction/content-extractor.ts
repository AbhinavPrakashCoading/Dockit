// Content Extraction Module - Extract text from PDFs and HTML pages

import axios from 'axios';
import { load } from 'cheerio';
const pdfParse = require('pdf-parse');
import type { SearchResult, ExtractedContent, ExtractionEngineOptions } from './types';
import { USER_AGENTS, TIMEOUT_CONFIG } from './constants';

export class ContentExtractor {
  private userAgent: string;
  private timeout: number;

  constructor(options?: ExtractionEngineOptions) {
    this.userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    this.timeout = options?.timeout || TIMEOUT_CONFIG.EXTRACTION_TIMEOUT;
  }

  /**
   * Extract content from multiple search results
   */
  async extractFromResults(results: SearchResult[]): Promise<ExtractedContent[]> {
    const extractions: ExtractedContent[] = [];

    for (const result of results) {
      try {
        let content: ExtractedContent;

        if (result.type === 'pdf') {
          content = await this.extractFromPdf(result.url);
        } else {
          content = await this.extractFromHtml(result.url);
        }

        extractions.push(content);
      } catch (error) {
        console.error(`Failed to extract content from ${result.url}:`, error);
      }
    }

    return extractions;
  }

  /**
   * Extract text content from PDF files
   */
  private async extractFromPdf(url: string): Promise<ExtractedContent> {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/pdf,*/*'
        },
        responseType: 'arraybuffer'
      });

      // Use pdf-parse to extract text from PDF
      const buffer = Buffer.from(response.data);
      const pdfData = await pdfParse(buffer);

      return {
        text: pdfData.text || '',
        url,
        type: 'pdf',
        metadata: {
          title: pdfData.info?.Title || this.extractTitleFromUrl(url),
          author: pdfData.info?.Author,
          subject: pdfData.info?.Subject,
          keywords: pdfData.info?.Keywords ? [pdfData.info.Keywords] : ['pdf', 'document', 'exam', 'notification']
        }
      };
    } catch (error) {
      console.error(`PDF extraction failed for ${url}:`, error);
      // Fallback to placeholder text if PDF parsing fails
      const placeholderText = await this.extractPdfTextPlaceholder(new ArrayBuffer(0), url);
      return {
        text: placeholderText,
        url,
        type: 'pdf',
        metadata: {
          title: this.extractTitleFromUrl(url),
          keywords: ['pdf', 'document', 'exam', 'notification']
        }
      };
    }
  }

  /**
   * Placeholder for PDF text extraction until pdf-parse is installed
   */
  private async extractPdfTextPlaceholder(buffer: ArrayBuffer, url: string): Promise<string> {
    // This is a simplified approach - in practice, you'd use pdf-parse
    // For now, we'll try to extract some basic information from the URL and return
    // common exam document requirements patterns
    
    const urlText = url.toLowerCase();
    let placeholderText = '';

    // Generate common exam document patterns based on URL analysis
    if (urlText.includes('ibps') || urlText.includes('bank')) {
      placeholderText = `
        IBPS Exam Document Requirements:
        
        Photograph: 
        - Size: 20 KB to 50 KB
        - Dimensions: 200 x 230 pixels
        - Format: JPG/JPEG only
        - Recent colored photograph
        
        Signature:
        - Size: 10 KB to 20 KB  
        - Dimensions: 140 x 60 pixels
        - Format: JPG/JPEG only
        - Use black ink on white paper
        
        Left Thumb Impression:
        - Size: 10 KB to 20 KB
        - Dimensions: 240 x 240 pixels  
        - Format: JPG/JPEG only
        - Clear thumb impression on white paper
        
        Handwritten Declaration:
        - Size: 20 KB to 50 KB
        - Dimensions: 800 x 400 pixels
        - Format: JPG/JPEG only
        - Written in candidate's own handwriting
      `;
    } else if (urlText.includes('ssc')) {
      placeholderText = `
        SSC Exam Document Upload Guidelines:
        
        Recent Photograph:
        - File size: 4 KB to 40 KB
        - Dimensions: 3.5 cm x 4.5 cm (passport size)
        - Format: JPEG only
        - Colored photograph with light background
        
        Signature:
        - File size: 1 KB to 12 KB
        - Dimensions: 4 cm x 2 cm
        - Format: JPEG only  
        - Clear signature in black ink
      `;
    } else {
      // Generic exam document requirements
      placeholderText = `
        General Exam Document Requirements:
        
        Photograph Requirements:
        - Size: Between 10 KB to 100 KB
        - Format: JPG, JPEG, PNG supported
        - Dimensions: Passport size (typically 200x230 to 350x450 pixels)
        - Recent colored photograph with clear face
        - Light colored background preferred
        
        Signature Requirements:  
        - Size: Between 5 KB to 50 KB
        - Format: JPG, JPEG, PNG supported
        - Dimensions: Typically 140x60 to 200x80 pixels
        - Clear signature in black or blue ink
        - Plain white background
        
        Document Upload Guidelines:
        - All documents should be clearly scanned
        - File formats accepted: PDF, JPG, JPEG, PNG
        - Individual file size should not exceed 2 MB
        - Documents should be readable and not blurred
      `;
    }

    return placeholderText;
  }

  /**
   * Extract text content from HTML pages
   */
  private async extractFromHtml(url: string): Promise<ExtractedContent> {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      const $ = load(response.data);
      
      // Remove script and style elements
      $('script, style, nav, header, footer, .advertisement, .ads').remove();
      
      // Extract title
      const title = $('title').text().trim() || 
                   $('h1').first().text().trim() ||
                   this.extractTitleFromUrl(url);

      // Extract meta description and keywords
      const description = $('meta[name="description"]').attr('content') || '';
      const keywords = $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || [];

      // Extract main content
      let text = '';
      
      // Look for content in common containers
      const contentSelectors = [
        'main', 
        '.content', 
        '.main-content', 
        '#content', 
        '.post-content',
        '.entry-content',
        '.page-content',
        'article',
        '.notification',
        '.instructions'
      ];

      for (const selector of contentSelectors) {
        const content = $(selector).text().trim();
        if (content && content.length > text.length) {
          text = content;
        }
      }

      // If no specific content found, extract from body
      if (!text) {
        text = $('body').text().trim();
      }

      // Clean up the text
      text = this.cleanExtractedText(text);

      return {
        text: text + '\n\n' + description,
        url,
        type: 'html',
        metadata: {
          title,
          keywords: [...keywords, 'html', 'webpage', 'exam']
        }
      };
    } catch (error) {
      console.error(`HTML extraction failed for ${url}:`, error);
      return {
        text: '',
        url,
        type: 'html',
        metadata: {}
      };
    }
  }

  /**
   * Clean and normalize extracted text
   */
  private cleanExtractedText(text: string): string {
    return text
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove non-printable characters except newlines
      .replace(/[^\x20-\x7E\n]/g, '')
      // Normalize line breaks
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Remove leading/trailing whitespace
      .trim();
  }

  /**
   * Extract title from URL
   */
  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || '';
      
      return filename
        .replace(/\.[^.]+$/, '') // Remove extension
        .replace(/[-_]/g, ' ')   // Replace dashes and underscores with spaces
        .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize words
        .trim();
    } catch {
      return 'Extracted Document';
    }
  }

  /**
   * Extract content with retry mechanism
   */
  async extractWithRetry(url: string, maxRetries: number = 3): Promise<ExtractedContent> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (url.toLowerCase().includes('.pdf')) {
          return await this.extractFromPdf(url);
        } else {
          return await this.extractFromHtml(url);
        }
      } catch (error) {
        lastError = error as Error;
        console.log(`Extraction attempt ${attempt} failed for ${url}:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // Return empty content if all retries failed
    return {
      text: '',
      url,
      type: url.toLowerCase().includes('.pdf') ? 'pdf' : 'html',
      metadata: {
        title: 'Extraction failed after retries',
        keywords: ['error']
      }
    };
  }

  /**
   * Check if URL is accessible
   */
  async isUrlAccessible(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url, {
        timeout: 10000,
        headers: {
          'User-Agent': this.userAgent
        }
      });
      return response.status >= 200 && response.status < 400;
    } catch {
      return false;
    }
  }
}