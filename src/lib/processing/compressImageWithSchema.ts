/**
 * Schema-Aware Image Compression Module
 * 
 * Uses configurable processing strategies to compress images according to 
 * specific document requirements with intelligent fallback mechanisms.
 */

import { 
  getProcessingConfig, 
  parseSizeToBytes, 
  formatBytes 
} from './processingConfig';
import { 
  selectStrategy, 
  analyzeCompressionFeasibility, 
  getCompressionSettingsForAttempt, 
  shouldPreserveOriginal,
  describeStrategy,
  DocumentRequirements,
  ProcessingStrategy 
} from './strategySelector';

export interface CompressionResult {
  success: boolean;
  file?: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  quality: number;
  attempts: number;
  strategy: ProcessingStrategy['compressionMethod'];
  preservedOriginal: boolean;
  error?: string;
  warnings: string[];
}

/**
 * Compress image with schema-aware strategy
 */
export async function compressImageWithSchema(
  file: File,
  documentType: string,
  requirements: DocumentRequirements
): Promise<CompressionResult> {
  
  try {
    console.log(`🗜️ Starting schema-aware compression for ${documentType}`);
    console.log(`📊 Requirements:`, requirements);
    
    const config = getProcessingConfig();
    console.log(`🔧 Got processing config successfully`);
    
    const originalSize = file.size;
    console.log(`📏 Original size: ${originalSize} bytes`);
    
    let minBytes, maxBytes;
    try {
      minBytes = parseSizeToBytes(requirements.minSize || '0KB');
      console.log(`📐 Min bytes parsed: ${minBytes}`);
      maxBytes = parseSizeToBytes(requirements.maxSize);
      console.log(`� Max bytes parsed: ${maxBytes}`);
    } catch (parseError) {
      console.error(`❌ Error parsing size requirements:`, parseError);
      return {
        success: false,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        quality: 1,
        attempts: 0,
        strategy: 'gentle',
        preservedOriginal: false,
        error: `Failed to parse size requirements: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        warnings: [],
      };
    }

    console.log(`📊 File: ${file.name} (${formatBytes(originalSize)})`);
    console.log(`🎯 Target range: ${formatBytes(minBytes)} - ${formatBytes(maxBytes)}`);
  
  // 🎯 CRITICAL FIX: Don't compress files that are already within size limits!
  if (originalSize <= maxBytes && originalSize >= minBytes) {
    console.log(`✅ FILE ALREADY COMPLIANT: ${formatBytes(originalSize)} is within range [${formatBytes(minBytes)} - ${formatBytes(maxBytes)}]`);
    console.log(`🎉 RETURNING ORIGINAL FILE WITHOUT COMPRESSION - QUALITY PRESERVED!`);
    return {
      success: true,
      file: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      quality: 1,
      attempts: 0,
      strategy: 'gentle',
      preservedOriginal: true,
      error: undefined,
      warnings: [`File already within size requirements - no compression applied`],
    };
  }
  
  console.log(`⚠️ COMPRESSION NEEDED: ${formatBytes(originalSize)} > ${formatBytes(maxBytes)} (${(originalSize / maxBytes).toFixed(1)}x over limit)`);
  
  // Analyze compression feasibility
  let feasibility;
  try {
    feasibility = analyzeCompressionFeasibility(file, requirements);
    console.log(`📈 Compression analysis: ${feasibility.recommendation}`);
  } catch (feasibilityError) {
    console.error(`❌ Error analyzing compression feasibility:`, feasibilityError);
    return {
      success: false,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      quality: 1,
      attempts: 0,
      strategy: 'gentle',
      preservedOriginal: false,
      error: `Failed to analyze compression feasibility: ${feasibilityError instanceof Error ? feasibilityError.message : String(feasibilityError)}`,
      warnings: [],
    };
  }
  
  if (!feasibility.feasible) {
    return {
      success: false,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      quality: 1,
      attempts: 0,
      strategy: feasibility.strategy,
      preservedOriginal: false,
      error: feasibility.recommendation,
      warnings: [],
    };
  }
  
  // Select processing strategy
  let strategy;
  try {
    strategy = selectStrategy(file, documentType, requirements);
    console.log(`🎯 Strategy: ${describeStrategy(strategy)}`);
  } catch (strategyError) {
    console.error(`❌ Error selecting processing strategy:`, strategyError);
    return {
      success: false,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      quality: 1,
      attempts: 0,
      strategy: 'gentle',
      preservedOriginal: false,
      error: `Failed to select processing strategy: ${strategyError instanceof Error ? strategyError.message : String(strategyError)}`,
      warnings: [],
    };
  }
  
  // Check if original should be preserved
  let shouldPreserve;
  try {
    shouldPreserve = shouldPreserveOriginal(file, requirements, strategy);
  } catch (preserveError) {
    console.error(`❌ Error checking if original should be preserved:`, preserveError);
    shouldPreserve = false; // Default to not preserving if check fails
  }
  
  if (shouldPreserve) {
    console.log(`✅ Preserving original file (compliant and quality priority)`);
    return {
      success: true,
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      quality: 1,
      attempts: 0,
      strategy: 'gentle',
      preservedOriginal: true,
      warnings: [],
    };
  }
  
  // Check if file is too small to compress safely
  if (strategy.tooSmallToCompress) {
    return {
      success: false,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      quality: 1,
      attempts: 0,
      strategy: strategy.compressionMethod,
      preservedOriginal: false,
      error: `File too small (${formatBytes(originalSize)}). ` +
             `Minimum required: ${requirements.minSize}. ` +
             `Try using a higher resolution image.`,
      warnings: [],
    };
  }
  
  // Try gentle compression for slightly oversized files
  if (strategy.allowGentleCompression) {
    console.log(`🔄 Trying gentle compression first...`);
    try {
      const gentleResult = await tryGentleCompression(file, config.compressionSettings.gentleCompressionQuality);
      if (gentleResult.size >= minBytes && gentleResult.size <= maxBytes) {
        console.log(`✅ Gentle compression successful: ${formatBytes(gentleResult.size)}`);
        return {
          success: true,
          file: new File([gentleResult], file.name, { type: file.type, lastModified: file.lastModified }),
          originalSize,
          compressedSize: gentleResult.size,
          compressionRatio: originalSize / gentleResult.size,
          quality: config.compressionSettings.gentleCompressionQuality,
          attempts: 1,
          strategy: 'gentle',
          preservedOriginal: false,
          warnings: [],
        };
      }
    } catch (error) {
      console.warn(`⚠️ Gentle compression failed:`, error);
    }
  }
  
  // Proceed with strategic compression
  return await performStrategicCompression(file, strategy, requirements);
  
  } catch (error) {
    console.error(`❌ CRITICAL ERROR in compressImageWithSchema:`, error);
    return {
      success: false,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1,
      quality: 1,
      attempts: 0,
      strategy: 'gentle',
      preservedOriginal: false,
      error: `Compression failed: ${error instanceof Error ? error.message : String(error)}`,
      warnings: [],
    };
  }
}

/**
 * Try gentle compression with high quality
 */
async function tryGentleCompression(file: File, quality: number): Promise<Blob> {
  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Failed to get canvas context');
  
  canvas.width = image.width;
  canvas.height = image.height;
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create gentle compression blob'));
        return;
      }
      resolve(blob);
    }, file.type, quality);
  });
}

/**
 * Perform strategic compression with multiple attempts
 */
async function performStrategicCompression(
  file: File,
  strategy: ProcessingStrategy,
  requirements: DocumentRequirements
): Promise<CompressionResult> {
  
  const config = getProcessingConfig();
  const minBytes = parseSizeToBytes(requirements.minSize || '0KB');
  const maxBytes = parseSizeToBytes(requirements.maxSize);
  const warnings: string[] = [];
  
  let bestResult: { blob: Blob; quality: number; attempts: number } | null = null;
  let bestDistance = Infinity;
  
  try {
    const image = await loadImage(file);
    console.log(`📐 Original dimensions: ${image.width}x${image.height}`);
    
    for (let attempt = 0; attempt < strategy.maxAttempts; attempt++) {
      const settings = getCompressionSettingsForAttempt(strategy, attempt, strategy.maxAttempts);
      
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        
        // Calculate canvas dimensions
        let canvasWidth = image.width;
        let canvasHeight = image.height;
        
        if (settings.shouldReduceDimensions) {
          canvasWidth = Math.round(image.width * settings.scaleFactor);
          canvasHeight = Math.round(image.height * settings.scaleFactor);
          
          // Apply minimum dimensions for signatures
          if (file.name.toLowerCase().includes('signature')) {
            const minDims = config.compressionSettings.minDimensionsForSignature;
            canvasWidth = Math.max(minDims.width, canvasWidth);
            canvasHeight = Math.max(minDims.height, canvasHeight);
          }
          
          // Apply maximum dimension limit
          const maxDim = config.compressionSettings.maxDimension;
          if (canvasWidth > maxDim || canvasHeight > maxDim) {
            const scale = maxDim / Math.max(canvasWidth, canvasHeight);
            canvasWidth = Math.round(canvasWidth * scale);
            canvasHeight = Math.round(canvasHeight * scale);
          }
        }
        
        // Ensure minimum canvas size
        canvasWidth = Math.max(50, canvasWidth);
        canvasHeight = Math.max(50, canvasHeight);
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // Draw with high quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
        
        // Create blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create compressed blob'));
              return;
            }
            resolve(blob);
          }, file.type, settings.quality);
        });
        
        const currentSize = blob.size;
        console.log(`🔄 Attempt ${attempt + 1}/${strategy.maxAttempts}: ${formatBytes(currentSize)} ` +
                   `(quality: ${settings.quality.toFixed(2)}, scale: ${settings.scaleFactor.toFixed(2)}, ` +
                   `canvas: ${canvasWidth}x${canvasHeight})`);
        
        // Check if this result is within target range
        if (currentSize >= minBytes && currentSize <= maxBytes) {
          console.log(`✅ Compression successful: ${formatBytes(currentSize)}`);
          return {
            success: true,
            file: new File([blob], file.name, { type: file.type, lastModified: file.lastModified }),
            originalSize: file.size,
            compressedSize: currentSize,
            compressionRatio: file.size / currentSize,
            quality: settings.quality,
            attempts: attempt + 1,
            strategy: strategy.compressionMethod,
            preservedOriginal: false,
            warnings,
          };
        }
        
        // Track best result (closest to target range)
        const distance = currentSize < minBytes ? 
          minBytes - currentSize : 
          currentSize - maxBytes;
          
        if (distance < bestDistance) {
          bestDistance = distance;
          bestResult = { blob, quality: settings.quality, attempts: attempt + 1 };
        }
        
      } catch (attemptError) {
        console.warn(`⚠️ Attempt ${attempt + 1} failed:`, attemptError);
        warnings.push(`Attempt ${attempt + 1} failed: ${attemptError instanceof Error ? attemptError.message : 'Unknown error'}`);
      }
    }
    
    // If no perfect result, use best available with tolerance
    if (bestResult) {
      const tolerance = strategy.compressionMethod === 'extreme' ? 1.5 : 
                       strategy.compressionMethod === 'aggressive' ? 1.3 : 1.2;
      
      if (bestResult.blob.size <= maxBytes * tolerance) {
        console.log(`✅ Compression completed with tolerance: ${formatBytes(bestResult.blob.size)}`);
        warnings.push(`Target size not exactly achieved. Using best result within ${Math.round((tolerance - 1) * 100)}% tolerance.`);
        
        return {
          success: true,
          file: new File([bestResult.blob], file.name, { type: file.type, lastModified: file.lastModified }),
          originalSize: file.size,
          compressedSize: bestResult.blob.size,
          compressionRatio: file.size / bestResult.blob.size,
          quality: bestResult.quality,
          attempts: bestResult.attempts,
          strategy: strategy.compressionMethod,
          preservedOriginal: false,
          warnings,
        };
      }
    }
    
    // Compression failed
    const error = bestResult ? 
      `Could not achieve target size. Best result: ${formatBytes(bestResult.blob.size)}. ` +
      `Target range: ${formatBytes(minBytes)} - ${formatBytes(maxBytes)}.` :
      `All compression attempts failed. Consider using a smaller source file.`;
    
    return {
      success: false,
      originalSize: file.size,
      compressedSize: bestResult?.blob.size || file.size,
      compressionRatio: 1,
      quality: 1,
      attempts: strategy.maxAttempts,
      strategy: strategy.compressionMethod,
      preservedOriginal: false,
      error,
      warnings,
    };
    
  } catch (error) {
    return {
      success: false,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1,
      quality: 1,
      attempts: 0,
      strategy: strategy.compressionMethod,
      preservedOriginal: false,
      error: `Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      warnings,
    };
  }
}

/**
 * Load image from file
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    console.log(`📸 Loading image: ${file.name} (${(file.size / 1024).toFixed(1)}KB, ${file.type})`);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error(`❌ Invalid file type: ${file.type}`);
      reject(new Error(`Invalid file type: ${file.type}. Expected image file.`));
      return;
    }
    
    // Check file size (basic sanity check)
    if (file.size === 0) {
      console.error(`❌ File is empty: ${file.name}`);
      reject(new Error('File is empty or corrupted'));
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      console.error(`❌ File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      reject(new Error('File too large (max 50MB supported)'));
      return;
    }
    
    const image = new Image();
    let imageUrl: string;
    
    try {
      imageUrl = URL.createObjectURL(file);
      console.log(`🔗 Created object URL for ${file.name}`);
    } catch (urlError) {
      console.error(`❌ Failed to create object URL:`, urlError);
      reject(new Error(`Failed to create object URL: ${urlError instanceof Error ? urlError.message : String(urlError)}`));
      return;
    }
    
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      URL.revokeObjectURL(imageUrl);
      console.error(`❌ Image loading timeout for ${file.name}`);
      reject(new Error(`Image loading timeout (30s) for ${file.name}`));
    }, 30000); // 30 second timeout
    
    image.onload = () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(imageUrl);
      console.log(`✅ Image loaded successfully: ${image.naturalWidth}x${image.naturalHeight}`);
      resolve(image);
    };
    
    image.onerror = (event) => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(imageUrl);
      console.error(`❌ Image loading failed for ${file.name}:`, event);
      console.error(`   File type: ${file.type}`);
      console.error(`   File size: ${(file.size / 1024).toFixed(1)}KB`);
      console.error(`   Object URL: ${imageUrl}`);
      reject(new Error(`Failed to load image for compression: ${file.name} (${file.type})`));
    };
    
    try {
      image.src = imageUrl;
      console.log(`🎯 Started loading image from object URL`);
    } catch (srcError) {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(imageUrl);
      console.error(`❌ Failed to set image src:`, srcError);
      reject(new Error(`Failed to set image source: ${srcError instanceof Error ? srcError.message : String(srcError)}`));
    }
  });
}

/**
 * Backward compatibility function for existing compression calls
 */
export async function compressImage(file: File, maxSizeKB: number): Promise<File> {
  const requirements: DocumentRequirements = {
    maxSize: `${maxSizeKB}KB`,
  };
  
  const result = await compressImageWithSchema(file, 'document', requirements);
  
  if (!result.success) {
    throw new Error(result.error || 'Compression failed');
  }
  
  return result.file!;
}