/**
 * Schema Discovery API Endpoint
 * Provides real-time data for the schema engine demo
 */

import { NextRequest, NextResponse } from 'next/server';

// Demo data that simulates real schema discovery
const DEMO_DISCOVERY_SOURCES = [
  {
    name: 'Staff Selection Commission',
    baseUrl: 'https://ssc.nic.in',
    searchPatterns: ['/apply/', '/recruitment/', '/notification/'],
    selectors: {
      examLinks: 'a[href*="apply"], a[href*="recruitment"]',
      examName: 'h1, h2, .title, .exam-name',
      organization: '.org-name, .header .logo',
      deadlines: '.deadline, .last-date, [class*="date"]'
    },
    priority: 1,
    lastCrawled: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isActive: true,
    status: 'idle'
  },
  {
    name: 'Union Public Service Commission',
    baseUrl: 'https://upsc.gov.in',
    searchPatterns: ['/examinations/', '/apply/', '/recruitment/'],
    selectors: {
      examLinks: 'a[href*="examinations"]',
      examName: '.exam-title',
      organization: '.upsc-header',
      deadlines: '.registration-dates'
    },
    priority: 1,
    lastCrawled: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    isActive: true,
    status: 'idle'
  },
  {
    name: 'Banking Personnel Selection Institute',
    baseUrl: 'https://www.ibps.in',
    searchPatterns: ['/recruitment/', '/apply/'],
    selectors: {
      examLinks: 'a[href*="recruitment"], a[href*="cwe"]',
      examName: '.exam-name, h1',
      organization: '.ibps-logo',
      deadlines: '.important-dates'
    },
    priority: 2,
    lastCrawled: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    isActive: true,
    status: 'idle'
  }
];

const DEMO_SCHEMAS = [
  {
    examId: 'ssc-cgl-2024',
    version: 1,
    generatedAt: new Date(Date.now() - 1800000).toISOString(),
    confidence: 95,
    source: 'Staff Selection Commission',
    url: 'https://ssc.nic.in/apply/ssc-cgl-2024/',
    fields: [
      { id: 'name', name: 'Full Name', type: 'text', required: true, validation: { minLength: 2, maxLength: 100 } },
      { id: 'dob', name: 'Date of Birth', type: 'date', required: true, validation: { minAge: 18, maxAge: 32 } },
      { id: 'category', name: 'Category', type: 'select', required: true, validation: { options: ['General', 'OBC', 'SC', 'ST'] } },
      { id: 'photo', name: 'Passport Photo', type: 'file', required: true, validation: { fileType: 'image', maxSize: '100KB' } },
      { id: 'signature', name: 'Signature', type: 'file', required: true, validation: { fileType: 'image', maxSize: '50KB' } },
      { id: 'email', name: 'Email Address', type: 'email', required: true, validation: { format: 'email' } },
      { id: 'mobile', name: 'Mobile Number', type: 'tel', required: true, validation: { pattern: '^[0-9]{10}$' } },
      { id: 'address', name: 'Permanent Address', type: 'textarea', required: true, validation: { minLength: 10 } }
    ],
    documentTypes: [
      { 
        type: 'passport_photo', 
        specifications: { size: '3.5cm x 4.5cm', background: 'white', dpi: 300 }, 
        examples: ['passport_photo_sample.jpg'] 
      },
      { 
        type: 'signature', 
        specifications: { size: '3cm x 1cm', background: 'white', format: 'jpg/png' }, 
        examples: ['signature_sample.jpg'] 
      }
    ],
    metadata: {
      formComplexity: 'medium',
      estimatedSubmissionTime: 15,
      successRate: 87
    }
  },
  {
    examId: 'upsc-civil-services-2024',
    version: 2,
    generatedAt: new Date(Date.now() - 3600000).toISOString(),
    confidence: 92,
    source: 'Union Public Service Commission',
    url: 'https://upsc.gov.in/examinations/civil-services-2024/',
    fields: [
      { id: 'name', name: 'Candidate Name', type: 'text', required: true, validation: { minLength: 2, maxLength: 50 } },
      { id: 'father_name', name: 'Father Name', type: 'text', required: true, validation: { minLength: 2 } },
      { id: 'dob', name: 'Date of Birth', type: 'date', required: true, validation: { minAge: 21, maxAge: 32 } },
      { id: 'nationality', name: 'Nationality', type: 'select', required: true, validation: { options: ['Indian'] } },
      { id: 'photo', name: 'Photograph', type: 'file', required: true, validation: { fileType: 'image', maxSize: '100KB' } },
      { id: 'signature', name: 'Signature', type: 'file', required: true, validation: { fileType: 'image', maxSize: '50KB' } },
      { id: 'optional_subject', name: 'Optional Subject', type: 'select', required: false, validation: { options: ['History', 'Geography', 'Political Science'] } }
    ],
    documentTypes: [
      { 
        type: 'passport_photo', 
        specifications: { size: '3.5cm x 4.5cm', background: 'white', quality: 'high' }, 
        examples: ['upsc_photo_sample.jpg'] 
      },
      { 
        type: 'signature', 
        specifications: { size: '3cm x 1cm', ink: 'blue/black' }, 
        examples: ['upsc_signature_sample.jpg'] 
      }
    ],
    metadata: {
      formComplexity: 'high',
      estimatedSubmissionTime: 25,
      successRate: 78
    }
  },
  {
    examId: 'ibps-po-2024',
    version: 1,
    generatedAt: new Date(Date.now() - 900000).toISOString(),
    confidence: 88,
    source: 'Banking Personnel Selection Institute',
    url: 'https://www.ibps.in/recruitment/po-2024/',
    fields: [
      { id: 'name', name: 'Full Name', type: 'text', required: true, validation: { minLength: 2 } },
      { id: 'dob', name: 'Date of Birth', type: 'date', required: true, validation: { minAge: 20, maxAge: 30 } },
      { id: 'qualification', name: 'Educational Qualification', type: 'select', required: true, validation: { options: ['Graduate', 'Post Graduate'] } },
      { id: 'experience', name: 'Work Experience', type: 'number', required: false, validation: { min: 0, max: 10 } },
      { id: 'photo', name: 'Recent Photograph', type: 'file', required: true, validation: { fileType: 'image' } },
      { id: 'signature', name: 'Signature', type: 'file', required: true, validation: { fileType: 'image' } }
    ],
    documentTypes: [
      { 
        type: 'passport_photo', 
        specifications: { size: '3.5cm x 4.5cm', background: 'light', recent: 'within 3 months' }, 
        examples: ['banking_photo_sample.jpg'] 
      },
      { 
        type: 'signature', 
        specifications: { size: '3cm x 1cm', clear: true }, 
        examples: ['banking_signature_sample.jpg'] 
      }
    ],
    metadata: {
      formComplexity: 'medium',
      estimatedSubmissionTime: 12,
      successRate: 91
    }
  }
];

// GET /api/schema-discovery - Get discovery sources and schemas
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'sources':
        return NextResponse.json({
          success: true,
          data: DEMO_DISCOVERY_SOURCES
        });

      case 'schemas':
        return NextResponse.json({
          success: true,
          data: DEMO_SCHEMAS
        });

      case 'stats':
        const stats = {
          totalDiscoveredForms: DEMO_SCHEMAS.length,
          activeMonitoringTasks: DEMO_DISCOVERY_SOURCES.filter(s => s.isActive).length,
          recentChanges: Math.floor(Math.random() * 5),
          averageConfidence: DEMO_SCHEMAS.reduce((acc, s) => acc + s.confidence, 0) / DEMO_SCHEMAS.length,
          formsByCategory: {
            'Government': DEMO_SCHEMAS.filter(s => s.source.includes('Commission')).length,
            'Banking': DEMO_SCHEMAS.filter(s => s.source.includes('Banking')).length,
            'Railway': 0,
            'Defense': 0
          },
          priorityDistribution: {
            'High': DEMO_DISCOVERY_SOURCES.filter(s => s.priority === 1).length,
            'Medium': DEMO_DISCOVERY_SOURCES.filter(s => s.priority === 2).length,
            'Low': DEMO_DISCOVERY_SOURCES.filter(s => s.priority === 3).length
          }
        };
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'discover':
        // Simulate discovery process
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        
        // Return a simulated new schema
        const newSchema = {
          examId: `new-exam-${Date.now()}`,
          version: 1,
          generatedAt: new Date().toISOString(),
          confidence: 80 + Math.random() * 20,
          source: DEMO_DISCOVERY_SOURCES[Math.floor(Math.random() * DEMO_DISCOVERY_SOURCES.length)].name,
          url: `https://example.com/exam-${Math.floor(Math.random() * 1000)}/`,
          fields: [
            { id: 'name', name: 'Full Name', type: 'text', required: true, validation: { minLength: 2 } },
            { id: 'email', name: 'Email', type: 'email', required: true, validation: { format: 'email' } },
            { id: 'mobile', name: 'Mobile Number', type: 'tel', required: true, validation: { pattern: '^[0-9]{10}$' } }
          ],
          documentTypes: [
            { type: 'photo', specifications: { size: '3.5x4.5cm' }, examples: [] },
            { type: 'signature', specifications: { size: '3x1cm' }, examples: [] }
          ],
          metadata: {
            formComplexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            estimatedSubmissionTime: 5 + Math.floor(Math.random() * 20),
            successRate: 70 + Math.floor(Math.random() * 30)
          }
        };

        return NextResponse.json({
          success: true,
          data: {
            discovered: Math.random() > 0.3, // 70% chance of discovery
            schema: newSchema,
            message: Math.random() > 0.3 ? 'New schema discovered!' : 'No new schemas found in this cycle'
          }
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            sources: DEMO_DISCOVERY_SOURCES,
            schemas: DEMO_SCHEMAS
          }
        });
    }
  } catch (error) {
    console.error('Schema discovery API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST /api/schema-discovery - Trigger discovery or update sources
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'start_discovery':
        // Simulate starting discovery process
        return NextResponse.json({
          success: true,
          data: {
            message: 'Discovery process started',
            estimatedDuration: '30-60 seconds',
            sourcesCount: DEMO_DISCOVERY_SOURCES.filter(s => s.isActive).length
          }
        });

      case 'update_source':
        // Simulate updating a discovery source
        return NextResponse.json({
          success: true,
          data: {
            message: `Source ${data.name} updated successfully`
          }
        });

      case 'generate_schema':
        // Simulate schema generation for a specific URL
        const generatedSchema = {
          examId: `generated-${Date.now()}`,
          version: 1,
          generatedAt: new Date().toISOString(),
          confidence: 85 + Math.random() * 15,
          source: data.source || 'Manual Generation',
          url: data.url || 'https://example.com/form/',
          fields: [
            { id: 'name', name: 'Full Name', type: 'text', required: true, validation: { minLength: 2 } },
            { id: 'email', name: 'Email Address', type: 'email', required: true, validation: { format: 'email' } },
            { id: 'phone', name: 'Phone Number', type: 'tel', required: true, validation: { pattern: '^[0-9]{10}$' } },
            { id: 'dob', name: 'Date of Birth', type: 'date', required: true, validation: { minAge: 18 } },
            { id: 'photo', name: 'Photograph', type: 'file', required: true, validation: { fileType: 'image' } }
          ],
          documentTypes: [
            { type: 'passport_photo', specifications: { size: '3.5x4.5cm', background: 'white' }, examples: [] }
          ],
          metadata: {
            formComplexity: 'medium',
            estimatedSubmissionTime: 10,
            successRate: 85
          }
        };

        return NextResponse.json({
          success: true,
          data: generatedSchema
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Schema discovery POST API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}