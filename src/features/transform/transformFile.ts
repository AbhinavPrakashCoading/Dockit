import { resizeImage, Dimensions } from './utils/resizeImage';
import { convertFormat } from './utils/convertFormat';
import { compressImage } from './utils/compressImage';
import { normalizeName } from './utils/normalizeName';
import { Requirement } from '@/features/exam/types';

export async function transformFile(file: File, req: Requirement): Promise<File> {
  let transformed = file;
  
  console.log(`🔄 Starting transformation for: ${file.name} (${Math.round(file.size / 1024)}KB)`);
  console.log(`📋 Target requirements:`, req);

  try {
    // Pre-compression for extremely large files (>5MB) to make processing more manageable
    const initialSizeKB = Math.round(file.size / 1024);
    if (initialSizeKB > 5120) { // 5MB
      console.log(`🚀 Pre-compressing extremely large file: ${initialSizeKB}KB`);
      try {
        // Pre-compress to roughly 2MB to make subsequent processing faster
        const preCompressTarget = Math.min(2048, req.maxSizeKB ? req.maxSizeKB * 3 : 2048);
        transformed = await compressImage(transformed, preCompressTarget);
        console.log(`✅ Pre-compression complete: ${Math.round(transformed.size / 1024)}KB`);
      } catch (preCompressError) {
        console.warn('⚠️ Pre-compression failed, continuing with original file:', preCompressError);
        // Continue with original file if pre-compression fails
      }
    }

    // Convert format first (might help with compression)
    if (req.format && transformed.type !== req.format) {
      console.log(`🔄 Converting format: ${transformed.type} → ${req.format}`);
      transformed = await convertFormat(transformed, req.format);
    }

    // Resize if dimensions are specified (do this before compression for better results)
    if (req.dimensions) {
      console.log(`🔄 Resizing to dimensions: ${req.dimensions}`);
      
      // Handle string dimensions (e.g., "200x230") by converting to Dimensions object
      let dimensionsObj: Dimensions;
      if (typeof req.dimensions === 'string') {
        const [width, height] = req.dimensions.split('x').map((d: string) => parseInt(d));
        dimensionsObj = { width, height };
      } else {
        dimensionsObj = req.dimensions;
      }
      
      transformed = await resizeImage(transformed, dimensionsObj);
    }

    // Compress if size exceeds max (with enhanced fallback strategy)
    const sizeKB = Math.round(transformed.size / 1024);
    if (req.maxSizeKB && sizeKB > req.maxSizeKB) {
      console.log(`🗜️ Compression needed: ${sizeKB}KB → ${req.maxSizeKB}KB (${(sizeKB / req.maxSizeKB).toFixed(1)}x compression)`);
      
      try {
        transformed = await compressImage(transformed, req.maxSizeKB);
      } catch (compressionError) {
        console.warn('⚠️ Primary compression failed, trying alternative strategies...');
        
        // Enhanced fallback strategies for extreme compression
        const compressionRatio = sizeKB / req.maxSizeKB;
        
        if (compressionRatio > 8) {
          // For extreme compression ratios (8x+), try multiple strategies
          console.log(`🔄 Extreme compression ratio detected (${compressionRatio.toFixed(1)}x), trying enhanced strategies...`);
          
          // Strategy 1: More aggressive dimension reduction first
          if (req.dimensions) {
            try {
              console.log(`🔄 Trying aggressive dimension reduction...`);
              const [width, height] = req.dimensions.split('x').map((d: string) => Math.round(parseInt(d) * 0.7));
              const reducedDimensions: Dimensions = { width, height };
              const smallerFile = await resizeImage(transformed, reducedDimensions);
              transformed = await compressImage(smallerFile, req.maxSizeKB);
              console.log(`✅ Extreme compression successful with aggressive resizing`);
            } catch (aggressiveError) {
              console.warn('⚠️ Aggressive dimension reduction failed:', aggressiveError);
              throw compressionError; // Re-throw original error if all strategies fail
            }
          } else {
            throw compressionError; // No dimensions to work with for extreme compression
          }
        } else {
          // For moderate compression ratios, use original fallback strategy
          try {
            const relaxedTarget = Math.round(req.maxSizeKB * 1.5);
            console.log(`🔄 Trying relaxed compression target: ${relaxedTarget}KB`);
            transformed = await compressImage(transformed, relaxedTarget);
          } catch (relaxedError) {
            // Fallback 2: If we have dimensions, try reducing them more aggressively
            if (req.dimensions) {
              console.log('🔄 Trying aggressive dimension reduction...');
              try {
                // Reduce dimensions by 50% and try again
                const [width, height] = req.dimensions.split('x').map((d: string) => Math.round(parseInt(d) * 0.5));
                const reducedDimensions: Dimensions = {
                  width: width,
                  height: height
                };
                transformed = await resizeImage(transformed, reducedDimensions);
                transformed = await compressImage(transformed, req.maxSizeKB);
              } catch (fallbackError) {
                // If all else fails, throw the original error with helpful context
                throw new Error(
                  `Unable to compress file to ${req.maxSizeKB}KB. ` +
                  `Original: ${Math.round(file.size / 1024)}KB, ` +
                  `Current: ${sizeKB}KB. ` +
                  `Please try a smaller image file.`
                );
              }
            } else {
              // No dimensions to work with, throw original error
              throw compressionError;
            }
          }
        }
      }
    }

    // Normalize filename
    transformed = normalizeName(transformed, req.type);

    console.log(`✅ Transformation complete: ${file.name} → ${transformed.name} (${Math.round(transformed.size / 1024)}KB)`);
    return transformed;
    
  } catch (error) {
    console.error('❌ Transformation failed:', error);
    throw error;
  }
}
