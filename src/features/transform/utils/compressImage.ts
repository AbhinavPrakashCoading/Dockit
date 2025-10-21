// Import the new configuration-based compression
import { compressImageWithSchema } from '@/lib/processing/compressImageWithSchema';

export async function compressImage(file: File, maxSizeKB: number): Promise<File> {
  const currentSizeKB = Math.round(file.size / 1024);
  console.log(`🚀 COMPRESSION ENTRY POINT: ${file.name} (${currentSizeKB}KB) → target: ${maxSizeKB}KB`);
  
  // 🎯 CRITICAL FIX: Don't compress files that are already within size limits!
  if (currentSizeKB <= maxSizeKB) {
    console.log(`✅ FILE ALREADY COMPLIANT: ${currentSizeKB}KB ≤ ${maxSizeKB}KB - NO COMPRESSION NEEDED!`);
    console.log(`🎉 RETURNING ORIGINAL FILE WITHOUT COMPRESSION - QUALITY PRESERVED!`);
    return file;
  }
  
  console.log(`⚠️ COMPRESSION NEEDED: ${currentSizeKB}KB > ${maxSizeKB}KB (${(currentSizeKB / maxSizeKB).toFixed(1)}x over limit)`);
  
  // Use the new configuration-based compression for better results
  try {
    console.log(`🆕 ATTEMPTING NEW CONFIGURATION-BASED COMPRESSION`);
    
    // Convert maxSizeKB to requirements format expected by new system
    const requirements = {
      maxSize: `${maxSizeKB}KB`
    };
    
    // Use 'document' as default document type - this can be enhanced later
    console.log(`🎯 Calling compressImageWithSchema with document type and max size: ${maxSizeKB}KB`);
    console.log(`🔍 Requirements object:`, requirements);
    
    const result = await compressImageWithSchema(file, 'document', requirements);
    
    console.log(`🔍 Compression result received:`, result);
    
    if (result && result.success && result.file) {
      console.log(`✅ NEW COMPRESSION SUCCESSFUL! Strategy: ${result.strategy}, Final size: ${Math.round(result.file.size / 1024)}KB`);
      console.log(`🎉 CONFIGURATION SYSTEM IS WORKING! No more hardcoded values!`);
      return result.file;
    } else {
      console.error(`❌ New compression failed:`, result);
      throw new Error(`New compression system returned unsuccessful result: ${JSON.stringify(result)}`);
    }
  } catch (error) {
    // Fallback to legacy implementation if new one fails
    console.error(`❌ NEW COMPRESSION FAILED, falling back to legacy:`, error);
    console.error(`❌ Error details:`, error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error(`❌ Error stack:`, error.stack);
    }
    console.warn(`🔙 USING LEGACY COMPRESSION (with hardcoded values)`);
    return await compressImageLegacy(file, maxSizeKB);
  }
}

// Legacy compression implementation (kept as fallback)
async function compressImageLegacy(file: File, maxSizeKB: number): Promise<File> {
  const originalSizeKB = Math.round(file.size / 1024);
  
  // 🎯 CRITICAL FIX: Don't compress files that are already within size limits!
  if (originalSizeKB <= maxSizeKB) {
    console.log(`✅ LEGACY CHECK: FILE ALREADY COMPLIANT: ${originalSizeKB}KB ≤ ${maxSizeKB}KB - NO COMPRESSION NEEDED!`);
    return file;
  }
  
  const compressionRatio = originalSizeKB / maxSizeKB;
  
  console.log(`🗜️ Legacy compression: ${file.name} (${originalSizeKB}KB) to max ${maxSizeKB}KB (${compressionRatio.toFixed(1)}x compression needed)`);

  // Create an image element
  const image = new Image();
  let imageUrl: string;
  try {
    imageUrl = URL.createObjectURL(file);
    console.log(`🔗 Created object URL for legacy compression: ${file.name}`);
  } catch (urlError) {
    console.error(`❌ Legacy: Failed to create object URL:`, urlError);
    throw new Error(`Failed to create object URL: ${urlError instanceof Error ? urlError.message : String(urlError)}`);
  }

  // Load the image with enhanced error handling
  await new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      URL.revokeObjectURL(imageUrl);
      console.error(`❌ Legacy: Image loading timeout for ${file.name}`);
      reject(new Error(`Legacy compression: Image loading timeout for ${file.name}`));
    }, 30000);
    
    image.onload = () => {
      clearTimeout(timeoutId);
      console.log(`✅ Legacy: Image loaded successfully: ${image.width}x${image.height}`);
      resolve(undefined);
    };
    
    image.onerror = (event) => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(imageUrl);
      console.error(`❌ Legacy: Image loading failed for ${file.name}:`, event);
      reject(new Error(`Legacy compression: Failed to load image for compression: ${file.name} (${file.type})`));
    };
    
    image.src = imageUrl;
  });

  console.log(`📐 Original dimensions: ${image.width}x${image.height}`);

  // Create canvas
  const canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // 🎯 CONFIGURATION SYSTEM: Replace hardcoded values with configurable ones
  const { getConfigurableQuality, getConfigurableAttempts } = await import('@/lib/processing/simpleConfigurableCompression');
  
  console.log(`🔄 LEGACY COMPRESSION NOW USING CONFIGURATION SYSTEM!`);
  let quality = getConfigurableQuality(compressionRatio, 'document'); // Was: hardcoded 0.3/0.5/0.7
  let scaleFactor = compressionRatio > 8 ? 0.4 : compressionRatio > 5 ? 0.6 : compressionRatio > 3 ? 0.8 : 1.0;
  
  let attempt = 0;
  const MAX_ATTEMPTS = getConfigurableAttempts(compressionRatio); // Was: hardcoded 25

  console.log(`🎯 Starting with aggressive settings: quality=${quality.toFixed(2)}, scale=${scaleFactor.toFixed(2)}`);

  // Compress with progressive quality and dimension reduction
  while (attempt < MAX_ATTEMPTS) {
    // Adjust canvas size based on scale factor
    canvas.width = Math.round(image.width * scaleFactor);
    canvas.height = Math.round(image.height * scaleFactor);
    
    // Ensure minimum canvas size
    canvas.width = Math.max(50, canvas.width);
    canvas.height = Math.max(50, canvas.height);
    
    // Redraw with new dimensions
    ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    // Use better quality settings for resizing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create compressed blob from canvas'));
            return;
          }
          resolve(blob);
        }, file.type, quality);
      } catch (error) {
        reject(error);
      }
    });

    const currentSizeKB = blob.size / 1024;
    console.log(`🔄 Attempt ${attempt + 1}: ${Math.round(currentSizeKB)}KB (quality: ${quality.toFixed(2)}, scale: ${scaleFactor.toFixed(2)}, canvas: ${canvas.width}x${canvas.height})`);

    if (currentSizeKB <= maxSizeKB) {
      // Success!
      URL.revokeObjectURL(imageUrl);
      console.log(`✅ Compression successful: ${Math.round(currentSizeKB)}KB`);
      
      return new File([blob], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });
    }

    // More aggressive compression strategy for extreme ratios
    if (compressionRatio > 8) {
      // For extreme compression (8x+), be very aggressive
      if (attempt < 8) {
        quality *= 0.7; // Reduce quality aggressively
        scaleFactor *= 0.9; // Also reduce dimensions early
      } else if (attempt < 15) {
        quality *= 0.6;
        scaleFactor *= 0.85;
      } else {
        quality *= 0.5;
        scaleFactor *= 0.8;
      }
    } else if (compressionRatio > 5) {
      // For high compression (5x-8x)
      if (attempt < 5) {
        quality *= 0.8;
      } else if (attempt < 12) {
        quality *= 0.7;
        scaleFactor *= 0.9;
      } else {
        quality *= 0.6;
        scaleFactor *= 0.85;
      }
    } else {
      // For moderate compression (up to 5x) - original strategy
      if (attempt < 5) {
        quality *= 0.85;
      } else if (attempt < 10) {
        quality *= 0.75;
      } else {
        quality = Math.max(0.1, quality * 0.8);
        scaleFactor *= 0.9;
      }
    }

    // Ensure minimum values but allow very aggressive compression
    quality = Math.max(0.01, quality); // Allow much lower quality
    scaleFactor = Math.max(0.05, scaleFactor); // Allow much smaller dimensions

    attempt++;
  }

  // If we still can't compress enough, make ultra-aggressive final attempts
  URL.revokeObjectURL(imageUrl);
  
  console.log(`⚠️ Making ultra-aggressive final compression attempts...`);
  
  const finalAttempts = [
    { scale: 0.3, quality: 0.05 },
    { scale: 0.2, quality: 0.03 },
    { scale: 0.15, quality: 0.02 },
    { scale: 0.1, quality: 0.01 }
  ];

  for (const { scale, quality: finalQuality } of finalAttempts) {
    try {
      canvas.width = Math.max(20, Math.round(image.width * scale));
      canvas.height = Math.max(20, Math.round(image.height * scale));
      
      ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        const finalBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create ultra-compressed blob'));
              return;
            }
            resolve(blob);
          }, file.type, finalQuality);
        });
        
        const finalSizeKB = finalBlob.size / 1024;
        console.log(`🔧 Ultra-aggressive attempt: ${Math.round(finalSizeKB)}KB (scale: ${scale}, quality: ${finalQuality}, canvas: ${canvas.width}x${canvas.height})`);
        
        // Accept results within 50% tolerance for extreme compression
        const tolerance = compressionRatio > 8 ? 1.5 : compressionRatio > 5 ? 1.3 : 1.2;
        if (finalSizeKB <= maxSizeKB * tolerance) {
          console.log(`✅ Ultra compression completed with ${tolerance}x tolerance: ${Math.round(finalSizeKB)}KB`);
          return new File([finalBlob], file.name, {
            type: file.type,
            lastModified: file.lastModified,
          });
        }
      }
    } catch (error) {
      console.warn(`Ultra-aggressive attempt failed:`, error);
      continue;
    }
  }

  // Final fallback - return the best we can achieve with a warning
  console.warn(`⚠️ Extreme compression attempted. Returning best achievable result.`);
  
  try {
    canvas.width = Math.max(20, Math.round(image.width * 0.1));
    canvas.height = Math.max(20, Math.round(image.height * 0.1));
    
    ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      const fallbackBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create fallback blob'));
            return;
          }
          resolve(blob);
        }, file.type, 0.01);
      });
      
      const fallbackSizeKB = fallbackBlob.size / 1024;
      console.log(`🔧 Fallback result: ${Math.round(fallbackSizeKB)}KB (extreme compression applied)`);
      
      return new File([fallbackBlob], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });
    }
  } catch (error) {
    console.error(`Fallback compression also failed:`, error);
  }

  // If everything fails, throw a more helpful error
  throw new Error(
    `Unable to compress image from ${originalSizeKB}KB to ${maxSizeKB}KB even with extreme compression. ` +
    `The image may be too complex or large. Try using a different image or convert to a different format first.`
  );
}
