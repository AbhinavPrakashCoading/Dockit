/**
 * HTML Parser Module
 * Handles parsing HTML content and extracting visible text using cheerio
 */

import * as cheerio from 'cheerio';
import { ExtractionResult } from './types';

export class HtmlParser {
  /**
   * Extract visible text from HTML content
   */
  extractText(html: string): string {
    const $ = cheerio.load(html);
    
    // Remove script and style elements
    $('script, style, noscript').remove();
    
    // Remove comments
    $('*').contents().filter(function() {
      return this.type === 'comment';
    }).remove();

    // Get text from body, or entire document if no body
    const bodyText = $('body').length > 0 ? $('body').text() : $.text();
    
    return this.cleanExtractedText(bodyText);
  }

  /**
   * Process ExtractionResult from fetcher and extract text
   */
  async processExtractionResult(result: ExtractionResult): Promise<string> {
    if (result.contentType !== 'html') {
      throw new Error('Expected HTML content type');
    }

    return this.extractText(result.rawText);
  }

  /**
   * Extract text with structural information (headings, lists, etc.)
   */
  extractStructuredText(html: string): {
    text: string;
    headings: string[];
    lists: string[];
    forms: string[];
    links: Array<{ text: string; href: string }>;
  } {
    const $ = cheerio.load(html);
    
    // Remove script and style elements
    $('script, style, noscript').remove();
    
    // Extract headings
    const headings: string[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        headings.push(text);
      }
    });

    // Extract list items
    const lists: string[] = [];
    $('ul li, ol li').each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        lists.push(text);
      }
    });

    // Extract form-related text
    const forms: string[] = [];
    $('form, fieldset, label, .form, .upload, .requirement').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10) { // Filter out very short text
        forms.push(text);
      }
    });

    // Extract links that might contain document requirements
    const links: Array<{ text: string; href: string }> = [];
    $('a').each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href') || '';
      if (text && (text.toLowerCase().includes('document') || 
                   text.toLowerCase().includes('upload') ||
                   text.toLowerCase().includes('photo') ||
                   text.toLowerCase().includes('signature'))) {
        links.push({ text, href });
      }
    });

    const bodyText = $('body').length > 0 ? $('body').text() : $.text();
    
    return {
      text: this.cleanExtractedText(bodyText),
      headings,
      lists,
      forms,
      links
    };
  }

  /**
   * Extract specific sections that commonly contain document requirements
   */
  extractDocumentSections(html: string): string[] {
    const $ = cheerio.load(html);
    const sections: string[] = [];

    // Look for common selectors that contain document requirements
    const selectors = [
      '.document, .documents',
      '.upload, .uploads',
      '.requirement, .requirements', 
      '.photo, .photos',
      '.signature',
      '.attachment, .attachments',
      '[id*="document"], [id*="upload"], [id*="photo"], [id*="signature"]',
      '[class*="document"], [class*="upload"], [class*="photo"], [class*="signature"]',
      'section, article, .content, .main-content',
      '.form-section, .form-group',
      'table td, table th'
    ];

    selectors.forEach(selector => {
      $(selector).each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 20) { // Filter out very short sections
          sections.push(text);
        }
      });
    });

    // Also extract text from paragraphs that contain keywords
    $('p, div, span').each((_, el) => {
      const text = $(el).text().trim();
      const lowerText = text.toLowerCase();
      
      if (text.length > 30 && (
        lowerText.includes('document') ||
        lowerText.includes('upload') ||
        lowerText.includes('photo') ||
        lowerText.includes('signature') ||
        lowerText.includes('attachment') ||
        lowerText.includes('file') ||
        lowerText.includes('image') ||
        lowerText.includes('jpg') ||
        lowerText.includes('jpeg') ||
        lowerText.includes('png') ||
        lowerText.includes('pdf') ||
        lowerText.includes('size') ||
        lowerText.includes('dimension') ||
        lowerText.includes('kb') ||
        lowerText.includes('mb')
      )) {
        sections.push(text);
      }
    });

    return [...new Set(sections)]; // Remove duplicates
  }

  /**
   * Get the page title for schema identification
   */
  extractTitle(html: string): string {
    const $ = cheerio.load(html);
    
    // Try different selectors for title
    const titleSelectors = [
      'title',
      'h1',
      '.title, .page-title, .main-title',
      '[id*="title"], [class*="title"]'
    ];

    for (const selector of titleSelectors) {
      const titleEl = $(selector).first();
      if (titleEl.length > 0) {
        const title = titleEl.text().trim();
        if (title && title.length > 0) {
          return title;
        }
      }
    }

    return 'Unknown Exam';
  }

  /**
   * Clean and normalize extracted text
   */
  private cleanExtractedText(text: string): string {
    return text
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove excessive punctuation
      .replace(/[^\w\s\-.,;:()\[\]{}\/]/g, '')
      // Remove multiple consecutive punctuation
      .replace(/[.,;:]{2,}/g, '.')
      // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  }
}

export const htmlParser = new HtmlParser();