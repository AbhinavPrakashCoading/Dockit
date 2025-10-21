/**
 * Strategy Selector Module
 * 
 * Selects appropriate processing strategies based on document requirements,
 * file characteristics, and configurable thresholds.
 */

import { 
  getProcessingConfig, 
  categorizeSizeRange, 
  getQualityProfile, 
  parseSizeToBytes,
  formatBytes 
} from './processingConfig';

export interface DocumentRequirements {
  minSize?: string;    // e.g., "10KB"
  maxSize: string;     // e.g., "200KB"
  format?: string[];   // e.g., ["jpeg", "jpg"]
  dimensions?: {
    width?: number;
    height?: number;
    ratio?: string;
  };
}

export interface ProcessingStrategy {
  targetSize: number;           // Target file size in bytes
  minQuality: number;          // Minimum quality (0-1)
  maxQuality: number;          // Maximum quality (0-1)
  priorityMode: 'quality' | 'size' | 'balanced';
  maxAttempts: number;         // Maximum compression attempts
  initialQuality: number;      // Starting quality
  initialScale: number;        // Starting scale factor
  compressionMethod: 'gentle' | 'standard' | 'aggressive' | 'extreme';
  allowGentleCompression: boolean;   // Try gentle compression first
  tooSmallToCompress: boolean;       // File is too small to compress safely
}

/**
 * Select processing strategy based on file and requirements
 */
export function selectStrategy(
  file: File,
  documentType: string,
  requirements: DocumentRequirements
): ProcessingStrategy {
  
  const config = getProcessingConfig();
  const minBytes = parseSizeToBytes(requirements.minSize || '0KB');
  const maxBytes = parseSizeToBytes(requirements.maxSize);
  const sizeRange = maxBytes - minBytes;
  
  // Categorize size range using config
  const category = categorizeSizeRange(sizeRange, config);
  
  // Get target percentage from config
  const targetPercentage = config.targetSizeStrategy[category];
  
  // Calculate target size
  let targetSize = minBytes + (sizeRange * targetPercentage);
  
  // Cap at original file size if compliant
  if (file.size >= minBytes && file.size <= maxBytes) {
    targetSize = Math.min(targetSize, file.size);
  }
  
  targetSize = Math.max(minBytes, Math.min(targetSize, maxBytes));
  
  // Get quality settings based on document type
  const qualityProfile = getQualityProfile(documentType, config);
  
  // Calculate compression ratio
  const compressionRatio = file.size / targetSize;
  
  // Determine compression method
  let compressionMethod: ProcessingStrategy['compressionMethod'];
  let initialQuality: number;
  let initialScale: number;
  
  if (compressionRatio > 20) {
    compressionMethod = 'extreme';
    initialQuality = qualityProfile.min;
    initialScale = 0.3;
  } else if (compressionRatio > 8) {
    compressionMethod = 'aggressive';
    initialQuality = qualityProfile.min + 0.1;
    initialScale = 0.4;
  } else if (compressionRatio > 3) {
    compressionMethod = 'standard';
    initialQuality = qualityProfile.min + 0.2;
    initialScale = 0.6;
  } else {
    compressionMethod = 'gentle';
    initialQuality = qualityProfile.max - 0.1;
    initialScale = 0.8;
  }
  
  // Check if file is too small to compress safely
  const tooSmallToCompress = file.size < minBytes * config.compressionSettings.tooSmallThreshold;
  
  // Check if gentle compression is appropriate
  const allowGentleCompression = 
    file.size > maxBytes && 
    file.size < maxBytes * config.compressionSettings.gentleCompressionThreshold;
  
  return {
    targetSize,
    minQuality: qualityProfile.min,
    maxQuality: qualityProfile.max,
    priorityMode: qualityProfile.priority,
    maxAttempts: config.compressionSettings.maxAttempts[category],
    initialQuality,
    initialScale,
    compressionMethod,
    allowGentleCompression,
    tooSmallToCompress,
  };
}

/**
 * Analyze compression feasibility
 */
export function analyzeCompressionFeasibility(
  file: File,
  requirements: DocumentRequirements
): {
  feasible: boolean;
  compressionRatio: number;
  recommendation: string;
  strategy: ProcessingStrategy['compressionMethod'];
} {
  const config = getProcessingConfig();
  const maxBytes = parseSizeToBytes(requirements.maxSize);
  const compressionRatio = file.size / maxBytes;
  
  // Determine if compression is feasible
  const isImage = file.type.startsWith('image/');
  const maxAcceptableRatio = isImage ? 50 : 20; // From existing logic
  
  const feasible = compressionRatio <= maxAcceptableRatio;
  
  // Generate recommendation
  let recommendation: string;
  let strategy: ProcessingStrategy['compressionMethod'];
  
  if (compressionRatio <= 1.2) {
    recommendation = 'File size is within acceptable range. Minimal or no compression needed.';
    strategy = 'gentle';
  } else if (compressionRatio <= 3) {
    recommendation = 'Moderate compression needed. Should achieve target with good quality.';
    strategy = 'gentle';
  } else if (compressionRatio <= 8) {
    recommendation = 'Significant compression needed. Quality may be reduced but should succeed.';
    strategy = 'standard';
  } else if (compressionRatio <= 20) {
    recommendation = 'Aggressive compression needed. Quality will be significantly reduced.';
    strategy = 'aggressive';
  } else if (feasible) {
    recommendation = 'Extreme compression needed. Expect very low quality but may succeed.';
    strategy = 'extreme';
  } else {
    recommendation = `Compression not feasible (${compressionRatio.toFixed(1)}x reduction needed). ` +
                    `Consider using a smaller source file. Maximum feasible: ${formatBytes(file.size / maxAcceptableRatio)}.`;
    strategy = 'extreme';
  }
  
  return {
    feasible,
    compressionRatio,
    recommendation,
    strategy,
  };
}

/**
 * Get compression settings for specific attempt
 */
export function getCompressionSettingsForAttempt(
  strategy: ProcessingStrategy,
  attempt: number,
  totalAttempts: number
): {
  quality: number;
  scaleFactor: number;
  shouldReduceDimensions: boolean;
} {
  const config = getProcessingConfig();
  const progress = attempt / totalAttempts;
  
  // Calculate quality reduction
  let quality: number;
  let scaleFactor: number;
  
  switch (strategy.compressionMethod) {
    case 'gentle':
      // Gentle progression for files close to target
      quality = strategy.maxQuality - (progress * (strategy.maxQuality - strategy.minQuality) * 0.5);
      scaleFactor = 1.0 - (progress * 0.2); // Max 20% reduction
      break;
      
    case 'standard':
      // Standard progression
      quality = strategy.maxQuality - (progress * (strategy.maxQuality - strategy.minQuality) * 0.7);
      scaleFactor = 1.0 - (progress * 0.4); // Max 40% reduction
      break;
      
    case 'aggressive':
      // Aggressive progression - start reducing dimensions early
      quality = strategy.maxQuality - (progress * (strategy.maxQuality - strategy.minQuality) * 0.8);
      scaleFactor = 1.0 - (progress * 0.6); // Max 60% reduction
      break;
      
    case 'extreme':
      // Extreme progression - aggressive from start
      quality = strategy.initialQuality - (progress * (strategy.initialQuality - strategy.minQuality) * 0.9);
      scaleFactor = strategy.initialScale - (progress * (strategy.initialScale - 0.1)); // Down to 10%
      break;
      
    default:
      quality = strategy.maxQuality - (progress * (strategy.maxQuality - strategy.minQuality));
      scaleFactor = 1.0 - (progress * 0.3);
  }
  
  // Ensure bounds
  quality = Math.max(strategy.minQuality, Math.min(strategy.maxQuality, quality));
  scaleFactor = Math.max(0.1, Math.min(1.0, scaleFactor));
  
  // Determine if dimensions should be reduced
  const shouldReduceDimensions = 
    strategy.compressionMethod === 'aggressive' && attempt > totalAttempts * 0.3 ||
    strategy.compressionMethod === 'extreme' && attempt > totalAttempts * 0.2 ||
    scaleFactor < 0.9;
  
  return {
    quality,
    scaleFactor,
    shouldReduceDimensions,
  };
}

/**
 * Check if original file should be preserved
 */
export function shouldPreserveOriginal(
  file: File,
  requirements: DocumentRequirements,
  strategy: ProcessingStrategy
): boolean {
  const config = getProcessingConfig();
  
  if (!config.validationSettings.allowOriginalIfCompliant) {
    return false;
  }
  
  const minBytes = parseSizeToBytes(requirements.minSize || '0KB');
  const maxBytes = parseSizeToBytes(requirements.maxSize);
  
  // Check if file is compliant
  if (file.size < minBytes || file.size > maxBytes) {
    return false;
  }
  
  // For wide/very wide ranges with quality priority, keep original
  const sizeRange = maxBytes - minBytes;
  const category = categorizeSizeRange(sizeRange, config);
  
  return (
    (category === 'wide' || category === 'veryWide') && 
    strategy.priorityMode === 'quality'
  );
}

/**
 * Generate user-friendly strategy description
 */
export function describeStrategy(strategy: ProcessingStrategy): string {
  const { compressionMethod, priorityMode, targetSize } = strategy;
  
  const descriptions = {
    gentle: `Using gentle compression with ${priorityMode} priority. Target: ${formatBytes(targetSize)}.`,
    standard: `Using standard compression with ${priorityMode} priority. Target: ${formatBytes(targetSize)}.`,
    aggressive: `Using aggressive compression with ${priorityMode} priority. Quality will be reduced. Target: ${formatBytes(targetSize)}.`,
    extreme: `Using extreme compression with ${priorityMode} priority. Expect significant quality reduction. Target: ${formatBytes(targetSize)}.`,
  };
  
  return descriptions[compressionMethod];
}