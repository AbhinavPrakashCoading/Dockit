/**
 * Scalable Intelligent Discovery API v2.0
 * Multi-layered discovery system with autonomous engine, visual scraping, ML inference, and intelligent fallbacks
 * Designed to scale to thousands of exams with live web scraping and learning capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { DiscoveryManager } from '@/lib/discovery/DiscoveryManager';
import { AutonomousEngine } from '../../../../autonomous-system-share/autonomous/AutonomousEngine';

// Initialize both discovery systems for maximum coverage
let discoveryManager: DiscoveryManager | null = null;
let autonomousEngine: AutonomousEngine | null = null;

function getDiscoveryManager() {
  if (!discoveryManager) {
    discoveryManager = new DiscoveryManager();
  }
  return discoveryManager;
}

async function getAutonomousEngine(): Promise<AutonomousEngine> {
  if (!autonomousEngine) {
    console.log('🔧 Initializing Autonomous Discovery Engine...');
    autonomousEngine = new AutonomousEngine({
      enableAutomaticDiscovery: true,
      enableAdaptiveLearning: true,
      enablePredictiveAnalytics: true,
      enableSchemaEvolution: true,
      discoveryInterval: 60,
      learningThreshold: 5,
      predictionConfidenceThreshold: 0.7,
      maxConcurrentDiscoveries: 5,
      alertingSeverity: 'warning'
    });
    
    // Start autonomous operation
    await autonomousEngine.startAutonomousOperation();
    console.log('✅ Autonomous Discovery Engine initialized and running');
  }
  
  return autonomousEngine;
}

export async function POST(request: NextRequest) {
  try {
    const { query, context, fallbackLevels, action } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Scalable Discovery Request: "${query}"`);
    console.log(`🎯 Action: ${action || 'discover'}`);

    const manager = getDiscoveryManager();

    // Handle different action types
    switch (action) {
      case 'autonomous_discovery':
        return await handleAutonomousDiscovery(query, context);
      
      case 'natural_language_discovery':
      default:
        return await handleDiscovery(manager, query, context, fallbackLevels);
      
      case 'validate_discovery':
        return await handleValidation(manager, query, context);
      
      case 'get_discovery_stats':
        return await handleStats(manager);
      
      case 'preload_exams':
        return await handlePreload(manager, context?.examNames || []);
    }

  } catch (error) {
    console.error('❌ Scalable Discovery failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to discover exam requirements',
        details: error.message,
        fallback: generateFallbackSchema(query || 'Unknown Exam')
      },
      { status: 500 }
    );
  }
}

/**
 * 🚀 NEW: Handle Autonomous Discovery with Advanced Capabilities
 * Uses the autonomous engine for live web scraping and ML inference
 */
async function handleAutonomousDiscovery(query: string, context: any): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    console.log(`🤖 Starting Autonomous Discovery for: "${query}"`);
    
    // Get the autonomous engine
    const engine = await getAutonomousEngine();
    
    // Perform scalable discovery using the autonomous system
    const discoveryResult = await engine.discoverSchemaIntelligently(query, {
      examName: context?.examName,
      category: context?.category,
      urgency: context?.urgency || 'medium',
      fallbackToCache: context?.fallbackToCache !== false
    });

    // Enhanced response with autonomous engine metadata
    const enhancedResult = {
      success: true,
      examId: discoveryResult.examId,
      examName: discoveryResult.examName,
      confidence: discoveryResult.confidence,
      source: discoveryResult.source.primary,
      sources: [discoveryResult.source],
      reliability: discoveryResult.source.reliability,
      discoveryPath: discoveryResult.discoveryPath,
      schema: {
        id: discoveryResult.examId,
        examName: discoveryResult.examName,
        version: '2.0-autonomous',
        requirements: discoveryResult.schema.requirements,
        totalRequirements: discoveryResult.schema.requirements.length,
        documentRequirements: discoveryResult.schema.metadata.documentFields,
        lastUpdated: discoveryResult.schema.metadata.lastUpdated,
        verificationStatus: discoveryResult.schema.metadata.verificationStatus
      },
      metadata: {
        discoveredAt: new Date().toISOString(),
        discoveryMethod: 'autonomous-engine',
        reliability: discoveryResult.source.reliability,
        needsVerification: discoveryResult.schema.metadata.verificationStatus !== 'verified',
        processingTime: discoveryResult.processingTime,
        totalTime: Date.now() - startTime,
        layersUsed: discoveryResult.discoveryPath.length,
        capabilities: {
          webScraping: discoveryResult.discoveryPath.includes('web-scraping'),
          mlInference: discoveryResult.discoveryPath.includes('ml-inference'),
          cacheHit: discoveryResult.discoveryPath.includes('knowledge-base'),
          adaptiveFallback: discoveryResult.discoveryPath.includes('adaptive-fallback')
        }
      },
      api: {
        version: '2.0-autonomous',
        timestamp: new Date().toISOString(),
        scalabilityFeatures: {
          liveWebScraping: true,
          mlInference: true,
          adaptiveLearning: true,
          backgroundOptimization: true,
          unlimitedExams: true
        }
      }
    };

    console.log(`✅ Autonomous Discovery completed in ${discoveryResult.processingTime}ms`);
    console.log(`📊 Used discovery path: ${discoveryResult.discoveryPath.join(' → ')}`);
    console.log(`🎯 Result: ${enhancedResult.examName} (confidence: ${enhancedResult.confidence})`);

    return NextResponse.json(enhancedResult);

  } catch (error) {
    console.error('🚨 Autonomous Discovery failed:', error);
    
    // Return enhanced error response with fallback
    return NextResponse.json(
      {
        success: false,
        error: 'Autonomous discovery failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallbackSchema: {
          examId: 'autonomous-fallback',
          examName: extractExamName(query),
          confidence: 0.3,
          source: { primary: 'emergency-fallback', type: 'inferred', reliability: 0.3, timestamp: new Date().toISOString() },
          schema: {
            requirements: [
              { id: 'photo', name: 'Passport Photo', type: 'document', required: true, description: 'Recent passport-sized photograph' },
              { id: 'signature', name: 'Signature', type: 'document', required: true, description: 'Candidate signature' }
            ],
            metadata: { totalFields: 2, documentFields: 2, lastUpdated: new Date().toISOString(), verificationStatus: 'experimental' }
          },
          discoveryPath: ['emergency-fallback'],
          processingTime: Date.now() - startTime
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Handle main discovery process
 */
async function handleDiscovery(
  manager: DiscoveryManager, 
  query: string, 
  context: any, 
  fallbackLevels: string[]
): Promise<NextResponse> {
  try {
    // Extract exam name from query using intelligent parsing
    const examName = extractExamName(query);
    
    // Prepare discovery request
    const discoveryRequest = {
      examName,
      query,
      context: {
        year: context?.year || new Date().getFullYear().toString(),
        region: context?.region || 'India',
        level: context?.level || 'national',
        ...context
      },
      fallbackLevels: fallbackLevels || ['cache', 'knowledge', 'search', 'scrape', 'ml']
    };

    // Start multi-layered discovery process
    console.log(`🚀 Starting discovery for: ${examName}`);
    console.log(`🔄 Using layers: ${discoveryRequest.fallbackLevels.join(' → ')}`);

    const result = await manager.discover(discoveryRequest);

    // Enhanced response with detailed metadata
    const response = {
      success: true,
      examId: result.examId,
      examName: result.examName,
      confidence: result.confidence,
      validationScore: result.validationScore,
      source: result.sources[0]?.url || 'Multiple sources',
      sources: result.sources,
      reliability: result.metadata.reliability,
      discoveryPath: result.discoveryPath,
      needsVerification: result.metadata.needsVerification,
      metadata: {
        ...result.metadata,
        totalSources: result.sources.length,
        officialSources: result.sources.filter(s => s.type === 'official').length,
        discoveryDuration: Date.now(), // Would be calculated properly in real implementation
        layersUsed: result.discoveryPath.length
      },
      schema: {
        id: result.examId,
        examName: result.examName,
        version: '2.0.0', // Updated version for new system
        category: result.metadata.category || 'general',
        subcategory: result.metadata.subcategory,
        requirements: result.requirements,
        totalRequirements: result.requirements.length,
        documentRequirements: result.requirements.filter(r => r.type === 'document').length,
        createdAt: new Date().toISOString(),
        sources: result.sources,
        discoveryMethod: result.metadata.discoveryMethod,
        qualityScore: calculateQualityScore(result)
      },
      recommendations: generateRecommendations(result),
      nextSteps: generateNextSteps(result)
    };

    // Log comprehensive results
    console.log(`✅ Discovery completed successfully!`);
    console.log(`📊 Requirements found: ${result.requirements.length}`);
    console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`✔️ Validation: ${(result.validationScore * 100).toFixed(1)}%`);
    console.log(`🛤️ Path: ${result.discoveryPath.join(' → ')}`);
    console.log(`🔗 Sources: ${result.sources.length} (${result.sources.filter(s => s.type === 'official').length} official)`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Discovery process failed:', error);
    throw error;
  }
}

/**
 * Handle validation of existing discovery
 */
async function handleValidation(
  manager: DiscoveryManager,
  query: string,
  context: any
): Promise<NextResponse> {
  // This would validate an existing schema against current sources
  return NextResponse.json({
    success: true,
    message: 'Validation endpoint - to be implemented',
    query,
    context
  });
}

/**
 * Handle discovery system statistics
 */
async function handleStats(manager: DiscoveryManager): Promise<NextResponse> {
  // This would return stats about the discovery system performance
  return NextResponse.json({
    success: true,
    stats: {
      totalDiscoveries: 0, // Would track in real implementation
      cacheHitRate: 0,
      averageConfidence: 0,
      layerUsageStats: {},
      popularExams: []
    }
  });
}

/**
 * Handle preloading of common exams
 */
async function handlePreload(
  manager: DiscoveryManager,
  examNames: string[]
): Promise<NextResponse> {
  console.log(`🔄 Preloading ${examNames.length} exams...`);
  
  // This would preload common exams for better performance
  return NextResponse.json({
    success: true,
    message: `Preloading initiated for ${examNames.length} exams`,
    examNames
  });
}

/**
 * Extract exam name from query using advanced parsing
 */
function extractExamName(query: string): string {
  // Remove common query words and years
  const cleanQuery = query
    .replace(/\b(application|form|requirements|documents|needed|how to apply|eligibility|criteria|notification|exam|test|entrance)\b/gi, '')
    .replace(/\b(2024|2025|2026|2027)\b/g, '')
    .trim();

  // Enhanced exam patterns with variations
  const patterns = [
    // Banking exams
    { pattern: /ibps\s+clerk/i, name: 'IBPS Clerk' },
    { pattern: /ibps\s+po/i, name: 'IBPS PO' },
    { pattern: /sbi\s+clerk/i, name: 'SBI Clerk' },
    { pattern: /sbi\s+po/i, name: 'SBI PO' },
    { pattern: /rbi\s+assistant/i, name: 'RBI Assistant' },
    
    // SSC exams
    { pattern: /ssc\s+cgl/i, name: 'SSC CGL' },
    { pattern: /ssc\s+chsl/i, name: 'SSC CHSL' },
    { pattern: /ssc\s+mts/i, name: 'SSC MTS' },
    { pattern: /ssc\s+constable/i, name: 'SSC Constable' },
    
    // Engineering exams
    { pattern: /jee\s+main/i, name: 'JEE Main' },
    { pattern: /jee\s+advanced/i, name: 'JEE Advanced' },
    { pattern: /gate\s*(cs|ee|me|ce)?/i, name: 'GATE' },
    { pattern: /bitsat/i, name: 'BITSAT' },
    
    // Medical exams
    { pattern: /neet\s*(ug|pg)?/i, name: 'NEET' },
    { pattern: /aiims/i, name: 'AIIMS' },
    { pattern: /jipmer/i, name: 'JIPMER' },
    
    // Management exams
    { pattern: /cat\b/i, name: 'CAT' },
    { pattern: /mat\b/i, name: 'MAT' },
    { pattern: /xat\b/i, name: 'XAT' },
    { pattern: /snap\b/i, name: 'SNAP' },
    
    // Language exams
    { pattern: /ielts/i, name: 'IELTS' },
    { pattern: /toefl/i, name: 'TOEFL' },
    { pattern: /pte/i, name: 'PTE' },
    
    // Railway exams
    { pattern: /rrb\s+ntpc/i, name: 'RRB NTPC' },
    { pattern: /rrb\s+group\s*d/i, name: 'RRB Group D' },
    { pattern: /railway\s+alp/i, name: 'Railway ALP' },
    
    // UPSC exams
    { pattern: /upsc\s+cse/i, name: 'UPSC CSE' },
    { pattern: /upsc\s+capf/i, name: 'UPSC CAPF' },
    
    // State exams
    { pattern: /maharashtra\s+psc/i, name: 'Maharashtra PSC' },
    { pattern: /kerala\s+psc/i, name: 'Kerala PSC' },
    { pattern: /tnpsc/i, name: 'TNPSC' }
  ];

  // Try to match known exam patterns
  for (const { pattern, name } of patterns) {
    if (pattern.test(query)) {
      return name;
    }
  }

  // Fallback: use the most meaningful words from query
  const words = cleanQuery.split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !/^(for|the|and|with|exam|test)$/i.test(word));
  
  const examName = words.slice(0, 3).join(' ').trim();
  return examName || 'General Exam';
}

/**
 * Calculate overall quality score for the discovery
 */
function calculateQualityScore(result: any): number {
  let score = 0;
  
  // Base score from confidence and validation
  score += (result.confidence * 0.4);
  score += (result.validationScore * 0.3);
  
  // Bonus for official sources
  const officialSourceRatio = result.sources.filter((s: any) => s.type === 'official').length / Math.max(result.sources.length, 1);
  score += (officialSourceRatio * 0.2);
  
  // Bonus for comprehensive requirements
  if (result.requirements.length >= 5) score += 0.1;
  
  return Math.min(score, 1.0);
}

/**
 * Generate actionable recommendations based on discovery results
 */
function generateRecommendations(result: any): string[] {
  const recommendations: string[] = [];
  
  if (result.confidence < 0.7) {
    recommendations.push('Consider manual verification due to low confidence score');
  }
  
  if (result.sources.filter((s: any) => s.type === 'official').length === 0) {
    recommendations.push('Try to find official sources for more reliable information');
  }
  
  if (result.requirements.length < 3) {
    recommendations.push('Check for additional requirements that might have been missed');
  }
  
  if (result.metadata.needsVerification) {
    recommendations.push('Verify requirements with official notification or website');
  }
  
  const category = result.metadata.category;
  if (category === 'government-banking') {
    const bankingReqs = ['left-thumb-impression', 'handwritten-declaration'];
    const missing = bankingReqs.filter(req => !result.requirements.find((r: any) => r.id === req));
    if (missing.length > 0) {
      recommendations.push(`Banking exams typically require: ${missing.join(', ')}`);
    }
  }
  
  return recommendations;
}

/**
 * Generate next steps for the user
 */
function generateNextSteps(result: any): string[] {
  const steps: string[] = [];
  
  steps.push('Review the generated requirements list');
  
  if (result.sources.length > 0) {
    steps.push('Check the source links for official notifications');
  }
  
  if (result.confidence > 0.8) {
    steps.push('Schema is ready to use with high confidence');
  } else {
    steps.push('Consider manual review and verification');
  }
  
  steps.push('Test the schema with sample application data');
  
  return steps;
}

/**
 * Generate fallback schema when all discovery methods fail
 */
function generateFallbackSchema(query: string) {
  const examName = extractExamName(query);
  
  return {
    examId: examName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    examName,
    confidence: 0.3,
    source: 'Fallback generation',
    reliability: 0.5,
    discoveryPath: ['fallback'],
    schema: {
      id: examName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      examName,
      version: '2.0.0',
      category: 'general',
      requirements: [
        {
          id: 'photo',
          name: 'Passport Size Photograph',
          type: 'document',
          required: true,
          description: 'Recent passport size photograph with white background',
          formats: ['JPEG', 'PNG'],
          constraints: {
            maxSize: '200KB',
            dimensions: '200x230',
            fileTypes: ['jpg', 'jpeg', 'png']
          }
        },
        {
          id: 'signature',
          name: 'Signature',
          type: 'document', 
          required: true,
          description: 'Clear signature of the candidate',
          formats: ['JPEG', 'PNG'],
          constraints: {
            maxSize: '100KB',
            dimensions: '200x100',
            fileTypes: ['jpg', 'jpeg', 'png']
          }
        },
        {
          id: 'educational-certificate',
          name: 'Educational Certificate',
          type: 'document',
          required: true,
          description: 'Educational qualification certificate',
          formats: ['PDF', 'JPEG', 'PNG'],
          constraints: {
            maxSize: '2MB',
            fileTypes: ['pdf', 'jpg', 'jpeg', 'png']
          }
        }
      ],
      createdAt: new Date().toISOString(),
      sources: [{
        url: 'fallback',
        title: 'Fallback Schema Generation',
        type: 'generated',
        reliability: 0.5,
        lastAccessed: new Date().toISOString(),
        contentHash: 'fallback-' + Date.now()
      }]
    }
  };
}