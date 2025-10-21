/**
 * Universal Schema Format Normalizer
 * Handles format conversion for all dynamically parsed schemas
 */

export interface ParsedDocument {
  type: string;
  requirements: {
    format: string[];
    minSize: string;
    maxSize: string;
    mandatory: boolean;
    description: string;
  };
}

export interface ParsedSchema {
  id: string;
  examName: string;
  examType: string;
  source: string;
  parsedJson: {
    exam: string;
    documents: ParsedDocument[];
    extractedAt: string;
    source: string;
  };
}

/**
 * Normalize format array to proper MIME type
 */
export function normalizeSchemaFormat(format: string[] | string): string {
  if (Array.isArray(format)) {
    const firstFormat = format[0]?.toUpperCase();
    switch (firstFormat) {
      case 'PDF':
        return 'application/pdf';
      case 'JPG':
      case 'JPEG':
        return 'image/jpeg';
      case 'PNG':
        return 'image/png';
      default:
        console.warn(`Unknown format: ${firstFormat}, defaulting to image/jpeg`);
        return 'image/jpeg';
    }
  }
  
  // Already normalized string format
  return format;
}

/**
 * Parse size string to KB number
 */
export function parseSizeToKB(sizeString: string): number {
  const normalized = sizeString.toUpperCase().replace(/\s+/g, '');
  
  if (normalized.includes('KB')) {
    return parseInt(normalized.replace('KB', ''));
  }
  if (normalized.includes('MB')) {
    return parseInt(normalized.replace('MB', '')) * 1024;
  }
  if (normalized.includes('GB')) {
    return parseInt(normalized.replace('GB', '')) * 1024 * 1024;
  }
  
  // Default to KB if no unit specified
  return parseInt(normalized) || 100;
}

/**
 * Convert parsed schema to DocumentRequirement format
 */
export function convertParsedSchemaToRequirements(parsedSchema: ParsedSchema) {
  if (!parsedSchema.parsedJson?.documents) {
    throw new Error('Invalid parsed schema structure');
  }

  return parsedSchema.parsedJson.documents.map((doc, index) => ({
    id: `req_${index}`,
    type: doc.type,
    displayName: doc.type,
    description: doc.requirements.description,
    format: normalizeSchemaFormat(doc.requirements.format),
    maxSizeKB: parseSizeToKB(doc.requirements.maxSize),
    minSizeKB: parseSizeToKB(doc.requirements.minSize),
    mandatory: doc.requirements.mandatory,
    category: inferCategory(doc.type),
    aliases: generateAliases(doc.type)
  }));
}

/**
 * Infer document category from type
 */
function inferCategory(type: string): string {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('photo') || lowerType.includes('photograph')) {
    return 'photo';
  }
  if (lowerType.includes('signature') || lowerType.includes('sign')) {
    return 'signature';
  }
  if (lowerType.includes('id') || lowerType.includes('aadhaar') || lowerType.includes('passport')) {
    return 'identity';
  }
  if (lowerType.includes('marksheet') || lowerType.includes('certificate')) {
    return 'academic';
  }
  
  return 'document';
}

/**
 * Generate aliases for better matching
 */
function generateAliases(type: string): string[] {
  const lowerType = type.toLowerCase();
  const aliases: string[] = [];
  
  // Photo aliases
  if (lowerType.includes('photo')) {
    aliases.push('photograph', 'pic', 'image');
  }
  
  // ID Proof aliases  
  if (lowerType.includes('id')) {
    aliases.push('identity', 'aadhaar', 'passport', 'license', 'voter', 'pan');
  }
  
  // Signature aliases
  if (lowerType.includes('signature')) {
    aliases.push('sign', 'autograph');
  }
  
  // Academic document aliases
  if (lowerType.includes('marksheet')) {
    aliases.push('marks', 'result', 'scorecard');
  }
  if (lowerType.includes('certificate')) {
    aliases.push('cert', 'diploma');
  }
  
  return aliases;
}

/**
 * Create ExamSchema from parsed document
 */
export function convertParsedDocumentToExamSchema(parsedSchema: ParsedSchema) {
  return {
    examId: parsedSchema.id,
    examName: parsedSchema.examName,
    examType: parsedSchema.examType,
    version: '1.0.0',
    lastUpdated: new Date(parsedSchema.parsedJson.extractedAt),
    requirements: convertParsedSchemaToRequirements(parsedSchema),
    source: 'parsed-document',
    originalData: parsedSchema
  };
}