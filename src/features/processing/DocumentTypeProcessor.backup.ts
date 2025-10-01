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
  // 1. PERSONAL ID DOCUMENTS
  'personal_id_document': {
    type: 'personal_id_document',
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
      aspectRatio: 85.6/53.98, // Standard ID card ratio
      tolerancePercent: 15,
      requiredElements: ['photo', 'text']
    }
  },

  // 2. PHOTOGRAPHS
  'photograph': {
    type: 'photograph',
    category: 'photo',
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

  // 4. EDUCATION QUALIFICATION CERTIFICATES
  'education_certificate': {
    type: 'education_certificate',
    category: 'certificate',
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

  // 5. CASTE & CATEGORY CERTIFICATES
  'caste_category_certificate': {
    type: 'caste_category_certificate',
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

  // 8. OTHER SPECIAL DOCUMENTS
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
      name.includes('id') && name.includes('card')) {
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
      name.includes('certificate') && (name.includes('10') || name.includes('12') || name.includes('graduation') || name.includes('degree')) ||
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
      name.includes('address') && name.includes('proof')) {
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