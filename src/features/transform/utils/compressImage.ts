export async function compressImage(file: File, maxSizeKB: number): Promise<File> {
  const originalSizeKB = Math.round(file.size / 1024);
  const compressionRatio = originalSizeKB / maxSizeKB;
  
  console.log(`🗜️ Compressing image: ${file.name} (${originalSizeKB}KB) to max ${maxSizeKB}KB (${compressionRatio.toFixed(1)}x compression needed)`);

  // Create an image element
  const image = new Image();
  const imageUrl = URL.createObjectURL(file);

  // Load the image
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('Failed to load image for compression'));
    image.src = imageUrl;
  });

  console.log(`📐 Original dimensions: ${image.width}x${image.height}`);

  // Create canvas
  const canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Calculate aggressive initial settings for extreme compression
  let quality = compressionRatio > 8 ? 0.3 : compressionRatio > 5 ? 0.5 : compressionRatio > 3 ? 0.7 : 0.9;
  let scaleFactor = compressionRatio > 8 ? 0.4 : compressionRatio > 5 ? 0.6 : compressionRatio > 3 ? 0.8 : 1.0;
  
  let attempt = 0;
  const MAX_ATTEMPTS = 25; // Increased attempts for extreme compression

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
