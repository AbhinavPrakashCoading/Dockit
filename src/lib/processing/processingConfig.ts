/**
 * Processing Configuration Module
 * 
 * Centralizes all processing thresholds and settings to eliminate hardcoded values
 * and enable runtime configuration for different document types and exam requirements.
 */

export interface ProcessingConfig {
  sizeRangeThresholds: {
    tight: number;      // Bytes: ranges smaller than this
    medium: number;     // Bytes: ranges between tight and wide
    wide: number;       // Bytes: ranges between medium and veryWide
    veryWide: number;   // Bytes: ranges larger than this
  };
  
  targetSizeStrategy: {
    tight: number;      // Percentage of range to target (0-1)
    medium: number;
    wide: number;
    veryWide: number;
  };
  
  qualitySettings: {
    signature: {
      min: number;      // Minimum quality (0-1)
      max: number;      // Maximum quality (0-1)
      priority: 'quality' | 'size' | 'balanced';
    };
    photo: {
      min: number;
      max: number;
      priority: 'quality' | 'size' | 'balanced';
    };
    document: {
      min: number;
      max: number;
      priority: 'quality' | 'size' | 'balanced';
    };
    default: {
      min: number;
      max: number;
      priority: 'quality' | 'size' | 'balanced';
    };
  };
  
  compressionSettings: {
    maxAttempts: {
      tight: number;
      medium: number;
      wide: number;
      veryWide: number;
    };
    minDimensionsForSignature: {
      width: number;
      height: number;
    };
    maxDimension: number;  // Max width/height before scaling
    gentleCompressionQuality: number;  // For files slightly over limit
    gentleCompressionThreshold: number;  // How much over (1.2 = 20% over)
    tooSmallThreshold: number;  // If file < (min * threshold), error
  };
  
  pdfSettings: {
    defaultQuality: number;
    maxAttempts: number;
    compressionMethod: 'mild' | 'moderate' | 'aggressive';
  };
  
  validationSettings: {
    allowOriginalIfCompliant: boolean;
    strictValidation: boolean;  // Fail on any warning
  };
}

export const DEFAULT_PROCESSING_CONFIG: ProcessingConfig = {
  sizeRangeThresholds: {
    tight: 100 * 1024,      // 100KB
    medium: 500 * 1024,     // 500KB
    wide: 1024 * 1024,      // 1MB
    veryWide: 2048 * 1024,  // 2MB
  },
  
  targetSizeStrategy: {
    tight: 0.5,       // Target 50% of range
    medium: 0.5,      // Target 50% of range
    wide: 0.3,        // Target 30% of range (quality priority)
    veryWide: 0.2,    // Target 20% of range (quality priority)
  },
  
  qualitySettings: {
    signature: {
      min: 0.75,
      max: 0.95,
      priority: 'quality',
    },
    photo: {
      min: 0.7,
      max: 0.95,
      priority: 'balanced',
    },
    document: {
      min: 0.65,
      max: 0.92,
      priority: 'size',
    },
    default: {
      min: 0.7,
      max: 0.92,
      priority: 'balanced',
    },
  },
  
  compressionSettings: {
    maxAttempts: {
      tight: 12,
      medium: 10,
      wide: 8,
      veryWide: 6,
    },
    minDimensionsForSignature: {
      width: 800,
      height: 400,
    },
    maxDimension: 1200,
    gentleCompressionQuality: 0.92,
    gentleCompressionThreshold: 1.2,
    tooSmallThreshold: 0.5,
  },
  
  pdfSettings: {
    defaultQuality: 0.85,
    maxAttempts: 10,
    compressionMethod: 'moderate',
  },
  
  validationSettings: {
    allowOriginalIfCompliant: true,
    strictValidation: false,
  },
};

// Allow runtime configuration override
let currentConfig: ProcessingConfig = { ...DEFAULT_PROCESSING_CONFIG };

/**
 * Set processing configuration with deep merge support
 */
export function setProcessingConfig(config: Partial<ProcessingConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...config,
    sizeRangeThresholds: {
      ...currentConfig.sizeRangeThresholds,
      ...config.sizeRangeThresholds,
    },
    targetSizeStrategy: {
      ...currentConfig.targetSizeStrategy,
      ...config.targetSizeStrategy,
    },
    qualitySettings: {
      ...currentConfig.qualitySettings,
      signature: {
        ...currentConfig.qualitySettings.signature,
        ...config.qualitySettings?.signature,
      },
      photo: {
        ...currentConfig.qualitySettings.photo,
        ...config.qualitySettings?.photo,
      },
      document: {
        ...currentConfig.qualitySettings.document,
        ...config.qualitySettings?.document,
      },
      default: {
        ...currentConfig.qualitySettings.default,
        ...config.qualitySettings?.default,
      },
    },
    compressionSettings: {
      ...currentConfig.compressionSettings,
      ...config.compressionSettings,
      maxAttempts: {
        ...currentConfig.compressionSettings.maxAttempts,
        ...config.compressionSettings?.maxAttempts,
      },
      minDimensionsForSignature: {
        ...currentConfig.compressionSettings.minDimensionsForSignature,
        ...config.compressionSettings?.minDimensionsForSignature,
      },
    },
    pdfSettings: {
      ...currentConfig.pdfSettings,
      ...config.pdfSettings,
    },
    validationSettings: {
      ...currentConfig.validationSettings,
      ...config.validationSettings,
    },
  };
}

/**
 * Get current processing configuration (immutable copy)
 */
export function getProcessingConfig(): ProcessingConfig {
  return JSON.parse(JSON.stringify(currentConfig));
}

/**
 * Reset processing configuration to defaults
 */
export function resetProcessingConfig(): void {
  currentConfig = JSON.parse(JSON.stringify(DEFAULT_PROCESSING_CONFIG));
}

/**
 * Categorize size range for strategy selection
 */
export function categorizeSizeRange(
  sizeRange: number, 
  config?: ProcessingConfig
): 'tight' | 'medium' | 'wide' | 'veryWide' {
  const thresholds = (config || currentConfig).sizeRangeThresholds;
  
  if (sizeRange >= thresholds.veryWide) return 'veryWide';
  if (sizeRange >= thresholds.wide) return 'wide';
  if (sizeRange >= thresholds.medium) return 'medium';
  return 'tight';
}

/**
 * Get quality profile for document type
 */
export function getQualityProfile(
  documentType: string, 
  config?: ProcessingConfig
) {
  const settings = (config || currentConfig).qualitySettings;
  const type = documentType.toLowerCase();
  
  if (type.includes('signature')) {
    return settings.signature;
  }
  if (type.includes('photo') || type.includes('picture')) {
    return settings.photo;
  }
  if (type.includes('document') || type.includes('certificate') || type.includes('marksheet')) {
    return settings.document;
  }
  
  return settings.default;
}

/**
 * Parse size string to bytes (e.g., "50KB" -> 51200)
 */
export function parseSizeToBytes(sizeStr: string): number {
  if (!sizeStr) return 0;
  
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB)?$/i);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = (match[2] || 'B').toUpperCase();
  
  switch (unit) {
    case 'KB': return value * 1024;
    case 'MB': return value * 1024 * 1024;
    case 'GB': return value * 1024 * 1024 * 1024;
    default: return value;
  }
}

/**
 * Format bytes to readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Validate configuration object
 */
export function validateProcessingConfig(config: Partial<ProcessingConfig>): string[] {
  const errors: string[] = [];
  
  // Validate size range thresholds
  if (config.sizeRangeThresholds) {
    const { tight, medium, wide, veryWide } = config.sizeRangeThresholds;
    if (tight && medium && tight >= medium) {
      errors.push('sizeRangeThresholds.tight must be less than medium');
    }
    if (medium && wide && medium >= wide) {
      errors.push('sizeRangeThresholds.medium must be less than wide');
    }
    if (wide && veryWide && wide >= veryWide) {
      errors.push('sizeRangeThresholds.wide must be less than veryWide');
    }
  }
  
  // Validate target size strategy (must be 0-1)
  if (config.targetSizeStrategy) {
    Object.entries(config.targetSizeStrategy).forEach(([key, value]) => {
      if (value < 0 || value > 1) {
        errors.push(`targetSizeStrategy.${key} must be between 0 and 1`);
      }
    });
  }
  
  // Validate quality settings (must be 0-1)
  if (config.qualitySettings) {
    Object.entries(config.qualitySettings).forEach(([type, settings]) => {
      if (settings.min < 0 || settings.min > 1) {
        errors.push(`qualitySettings.${type}.min must be between 0 and 1`);
      }
      if (settings.max < 0 || settings.max > 1) {
        errors.push(`qualitySettings.${type}.max must be between 0 and 1`);
      }
      if (settings.min >= settings.max) {
        errors.push(`qualitySettings.${type}.min must be less than max`);
      }
    });
  }
  
  return errors;
}

/**
 * Create a configuration preset for specific use cases
 */
export function createConfigPreset(presetName: string): Partial<ProcessingConfig> {
  switch (presetName.toLowerCase()) {
    case 'high-quality':
      return {
        qualitySettings: {
          signature: { min: 0.85, max: 0.98, priority: 'quality' },
          photo: { min: 0.8, max: 0.98, priority: 'quality' },
          document: { min: 0.75, max: 0.95, priority: 'quality' },
          default: { min: 0.8, max: 0.95, priority: 'quality' },
        },
        targetSizeStrategy: {
          tight: 0.8,
          medium: 0.7,
          wide: 0.5,
          veryWide: 0.3,
        },
      };
      
    case 'aggressive-compression':
      return {
        qualitySettings: {
          signature: { min: 0.6, max: 0.85, priority: 'size' },
          photo: { min: 0.55, max: 0.8, priority: 'size' },
          document: { min: 0.5, max: 0.75, priority: 'size' },
          default: { min: 0.55, max: 0.8, priority: 'size' },
        },
        targetSizeStrategy: {
          tight: 0.3,
          medium: 0.25,
          wide: 0.2,
          veryWide: 0.15,
        },
      };
      
    case 'balanced':
    default:
      return DEFAULT_PROCESSING_CONFIG;
  }
}

/**
 * Debug helper to log current configuration
 */
export function logCurrentConfig(): void {
  console.group('🔧 Current Processing Configuration');
  console.log('Size Range Thresholds:', currentConfig.sizeRangeThresholds);
  console.log('Target Size Strategy:', currentConfig.targetSizeStrategy);
  console.log('Quality Settings:', currentConfig.qualitySettings);
  console.log('Compression Settings:', currentConfig.compressionSettings);
  console.log('PDF Settings:', currentConfig.pdfSettings);
  console.log('Validation Settings:', currentConfig.validationSettings);
  console.groupEnd();
}