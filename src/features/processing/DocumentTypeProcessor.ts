/**
 * Document Type-Aware Processing System
 * Handles different document types with their specific requirements
 */

export interface DocumentTypeConfig {
  type: string;
  category: 'photo' | 'document' | 'certificate' | 'form';
  subTypes?: DocumentSubType[]; // Sub-type variations
  requirements: {
    // Size requirements
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    exactDimensions?: { width: number; height: number };
    
    // Quality requirements
    preserveOriginalSize?: boolean;
    minDPI?: number;
    compressionLevel?: 'none' | 'lossless' | 'minimal' | 'moderate' | 'high';
    outputFormat?: 'jpeg' | 'png' | 'original';
    jpegQuality?: number; // 0.1 - 1.0
    
    // Content preservation
    preserveText?: boolean;
    enhanceText?: boolean;
    preserveColors?: boolean;
    backgroundRemoval?: boolean;
    
    // File size limits
    maxFileSizeKB?: number;
    minFileSizeKB?: number;
  };
  validation: {
    aspectRatio?: number;
    tolerancePercent?: number;
    requiredElements?: string[];
  };
}

export interface DocumentSubType {
  subType: string;
  name: string;
  detectionPatterns: {
    textPatterns: RegExp[];
    keywords: string[];
    excludeKeywords?: string[];
    numberPatterns?: RegExp[];
    contextualClues?: string[];
  };
  specificRequirements?: {
    dimensions?: { width: number; height: number };
    maxSizeKB?: number;
    minSizeKB?: number;
    aspectRatio?: number;
  };
  confidence: {
    high: number; // Score threshold for high confidence
    medium: number; // Score threshold for medium confidence
  };
}

export interface DocumentSubTypeResult {
  subType: string;
  name: string;
  confidence: number;
  reasons: string[];
  suggestedProcessing?: string[];
}

export const DOCUMENT_TYPE_CONFIGS: Record<string, DocumentTypeConfig> = {
  // 1. PERSONAL ID DOCUMENTS (Aadhaar, Voter ID, Passport, Driving License, PAN Card, etc.)
  'personal_id_document': {
    type: 'personal_id_document',
    category: 'document',
    subTypes: [
      {
        subType: 'aadhaar_card',
        name: 'Aadhaar Card',
        detectionPatterns: {
          textPatterns: [
            /\b\d{4}\s\d{4}\s\d{4}\b/, // Aadhaar number pattern
            /(?:आधार|AADHAAR|Aadhaar)/i,
            /(?:भारत सरकार|Government of India)/i
          ],
          keywords: ['aadhaar', 'aadhar', 'uid', 'unique identification'],
          numberPatterns: [/\b\d{4}\s\d{4}\s\d{4}\b/],
          contextualClues: ['date of birth', 'address', 'biometric']
        },
        specificRequirements: {
          aspectRatio: 1.6, // Standard Aadhaar ratio
          maxSizeKB: 2048
        },
        confidence: { high: 0.9, medium: 0.7 }
      },
      {
        subType: 'pan_card',
        name: 'PAN Card',
        detectionPatterns: {
          textPatterns: [
            /[A-Z]{5}\d{4}[A-Z]/i, // PAN number pattern
            /(?:INCOME TAX DEPARTMENT|PERMANENT ACCOUNT NUMBER)/i
          ],
          keywords: ['pan', 'permanent account number', 'income tax department'],
          numberPatterns: [/[A-Z]{5}\d{4}[A-Z]/i],
          contextualClues: ['father name', 'signature', 'tax']
        },
        confidence: { high: 0.9, medium: 0.7 }
      },
      {
        subType: 'voter_id',
        name: 'Voter ID Card',
        detectionPatterns: {
          textPatterns: [
            /(?:ELECTION COMMISSION|VOTER|EPIC|ELECTORAL)/i,
            /(?:IDENTITY CARD|VOTER ID)/i
          ],
          keywords: ['election commission', 'voter', 'epic', 'electoral'],
          contextualClues: ['assembly constituency', 'polling station']
        },
        confidence: { high: 0.9, medium: 0.7 }
      },
      {
        subType: 'passport',
        name: 'Passport',
        detectionPatterns: {
          textPatterns: [
            /(?:PASSPORT|REPUBLIC OF INDIA)/i,
            /(?:Type|Code|Country Code)/i
          ],
          keywords: ['passport', 'republic of india', 'travel document'],
          numberPatterns: [/[A-Z]\d{7}/], // Indian passport format
          contextualClues: ['place of birth', 'nationality', 'valid until']
        },
        confidence: { high: 0.9, medium: 0.7 }
      },
      {
        subType: 'driving_license',
        name: 'Driving License',
        detectionPatterns: {
          textPatterns: [
            /(?:DRIVING LICENCE|MOTOR VEHICLE|TRANSPORT)/i,
            /(?:LICENSE|LICENCE)/i
          ],
          keywords: ['driving licence', 'motor vehicle', 'transport', 'license'],
          contextualClues: ['vehicle class', 'valid till', 'endorsement']
        },
        confidence: { high: 0.9, medium: 0.7 }
      }
    ],
    requirements: {
      preserveOriginalSize: true,
      compressionLevel: 'minimal',
      outputFormat: 'png',
      preserveText: true,
      preserveColors: true,
      maxFileSizeKB: 2048
    },
    validation: {
      aspectRatio: 85.6/53.98, // Standard ID card ratio
      tolerancePercent: 15,
      requiredElements: ['photo', 'text']
    }
  },

  // 2. PHOTOGRAPHS (Passport Size, Postcard Size, etc.)
  'photograph': {
    type: 'photograph',
    category: 'photo',
    subTypes: [
      {
        subType: 'passport_size_photo',
        name: 'Passport Size Photo',
        detectionPatterns: {
          textPatterns: [],
          keywords: ['passport size', 'passport photo'],
          contextualClues: ['face', 'white background', 'formal']
        },
        specificRequirements: {
          dimensions: { width: 413, height: 531 }, // 35x45mm at 300 DPI
          aspectRatio: 35/45,
          maxSizeKB: 1024
        },
        confidence: { high: 0.8, medium: 0.6 }
      },
      {
        subType: 'postcard_size_photo',
        name: 'Postcard Size Photo',
        detectionPatterns: {
          textPatterns: [],
          keywords: ['postcard size', 'stamp size'],
          contextualClues: ['face', 'background']
        },
        specificRequirements: {
          dimensions: { width: 138, height: 167 }, // 3.5x4.5cm at 100 DPI
          aspectRatio: 3.5/4.5,
          maxSizeKB: 300
        },
        confidence: { high: 0.8, medium: 0.6 }
      },
      {
        subType: 'stamp_size_photo',
        name: 'Stamp Size Photo',
        detectionPatterns: {
          textPatterns: [],
          keywords: ['stamp size', 'small photo'],
          contextualClues: ['face', 'compact']
        },
        specificRequirements: {
          dimensions: { width: 118, height: 157 }, // 3x4cm at 100 DPI
          aspectRatio: 3/4,
          maxSizeKB: 100
        },
        confidence: { high: 0.8, medium: 0.6 }
      }
    ],
    requirements: {
      compressionLevel: 'minimal',
      outputFormat: 'jpeg',
      jpegQuality: 0.95,
      preserveColors: true,
      maxFileSizeKB: 1024,
      minFileSizeKB: 20
    },
    validation: {
      aspectRatio: 3/4, // Common photo ratio
      tolerancePercent: 25, // Flexible for different photo sizes
      requiredElements: ['face']
    }
  },

  // 3. SIGNATURE
  'signature': {
    type: 'signature',
    category: 'photo',
    requirements: {
      maxWidth: 600,
      maxHeight: 200,
      compressionLevel: 'lossless',
      outputFormat: 'png',
      backgroundRemoval: true,
      preserveColors: false, // Convert to black/white
      maxFileSizeKB: 100
    },
    validation: {
      aspectRatio: 3/1,
      tolerancePercent: 50 // Signatures can vary a lot
    }
  },

  // 4. EDUCATION QUALIFICATION CERTIFICATES (10th, 12th, Graduation, PG, Diploma/ITI)
  'education_certificate': {
    type: 'education_certificate',
    category: 'certificate',
    subTypes: [
      {
        subType: 'class_10_marksheet',
        name: '10th Class Marksheet',
        detectionPatterns: {
          textPatterns: [
            /\b(?:10th|tenth|X|class\s*10)\b/i,
            /\b(?:secondary|matriculation)\b/i,
            /\b(?:10|X)\s*(?:th|class|standard|std)\b/i
          ],
          keywords: ['10th', 'tenth', 'class 10', 'standard 10', 'matriculation', 'secondary'],
          excludeKeywords: ['12th', 'twelfth', 'intermediate', 'senior secondary'],
          contextualClues: ['marks obtained', 'total marks', 'percentage', 'grade']
        },
        confidence: { high: 0.8, medium: 0.6 }
      },
      {
        subType: 'class_12_marksheet',
        name: '12th Class Marksheet',
        detectionPatterns: {
          textPatterns: [
            /\b(?:12th|twelfth|XII|class\s*12)\b/i,
            /\b(?:intermediate|senior\s*secondary|higher\s*secondary)\b/i,
            /\b(?:12|XII)\s*(?:th|class|standard|std)\b/i
          ],
          keywords: ['12th', 'twelfth', 'class 12', 'standard 12', 'intermediate', 'senior secondary', 'higher secondary'],
          excludeKeywords: ['10th', 'tenth', 'matriculation'],
          contextualClues: ['physics', 'chemistry', 'mathematics', 'biology', 'commerce', 'arts']
        },
        confidence: { high: 0.8, medium: 0.6 }
      },
      {
        subType: 'graduation_certificate',
        name: 'Graduation Certificate',
        detectionPatterns: {
          textPatterns: [
            /\b(?:bachelor|graduation|degree|B\.?A\.?|B\.?Sc\.?|B\.?Com\.?|B\.?Tech\.?|B\.?E\.?)\b/i,
            /\b(?:undergraduate|UG)\b/i
          ],
          keywords: ['bachelor', 'graduation', 'degree', 'BA', 'BSc', 'BCom', 'BTech', 'BE', 'undergraduate'],
          excludeKeywords: ['master', 'postgraduate', 'PhD', 'doctorate'],
          contextualClues: ['university', 'college', 'semester', 'cgpa']
        },
        confidence: { high: 0.8, medium: 0.6 }
      },
      {
        subType: 'postgraduate_certificate',
        name: 'Post-Graduate Certificate',
        detectionPatterns: {
          textPatterns: [
            /\b(?:master|postgraduate|M\.?A\.?|M\.?Sc\.?|M\.?Com\.?|M\.?Tech\.?|MBA|MCA)\b/i,
            /\b(?:PG|post\s*graduate)\b/i
          ],
          keywords: ['master', 'postgraduate', 'MA', 'MSc', 'MCom', 'MTech', 'MBA', 'MCA', 'PG'],
          excludeKeywords: ['bachelor', 'undergraduate', 'PhD', 'doctorate'],
          contextualClues: ['specialization', 'thesis', 'dissertation']
        },
        confidence: { high: 0.8, medium: 0.6 }
      },
      {
        subType: 'diploma_certificate',
        name: 'Diploma Certificate',
        detectionPatterns: {
          textPatterns: [
            /\b(?:diploma|polytechnic|ITI|industrial\s*training)\b/i,
            /\b(?:technical|vocational)\s*(?:education|training)\b/i
          ],
          keywords: ['diploma', 'polytechnic', 'ITI', 'industrial training', 'technical education', 'vocational'],
          excludeKeywords: ['degree', 'bachelor', 'master'],
          contextualClues: ['trade', 'skill', 'technical', 'practical']
        },
        confidence: { high: 0.8, medium: 0.6 }
      }
    ],
    requirements: {
      preserveOriginalSize: true,
      minDPI: 300,
      compressionLevel: 'lossless',
      outputFormat: 'png',
      preserveText: true,
      enhanceText: true,
      maxFileSizeKB: 5120 // 5MB max for certificates
    },
    validation: {
      requiredElements: ['text', 'official_seal']
    }
  },

  // 5. CASTE & CATEGORY CERTIFICATES (SC/ST/OBC/EWS, non-creamy layer)
  'caste_category_certificate': {
    type: 'caste_category_certificate',
    category: 'certificate',
    subTypes: [
      {
        subType: 'sc_certificate',
        name: 'Scheduled Caste Certificate',
        detectionPatterns: {
          textPatterns: [
            /\b(?:SC|SCHEDULED CASTE)\b/i,
            /\b(?:अनुसूचित जाति)\b/i
          ],
          keywords: ['scheduled caste', 'sc', 'अनुसूचित जाति'],
          excludeKeywords: ['st', 'obc', 'ews', 'scheduled tribe', 'other backward'],
          contextualClues: ['caste certificate', 'government', 'district']
        },
        confidence: { high: 0.9, medium: 0.7 }
      },
      {
        subType: 'st_certificate',
        name: 'Scheduled Tribe Certificate',
        detectionPatterns: {
          textPatterns: [
            /\b(?:ST|SCHEDULED TRIBE)\b/i,
            /\b(?:अनुसूचित जनजाति)\b/i
          ],
          keywords: ['scheduled tribe', 'st', 'अनुसूचित जनजाति'],
          excludeKeywords: ['sc', 'obc', 'ews', 'scheduled caste', 'other backward'],
          contextualClues: ['tribe certificate', 'government', 'district']
        },
        confidence: { high: 0.9, medium: 0.7 }
      },
      {
        subType: 'obc_certificate',
        name: 'Other Backward Class Certificate',
        detectionPatterns: {
          textPatterns: [
            /\b(?:OBC|OTHER BACKWARD CLASS)\b/i,
            /\b(?:अन्य पिछड़ा वर्ग)\b/i
          ],
          keywords: ['other backward class', 'obc', 'अन्य पिछड़ा वर्ग'],
          excludeKeywords: ['sc', 'st', 'ews', 'scheduled'],
          contextualClues: ['backward class', 'non-creamy layer', 'creamy layer']
        },
        confidence: { high: 0.9, medium: 0.7 }
      },
      {
        subType: 'ews_certificate',
        name: 'Economically Weaker Section Certificate',
        detectionPatterns: {
          textPatterns: [
            /\b(?:EWS|ECONOMICALLY WEAKER SECTION)\b/i,
            /\b(?:आर्थिक रूप से कमजोर वर्ग)\b/i
          ],
          keywords: ['economically weaker section', 'ews', 'आर्थिक रूप से कमजोर वर्ग'],
          excludeKeywords: ['sc', 'st', 'obc', 'scheduled'],
          contextualClues: ['income certificate', 'economically weaker', 'annual income']
        },
        confidence: { high: 0.9, medium: 0.7 }
      }
    ],
    requirements: {
      preserveOriginalSize: true,
      minDPI: 300,
      compressionLevel: 'lossless',
      outputFormat: 'png',
      preserveText: true,
      enhanceText: true,
      maxFileSizeKB: 3072
    },
    validation: {
      requiredElements: ['text', 'official_seal', 'signature']
    }
  },

  // 6. DOMICILE/RESIDENCE CERTIFICATE
  'domicile_certificate': {
    type: 'domicile_certificate',
    category: 'certificate',
    requirements: {
      preserveOriginalSize: true,
      minDPI: 300,
      compressionLevel: 'lossless',
      outputFormat: 'png',
      preserveText: true,
      enhanceText: true,
      maxFileSizeKB: 3072
    },
    validation: {
      requiredElements: ['text', 'official_seal', 'signature']
    }
  },

  // 7. DISABILITY CERTIFICATE
  'disability_certificate': {
    type: 'disability_certificate',
    category: 'certificate',
    requirements: {
      preserveOriginalSize: true,
      minDPI: 300,
      compressionLevel: 'lossless',
      outputFormat: 'png',
      preserveText: true,
      enhanceText: true,
      maxFileSizeKB: 3072
    },
    validation: {
      requiredElements: ['text', 'official_seal', 'signature']
    }
  },

  // 8. OTHER SPECIAL DOCUMENTS (Migration, Transfer, Character, Work-Experience, NOC, etc.)
  'special_document': {
    type: 'special_document',
    category: 'document',
    requirements: {
      preserveOriginalSize: true,
      minDPI: 200,
      compressionLevel: 'lossless',
      outputFormat: 'png',
      preserveText: true,
      enhanceText: true,
      maxFileSizeKB: 3072
    },
    validation: {
      requiredElements: ['text']
    }
  },

  // GENERIC DOCUMENT (fallback)
  'document': {
    type: 'document',
    category: 'document',
    requirements: {
      preserveOriginalSize: true,
      compressionLevel: 'minimal',
      outputFormat: 'original',
      preserveText: true,
      maxFileSizeKB: 2048
    },
    validation: {}
  },

  // UNKNOWN DOCUMENT (requires AI analysis)
  'unknown_document': {
    type: 'unknown_document',
    category: 'document',
    requirements: {
      preserveOriginalSize: true,
      compressionLevel: 'minimal',
      outputFormat: 'original',
      preserveText: true,
      maxFileSizeKB: 2048
    },
    validation: {}
  }
};

/**
 * Intelligent document type detection based on filename and content
 * This should only be used as a rough initial guess - real detection happens in AI verification
 */
export function detectDocumentType(filename: string, fileSize?: number): string {
  const name = filename.toLowerCase();
  
  // 1. Personal ID Documents
  if (name.includes('aadhar') || name.includes('aadhaar') ||
      name.includes('voter') || name.includes('passport') ||
      name.includes('driving') || name.includes('pan') ||
      (name.includes('id') && name.includes('card'))) {
    return 'personal_id_document';
  }
  
  // 2. Photographs
  if ((name.includes('photo') || name.includes('image') || name.includes('pic')) &&
      !name.includes('certificate') && !name.includes('document')) {
    return 'photograph';
  }
  
  // 3. Signature
  if (name.includes('signature') || name.includes('sign')) {
    return 'signature';
  }
  
  // 4. Education Qualification Certificates
  if (name.includes('marksheet') || name.includes('mark_sheet') ||
      (name.includes('certificate') && (name.includes('10') || name.includes('12') || name.includes('graduation') || name.includes('degree'))) ||
      name.includes('diploma') || name.includes('iti')) {
    return 'education_certificate';
  }
  
  // 5. Caste & Category Certificates
  if (name.includes('caste') || name.includes('category') ||
      name.includes('sc') || name.includes('st') || name.includes('obc') || name.includes('ews') ||
      name.includes('creamy') || name.includes('non-creamy')) {
    return 'caste_category_certificate';
  }
  
  // 6. Domicile/Residence Certificate
  if (name.includes('domicile') || name.includes('residence') ||
      (name.includes('address') && name.includes('proof'))) {
    return 'domicile_certificate';
  }
  
  // 7. Disability Certificate
  if (name.includes('disability') || name.includes('handicap') ||
      name.includes('pwd') || name.includes('divyang')) {
    return 'disability_certificate';
  }
  
  // 8. Other Special Documents
  if (name.includes('migration') || name.includes('transfer') ||
      name.includes('character') || name.includes('experience') ||
      name.includes('noc') || name.includes('no objection')) {
    return 'special_document';
  }
  
  // Default fallback - let AI determine the actual type
  return 'document';
}

/**
 * Get processing configuration for a document type
 */
export function getDocumentConfig(documentType: string): DocumentTypeConfig {
  return DOCUMENT_TYPE_CONFIGS[documentType] || DOCUMENT_TYPE_CONFIGS['document'];
}

/**
 * Validate if a file meets the requirements for a document type
 */
export function validateDocumentRequirements(
  file: File, 
  documentType: string
): { valid: boolean; issues: string[]; recommendations: string[] } {
  const config = getDocumentConfig(documentType);
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  const fileSizeKB = Math.round(file.size / 1024);
  
  // File size validation
  if (config.requirements.maxFileSizeKB && fileSizeKB > config.requirements.maxFileSizeKB) {
    issues.push(`File size (${fileSizeKB}KB) exceeds maximum (${config.requirements.maxFileSizeKB}KB)`);
    recommendations.push('Compress the image or reduce quality');
  }
  
  if (config.requirements.minFileSizeKB && fileSizeKB < config.requirements.minFileSizeKB) {
    issues.push(`File size (${fileSizeKB}KB) is below minimum (${config.requirements.minFileSizeKB}KB)`);
    recommendations.push('Use higher quality or resolution');
  }
  
  // Format validation
  if (config.requirements.outputFormat && config.requirements.outputFormat !== 'original') {
    const expectedFormat = config.requirements.outputFormat;
    if (!file.type.includes(expectedFormat)) {
      recommendations.push(`Consider using ${expectedFormat.toUpperCase()} format for better quality`);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Detect sub-type of a document based on text content and metadata
 */
export function detectDocumentSubType(
  documentType: string,
  extractedText: string[],
  fileMetadata: { size: number; width?: number; height?: number }
): DocumentSubTypeResult | null {
  const config = getDocumentConfig(documentType);
  
  if (!config.subTypes || config.subTypes.length === 0) {
    return null;
  }
  
  const allText = extractedText.join(' ').toLowerCase();
  const results: Array<DocumentSubTypeResult> = [];
  
  for (const subType of config.subTypes) {
    let score = 0;
    const reasons: string[] = [];
    const suggestedProcessing: string[] = [];
    
    // Text pattern matching
    const textMatches = subType.detectionPatterns.textPatterns.filter(pattern => 
      pattern.test(allText)
    ).length;
    
    if (textMatches > 0) {
      const textScore = (textMatches / subType.detectionPatterns.textPatterns.length) * 0.4;
      score += textScore;
      reasons.push(`Text patterns matched: ${textMatches}/${subType.detectionPatterns.textPatterns.length}`);
    }
    
    // Keyword matching
    const keywordMatches = subType.detectionPatterns.keywords.filter(keyword =>
      allText.includes(keyword.toLowerCase())
    ).length;
    
    if (keywordMatches > 0) {
      const keywordScore = Math.min(keywordMatches / subType.detectionPatterns.keywords.length, 1) * 0.3;
      score += keywordScore;
      reasons.push(`Keywords found: ${keywordMatches}/${subType.detectionPatterns.keywords.length}`);
    }
    
    // Exclude keyword penalty
    if (subType.detectionPatterns.excludeKeywords) {
      const excludeMatches = subType.detectionPatterns.excludeKeywords.filter(keyword =>
        allText.includes(keyword.toLowerCase())
      ).length;
      
      if (excludeMatches > 0) {
        score -= 0.2; // Penalty for exclusion keywords
        reasons.push(`Exclusion keywords found: ${excludeMatches} (penalty applied)`);
      }
    }
    
    // Number pattern matching
    if (subType.detectionPatterns.numberPatterns) {
      const numberMatches = subType.detectionPatterns.numberPatterns.filter(pattern =>
        pattern.test(allText)
      ).length;
      
      if (numberMatches > 0) {
        score += 0.2;
        reasons.push(`Number patterns matched: ${numberMatches}`);
      }
    }
    
    // Contextual clues
    if (subType.detectionPatterns.contextualClues) {
      const contextMatches = subType.detectionPatterns.contextualClues.filter(clue =>
        allText.includes(clue.toLowerCase())
      ).length;
      
      if (contextMatches > 0) {
        const contextScore = Math.min(contextMatches / subType.detectionPatterns.contextualClues.length, 1) * 0.1;
        score += contextScore;
        reasons.push(`Contextual clues found: ${contextMatches}/${subType.detectionPatterns.contextualClues.length}`);
      }
    }
    
    // Dimensional validation (if available)
    if (subType.specificRequirements && fileMetadata.width && fileMetadata.height) {
      if (subType.specificRequirements.dimensions) {
        const targetWidth = subType.specificRequirements.dimensions.width;
        const targetHeight = subType.specificRequirements.dimensions.height;
        const actualRatio = fileMetadata.width / fileMetadata.height;
        const targetRatio = targetWidth / targetHeight;
        
        const ratioDifference = Math.abs(actualRatio - targetRatio) / targetRatio;
        
        if (ratioDifference < 0.1) { // Within 10% tolerance
          score += 0.15;
          reasons.push(`Dimension ratio matches expected (${actualRatio.toFixed(2)} vs ${targetRatio.toFixed(2)})`);
          suggestedProcessing.push(`Resize to standard ${targetWidth}x${targetHeight} pixels`);
        } else {
          reasons.push(`Dimension ratio mismatch (${actualRatio.toFixed(2)} vs ${targetRatio.toFixed(2)})`);
        }
      }
      
      if (subType.specificRequirements.aspectRatio) {
        const actualRatio = fileMetadata.width / fileMetadata.height;
        const expectedRatio = subType.specificRequirements.aspectRatio;
        const ratioDifference = Math.abs(actualRatio - expectedRatio) / expectedRatio;
        
        if (ratioDifference < 0.15) { // Within 15% tolerance
          score += 0.1;
          reasons.push(`Aspect ratio matches (${actualRatio.toFixed(2)} vs ${expectedRatio.toFixed(2)})`);
        }
      }
    }
    
    // File size validation
    if (subType.specificRequirements) {
      const fileSizeKB = Math.round(fileMetadata.size / 1024);
      
      if (subType.specificRequirements.maxSizeKB && fileSizeKB <= subType.specificRequirements.maxSizeKB) {
        score += 0.05;
        reasons.push(`File size within expected range (${fileSizeKB}KB <= ${subType.specificRequirements.maxSizeKB}KB)`);
      }
      
      if (subType.specificRequirements.minSizeKB && fileSizeKB >= subType.specificRequirements.minSizeKB) {
        score += 0.05;
        reasons.push(`File size above minimum (${fileSizeKB}KB >= ${subType.specificRequirements.minSizeKB}KB)`);
      }
    }
    
    // Add processing suggestions based on sub-type
    addProcessingSuggestions(subType, suggestedProcessing, fileMetadata);
    
    // Determine confidence level
    let confidence: number;
    if (score >= subType.confidence.high) {
      confidence = Math.min(score, 1.0);
    } else if (score >= subType.confidence.medium) {
      confidence = score * 0.8; // Reduce confidence for medium matches
    } else {
      confidence = score * 0.5; // Low confidence
    }
    
    if (score > 0.1) { // Only include if there's some evidence
      results.push({
        subType: subType.subType,
        name: subType.name,
        confidence,
        reasons,
        suggestedProcessing
      });
    }
  }
  
  // Return the highest confidence result
  if (results.length === 0) {
    return null;
  }
  
  return results.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );
}

/**
 * Add processing suggestions based on detected sub-type
 */
function addProcessingSuggestions(
  subType: DocumentSubType,
  suggestions: string[],
  fileMetadata: { size: number; width?: number; height?: number }
): void {
  switch (subType.subType) {
    case 'class_10_marksheet':
    case 'class_12_marksheet':
      suggestions.push('Enhance text clarity for mark verification');
      suggestions.push('Preserve original dimensions for authenticity');
      suggestions.push('Use lossless compression to maintain seal quality');
      break;
      
    case 'graduation_certificate':
    case 'postgraduate_certificate':
      suggestions.push('High-resolution scan recommended (300+ DPI)');
      suggestions.push('Preserve watermarks and embossed seals');
      suggestions.push('Color preservation for university logos');
      break;
      
    case 'diploma_certificate':
      suggestions.push('Enhance technical drawing clarity if present');
      suggestions.push('Preserve trade-specific formatting');
      break;
      
    case 'aadhaar_card':
      suggestions.push('Preserve QR code integrity');
      suggestions.push('Maintain photo quality for verification');
      suggestions.push('Ensure number visibility');
      break;
      
    case 'pan_card':
      suggestions.push('Enhance signature visibility');
      suggestions.push('Preserve holographic elements');
      break;
      
    case 'passport_size_photo':
      suggestions.push('Resize to 35x45mm (413x531 pixels at 300 DPI)');
      suggestions.push('Ensure white/light background');
      suggestions.push('Compress to under 1MB while maintaining quality');
      break;
      
    case 'postcard_size_photo':
      suggestions.push('Resize to 3.5x4.5cm (138x167 pixels at 100 DPI)');
      suggestions.push('Optimize for smaller file size (under 300KB)');
      break;
      
    case 'stamp_size_photo':
      suggestions.push('Resize to 3x4cm (118x157 pixels at 100 DPI)');
      suggestions.push('Compress to under 100KB');
      break;
      
    default:
      suggestions.push('Apply standard document processing');
  }
}

/**
 * Get enhanced document information including sub-type analysis
 */
export function getEnhancedDocumentInfo(
  documentType: string,
  extractedText: string[],
  fileMetadata: { size: number; width?: number; height?: number }
): {
  config: DocumentTypeConfig;
  subTypeResult: DocumentSubTypeResult | null;
  processingRecommendations: string[];
} {
  const config = getDocumentConfig(documentType);
  const subTypeResult = detectDocumentSubType(documentType, extractedText, fileMetadata);
  
  const processingRecommendations: string[] = [];
  
  // Add general processing recommendations
  if (config.category === 'certificate') {
    processingRecommendations.push('Preserve original quality for legal validity');
    processingRecommendations.push('Maintain all seals and signatures');
  } else if (config.category === 'photo') {
    processingRecommendations.push('Optimize for specific photo requirements');
    processingRecommendations.push('Ensure proper aspect ratio');
  } else if (config.category === 'document') {
    processingRecommendations.push('Enhance text readability');
    processingRecommendations.push('Preserve identifying marks and numbers');
  }
  
  // Add sub-type specific recommendations
  if (subTypeResult && subTypeResult.suggestedProcessing) {
    processingRecommendations.push(...subTypeResult.suggestedProcessing);
  }
  
  return {
    config,
    subTypeResult,
    processingRecommendations
  };
}