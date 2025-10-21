/**
 * Schema Discovery and Enhancement API
 * Integrates web scraping with schema management for automatic enhancement
 */

import { NextRequest, NextResponse } from 'next/server';

interface DiscoveryRequest {
  action: 'discover' | 'enhance_existing' | 'create_from_discovery' | 'batch_enhance';
  examId?: string;
  urls?: string[];
  options?: {
    autoSave?: boolean;
    enhanceExisting?: boolean;
    createMissing?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: DiscoveryRequest = await request.json();
    const { action, examId, urls, options } = body;

    switch (action) {
      case 'discover':
        return await discoverAndAnalyze(urls!, options);
        
      case 'enhance_existing':
        return await enhanceExistingSchema(examId!, urls);
        
      case 'create_from_discovery':
        return await createSchemaFromDiscovery(examId!, urls!);
        
      case 'batch_enhance':
        return await batchEnhanceSchemas(options);
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Schema discovery error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

async function discoverAndAnalyze(urls: string[], options?: any) {
  try {
    // Enhanced discovery process
    const discoveries = await Promise.all(
      urls.map(async (url) => {
        // Scrape the URL
        const scrapeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/enhanced-web-scraper`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analyze',
            url,
            options: { includeDocuments: true, includeValidation: true }
          })
        });

        const scrapeData = await scrapeResponse.json();
        
        if (!scrapeData.success) {
          throw new Error(`Failed to scrape ${url}`);
        }

        return {
          url,
          examName: scrapeData.data.examName,
          category: scrapeData.data.category,
          confidence: scrapeData.data.confidence,
          requirements: scrapeData.data.requirements,
          insights: scrapeData.data.insights,
          recommendations: scrapeData.data.recommendations
        };
      })
    );

    // Generate comprehensive report
    const report = {
      totalUrls: urls.length,
      successfulDiscoveries: discoveries.filter(d => d.confidence > 0.7).length,
      averageConfidence: discoveries.reduce((sum, d) => sum + d.confidence, 0) / discoveries.length,
      totalRequirements: discoveries.reduce((sum, d) => sum + d.requirements.length, 0),
      discoveries,
      recommendations: generateGlobalRecommendations(discoveries)
    };

    return NextResponse.json({
      success: true,
      data: report
    });
  } catch (error) {
    throw new Error(`Discovery failed: ${error}`);
  }
}

async function enhanceExistingSchema(examId: string, urls?: string[]) {
  try {
    // Get current schema
    const currentSchemaResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/schema-management?action=read&examId=${examId}`);
    const currentSchemaData = await currentSchemaResponse.json();

    if (!currentSchemaData.success) {
      throw new Error(`Schema ${examId} not found`);
    }

    const currentSchema = currentSchemaData.data.schema;

    // Gather enhancement data from URLs if provided
    let enhancementData = {
      sources: ['comprehensive-research'],
      improvements: ['Enhanced validation rules', 'Detailed specifications']
    };

    if (urls && urls.length > 0) {
      const discoveryData = await Promise.all(
        urls.map(async (url) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/enhanced-web-scraper`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'analyze', url })
          });
          const data = await response.json();
          return data.success ? data.data : null;
        })
      );

      const validDiscoveries = discoveryData.filter(d => d !== null);
      
      enhancementData = {
        sources: [...enhancementData.sources, ...urls],
        improvements: [
          ...enhancementData.improvements,
          `Added ${validDiscoveries.reduce((sum, d) => sum + d.requirements.length, 0)} new requirements`,
          'Enhanced with web-scraped data',
          'Improved validation rules from official sources'
        ]
      };
    }

    // Enhance the schema
    const enhanceResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/schema-management`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'enhance',
        examId,
        enhancementData
      })
    });

    const enhanceResult = await enhanceResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        examId,
        enhancement: enhanceResult.data?.enhancement,
        message: `Schema ${examId} enhanced with data from ${urls?.length || 0} sources`
      }
    });
  } catch (error) {
    throw new Error(`Enhancement failed: ${error}`);
  }
}

async function createSchemaFromDiscovery(examId: string, urls: string[]) {
  try {
    // Discover requirements from all URLs
    const discoveries = await Promise.all(
      urls.map(async (url) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/enhanced-web-scraper`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'extract_schema', url, examType: 'government' })
        });
        const data = await response.json();
        return data.success ? data.data.schema : null;
      })
    );

    const validSchemas = discoveries.filter(s => s !== null);
    
    if (validSchemas.length === 0) {
      throw new Error('No valid schemas could be generated from the provided URLs');
    }

    // Merge schemas into comprehensive schema
    const mergedSchema = mergeSchemas(validSchemas, examId);

    // Create the new schema
    const createResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/schema-management`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        examId,
        schema: mergedSchema,
        category: 'government'
      })
    });

    const createResult = await createResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        examId,
        schema: mergedSchema,
        sources: urls,
        mergedFrom: validSchemas.length,
        message: `Schema ${examId} created from ${urls.length} discovery sources`
      }
    });
  } catch (error) {
    throw new Error(`Schema creation from discovery failed: ${error}`);
  }
}

async function batchEnhanceSchemas(options?: any) {
  try {
    const knownExams = [
      { examId: 'upsc-cse', urls: ['https://upsc.gov.in/examinations/civil-service-exam'] },
      { examId: 'ssc-cgl', urls: ['https://ssc.nic.in/Portal/Schemes-PostsNew/CGL'] },
      { examId: 'neet-ug', urls: ['https://neet.nta.nic.in'] }
    ];

    const results = await Promise.all(
      knownExams.map(async (exam) => {
        try {
          const enhanceResponse = await enhanceExistingSchema(exam.examId, exam.urls);
          const enhanceData = await enhanceResponse.json();
          
          return {
            examId: exam.examId,
            success: enhanceData.success,
            enhancement: enhanceData.data?.enhancement,
            error: enhanceData.error
          };
        } catch (error) {
          return {
            examId: exam.examId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };

    return NextResponse.json({
      success: true,
      data: summary
    });
  } catch (error) {
    throw new Error(`Batch enhancement failed: ${error}`);
  }
}

function mergeSchemas(schemas: any[], examId: string) {
  // Merge multiple schemas into one comprehensive schema
  const allRequirements = schemas.flatMap(schema => schema.requirements || []);
  
  // Remove duplicates based on ID
  const uniqueRequirements = allRequirements.filter((req, index, self) => 
    index === self.findIndex(r => r.id === req.id)
  );

  // Take the best examName from the schemas
  const examName = schemas.find(s => s.examName)?.examName || 'Discovered Exam';

  return {
    examId,
    examName,
    version: '1.0.0-discovered',
    lastUpdated: new Date(),
    requirements: uniqueRequirements,
    metadata: {
      generatedFrom: 'schema-discovery',
      mergedSchemas: schemas.length,
      totalRequirements: uniqueRequirements.length,
      discoveredAt: new Date().toISOString()
    }
  };
}

function generateGlobalRecommendations(discoveries: any[]) {
  const recommendations = [
    'Consider standardizing document format requirements across all exams',
    'Implement consistent file size limits based on document type',
    'Add comprehensive validation rules for all document categories',
    'Include common mistake guidelines for better user experience'
  ];

  const totalRequirements = discoveries.reduce((sum, d) => sum + d.requirements.length, 0);
  const avgRequirements = Math.round(totalRequirements / discoveries.length);

  if (avgRequirements < 5) {
    recommendations.push('Many schemas have minimal requirements - consider adding more comprehensive document lists');
  }

  if (discoveries.some(d => d.confidence < 0.8)) {
    recommendations.push('Some discoveries have low confidence - manual review recommended');
  }

  return recommendations;
}