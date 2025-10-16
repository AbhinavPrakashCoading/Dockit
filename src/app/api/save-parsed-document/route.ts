import { NextRequest, NextResponse } from 'next/server';

// Helper function to extract exam type from exam name
function extractExamType(examName: string): string | null {
  const examNameLower = examName.toLowerCase();
  
  if (examNameLower.includes('upsc') || examNameLower.includes('civil service')) {
    return 'upsc';
  } else if (examNameLower.includes('ssc') || examNameLower.includes('staff selection')) {
    return 'ssc';
  } else if (examNameLower.includes('ielts')) {
    return 'ielts';
  } else if (examNameLower.includes('toefl')) {
    return 'toefl';
  } else if (examNameLower.includes('jee') || examNameLower.includes('joint entrance')) {
    return 'jee';
  } else if (examNameLower.includes('neet')) {
    return 'neet';
  } else if (examNameLower.includes('gate')) {
    return 'gate';
  }
  
  return null;
}

// POST /api/save-parsed-document - Save parsed JSON result to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      parsedJson, 
      originalText,
      userId 
    } = body;

    // Validation
    if (!parsedJson) {
      return NextResponse.json(
        { error: 'Missing required field: parsedJson' },
        { status: 400 }
      );
    }

    // Extract exam type from exam name for normalization
    const examType = extractExamType(parsedJson.exam || '');
    
    // Call the fallback API to save the document (this will check for duplicates)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const saveResponse = await fetch(`${baseUrl}/api/parsed-documents-fallback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        examName: parsedJson.exam || 'Unknown Exam',
        examType: examType,
        source: parsedJson.source || 'text-input',
        parsedJson: parsedJson,
        originalText: originalText,
        confidence: parsedJson.metadata?.confidence,
        documentCount: parsedJson.documents?.length || 0,
        method: parsedJson.metadata?.method || 'text-parser',
        userId: userId || null
      })
    });
    
    const responseData = await saveResponse.json();
    
    if (saveResponse.status === 409) {
      // Duplicate detected - return special response for UI to handle
      return NextResponse.json({
        success: false,
        isDuplicate: true,
        message: 'Duplicate documents found',
        duplicates: responseData.duplicates,
        examName: responseData.examName,
        originalData: { parsedJson, originalText, userId, examType }
      }, { status: 409 });
    }
    
    if (!saveResponse.ok) {
      throw new Error(`Failed to save: ${saveResponse.status} - ${responseData.error || 'Unknown error'}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Parsed document saved successfully',
      document: responseData
    });

  } catch (error) {
    console.error('❌ Save parsed document failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}