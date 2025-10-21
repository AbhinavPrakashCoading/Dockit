/**
 * Scalable Schema Discovery Manager
 * Multi-layered approach for discovering exam requirements from any source
 */

import { VisualWebScraper } from './layers/VisualWebScraper';
import { SearchEngineLayer } from './layers/SearchEngineLayer';
import { KnowledgeBaseLayer } from './layers/KnowledgeBaseLayer';
import { MLInferenceLayer } from './layers/MLInferenceLayer';
import { ValidationLayer } from './layers/ValidationLayer';
import { CacheManager } from './cache/CacheManager';
import { ConfidenceScorer } from './scoring/ConfidenceScorer';

interface DiscoveryRequest {
  examName: string;
  query: string;
  context?: {
    year?: string;
    region?: string;
    level?: string;
  };
  fallbackLevels?: ('cache' | 'knowledge' | 'search' | 'scrape' | 'ml')[];
}

interface DiscoveryResult {
  examId: string;
  examName: string;
  requirements: ExamRequirement[];
  sources: SourceInfo[];
  confidence: number;
  validationScore: number;
  discoveryPath: string[];
  metadata: {
    discoveredAt: string;
    discoveryMethod: string;
    reliability: number;
    needsVerification: boolean;
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
  validationRules?: string[];
}

interface SourceInfo {
  url: string;
  title: string;
  type: 'official' | 'news' | 'forum' | 'guide';
  reliability: number;
  lastAccessed: string;
  contentHash: string;
}

export class DiscoveryManager {
  private visualScraper: VisualWebScraper;
  private searchEngine: SearchEngineLayer;
  private knowledgeBase: KnowledgeBaseLayer;
  private mlInference: MLInferenceLayer;
  private validator: ValidationLayer;
  private cache: CacheManager;
  private scorer: ConfidenceScorer;

  constructor() {
    this.visualScraper = new VisualWebScraper();
    this.searchEngine = new SearchEngineLayer();
    this.knowledgeBase = new KnowledgeBaseLayer();
    this.mlInference = new MLInferenceLayer();
    this.validator = new ValidationLayer();
    this.cache = new CacheManager();
    this.scorer = new ConfidenceScorer();
  }

  /**
   * Main discovery method - attempts multiple layers with fallbacks
   */
  async discover(request: DiscoveryRequest): Promise<DiscoveryResult> {
    console.log(`🔍 Starting discovery for: ${request.examName}`);
    
    const fallbackLevels = request.fallbackLevels || [
      'cache',
      'knowledge', 
      'search',
      'scrape',
      'ml'
    ];

    let result: DiscoveryResult | null = null;
    const discoveryPath: string[] = [];
    const allSources: SourceInfo[] = [];

    // Try each layer in sequence until we get a confident result
    for (const level of fallbackLevels) {
      try {
        console.log(`🔄 Trying ${level} layer...`);
        discoveryPath.push(level);

        switch (level) {
          case 'cache':
            result = await this.tryCache(request);
            break;
          case 'knowledge':
            result = await this.tryKnowledgeBase(request);
            break;
          case 'search':
            result = await this.trySearchEngine(request);
            break;
          case 'scrape':
            result = await this.tryVisualScraping(request);
            break;
          case 'ml':
            result = await this.tryMLInference(request, allSources);
            break;
        }

        if (result) {
          allSources.push(...result.sources);
          
          // Check if confidence is high enough to stop
          if (result.confidence >= 0.8) {
            console.log(`✅ High confidence result from ${level} layer`);
            break;
          }
          
          // Continue to next layer for better results
          console.log(`⚠️ Low confidence (${result.confidence}) from ${level}, trying next layer...`);
        }
      } catch (error) {
        console.log(`❌ ${level} layer failed:`, error.message);
        // Continue to next fallback
      }
    }

    if (!result) {
      throw new Error(`Failed to discover requirements for ${request.examName} using all available methods`);
    }

    // Enhance result with discovery metadata
    result.discoveryPath = discoveryPath;
    result.sources = allSources;
    
    // Validate and score the final result
    const validationScore = await this.validator.validate(result);
    result.validationScore = validationScore;
    
    // Cache the result for future use
    await this.cache.store(request.examName, result);
    
    console.log(`🎯 Discovery complete! Confidence: ${result.confidence}, Validation: ${validationScore}`);
    return result;
  }

  /**
   * Layer 1: Check cache for previously discovered schemas
   */
  private async tryCache(request: DiscoveryRequest): Promise<DiscoveryResult | null> {
    const cached = await this.cache.get(request.examName);
    if (cached && !this.cache.isExpired(cached)) {
      console.log('📦 Found valid cached result');
      return cached;
    }
    return null;
  }

  /**
   * Layer 2: Check knowledge base for known patterns
   */
  private async tryKnowledgeBase(request: DiscoveryRequest): Promise<DiscoveryResult | null> {
    return await this.knowledgeBase.findExam(request);
  }

  /**
   * Layer 3: Use search engines to find official information
   */
  private async trySearchEngine(request: DiscoveryRequest): Promise<DiscoveryResult | null> {
    console.log('🔍 Searching for official sources...');
    
    const searchQueries = this.generateSearchQueries(request);
    const searchResults = await this.searchEngine.multiSearch(searchQueries);
    
    if (searchResults.length === 0) {
      return null;
    }

    // Process search results to extract requirements
    const requirements = await this.extractRequirementsFromSources(searchResults);
    const confidence = this.scorer.calculateSearchConfidence(searchResults, requirements);

    return {
      examId: this.generateExamId(request.examName),
      examName: request.examName,
      requirements,
      sources: searchResults,
      confidence,
      validationScore: 0,
      discoveryPath: [],
      metadata: {
        discoveredAt: new Date().toISOString(),
        discoveryMethod: 'search-engine',
        reliability: this.calculateReliability(searchResults),
        needsVerification: confidence < 0.9
      }
    };
  }

  /**
   * Layer 4: Visual web scraping of official websites
   */
  private async tryVisualScraping(request: DiscoveryRequest): Promise<DiscoveryResult | null> {
    console.log('🕷️ Starting visual web scraping...');
    
    // First, find official websites
    const officialSites = await this.searchEngine.findOfficialWebsites(request.examName);
    
    if (officialSites.length === 0) {
      console.log('No official websites found for scraping');
      return null;
    }

    const scrapingResults = [];
    
    for (const site of officialSites.slice(0, 3)) { // Limit to top 3 sites
      try {
        const scraped = await this.visualScraper.scrapeExamRequirements(site.url, {
          examName: request.examName,
          targetElements: ['form', 'requirements', 'documents', 'application'],
          timeout: 30000
        });
        
        if (scraped.requirements.length > 0) {
          scrapingResults.push(scraped);
        }
      } catch (error) {
        console.log(`Failed to scrape ${site.url}:`, error.message);
      }
    }

    if (scrapingResults.length === 0) {
      return null;
    }

    // Merge and validate scraped requirements
    const mergedRequirements = this.mergeRequirements(scrapingResults);
    const confidence = this.scorer.calculateScrapingConfidence(scrapingResults);

    return {
      examId: this.generateExamId(request.examName),
      examName: request.examName,
      requirements: mergedRequirements,
      sources: scrapingResults.map(s => s.source),
      confidence,
      validationScore: 0,
      discoveryPath: [],
      metadata: {
        discoveredAt: new Date().toISOString(),
        discoveryMethod: 'visual-scraping',
        reliability: this.calculateReliability(scrapingResults.map(s => s.source)),
        needsVerification: confidence < 0.85
      }
    };
  }

  /**
   * Layer 5: ML inference based on similar exams and patterns
   */
  private async tryMLInference(request: DiscoveryRequest, sources: SourceInfo[]): Promise<DiscoveryResult | null> {
    console.log('🧠 Using ML inference for requirement prediction...');
    
    return await this.mlInference.predictRequirements(request, sources);
  }

  /**
   * Generate intelligent search queries for an exam
   */
  private generateSearchQueries(request: DiscoveryRequest): string[] {
    const baseQueries = [
      `${request.examName} application form requirements`,
      `${request.examName} documents needed`,
      `${request.examName} eligibility criteria`,
      `how to apply ${request.examName}`,
      `${request.examName} official notification`
    ];

    if (request.context?.year) {
      baseQueries.push(`${request.examName} ${request.context.year} notification`);
    }

    return baseQueries;
  }

  /**
   * Extract requirements from various source types
   */
  private async extractRequirementsFromSources(sources: SourceInfo[]): Promise<ExamRequirement[]> {
    const allRequirements: ExamRequirement[] = [];
    
    for (const source of sources) {
      try {
        const extracted = await this.mlInference.extractRequirementsFromText(source.url);
        allRequirements.push(...extracted);
      } catch (error) {
        console.log(`Failed to extract from ${source.url}:`, error.message);
      }
    }

    // Deduplicate and merge similar requirements
    return this.deduplicateRequirements(allRequirements);
  }

  /**
   * Merge requirements from multiple scraping results
   */
  private mergeRequirements(scrapingResults: any[]): ExamRequirement[] {
    const allRequirements: ExamRequirement[] = [];
    
    scrapingResults.forEach(result => {
      allRequirements.push(...result.requirements);
    });

    return this.deduplicateRequirements(allRequirements);
  }

  /**
   * Remove duplicate requirements and merge similar ones
   */
  private deduplicateRequirements(requirements: ExamRequirement[]): ExamRequirement[] {
    const seen = new Map<string, ExamRequirement>();
    
    requirements.forEach(req => {
      const key = req.id.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, req);
      } else {
        // Merge with existing requirement
        const existing = seen.get(key)!;
        existing.description = existing.description || req.description;
        existing.formats = [...(existing.formats || []), ...(req.formats || [])];
      }
    });

    return Array.from(seen.values());
  }

  /**
   * Calculate reliability score based on source types
   */
  private calculateReliability(sources: SourceInfo[]): number {
    if (sources.length === 0) return 0;
    
    const weights = {
      'official': 1.0,
      'news': 0.7,
      'guide': 0.6,
      'forum': 0.4
    };

    const totalWeight = sources.reduce((sum, source) => 
      sum + (weights[source.type] || 0.3), 0
    );

    return Math.min(totalWeight / sources.length, 1.0);
  }

  /**
   * Generate consistent exam ID
   */
  private generateExamId(examName: string): string {
    return examName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}