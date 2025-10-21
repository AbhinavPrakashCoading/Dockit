/**
 * Schema Configuration Extensions
 * 
 * Adds processing configuration support to exam schemas for per-exam 
 * configuration overrides and specialized processing requirements.
 */

import { setProcessingConfig, resetProcessingConfig, ProcessingConfig } from './processingConfig';

// Define more flexible partial types for schema configs
export interface PartialQualitySettings {
  signature?: {
    min?: number;
    max?: number;
    priority?: 'quality' | 'size' | 'balanced';
  };
  photo?: {
    min?: number;
    max?: number;
    priority?: 'quality' | 'size' | 'balanced';
  };
  document?: {
    min?: number;
    max?: number;
    priority?: 'quality' | 'size' | 'balanced';
  };
  default?: {
    min?: number;
    max?: number;
    priority?: 'quality' | 'size' | 'balanced';
  };
}

export interface PartialCompressionSettings {
  maxAttempts?: {
    tight?: number;
    medium?: number;
    wide?: number;
    veryWide?: number;
  };
  minDimensionsForSignature?: {
    width?: number;
    height?: number;
  };
  maxDimension?: number;
  gentleCompressionQuality?: number;
  gentleCompressionThreshold?: number;
  tooSmallThreshold?: number;
}

export interface SchemaProcessingConfig {
  schemaVersion?: string;
  sizeRangeThresholds?: Partial<ProcessingConfig['sizeRangeThresholds']>;
  targetSizeStrategy?: Partial<ProcessingConfig['targetSizeStrategy']>;
  qualitySettings?: PartialQualitySettings;
  compressionSettings?: PartialCompressionSettings;
  pdfSettings?: Partial<ProcessingConfig['pdfSettings']>;
  validationSettings?: Partial<ProcessingConfig['validationSettings']>;
  examSpecific?: {
    [examId: string]: SchemaProcessingConfig;
  };
}

export interface EnhancedExamSchema {
  examId: string;
  examName: string;
  version: string;
  category: string;
  requirements: any[];
  processingConfig?: SchemaProcessingConfig;
  [key: string]: any;
}

/**
 * Load schema with processing configuration support
 */
export async function loadSchemaWithConfig(schemaId: string): Promise<EnhancedExamSchema | null> {
  try {
    // Reset to defaults first
    resetProcessingConfig();
    
    // Load schema (attempt from API first, then fallback)
    let schema: EnhancedExamSchema | null = null;
    
    try {
      const response = await fetch(`/api/parsed-documents/${schemaId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          schema = data.data;
        }
      }
    } catch (apiError) {
      console.warn(`API load failed for ${schemaId}:`, apiError);
    }
    
    // If API failed, try loading from static files or create fallback
    if (!schema) {
      console.log(`Creating fallback schema for ${schemaId}`);
      schema = createFallbackSchemaWithConfig(schemaId);
    }
    
    // Apply processing configuration if present
    if (schema?.processingConfig) {
      console.log(`📝 Applying processing config for ${schema.examName}`);
      applySchemaProcessingConfig(schema.processingConfig, schema.examId);
    }
    
    return schema;
    
  } catch (error) {
    console.error(`Failed to load schema with config for ${schemaId}:`, error);
    return null;
  }
}

/**
 * Apply processing configuration from schema
 */
function applySchemaProcessingConfig(config: SchemaProcessingConfig, examId: string): void {
  // Convert schema config to processing config format
  const processingConfig: Partial<ProcessingConfig> = {};
  
  if (config.sizeRangeThresholds) {
    processingConfig.sizeRangeThresholds = config.sizeRangeThresholds as ProcessingConfig['sizeRangeThresholds'];
  }
  
  if (config.targetSizeStrategy) {
    processingConfig.targetSizeStrategy = config.targetSizeStrategy as ProcessingConfig['targetSizeStrategy'];
  }
  
  if (config.qualitySettings) {
    processingConfig.qualitySettings = config.qualitySettings as ProcessingConfig['qualitySettings'];
  }
  
  if (config.compressionSettings) {
    processingConfig.compressionSettings = config.compressionSettings as ProcessingConfig['compressionSettings'];
  }
  
  if (config.pdfSettings) {
    processingConfig.pdfSettings = config.pdfSettings as ProcessingConfig['pdfSettings'];
  }
  
  if (config.validationSettings) {
    processingConfig.validationSettings = config.validationSettings as ProcessingConfig['validationSettings'];
  }
  
  // Apply exam-specific config if present
  if (config.examSpecific?.[examId]) {
    console.log(`🎯 Applying exam-specific config for ${examId}`);
    const examConfig = config.examSpecific[examId];
    applySchemaProcessingConfig(examConfig, examId); // Recursive call for exam-specific
  } else if (Object.keys(processingConfig).length > 0) {
    // Apply general schema config
    console.log(`⚙️ Applying general schema config`);
    setProcessingConfig(processingConfig);
  }
}

/**
 * Create fallback schema with default processing config
 */
function createFallbackSchemaWithConfig(examId: string): EnhancedExamSchema {
  const examConfigs: { [key: string]: Partial<EnhancedExamSchema> } = {
    'jee-mains-2025': {
      examId: 'jee-mains-2025',
      examName: 'JEE Mains 2025',
      category: 'engineering',
      requirements: [
        {
          type: 'Photo',
          requirements: {
            format: ['JPG', 'JPEG'],
            minSize: '10KB',
            maxSize: '200KB',
            mandatory: true,
          }
        },
        {
          type: 'Signature',
          requirements: {
            format: ['JPG', 'JPEG'],
            minSize: '4KB',
            maxSize: '30KB',
            mandatory: true,
          }
        },
        {
          type: 'ID Proof',
          requirements: {
            format: ['PDF'],
            minSize: '50KB',
            maxSize: '300KB',
            mandatory: true,
          }
        }
      ],
      processingConfig: {
        // JEE requires high quality signatures with small size - challenging!
        qualitySettings: {
          signature: {
            min: 0.8,
            max: 0.95,
            priority: 'quality'
          },
          photo: {
            min: 0.75,
            max: 0.92,
            priority: 'balanced'
          }
        },
        targetSizeStrategy: {
          tight: 0.6, // Target higher percentage for tight ranges
          medium: 0.5,
          wide: 0.4,
          veryWide: 0.3
        },
        compressionSettings: {
          maxAttempts: {
            tight: 15, // More attempts for tight size requirements
            medium: 12,
            wide: 10,
            veryWide: 8
          }
        }
      }
    },
    
    'upsc-cse-2025': {
      examId: 'upsc-cse-2025',
      examName: 'UPSC Civil Services 2025',
      category: 'civil-services',
      requirements: [
        {
          type: 'Photo',
          requirements: {
            format: ['JPG', 'JPEG'],
            minSize: '3KB',
            maxSize: '50KB',
            mandatory: true,
          }
        },
        {
          type: 'Signature',
          requirements: {
            format: ['JPG', 'JPEG'],
            minSize: '1KB',
            maxSize: '30KB',
            mandatory: true,
          }
        }
      ],
      processingConfig: {
        // UPSC has more reasonable size ranges
        qualitySettings: {
          signature: {
            min: 0.7,
            max: 0.9,
            priority: 'balanced'
          },
          photo: {
            min: 0.7,
            max: 0.9,
            priority: 'balanced'
          }
        }
      }
    },
    
    'ssc-cgl-2025': {
      examId: 'ssc-cgl-2025',
      examName: 'SSC CGL 2025',
      category: 'government',
      requirements: [
        {
          type: 'Photo',
          requirements: {
            format: ['JPG', 'JPEG'],
            minSize: '4KB',
            maxSize: '40KB',
            mandatory: true,
          }
        },
        {
          type: 'Signature',
          requirements: {
            format: ['JPG', 'JPEG'],
            minSize: '1KB',
            maxSize: '30KB',
            mandatory: true,
          }
        }
      ],
      processingConfig: {
        // SSC optimized for size over quality
        qualitySettings: {
          signature: {
            min: 0.65,
            max: 0.85,
            priority: 'size'
          },
          photo: {
            min: 0.65,
            max: 0.85,
            priority: 'size'
          }
        }
      }
    }
  };
  
  const config = examConfigs[examId];
  if (config) {
    return {
      version: '1.0.0-fallback',
      ...config
    } as EnhancedExamSchema;
  }
  
  // Default fallback
  return {
    examId,
    examName: examId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    version: '1.0.0-fallback',
    category: 'general',
    requirements: [
      {
        type: 'Photo',
        requirements: {
          format: ['JPG', 'JPEG'],
          minSize: '10KB',
          maxSize: '200KB',
          mandatory: true,
        }
      },
      {
        type: 'Signature',
        requirements: {
          format: ['JPG', 'JPEG'],
          minSize: '4KB',
          maxSize: '50KB',
          mandatory: true,
        }
      }
    ],
    processingConfig: {
      // Default balanced config
      qualitySettings: {
        signature: {
          min: 0.7,
          max: 0.9,
          priority: 'balanced'
        },
        photo: {
          min: 0.7,
          max: 0.9,
          priority: 'balanced'
        }
      }
    }
  };
}

/**
 * Save processing configuration to schema
 */
export function addProcessingConfigToSchema(
  schema: any, 
  config: SchemaProcessingConfig
): EnhancedExamSchema {
  return {
    ...schema,
    processingConfig: {
      ...schema.processingConfig,
      ...config,
      schemaVersion: '1.1.0' // Increment version when adding config
    }
  };
}

/**
 * Create exam-specific configuration preset
 */
export function createExamPreset(examType: string): SchemaProcessingConfig {
  switch (examType.toLowerCase()) {
    case 'jee':
    case 'jee-mains':
    case 'engineering':
      return {
        qualitySettings: {
          signature: {
            min: 0.8,
            max: 0.95,
            priority: 'quality'
          },
          photo: {
            min: 0.75,
            max: 0.92,
            priority: 'balanced'
          }
        },
        targetSizeStrategy: {
          tight: 0.6,
          medium: 0.5,
          wide: 0.4,
          veryWide: 0.3
        }
      };
      
    case 'upsc':
    case 'civil-services':
      return {
        qualitySettings: {
          signature: {
            min: 0.7,
            max: 0.9,
            priority: 'balanced'
          },
          photo: {
            min: 0.7,
            max: 0.9,
            priority: 'balanced'
          }
        }
      };
      
    case 'ssc':
    case 'government':
      return {
        qualitySettings: {
          signature: {
            min: 0.65,
            max: 0.85,
            priority: 'size'
          },
          photo: {
            min: 0.65,
            max: 0.85,
            priority: 'size'
          }
        }
      };
      
    default:
      return {}; // Use defaults
  }
}

/**
 * Validate schema processing configuration
 */
export function validateSchemaProcessingConfig(config: SchemaProcessingConfig): string[] {
  const errors: string[] = [];
  
  // Validate quality settings
  if (config.qualitySettings) {
    Object.entries(config.qualitySettings).forEach(([type, settings]) => {
      if (settings.min < 0 || settings.min > 1) {
        errors.push(`Invalid min quality for ${type}: ${settings.min}`);
      }
      if (settings.max < 0 || settings.max > 1) {
        errors.push(`Invalid max quality for ${type}: ${settings.max}`);
      }
      if (settings.min >= settings.max) {
        errors.push(`Min quality must be less than max for ${type}`);
      }
    });
  }
  
  // Validate target size strategy
  if (config.targetSizeStrategy) {
    Object.entries(config.targetSizeStrategy).forEach(([category, percentage]) => {
      if (percentage < 0 || percentage > 1) {
        errors.push(`Invalid target percentage for ${category}: ${percentage}`);
      }
    });
  }
  
  return errors;
}