/**
 * Visual Web Scraper Layer
 * Intelligently scrapes exam websites to extract requirements
 */

// Conditional imports for serverless environments
let puppeteer: any = null;
try {
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    puppeteer = require('puppeteer');
  }
} catch (error) {
  console.warn('puppeteer not available in this environment:', error);
}

import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapingOptions {
  examName: string;
  targetElements: string[];
  timeout: number;
  useVisualRecognition?: boolean;
}

interface ScrapingResult {
  requirements: ExamRequirement[];
  source: SourceInfo;
  metadata: {
    scrapedAt: string;
    method: 'visual' | 'dom' | 'hybrid';
    elementsFound: number;
    confidence: number;
  };
}

interface ExamRequirement {
  id: string;
  name: string;
  type: 'document' | 'form-field' | 'media';
  required: boolean;
  description: string;
  formats?: string[];
  constraints?: {
    maxSize?: string;
    dimensions?: string;
    fileTypes?: string[];
  };
}

interface SourceInfo {
  url: string;
  title: string;
  type: 'official' | 'news' | 'forum' | 'guide';
  reliability: number;
  lastAccessed: string;
  contentHash: string;
}

export class VisualWebScraper {
  private browser: any = null;
  private documentPatterns: RegExp[];
  private requirementKeywords: string[];

  constructor() {
    this.documentPatterns = [
      /photograph|photo|passport.*photo|recent.*photo/i,
      /signature|sign|handwritten.*signature/i,
      /thumb.*impression|fingerprint|left.*thumb/i,
      /declaration|handwritten.*declaration/i,
      /certificate|marksheet|degree|diploma|educational/i,
      /category.*certificate|caste.*certificate|reservation/i,
      /identity.*proof|id.*proof|aadhar|pan/i,
      /address.*proof|residence.*proof/i,
      /experience.*certificate|work.*experience/i,
      /character.*certificate|conduct.*certificate/i
    ];

    this.requirementKeywords = [
      'documents required', 'required documents', 'eligibility documents',
      'application requirements', 'how to apply', 'application procedure',
      'documents to be uploaded', 'upload documents', 'document checklist',
      'mandatory documents', 'essential documents', 'supporting documents'
    ];
  }

  /**
   * Main scraping method with multiple fallback strategies
   */
  async scrapeExamRequirements(url: string, options: ScrapingOptions): Promise<ScrapingResult> {
    console.log(`🕷️ Scraping ${url} for ${options.examName}`);

    try {
      // Strategy 1: Try visual/DOM scraping with Puppeteer
      const visualResult = await this.visualScraping(url, options);
      if (visualResult.requirements.length > 0) {
        return visualResult;
      }
    } catch (error) {
      console.log('Visual scraping failed, trying DOM scraping:', error.message);
    }

    try {
      // Strategy 2: Fallback to basic DOM scraping
      const domResult = await this.domScraping(url, options);
      if (domResult.requirements.length > 0) {
        return domResult;
      }
    } catch (error) {
      console.log('DOM scraping failed:', error.message);
    }

    throw new Error(`Failed to scrape requirements from ${url}`);
  }

  /**
   * Advanced visual scraping using Puppeteer
   */
  private async visualScraping(url: string, options: ScrapingOptions): Promise<ScrapingResult> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to page with timeout
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: options.timeout 
      });

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Take screenshot for visual analysis (optional)
      const screenshot = await page.screenshot({ fullPage: true });

      // Extract text content and structure
      const pageData = await page.evaluate(() => {
        const textContent = document.body.innerText;
        const links = Array.from(document.links).map(link => ({
          text: link.textContent?.trim(),
          href: link.href
        }));
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          level: h.tagName,
          text: h.textContent?.trim()
        }));
        const lists = Array.from(document.querySelectorAll('ul, ol')).map(list => 
          Array.from(list.querySelectorAll('li')).map(li => li.textContent?.trim())
        );

        return { textContent, links, headings, lists, title: document.title };
      });

      // Look for application/notification links
      const relevantLinks = await this.findRelevantLinks(page, options.examName);
      
      // If we find notification/application links, scrape those too
      const additionalRequirements = [];
      for (const link of relevantLinks.slice(0, 2)) { // Limit to avoid infinite scraping
        try {
          await page.goto(link.href, { waitUntil: 'networkidle2', timeout: 15000 });
          const linkData = await page.evaluate(() => document.body.innerText);
          const linkRequirements = this.extractRequirementsFromText(linkData);
          additionalRequirements.push(...linkRequirements);
        } catch (error) {
          console.log(`Failed to scrape linked page ${link.href}:`, error.message);
        }
      }

      // Extract requirements from all collected text
      const mainRequirements = this.extractRequirementsFromText(pageData.textContent);
      const allRequirements = [...mainRequirements, ...additionalRequirements];

      // Calculate confidence based on various factors
      const confidence = this.calculateVisualConfidence(pageData, allRequirements, relevantLinks);

      return {
        requirements: this.deduplicateRequirements(allRequirements),
        source: {
          url,
          title: pageData.title,
          type: this.determineSourceType(url, pageData.textContent),
          reliability: this.calculateReliability(url, pageData),
          lastAccessed: new Date().toISOString(),
          contentHash: this.hashContent(pageData.textContent)
        },
        metadata: {
          scrapedAt: new Date().toISOString(),
          method: 'visual',
          elementsFound: allRequirements.length,
          confidence
        }
      };

    } finally {
      await page.close();
    }
  }

  /**
   * Basic DOM scraping fallback
   */
  private async domScraping(url: string, options: ScrapingOptions): Promise<ScrapingResult> {
    const response = await axios.get(url, {
      timeout: options.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const textContent = $('body').text();
    const title = $('title').text();

    const requirements = this.extractRequirementsFromText(textContent);
    const confidence = this.calculateDOMConfidence(textContent, requirements);

    return {
      requirements,
      source: {
        url,
        title,
        type: this.determineSourceType(url, textContent),
        reliability: this.calculateReliability(url, { textContent, title }),
        lastAccessed: new Date().toISOString(),
        contentHash: this.hashContent(textContent)
      },
      metadata: {
        scrapedAt: new Date().toISOString(),
        method: 'dom',
        elementsFound: requirements.length,
        confidence
      }
    };
  }

  /**
   * Extract requirements from text using pattern matching and NLP
   */
  private extractRequirementsFromText(text: string): ExamRequirement[] {
    const requirements: ExamRequirement[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Look for document sections
    const documentSections = this.findDocumentSections(lines);
    
    for (const section of documentSections) {
      const sectionRequirements = this.extractFromSection(section);
      requirements.push(...sectionRequirements);
    }

    // Also do pattern-based extraction across entire text
    for (const pattern of this.documentPatterns) {
      const matches = text.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        for (const match of matches) {
          const requirement = this.createRequirementFromMatch(match);
          if (requirement && !requirements.find(r => r.id === requirement.id)) {
            requirements.push(requirement);
          }
        }
      }
    }

    return requirements;
  }

  /**
   * Find document-related sections in text
   */
  private findDocumentSections(lines: string[]): string[][] {
    const sections: string[][] = [];
    let currentSection: string[] = [];
    let inDocumentSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      // Check if this line indicates start of document section
      const isDocumentHeader = this.requirementKeywords.some(keyword => 
        line.includes(keyword.toLowerCase())
      );

      if (isDocumentHeader) {
        if (currentSection.length > 0) {
          sections.push([...currentSection]);
        }
        currentSection = [lines[i]];
        inDocumentSection = true;
      } else if (inDocumentSection) {
        // Continue collecting until we hit a clear section break
        if (line.length === 0 || this.isNewSection(line)) {
          if (currentSection.length > 1) {
            sections.push([...currentSection]);
          }
          currentSection = [];
          inDocumentSection = false;
        } else {
          currentSection.push(lines[i]);
        }
      }
    }

    if (currentSection.length > 1) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Extract requirements from a specific section
   */
  private extractFromSection(section: string[]): ExamRequirement[] {
    const requirements: ExamRequirement[] = [];
    
    for (const line of section.slice(1)) { // Skip header
      // Look for numbered lists, bullet points, or clear requirements
      const cleanLine = line.replace(/^\d+\.|^[•\-\*]|\s*$/, '').trim();
      
      if (cleanLine.length < 5) continue; // Skip very short lines
      
      for (const pattern of this.documentPatterns) {
        if (pattern.test(cleanLine)) {
          const requirement = this.createRequirementFromMatch(cleanLine);
          if (requirement) {
            requirements.push(requirement);
            break; // Avoid multiple matches for same line
          }
        }
      }
    }

    return requirements;
  }

  /**
   * Create requirement object from matched text
   */
  private createRequirementFromMatch(matchText: string): ExamRequirement | null {
    const text = matchText.toLowerCase().trim();
    
    // Map patterns to requirement types
    const typeMapping = [
      { pattern: /photograph|photo|passport.*photo/, id: 'photo', name: 'Photograph', type: 'document' },
      { pattern: /signature|sign/, id: 'signature', name: 'Signature', type: 'document' },
      { pattern: /thumb.*impression|fingerprint|left.*thumb/, id: 'left-thumb-impression', name: 'Left Thumb Impression', type: 'document' },
      { pattern: /declaration|handwritten.*declaration/, id: 'handwritten-declaration', name: 'Handwritten Declaration', type: 'document' },
      { pattern: /certificate|marksheet|degree|diploma|educational/, id: 'educational-certificate', name: 'Educational Certificate', type: 'document' },
      { pattern: /category.*certificate|caste.*certificate/, id: 'category-certificate', name: 'Category Certificate', type: 'document' },
      { pattern: /identity.*proof|id.*proof|aadhar/, id: 'identity-proof', name: 'Identity Proof', type: 'document' },
      { pattern: /address.*proof|residence.*proof/, id: 'address-proof', name: 'Address Proof', type: 'document' }
    ];

    for (const mapping of typeMapping) {
      if (mapping.pattern.test(text)) {
        return {
          id: mapping.id,
          name: mapping.name,
          type: mapping.type as 'document' | 'form-field' | 'media',
          required: true,
          description: this.cleanDescription(matchText),
          formats: this.extractFormats(matchText),
          constraints: this.extractConstraints(matchText)
        };
      }
    }

    return null;
  }

  /**
   * Find relevant links on the page (notifications, applications, etc.)
   */
  private async findRelevantLinks(page: any, examName: string): Promise<Array<{text: string, href: string}>> {
    return await page.evaluate((examName: string) => {
      const links = Array.from(document.links);
      const relevant = [];
      
      const relevantKeywords = [
        'notification', 'apply', 'application', 'form', 'recruitment',
        'eligibility', 'how to apply', 'documents', 'requirements'
      ];
      
      for (const link of links) {
        const text = link.textContent?.toLowerCase() || '';
        const href = link.href.toLowerCase();
        
        // Check if link text or URL contains relevant keywords
        const isRelevant = relevantKeywords.some(keyword => 
          text.includes(keyword) || href.includes(keyword)
        );
        
        // Also check if it mentions the exam name
        const mentionsExam = text.includes(examName.toLowerCase()) || 
                           href.includes(examName.toLowerCase().replace(/\s+/g, '-'));
        
        if ((isRelevant || mentionsExam) && link.href.startsWith('http')) {
          relevant.push({
            text: link.textContent?.trim() || '',
            href: link.href
          });
        }
      }
      
      return relevant.slice(0, 5); // Limit results
    }, examName);
  }

  /**
   * Calculate confidence for visual scraping
   */
  private calculateVisualConfidence(pageData: any, requirements: ExamRequirement[], relevantLinks: any[]): number {
    let confidence = 0.3; // Base confidence
    
    // Boost confidence based on various factors
    if (requirements.length > 0) confidence += 0.3;
    if (requirements.length >= 3) confidence += 0.2;
    if (relevantLinks.length > 0) confidence += 0.1;
    if (pageData.title.toLowerCase().includes('notification')) confidence += 0.1;
    if (pageData.textContent.includes('documents required')) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate confidence for DOM scraping
   */
  private calculateDOMConfidence(text: string, requirements: ExamRequirement[]): number {
    let confidence = 0.2; // Lower base for DOM scraping
    
    if (requirements.length > 0) confidence += 0.4;
    if (requirements.length >= 3) confidence += 0.2;
    if (text.toLowerCase().includes('documents required')) confidence += 0.2;
    
    return Math.min(confidence, 0.8); // DOM scraping max 80%
  }

  /**
   * Utility methods
   */
  private async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  private isNewSection(line: string): boolean {
    return /^(eligibility|age|qualification|fee|important|note|selection)/i.test(line);
  }

  private determineSourceType(url: string, content: string): 'official' | 'news' | 'forum' | 'guide' {
    if (url.includes('.gov.') || url.includes('.in') || content.includes('official')) {
      return 'official';
    }
    if (url.includes('news') || url.includes('times')) {
      return 'news';
    }
    if (url.includes('forum') || url.includes('discuss')) {
      return 'forum';
    }
    return 'guide';
  }

  private calculateReliability(url: string, data: any): number {
    let reliability = 0.5;
    
    if (url.includes('.gov.')) reliability += 0.4;
    if (url.includes('official')) reliability += 0.3;
    if (data.title?.includes('official')) reliability += 0.2;
    
    return Math.min(reliability, 1.0);
  }

  private hashContent(content: string): string {
    // Simple hash for content comparison
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private cleanDescription(text: string): string {
    return text.replace(/^\d+\.|^[•\-\*]/, '').trim();
  }

  private extractFormats(text: string): string[] {
    const formats = [];
    if (text.includes('jpg') || text.includes('jpeg')) formats.push('JPEG');
    if (text.includes('png')) formats.push('PNG');
    if (text.includes('pdf')) formats.push('PDF');
    return formats;
  }

  private extractConstraints(text: string): any {
    const constraints: any = {};
    
    // Extract size constraints
    const sizeMatch = text.match(/(\d+)\s*(kb|mb|kb|mb)/i);
    if (sizeMatch) {
      constraints.maxSize = sizeMatch[0];
    }
    
    // Extract dimension constraints
    const dimMatch = text.match(/(\d+)\s*x\s*(\d+)/i);
    if (dimMatch) {
      constraints.dimensions = dimMatch[0];
    }
    
    return Object.keys(constraints).length > 0 ? constraints : undefined;
  }

  private deduplicateRequirements(requirements: ExamRequirement[]): ExamRequirement[] {
    const seen = new Map<string, ExamRequirement>();
    
    requirements.forEach(req => {
      if (!seen.has(req.id)) {
        seen.set(req.id, req);
      }
    });
    
    return Array.from(seen.values());
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}