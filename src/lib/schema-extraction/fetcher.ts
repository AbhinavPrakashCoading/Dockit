/**
 * Content Fetcher Module
 * Handles fetching content from URLs using axios for static content
 * and puppeteer for dynamic/JavaScript-heavy pages
 */

import axios, { AxiosResponse } from 'axios';
import puppeteer, { Browser, Page } from 'puppeteer';
import { ExtractionResult, FetchOptions } from './types';
import { mockExamData } from './mock-data';

export class ContentFetcher {
  private browser?: Browser;
  
  constructor() {
    // Initialize browser lazily when needed
  }

  /**
   * Main entry point for fetching content from a URL
   */
  async fetchContent(url: string, options: FetchOptions = {}): Promise<ExtractionResult> {
    console.log(`🌐 Fetching content from: ${url}`);
    
    const {
      timeout = 30000,
      userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      enableJavascript = false,
      headers = {}
    } = options;

    // Check if we have mock data for this URL (for testing)
    if (url in mockExamData) {
      console.log('🎭 Using mock data for testing...');
      const mockData = mockExamData[url as keyof typeof mockExamData];
      return {
        rawText: mockData.content,
        contentType: 'html',
        source: url
      };
    }

    // First, try to determine if this is a PDF URL
    if (this.isPdfUrl(url)) {
      console.log('📄 Detected PDF URL, fetching as PDF...');
      return this.fetchPdf(url, { timeout, userAgent, headers });
    }

    // Try static fetch first (faster)
    if (!enableJavascript) {
      try {
        console.log('⚡ Attempting static fetch...');
        const result = await this.fetchStatic(url, { timeout, userAgent, headers });
        
        // Log content preview for debugging
        const preview = result.rawText.substring(0, 300).replace(/\s+/g, ' ');
        console.log(`📝 Static fetch preview: ${preview}...`);
        
        // If we get meaningful HTML content, return it
        if (result.rawText.length > 500 && result.rawText.includes('<')) {
          console.log(`✅ Static fetch successful - ${result.rawText.length} characters`);
          return result;
        }
      } catch (error) {
        console.log('❌ Static fetch failed, trying dynamic fetch...', error);
      }
    }

    // Fall back to dynamic fetch for JavaScript-heavy sites
    console.log('🎭 Using dynamic fetch with Puppeteer...');
    return this.fetchDynamic(url, options);
  }

  /**
   * Fetch static content using axios
   */
  private async fetchStatic(url: string, options: { timeout: number; userAgent: string; headers: Record<string, string> }): Promise<ExtractionResult> {
    const response: AxiosResponse = await axios.get(url, {
      timeout: options.timeout,
      headers: {
        'User-Agent': options.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers
      },
      responseType: 'arraybuffer'
    });

    const contentType = response.headers['content-type'] || '';
    
    if (contentType.includes('application/pdf')) {
      return {
        rawText: Buffer.from(response.data).toString('base64'),
        contentType: 'pdf',
        source: url
      };
    }

    const htmlContent = Buffer.from(response.data).toString('utf-8');
    
    return {
      rawText: htmlContent,
      contentType: 'html',
      source: url
    };
  }

  /**
   * Fetch dynamic content using puppeteer
   */
  private async fetchDynamic(url: string, options: FetchOptions = {}): Promise<ExtractionResult> {
    const {
      timeout = 30000,
      userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      waitForSelector
    } = options;

    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }

    const page: Page = await this.browser.newPage();
    
    try {
      await page.setUserAgent(userAgent);
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set longer timeout for navigation
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout 
      });

      // Wait for specific selector if provided
      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout: 10000 });
      }

      // Wait a bit more for dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      const htmlContent = await page.content();
      
      return {
        rawText: htmlContent,
        contentType: 'html',
        source: url
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Fetch PDF content directly
   */
  private async fetchPdf(url: string, options: { timeout: number; userAgent: string; headers: Record<string, string> }): Promise<ExtractionResult> {
    const response: AxiosResponse = await axios.get(url, {
      timeout: options.timeout,
      headers: {
        'User-Agent': options.userAgent,
        ...options.headers
      },
      responseType: 'arraybuffer'
    });

    return {
      rawText: Buffer.from(response.data).toString('base64'),
      contentType: 'pdf',
      source: url
    };
  }

  /**
   * Check if URL likely points to a PDF
   */
  private isPdfUrl(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.pdf') || 
           lowerUrl.includes('.pdf?') ||
           lowerUrl.includes('application/pdf');
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }
}

export const contentFetcher = new ContentFetcher();