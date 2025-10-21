// Search Layer Module - Programmatically search the web for exam-related content

import axios from 'axios';
import { load } from 'cheerio';
import type { SearchResult, SearchQuery, ExtractionEngineOptions } from './types';
import { 
  SEARCH_KEYWORDS, 
  SEARCH_DOMAINS, 
  USER_AGENTS, 
  TIMEOUT_CONFIG 
} from './constants';

export class SearchLayer {
  private userAgent: string;
  private timeout: number;

  constructor(options?: ExtractionEngineOptions) {
    this.userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    this.timeout = options?.timeout || TIMEOUT_CONFIG.SEARCH_TIMEOUT;
  }

  /**
   * Generate search queries for a given exam name
   */
  generateSearchQueries(examName: string): SearchQuery[] {
    const baseExamName = this.normalizeExamName(examName);
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const queries: SearchQuery[] = [
      // Official notification searches
      {
        examName: baseExamName,
        searchTerms: [
          `${baseExamName} ${currentYear} official notification`,
          `${baseExamName} ${nextYear} recruitment notice`,
          `${baseExamName} apply online instructions`,
          `${baseExamName} application form document requirements`
        ],
        fileTypes: ['pdf', 'html'],
        domains: Object.values(SEARCH_DOMAINS).flat()
      },
      // Document upload specific searches
      {
        examName: baseExamName,
        searchTerms: [
          `${baseExamName} photo upload requirements`,
          `${baseExamName} signature dimensions`,
          `${baseExamName} document specifications`,
          `${baseExamName} instructions to candidates`
        ],
        fileTypes: ['pdf'],
        domains: Object.values(SEARCH_DOMAINS).flat()
      }
    ];

    return queries;
  }

  /**
   * Search for exam-related content using multiple strategies
   */
  async searchExamContent(examName: string, options?: ExtractionEngineOptions): Promise<SearchResult[]> {
    const queries = this.generateSearchQueries(examName);
    const results: SearchResult[] = [];

    for (const query of queries) {
      try {
        // Strategy 1: Direct official website search
        const officialResults = await this.searchOfficialWebsites(query);
        results.push(...officialResults);

        // Strategy 2: Google search simulation (using DuckDuckGo API alternative)
        const searchResults = await this.performWebSearch(query);
        results.push(...searchResults);

        // Strategy 3: Specific domain searches
        const domainResults = await this.searchSpecificDomains(query);
        results.push(...domainResults);

      } catch (error) {
        console.error(`Search failed for query: ${query.examName}`, error);
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = this.deduplicateResults(results);
    return this.rankResults(uniqueResults, examName);
  }

  /**
   * Search official government and examination websites
   */
  private async searchOfficialWebsites(query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const domain of query.domains || []) {
      try {
        const searchUrl = `https://${domain}`;
        const response = await axios.get(searchUrl, {
          timeout: this.timeout,
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
          }
        });

        const $ = load(response.data);
        
        // Look for relevant links
        const links = this.extractRelevantLinks($, query, domain);
        results.push(...links);

      } catch (error) {
        console.log(`Failed to search ${domain}:`, error);
      }
    }

    return results;
  }

  /**
   * Perform web search using publicly available search APIs
   */
  private async performWebSearch(query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    try {
      // Using a simple web scraping approach for search results
      // In production, you might want to use official search APIs
      for (const searchTerm of query.searchTerms) {
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchTerm)}`;
        
        const response = await axios.get(searchUrl, {
          timeout: this.timeout,
          headers: {
            'User-Agent': this.userAgent
          }
        });

        const $ = load(response.data);
        
        // Extract search results
        $('.result').each((_, element) => {
          const titleEl = $(element).find('.result__title a');
          const snippetEl = $(element).find('.result__snippet');
          const urlEl = $(element).find('.result__url');

          const title = titleEl.text().trim();
          const url = titleEl.attr('href') || '';
          const snippet = snippetEl.text().trim();

          if (url && this.isRelevantUrl(url, query)) {
            results.push({
              url: this.normalizeUrl(url),
              title,
              content: snippet,
              type: url.toLowerCase().includes('.pdf') ? 'pdf' : 'html',
              relevanceScore: this.calculateRelevanceScore(title + ' ' + snippet, query)
            });
          }
        });
      }
    } catch (error) {
      console.error('Web search failed:', error);
    }

    return results;
  }

  /**
   * Search specific domains for exam content
   */
  private async searchSpecificDomains(query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const examKeywords = query.examName.toLowerCase().split(/[-\s]+/);

    for (const domain of query.domains || []) {
      try {
        // Try to find exam-specific pages on the domain
        const possiblePaths = [
          '/notifications',
          '/recruitment',
          '/apply-online',
          '/instructions',
          '/download',
          '/forms'
        ];

        for (const path of possiblePaths) {
          try {
            const url = `https://${domain}${path}`;
            const response = await axios.get(url, {
              timeout: this.timeout / 2, // Shorter timeout for exploratory requests
              headers: { 'User-Agent': this.userAgent }
            });

            const $ = load(response.data);
            const links = this.extractRelevantLinks($, query, domain);
            results.push(...links);

          } catch (error) {
            // Ignore 404s and continue
            continue;
          }
        }
      } catch (error) {
        console.log(`Domain search failed for ${domain}:`, error);
      }
    }

    return results;
  }

  /**
   * Extract relevant links from a webpage
   */
  private extractRelevantLinks($: any, query: SearchQuery, baseDomain: string): SearchResult[] {
    const results: SearchResult[] = [];
    const examKeywords = query.examName.toLowerCase().split(/[-\s]+/);

    $('a[href]').each((_: any, element: any) => {
      const link = $(element);
      const href = link.attr('href');
      const text = link.text().trim();
      const title = link.attr('title') || text;

      if (!href) return;

      const fullUrl = this.resolveUrl(href, baseDomain);
      if (!this.isRelevantUrl(fullUrl, query)) return;

      const content = text + ' ' + (link.parent().text() || '');
      const relevanceScore = this.calculateRelevanceScore(content, query);

      if (relevanceScore > 0.3) { // Minimum relevance threshold
        results.push({
          url: fullUrl,
          title,
          content,
          type: href.toLowerCase().includes('.pdf') ? 'pdf' : 'html',
          relevanceScore
        });
      }
    });

    return results;
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(text: string, query: SearchQuery): number {
    const lowerText = text.toLowerCase();
    const examKeywords = query.examName.toLowerCase().split(/[-\s]+/);
    let score = 0;

    // Check for exam name keywords
    for (const keyword of examKeywords) {
      if (lowerText.includes(keyword)) {
        score += 0.3;
      }
    }

    // Check for official keywords
    for (const keyword of SEARCH_KEYWORDS.OFFICIAL) {
      if (lowerText.includes(keyword)) {
        score += 0.2;
      }
    }

    // Check for application keywords
    for (const keyword of SEARCH_KEYWORDS.APPLICATION) {
      if (lowerText.includes(keyword)) {
        score += 0.25;
      }
    }

    // Check for document upload keywords
    for (const keyword of SEARCH_KEYWORDS.DOCUMENT_UPLOAD) {
      if (lowerText.includes(keyword)) {
        score += 0.15;
      }
    }

    // Check for requirements keywords
    for (const keyword of SEARCH_KEYWORDS.REQUIREMENTS) {
      if (lowerText.includes(keyword)) {
        score += 0.1;
      }
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Check if URL is relevant for exam search
   */
  private isRelevantUrl(url: string, query: SearchQuery): boolean {
    const lowerUrl = url.toLowerCase();
    const examKeywords = query.examName.toLowerCase().split(/[-\s]+/);

    // Check if URL contains exam keywords
    const hasExamKeywords = examKeywords.some(keyword => lowerUrl.includes(keyword));
    
    // Check for relevant file types
    const hasRelevantFileType = query.fileTypes?.some(type => lowerUrl.includes(`.${type}`)) || 
                               lowerUrl.includes('.pdf') || 
                               !lowerUrl.includes('.');

    // Check for relevant URL patterns
    const hasRelevantPattern = [
      'notification', 'recruitment', 'apply', 'form', 'instruction',
      'document', 'upload', 'requirement', 'specification'
    ].some(pattern => lowerUrl.includes(pattern));

    return (hasExamKeywords || hasRelevantPattern) && hasRelevantFileType;
  }

  /**
   * Normalize exam name for search
   */
  private normalizeExamName(examName: string): string {
    return examName
      .toLowerCase()
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Resolve relative URLs to absolute URLs
   */
  private resolveUrl(href: string, baseDomain: string): string {
    if (href.startsWith('http')) {
      return href;
    }
    if (href.startsWith('//')) {
      return `https:${href}`;
    }
    if (href.startsWith('/')) {
      return `https://${baseDomain}${href}`;
    }
    return `https://${baseDomain}/${href}`;
  }

  /**
   * Normalize URL format
   */
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.href;
    } catch {
      return url;
    }
  }

  /**
   * Remove duplicate search results
   */
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const key = result.url.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Rank and sort results by relevance
   */
  private rankResults(results: SearchResult[], examName: string): SearchResult[] {
    return results
      .sort((a, b) => {
        // Prefer PDFs
        if (a.type === 'pdf' && b.type !== 'pdf') return -1;
        if (b.type === 'pdf' && a.type !== 'pdf') return 1;
        
        // Then sort by relevance score
        return b.relevanceScore - a.relevanceScore;
      })
      .slice(0, 10); // Limit to top 10 results
  }
}