import { NextRequest, NextResponse } from 'next/server';

// Mock exam data with unique schemas for each URL
const mockExamData: Record<string, any> = {
  'https://ibpsonline.ibps.in/clerk25': {
    exam: 'IBPS Clerk 2025',
    source: 'https://ibpsonline.ibps.in/clerk25',
    extractedAt: '',
    documents: [
      {
        type: 'Photo',
        requirements: {
          format: ['JPG', 'JPEG'],
          maxSize: '50 KB',
          minSize: '20 KB',
          dimensions: { width: 200, height: 230, ratio: '200:230' },
          mandatory: true,
          description: 'Recent passport size color photograph'
        }
      },
      {
        type: 'Signature',
        requirements: {
          format: ['JPG', 'JPEG'],
          maxSize: '40 KB',
          dimensions: { width: 140, height: 60, ratio: '140:60' },
          mandatory: true,
          description: 'Clear signature in black ink'
        }
      },
      {
        type: 'Thumb Impression',
        requirements: {
          format: ['JPG', 'JPEG'],
          maxSize: '40 KB',
          mandatory: true,
          description: 'Left thumb impression'
        }
      },
      {
        type: 'Educational Documents',
        requirements: {
          format: ['PDF'],
          maxSize: '500 KB',
          mandatory: true,
          description: '10th, 12th, and graduation certificates'
        }
      }
    ],
    metadata: {
      url: 'https://ibpsonline.ibps.in/clerk25',
      contentType: 'text/html',
      extractionMethod: 'html' as const,
      confidence: 0.95
    }
  },

  'https://sbi.co.in/careers': {
    exam: 'SBI PO 2025',
    source: 'https://sbi.co.in/careers',
    extractedAt: '',
    documents: [
      {
        type: 'Photo',
        requirements: {
          format: ['JPEG'],
          maxSize: '40 KB',
          minSize: '4 KB',
          dimensions: { width: 200, height: 200, ratio: '1:1' },
          mandatory: true,
          description: 'Recent color photograph (JPEG only)'
        }
      },
      {
        type: 'Signature',
        requirements: {
          format: ['JPEG'],
          maxSize: '30 KB',
          dimensions: { width: 140, height: 60, ratio: '140:60' },
          mandatory: true,
          description: 'Handwritten signature'
        }
      },
      {
        type: 'Category Certificate',
        requirements: {
          format: ['PDF'],
          maxSize: '300 KB',
          mandatory: false,
          description: 'SC/ST/OBC certificate (if applicable)'
        }
      },
      {
        type: 'Educational Certificates',
        requirements: {
          format: ['PDF'],
          maxSize: '1 MB',
          mandatory: true,
          description: 'All degree certificates'
        }
      }
    ],
    metadata: {
      url: 'https://sbi.co.in/careers',
      contentType: 'text/html',
      extractionMethod: 'html' as const,
      confidence: 0.92
    }
  },

  'https://upsconline.nic.in': {
    exam: 'UPSC Civil Services Examination 2025',
    source: 'https://upsconline.nic.in',
    extractedAt: '',
    documents: [
      {
        type: 'Photo',
        requirements: {
          format: ['JPG', 'PNG'],
          maxSize: '50 KB',
          minSize: '3 KB',
          dimensions: { width: 35, height: 45, ratio: 'passport size' },
          mandatory: true,
          description: 'Recent passport size photograph'
        }
      },
      {
        type: 'Signature',
        requirements: {
          format: ['JPG'],
          maxSize: '30 KB',
          minSize: '1 KB',
          mandatory: true,
          description: 'Clear signature (JPG only)'
        }
      },
      {
        type: 'Identity Proof',
        requirements: {
          format: ['PDF'],
          maxSize: '2 MB',
          mandatory: true,
          description: 'Valid identity document'
        }
      },
      {
        type: 'Address Proof',
        requirements: {
          format: ['PDF'],
          maxSize: '1 MB',
          mandatory: true,
          description: 'Residential address proof'
        }
      },
      {
        type: 'Educational Certificates',
        requirements: {
          format: ['PDF'],
          maxSize: '500 KB',
          mandatory: true,
          description: 'Educational qualification certificates'
        }
      }
    ],
    metadata: {
      url: 'https://upsconline.nic.in',
      contentType: 'text/html',
      extractionMethod: 'html' as const,
      confidence: 0.88
    }
  },

  'https://rrb.gov.in/ntpc': {
    exam: 'RRB NTPC 2025',
    source: 'https://rrb.gov.in/ntpc',
    extractedAt: '',
    documents: [
      {
        type: 'Photo',
        requirements: {
          format: ['JPG'],
          maxSize: '100 KB',
          minSize: '20 KB',
          dimensions: { width: 35, height: 45, ratio: '3.5cm x 4.5cm' },
          mandatory: true,
          description: 'Recent color passport size photograph'
        }
      },
      {
        type: 'Signature',
        requirements: {
          format: ['JPG'],
          maxSize: '50 KB',
          minSize: '10 KB',
          mandatory: true,
          description: 'Signature specimen in black ink'
        }
      },
      {
        type: 'Caste Certificate',
        requirements: {
          format: ['PDF'],
          maxSize: '400 KB',
          mandatory: false,
          description: 'For reserved categories (if applicable)'
        }
      },
      {
        type: 'Educational Qualification',
        requirements: {
          format: ['PDF'],
          maxSize: '1 MB',
          mandatory: true,
          description: 'Degree/diploma certificates'
        }
      },
      {
        type: 'Employment Registration',
        requirements: {
          format: ['PDF'],
          maxSize: '300 KB',
          mandatory: false,
          description: 'Employment registration (if applicable)'
        }
      }
    ],
    metadata: {
      url: 'https://rrb.gov.in/ntpc',
      contentType: 'text/html',
      extractionMethod: 'html' as const,
      confidence: 0.90
    }
  },

  'https://google.com': {
    exam: 'No Exam Requirements Found',
    source: 'https://google.com',
    extractedAt: '',
    documents: [],
    metadata: {
      url: 'https://google.com',
      contentType: 'text/html',
      extractionMethod: 'html' as const,
      confidence: 0.1
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, options = {} } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log(`🔍 Schema extraction request for: ${url}`);

    // Check if we have mock data for this URL
    if (url in mockExamData) {
      console.log(`📋 Using predefined data for: ${url}`);
      
      const schema = {
        ...mockExamData[url],
        extractedAt: new Date().toISOString()
      };

      console.log(`✅ Schema found: ${schema.exam} with ${schema.documents.length} documents`);
      return NextResponse.json(schema);
    }

    // For unknown URLs, create a generic response
    console.log(`⚠️ URL not in predefined data: ${url}`);
    
    const genericSchema = {
      exam: 'Unknown Exam',
      source: url,
      extractedAt: new Date().toISOString(),
      documents: [
        {
          type: 'Document Upload',
          requirements: {
            format: ['PDF', 'JPG', 'JPEG'],
            maxSize: '500 KB',
            mandatory: true,
            description: 'Required documents (URL not recognized in demo)'
          }
        }
      ],
      metadata: {
        url: url,
        contentType: 'unknown',
        extractionMethod: 'html' as const,
        confidence: 0.1
      }
    };

    return NextResponse.json(genericSchema);

  } catch (error) {
    console.error('❌ Schema extraction API error:', error);

    const errorSchema = {
      exam: 'Extraction Failed',
      source: 'unknown',
      extractedAt: new Date().toISOString(),
      documents: [],
      metadata: {
        url: 'unknown',
        contentType: 'unknown',
        extractionMethod: 'html' as const,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    };

    return NextResponse.json(errorSchema, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Schema Extraction API - Fixed Version',
    status: 'operational',
    availableUrls: Object.keys(mockExamData),
    usage: {
      method: 'POST',
      endpoint: '/api/extract-schema',
      body: {
        url: 'string (required) - URL to extract schema from',
        options: 'object (optional) - Additional extraction options'
      }
    },
    examples: [
      'https://ibpsonline.ibps.in/clerk25',
      'https://sbi.co.in/careers',
      'https://upsconline.nic.in',
      'https://rrb.gov.in/ntpc'
    ]
  });
}