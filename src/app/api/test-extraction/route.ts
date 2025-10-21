import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Schema Extraction API is working!',
    timestamp: new Date().toISOString(),
    status: 'ready'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock response for testing
    const mockSchema = {
      "exam": "Test Exam (Mock Data)",
      "source": body.url || "test-url",
      "extractedAt": new Date().toISOString(),
      "documents": [
        {
          "type": "Photo",
          "requirements": {
            "format": ["jpg", "jpeg"],
            "maxSize": "50 KB",
            "minSize": "20 KB",
            "dimensions": {
              "width": 200,
              "height": 230,
              "ratio": "200:230"
            },
            "mandatory": true,
            "description": "Recent passport size color photograph"
          }
        },
        {
          "type": "Signature", 
          "requirements": {
            "format": ["jpg", "jpeg"],
            "maxSize": "40 KB",
            "mandatory": true,
            "description": "Clear signature in black ink"
          }
        }
      ],
      "metadata": {
        "url": body.url || "test-url",
        "contentType": "text/html",
        "extractionMethod": "mock",
        "confidence": 0.95
      }
    };

    return NextResponse.json(mockSchema);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}