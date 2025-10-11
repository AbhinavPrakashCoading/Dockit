// API endpoint for Schema Extraction Engine
import { NextRequest, NextResponse } from 'next/server';
import { generateExamSchema } from '../../../engines/schema-extraction';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { examName, options = {} } = body;

    if (!examName || typeof examName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Exam name is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Starting schema extraction for: ${examName}`);
    
    // Generate schema using the extraction engine
    const schema = await generateExamSchema(examName.trim(), {
      maxSearchResults: options.maxSearchResults || 8,
      timeout: options.timeout || 45000,
      includeOfficialOnly: options.includeOfficialOnly !== false,
      preferPdfs: options.preferPdfs !== false
    });

    return NextResponse.json({
      success: true,
      data: {
        schema,
        examName,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Schema extraction API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Schema extraction failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Schema Extraction Engine API',
    endpoints: {
      'POST /api/schema-extraction': 'Generate exam schema',
      'GET /api/schema-extraction': 'API information'
    },
    usage: {
      method: 'POST',
      body: {
        examName: 'string (required)',
        options: {
          maxSearchResults: 'number (default: 8)',
          timeout: 'number (default: 45000)',
          includeOfficialOnly: 'boolean (default: true)',
          preferPdfs: 'boolean (default: true)'
        }
      }
    }
  });
}