/**
 * DIRECT CONFIGURATION TEST - NO COMPLEX DEPENDENCIES
 * This replaces hardcoded values directly in compressImage.ts with configurable ones
 */

import { getProcessingConfig } from '@/lib/processing/processingConfig';

// Simple configuration-aware quality calculation
export function getConfigurableQuality(compressionRatio: number, documentType: 'signature' | 'photo' | 'document' = 'document'): number {
  try {
    console.log(`🎯 Getting configurable quality for ${documentType}, compression ratio: ${compressionRatio.toFixed(1)}x`);
    
    const config = getProcessingConfig();
    const qualitySettings = config.qualitySettings[documentType];
    
    console.log(`📊 Quality settings for ${documentType}:`, qualitySettings);
    
    // Use configuration-based quality calculation instead of hardcoded values
    let quality: number;
    
    if (compressionRatio > 8) {
      // Extreme compression - use minimum quality but respect config
      quality = qualitySettings.min;
    } else if (compressionRatio > 5) {
      // High compression - use between min and mid
      quality = qualitySettings.min + (qualitySettings.max - qualitySettings.min) * 0.3;
    } else if (compressionRatio > 3) {
      // Moderate compression - use mid quality
      quality = qualitySettings.min + (qualitySettings.max - qualitySettings.min) * 0.6;
    } else {
      // Light compression - use high quality
      quality = qualitySettings.max * 0.95;
    }
    
    console.log(`✅ Calculated quality: ${quality.toFixed(2)} (was hardcoded 0.3/0.5/0.7 before)`);
    return quality;
    
  } catch (error) {
    console.warn('⚠️ Configuration failed, using fallback quality:', error);
    // Fallback to old hardcoded values if config fails
    return compressionRatio > 8 ? 0.3 : compressionRatio > 5 ? 0.5 : 0.7;
  }
}

// Simple configuration-aware attempts calculation  
export function getConfigurableAttempts(sizeRatio: number): number {
  try {
    console.log(`🎯 Getting configurable attempts for size ratio: ${sizeRatio.toFixed(1)}x`);
    
    const config = getProcessingConfig();
    
    // Use configuration-based attempts instead of hardcoded 25
    let attempts: number;
    if (sizeRatio < 2) {
      attempts = config.compressionSettings.maxAttempts.tight;
    } else if (sizeRatio < 5) {
      attempts = config.compressionSettings.maxAttempts.medium;
    } else if (sizeRatio < 10) {
      attempts = config.compressionSettings.maxAttempts.wide;
    } else {
      attempts = config.compressionSettings.maxAttempts.veryWide;
    }
    
    console.log(`✅ Calculated attempts: ${attempts} (was hardcoded 25 before)`);
    return attempts;
    
  } catch (error) {
    console.warn('⚠️ Configuration failed, using fallback attempts:', error);
    return 25; // Fallback to old hardcoded value
  }
}