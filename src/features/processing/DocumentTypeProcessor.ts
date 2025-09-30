/**
 * Document Type-Aware Processing System
 * Handles different document types with their specific requirements
 */

export interface DocumentTypeConfig {
  type: string;
  category: 'photo' | 'document' | 'certificate' | 'form';
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

export const DOCUMENT_TYPE_CONFIGS: Record<string, DocumentTypeConfig> = {
  // PASSPORT PHOTOS
  'passport_photo': {
    type: 'passport_photo',
    category: 'photo',
    requirements: {
      exactDimensions: { width: 413, height: 531 }, // 35x45mm at 300 DPI
      compressionLevel: 'minimal',
      outputFormat: 'jpeg',
      jpegQuality: 0.95,
      preserveColors: true,
      maxFileSizeKB: 1024,
      minFileSizeKB: 50
    },
    validation: {
      aspectRatio: 35/45,
      tolerancePercent: 5,
      requiredElements: ['face', 'white_background']
    }
  },

  // UPSC PHOTO
  'upsc_photo': {
    type: 'upsc_photo',
    category: 'photo',
    requirements: {
      exactDimensions: { width: 138, height: 167 }, // 3.5x4.5cm at 100 DPI
      compressionLevel: 'moderate',
      outputFormat: 'jpeg',
      jpegQuality: 0.85,
      preserveColors: true,
      maxFileSizeKB: 300,
      minFileSizeKB: 20
    },
    validation: {
      aspectRatio: 3.5/4.5,
      tolerancePercent: 3
    }
  },

  // SSC PHOTO
  'ssc_photo': {
    type: 'ssc_photo',
    category: 'photo',
    requirements: {
      exactDimensions: { width: 118, height: 157 }, // 3x4cm at 100 DPI
      compressionLevel: 'moderate',
      outputFormat: 'jpeg',
      jpegQuality: 0.80,
      maxFileSizeKB: 100,
      minFileSizeKB: 15
    },
    validation: {
      aspectRatio: 3/4,
      tolerancePercent: 5
    }
  },

  // MARKSHEETS & CERTIFICATES
  'marksheet': {
    type: 'marksheet',
    category: 'certificate',
    requirements: {
      preserveOriginalSize: true,
      minDPI: 300,
      compressionLevel: 'lossless',
      outputFormat: 'png',
      preserveText: true,
      enhanceText: true,
      maxFileSizeKB: 5120 // 5MB max
    },
    validation: {
      requiredElements: ['text', 'official_seal']
    }
  },

  // ID CARDS
  'aadhar_card': {
    type: 'aadhar_card',
    category: 'document',
    requirements: {
      preserveOriginalSize: true,
      compressionLevel: 'minimal',
      outputFormat: 'png',
      preserveText: true,
      preserveColors: true,
      maxFileSizeKB: 2048
    },
    validation: {
      aspectRatio: 85.6/53.98, // Credit card ratio
      tolerancePercent: 10,
      requiredElements: ['photo', 'text', 'qr_code']
    }
  },

  // PAN CARD
  'pan_card': {
    type: 'pan_card',
    category: 'document',
    requirements: {
      preserveOriginalSize: true,
      compressionLevel: 'minimal',
      outputFormat: 'png',
      preserveText: true,
      preserveColors: true,
      maxFileSizeKB: 1024
    },
    validation: {
      aspectRatio: 85.6/53.98,
      tolerancePercent: 10,
      requiredElements: ['photo', 'signature', 'pan_number']
    }
  },

  // APPLICATION FORMS
  'application_form': {
    type: 'application_form',
    category: 'form',
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
      requiredElements: ['form_fields', 'signature']
    }
  },

  // SIGNATURES
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
  
  // Only detect if filename has VERY specific indicators
  // Photo detection - only if explicitly mentioned
  if (name.includes('passport') && (name.includes('photo') || name.includes('image'))) return 'passport_photo';
  if (name.includes('upsc') && (name.includes('photo') || name.includes('image'))) return 'upsc_photo';
  if (name.includes('ssc') && (name.includes('photo') || name.includes('image'))) return 'ssc_photo';
  
  // ID Cards - only if explicitly mentioned
  if (name.includes('aadhar') || name.includes('aadhaar')) return 'aadhar_card';
  if (name.includes('pan') && name.includes('card')) return 'pan_card';
  
  // Educational documents - only if explicitly mentioned
  if (name.includes('marksheet') || name.includes('mark_sheet') || name.includes('marks')) return 'marksheet';
  if (name.includes('certificate')) return 'marksheet';
  if (name.includes('transcript') || name.includes('grade')) return 'marksheet';
  if (name.includes('degree') || name.includes('diploma')) return 'degree_certificate';
  
  // Exam documents - only if explicitly mentioned
  if (name.includes('admit') && name.includes('card')) {
    if (name.includes('upsc')) return 'upsc_admit_card';
    if (name.includes('ssc')) return 'ssc_admit_card';
    return 'application_form';
  }
  
  // Forms - only if explicitly mentioned
  if (name.includes('application') && name.includes('form')) return 'application_form';
  if (name.includes('signature') || name.includes('sign')) return 'signature';
  
  // Default fallback - let AI determine the actual type
  return 'unknown_document'; // Changed from wrong size-based detection
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