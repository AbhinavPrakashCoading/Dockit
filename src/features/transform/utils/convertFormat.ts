export async function convertFormat(file: File, targetFormat: string): Promise<File> {
  console.log(`🔄 Image format conversion: ${file.type} → ${targetFormat} (${Math.round(file.size / 1024)}KB)`);
  
  try {
    // Validate input file
    if (!file.type.startsWith('image/')) {
      throw new Error(`Invalid file type for format conversion: ${file.type}`);
    }
    
    if (file.size === 0) {
      throw new Error('Cannot convert empty file');
    }
    
    // Create an image element with enhanced error handling
    const image = new Image();
    const imageUrl = URL.createObjectURL(file);

    // Load the image with timeout
    const imageLoadPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Image loading timeout (10 seconds)'));
      }, 10000);
      
      image.onload = () => {
        clearTimeout(timeout);
        console.log(`📐 Image loaded: ${image.width}x${image.height}`);
        resolve();
      };
      
      image.onerror = (e) => {
        clearTimeout(timeout);
        console.error('❌ Image loading failed:', e);
        reject(new Error('Failed to load image for format conversion - file may be corrupted'));
      };
      
      image.src = imageUrl;
    });

    await imageLoadPromise;
    
    // Validate image dimensions
    if (image.width === 0 || image.height === 0) {
      throw new Error(`Invalid image dimensions: ${image.width}x${image.height}`);
    }
    
    if (image.width > 10000 || image.height > 10000) {
      console.warn(`⚠️ Very large image: ${image.width}x${image.height} - this may cause memory issues`);
    }

    // Create canvas with enhanced quality settings
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    // Get context with quality settings (same as resizing function)
    const ctx = canvas.getContext('2d', {
      alpha: true,
      willReadFrequently: true
    });
    
    if (!ctx) throw new Error('Failed to get canvas context');
    
    // Use better quality settings (same as PDF conversion)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw white background for transparency handling (especially for JPEG conversion)
    if (targetFormat === 'image/jpeg' || targetFormat.includes('jpeg')) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw image with high quality
    ctx.drawImage(image, 0, 0);

    // Convert to blob with high quality and validation
    const blob = await new Promise<Blob>((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob during format conversion'));
            return;
          }
          
          if (blob.size === 0) {
            reject(new Error('Generated blob is empty'));
            return;
          }
          
          console.log(`🖼️ Format conversion successful: ${Math.round(blob.size / 1024)}KB`);
          resolve(blob);
        }, targetFormat, 0.95); // High quality setting
      } catch (error) {
        reject(error);
      }
    });

    // Clean up
    URL.revokeObjectURL(imageUrl);

    // Create new filename with correct extension
    const extension = targetFormat.split('/')[1];
    const newFilename = file.name.replace(/\.[^.]+$/, `.${extension}`);

    // Create and validate new file
    const newFile = new File([blob], newFilename, {
      type: targetFormat,
      lastModified: file.lastModified,
    });
    
    console.log(`✅ Format conversion complete: ${file.name} → ${newFile.name}`);
    console.log(`📊 Size change: ${Math.round(file.size / 1024)}KB → ${Math.round(newFile.size / 1024)}KB`);
    
    return newFile;
    
  } catch (error) {
    console.error('❌ Format conversion failed:', error);
    throw new Error(`Failed to convert image format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
