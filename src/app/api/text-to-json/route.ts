import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ParsedDocument {
  type: string;
  requirements: {
    format?: string[];
    maxSize?: string;
    minSize?: string;
    dimensions?: {
      width?: number;
      height?: number;
      ratio?: string;
    };
    description?: string;
    mandatory?: boolean;
    allowMultiple?: boolean;
    maxFiles?: number;
    minFiles?: number;
    subcategories?: {
      id: string;
      label: string;
      required: boolean;
      description?: string;
    }[];
  };
}

interface TextToJsonResult {
  exam?: string;
  source: string;
  extractedAt: string;
  documents: ParsedDocument[];
  metadata: {
    method: 'text-parser';
    confidence: number;
    suggestions?: string[];
  };
}

function parseDocumentRequirements(text: string): TextToJsonResult {
  console.log('🔍 Starting parseDocumentRequirements...');
  console.log('📝 Input text length:', text.length);
  
  const lines = text.split('\n').filter(line => line.trim());
  console.log('📄 Total lines after filtering:', lines.length);
  
  const documents: ParsedDocument[] = [];
  const suggestions: string[] = [];
  let exam: string | undefined;
  let confidence = 0.7;

  // Extract exam name from first lines
  const examPatterns = [
    /^(.+?(?:exam|examination|test|assessment|recruitment|notification).+?)$/i,
    /^(.+?)\s*(?:exam|examination|recruitment|notification)/i,
    /exam[:\-\s]*(.*?)(?:\n|$)/i,
    /^([A-Z][A-Za-z\s]+(?:20\d{2})?)/
  ];

  for (const line of lines.slice(0, 3)) {
    for (const pattern of examPatterns) {
      const match = line.match(pattern);
      if (match && match[1] && match[1].length > 3) {
        exam = match[1].trim();
        confidence += 0.1;
        break;
      }
    }
    if (exam) break;
  }

  // Document parsing patterns - improved to distinguish document types from requirements
  const docPatterns = [
    // Pattern 1: Document with (if applicable): "Document (if applicable): details"
    /^([A-Za-z][A-Za-z\s]+?)\s*\(if applicable\):\s*(.+)$/i,
    // Pattern 2: JEE-style format: "Document Type: JPEG/JPG format, size, description"
    /^([A-Za-z][A-Za-z\s/()]+?):\s*((?:JPEG|JPG|PDF|PNG).+?)$/i,
    // Pattern 3: General document with colon and details (includes numbers for Class 10th, etc.)
    /^([A-Za-z0-9][A-Za-z0-9\s/]+?):\s*(.+)$/i,
    // Pattern 4: Numbered document with colon and details: "1. Document type: details"
    /^(\d+\.\s*)?([A-Za-z0-9][A-Za-z0-9\s]+?):\s*(.+)$/i,
    // Pattern 5: Numbered document header only: "1. Document type:"
    /^(\d+\.\s*)([A-Za-z0-9][A-Za-z0-9\s]{3,}):\s*$/i,
    // Pattern 6: Document type with dash: "Document type - details"  
    /^(\d+\.\s*)?([A-Za-z0-9][A-Za-z0-9\s]+?)\s*-\s*(.+)$/i,
    // Pattern 7: Document type in header format (for comprehensive lists)
    /^([A-Za-z0-9][A-Za-z0-9\s]{5,}(?:photograph|signature|certificate|proof|document|id|card))$/i
  ];

  // Requirement properties that should NOT be treated as document types
  const requirementKeywords = [
    'format:', 'size:', 'dimensions:', 'background:', 'note:', 'acceptable documents:',
    'maximum:', 'minimum:', 'between:', 'width:', 'height:', 'description:', 'mandatory:'
  ];

  let currentDoc: Partial<ParsedDocument> | null = null;
  let documentCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and main headers
    if (!line || 
        (line.toLowerCase().includes('document') && line.toLowerCase().includes('required')) ||
        line.toLowerCase().includes('examination') ||
        line === '') {
      continue;
    }

    // Try to match document patterns
    let matched = false;
    
    for (const pattern of docPatterns) {
      const match = line.match(pattern);
      if (match) {
        // Extract document type from different patterns
        let docType = '';
        let details = '';
        
        // Handle different patterns with different capture groups
        if (match[1] && match[2] && !match[3]) {
          // Patterns 1-3: Two capture groups (docType, details)
          docType = match[1].trim();
          details = match[2].trim();
        } else if (match[2] && match[3]) {
          // Patterns 4-6: Three capture groups (number, docType, details)
          docType = match[2].trim();
          details = match[3].trim();
        } else if (match[1] && !match[2]) {
          // Pattern 7: Single capture group (docType only)
          docType = match[1].trim();
        }

        // Check if this is actually a document type and not a requirement property
        const isRequirementProperty = requirementKeywords.some(keyword => 
          line.toLowerCase().trim().startsWith(keyword.toLowerCase())
        );

        if (docType && !isRequirementProperty) {
          // Save previous document
          if (currentDoc && currentDoc.type) {
            documents.push(currentDoc as ParsedDocument);
          }
          
          // For multi-line format, look ahead for format, size, etc.
          const nextLines = lines.slice(i + 1, i + 10);
          
          currentDoc = {
            type: docType,
            requirements: parseRequirements(details, nextLines) || {}
          };

          documentCount++;
          matched = true;
          confidence += 0.1;
          break;
        }
        // If it's a requirement property, don't break - let it fall through to requirement processing
      }
    }

    // If line looks like a sub-requirement for current document or was filtered out as requirement property
    if (!matched && currentDoc) {
      // Check if it's a requirement property that was filtered out
      const isRequirementProperty = requirementKeywords.some(keyword => 
        line.toLowerCase().includes(keyword)
      );

      if (isRequirementProperty ||
          line.toLowerCase().includes('format:') || 
          line.toLowerCase().includes('size:') || 
          line.toLowerCase().includes('dimension') || 
          line.toLowerCase().includes('mandatory') ||
          line.toLowerCase().includes('description:') ||
          line.toLowerCase().includes('note:') ||
          line.toLowerCase().includes('acceptable') ||
          line.includes('max') || line.includes('min') ||
          line.toLowerCase().includes('pdf') || 
          line.toLowerCase().includes('jpeg') ||
          line.toLowerCase().includes('jpg') ||
          line.toLowerCase().includes('between') ||
          /^\s*[A-Z]+\/[A-Z]+/.test(line) || // Format like "JPEG/JPG"
          /\d+\s*(kb|mb|gb)/i.test(line) || // Size like "300 KB"
          /\d+(?:\.\d+)?\s*cm/.test(line) // Dimensions like "3.5 cm"
      ) {
        const additionalReqs = parseRequirements(line, []);
        if (additionalReqs && currentDoc.requirements) {
          Object.assign(currentDoc.requirements, additionalReqs);
        }
      }
    }
  }

  // Add the last document
  if (currentDoc && currentDoc.type) {
    documents.push(currentDoc as ParsedDocument);
  }

  // Generate suggestions based on parsing results
  if (documents.length === 0) {
    suggestions.push('No documents were detected. Try using formats like "Photo: JPEG, 50KB" or numbered lists.');
  }
  
  if (documents.length < 3) {
    suggestions.push('Consider adding more document types like Photo, Signature, ID Proof, etc.');
  }

  const hasIncompleteReqs = documents.some(doc => 
    !doc.requirements.format || doc.requirements.mandatory === undefined
  );
  
  if (hasIncompleteReqs) {
    suggestions.push('Some requirements are incomplete. Try specifying format, size, and mandatory status.');
  }

  return {
    exam,
    source: 'text-input',
    extractedAt: new Date().toISOString(),
    documents,
    metadata: {
      method: 'text-parser',
      confidence: Math.min(confidence, 1.0),
      suggestions: suggestions.length > 0 ? suggestions : undefined
    }
  };
}

function parseRequirements(text: string, nextLines: string[]): ParsedDocument['requirements'] {
  const requirements: ParsedDocument['requirements'] = {};
  const allText = [text, ...nextLines].join(' ').toLowerCase();
  
  // Parse formats - very precise pattern matching for the current line only
  const currentLineText = text.toLowerCase();
  
  const formatPatterns = [
    // Pattern 1: "JPEG format" - format word after the file type
    /\b(jpeg|jpg|png|pdf|gif|doc|docx)\s+format\b/i,
    // Pattern 2: "JPG only" - only word after file type
    /\b(jpeg|jpg|png|pdf|gif|doc|docx)\s+only\b/i,
    // Pattern 3: "Format: JPEG" - format colon before file type
    /\bformat[:\s]+(jpeg|jpg|png|pdf|gif|doc|docx)\b/i,
    // Pattern 4: Combined formats "JPEG/JPG"
    /\b(jpeg\/jpg|jpg\/jpeg)\b/i
  ];

  const formats: string[] = [];
  
  // Only search in the current line text to avoid cross-contamination
  for (const pattern of formatPatterns) {
    const match = currentLineText.match(pattern);
    if (match && match[1]) {
      let format = match[1].toUpperCase();
      // Handle combined formats like "JPEG/JPG"
      if (format.includes('/')) {
        const splitFormats = format.split('/');
        splitFormats.forEach(f => {
          const trimmed = f.trim();
          if (trimmed && !formats.includes(trimmed)) {
            formats.push(trimmed);
          }
        });
      } else {
        if (!formats.includes(format)) {
          formats.push(format);
        }
      }
      break; // Stop at first match to avoid duplicates
    }
  }
  
  if (formats.length > 0) {
    requirements.format = formats;
  }

  // Parse sizes - enhanced to handle "Between X and Y" format and en-dash ranges
  const sizePatterns = [
    // Pattern for en-dash or hyphen ranges: "10KB–200KB" or "10KB-200KB"
    /(\d+(?:\.\d+)?)\s*(kb|mb|gb)\s*[–—-]\s*(\d+(?:\.\d+)?)\s*(kb|mb|gb)/i,
    /between\s*(\d+(?:\.\d+)?)\s*(kb|mb|gb)\s*(?:to|and)\s*(\d+(?:\.\d+)?)\s*(kb|mb|gb)/i,
    /(?:max|maximum)(?:\s*size)?[:\-\s]*(\d+(?:\.\d+)?)\s*(kb|mb|gb)/i,
    /(\d+(?:\.\d+)?)\s*(kb|mb|gb)\s*(?:max|maximum)/i,
    /(?:min|minimum)(?:\s*size)?[:\-\s]*(\d+(?:\.\d+)?)\s*(kb|mb|gb)/i,
    /around\s*(\d+(?:\.\d+)?)\s*(kb|mb|gb)/i,
  ];

  for (const pattern of sizePatterns) {
    const match = allText.match(pattern);
    if (match) {
      if (match[0] && (match[0].includes('–') || match[0].includes('—') || 
          (match[0].includes('-') && match[3] && match[4]))) {
        // Handle en-dash, em-dash, or hyphen range format: "10KB–200KB"
        if (match[1] && match[2] && match[3] && match[4]) {
          requirements.minSize = `${match[1]} ${match[2].toUpperCase()}`;
          requirements.maxSize = `${match[3]} ${match[4].toUpperCase()}`;
        }
        break;
      } else if (match[0] && match[0].toLowerCase().includes('between')) {
        // Handle "Between X and Y" format
        if (match[1] && match[2] && match[3] && match[4]) {
          requirements.minSize = `${match[1]} ${match[2].toUpperCase()}`;
          requirements.maxSize = `${match[3]} ${match[4].toUpperCase()}`;
        }
        break;
      } else if (match[0] && match[0].toLowerCase().includes('around')) {
        // Handle "Around X" format
        if (match[1] && match[2]) {
          requirements.maxSize = `${match[1]} ${match[2].toUpperCase()}`;
        }
        break;
      } else {
        if (match[1] && match[2]) {
          const size = `${match[1]} ${match[2].toUpperCase()}`;
          if (match[0] && match[0].toLowerCase().includes('max')) {
            requirements.maxSize = size;
          } else if (match[0] && match[0].toLowerCase().includes('min')) {
            requirements.minSize = size;
          } else {
            // Default to max if no specific indicator
            requirements.maxSize = size;
          }
        }
        break;
      }
    }
  }

  // Parse dimensions - enhanced to handle cm measurements
  const dimensionPatterns = [
    /(\d+(?:\.\d+)?)\s*cm\s*\(width\)\s*x\s*(\d+(?:\.\d+)?)\s*cm\s*\(height\)/i,
    /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)(?:\s*(px|pixels|mm|cm))?/i,
    /passport\s*size/i,
    /(\d+:\d+)\s*ratio/i,
  ];

  for (const pattern of dimensionPatterns) {
    const match = allText.match(pattern);
    if (match && match[0]) {
      if (match[0].toLowerCase().includes('passport')) {
        requirements.dimensions = { ratio: 'passport size' };
      } else if (match[0].includes(':') && match[1]) {
        requirements.dimensions = { ratio: match[1] };
      } else if (match[1] && match[2]) {
        let unit = (match[3] && match[3].trim()) || 'pixels';
        if (match[0].toLowerCase().includes('cm')) {
          unit = 'cm';
        }
        requirements.dimensions = {
          width: parseFloat(match[1]),
          height: parseFloat(match[2]),
          ratio: `${match[1]} x ${match[2]} ${unit}`
        };
      }
      break;
    }
  }

  // Parse mandatory status - enhanced to handle "Mandatory: Yes/No" format
  if (allText.includes('mandatory: yes') || allText.includes('mandatory:yes')) {
    requirements.mandatory = true;
  } else if (allText.includes('mandatory: no') || allText.includes('mandatory:no')) {
    requirements.mandatory = false;
  } else if (allText.includes('mandatory') || allText.includes('required') || allText.includes('compulsory')) {
    requirements.mandatory = true;
  } else if (allText.includes('optional') || allText.includes('if applicable') || allText.includes('not mandatory')) {
    requirements.mandatory = false;
  }

  // Extract description (remove parsed elements)
  let description = text;
  if (requirements.format) {
    description = description.replace(new RegExp(requirements.format.join('|'), 'gi'), '');
  }
  if (requirements.maxSize) {
    description = description.replace(/(?:max|maximum)[:\-\s]*\d+(?:\.\d+)?\s*(?:kb|mb|gb)/gi, '');
  }
  
  description = description
    .replace(/[,\-:;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
    
  if (description && description.length > 3) {
    requirements.description = description;
  }

  // Detect multiple file requirements and add subcategories for educational documents
  const combinedText = (text + ' ' + nextLines.join(' ')).toLowerCase();
  const documentType = text.toLowerCase();
  
  // First check for ID Proof subcategories (before checking for multiple files)
  // More flexible detection - check if it's any kind of ID/identity document
  if (documentType.includes('id') || documentType.includes('identity') || 
      (documentType.includes('proof') && 
       (combinedText.includes('aadhaar') || combinedText.includes('aadhar') ||
        combinedText.includes('pan') || combinedText.includes('passport') ||
        combinedText.includes('driving') || combinedText.includes('license')))) {
    
    requirements.allowMultiple = false; // Usually only one ID proof needed
    
    // Add subcategories for different ID proof options
    requirements.subcategories = [
      {
        id: 'aadhaar_card',
        label: 'Aadhaar Card',
        required: false,
        description: 'Government issued Aadhaar identity card'
      },
      {
        id: 'pan_card', 
        label: 'PAN Card',
        required: false,
        description: 'Permanent Account Number card'
      },
      {
        id: 'passport',
        label: 'Passport',
        required: false,
        description: 'Indian passport (any pages with photo and details)'
      },
      {
        id: 'driving_license',
        label: 'Driving License',
        required: false,
        description: 'Valid driving license issued by RTO'
      },
      {
        id: 'voter_id',
        label: 'Voter ID Card',
        required: false,
        description: 'Election Commission issued voter identity card'
      }
    ];
    
    return requirements;
  }
  
  // Check for indicators of multiple files - only in the current line/context
  const multipleFileIndicators = [
    /per file/i,
    /each file/i,
    /all .* certificates?/i,
    /multiple/i,
    /various/i,
    /different/i,
    /supporting/i
  ];
  
  const hasMultipleIndicator = multipleFileIndicators.some(pattern => 
    pattern.test(text) // Only check the current line, not all combined text
  );
  
  // Document type already declared above
  
  if (documentType.includes('educational') || documentType.includes('certificate') || 
      documentType.includes('qualification') || documentType.includes('degree')) {
    
    requirements.allowMultiple = true;
    requirements.maxFiles = 10; // Default reasonable limit
    requirements.minFiles = 1;
    
    // Add common subcategories for educational certificates
    requirements.subcategories = [
      {
        id: 'graduation_degree',
        label: 'Graduation Degree Certificate',
        required: true,
        description: 'Final degree certificate from university'
      },
      {
        id: 'graduation_marksheet',
        label: 'Graduation Mark Sheet',
        required: true,
        description: 'All semester/year mark sheets'
      },
      {
        id: 'intermediate_certificate',
        label: '12th/Intermediate Certificate',
        required: true,
        description: 'Higher secondary school certificate'
      },
      {
        id: 'matriculation_certificate',
        label: '10th/Matriculation Certificate', 
        required: true,
        description: 'Secondary school certificate'
      },
      {
        id: 'postgraduate_degree',
        label: 'Post Graduate Degree (if applicable)',
        required: false,
        description: 'Masters or higher degree certificates'
      },
      {
        id: 'professional_certificate',
        label: 'Professional Certificates (if any)',
        required: false,
        description: 'CA, CS, CMA or other professional qualifications'
      }
    ];
    
  } else if (documentType.includes('experience') || documentType.includes('work')) {
    
    requirements.allowMultiple = true;
    requirements.maxFiles = 5;
    requirements.minFiles = 0;
    
    requirements.subcategories = [
      {
        id: 'current_employer',
        label: 'Current Employment Certificate',
        required: false,
        description: 'Certificate from current employer'
      },
      {
        id: 'previous_employer',
        label: 'Previous Employment Certificates',
        required: false,
        description: 'Certificates from previous employers'
      },
      {
        id: 'experience_letter',
        label: 'Experience Letters',
        required: false,
        description: 'Detailed experience and salary certificates'
      }
    ];
    
  } else if (hasMultipleIndicator) {
    // Generic multiple file support
    requirements.allowMultiple = true;
    requirements.maxFiles = 5;
    requirements.minFiles = 1;
  }

  return requirements;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text input is required and must be a string' },
        { status: 400 }
      );
    }

    console.log(`\n🌐 ===============================================`);
    console.log(`🔍 BROWSER REQUEST - Text-to-JSON conversion`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`📝 Input length: ${text.length} characters`);
    console.log(`📄 First 100 chars: ${text.substring(0, 100)}...`);
    console.log(`🌐 ===============================================\n`);

    let result: TextToJsonResult;
    
    try {
      result = parseDocumentRequirements(text);
      console.log(`✅ Parsed ${result.documents.length} documents with confidence ${result.metadata.confidence}`);
    } catch (parseError) {
      console.error('❌ Parsing error:', parseError);
      console.error('❌ Error stack:', parseError instanceof Error ? parseError.stack : 'No stack trace');
      
      // Return a fallback result with helpful suggestions
      result = {
        source: 'text-input',
        extractedAt: new Date().toISOString(),
        documents: [],
        metadata: {
          method: 'text-parser',
          confidence: 0,
          suggestions: [
            '• No documents were detected. Try using formats like "Photo: JPEG, 50KB" or numbered lists.',
            '• Consider adding more document types like Photo, Signature, ID Proof, etc.',
            '• Ensure each document is on a separate line with clear format specifications.',
            `• Error details: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`
          ]
        }
      };
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Text-to-JSON API error:', error);

    const errorResult: TextToJsonResult = {
      source: 'text-input',
      extractedAt: new Date().toISOString(),
      documents: [],
      metadata: {
        method: 'text-parser',
        confidence: 0,
        suggestions: ['Server error occurred. Please try again or contact support.']
      }
    };

    return NextResponse.json(errorResult, { status: 200 });
  }
}

export async function GET() {
  console.log('📡 GET request to text-to-json API at:', new Date().toISOString());
  return NextResponse.json({
    message: 'Text-to-JSON Converter API',
    status: 'operational',
    timestamp: new Date().toISOString(),
    usage: {
      method: 'POST',
      endpoint: '/api/text-to-json',
      body: {
        text: 'string (required) - Text containing document requirements to parse'
      }
    },
    examples: [
      'Photo: JPEG format, max 50KB, passport size, mandatory',
      'Signature - JPG only, 30KB maximum, black ink required',
      '1. ID Proof: PDF format, 2MB max, Aadhaar/PAN acceptable'
    ]
  });
}

// Helper function to save parsed document (moved to separate save endpoint)
// This function is now available via POST /api/parsed-documents-fallback

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