/**
 * Robust Image to PDF Conversion
 * Uses Canvas API and proper PDF structure
 */

// 🎯 Quality Preview Error for User Control
export class QualityPreviewRequiredError extends Error {
  public readonly quality: number;
  public readonly sizeKB: number;
  public readonly maxSizeKB: number;
  public readonly previewPDF: File;
  public readonly previewRequired: boolean; // true = mandatory, false = optional
  
  constructor(data: {
    quality: number;
    sizeKB: number;
    maxSizeKB: number;
    previewPDF: File;
    previewRequired: boolean;
    message: string;
  }) {
    super(data.message);
    this.name = 'QualityPreviewRequiredError';
    this.quality = data.quality;
    this.sizeKB = data.sizeKB;
    this.maxSizeKB = data.maxSizeKB;
    this.previewPDF = data.previewPDF;
    this.previewRequired = data.previewRequired;
  }
}

export async function convertImageToPDF(file: File, maxSizeKB?: number, forceOptimization = false): Promise<File> {
  console.log(`📄 Converting image to PDF: ${file.name} (${Math.round(file.size / 1024)}KB)`);
  if (maxSizeKB) {
    console.log(`🎯 Target PDF size limit: ${maxSizeKB}KB`);
  }
  
  try {
    // Validate input file
    if (!file.type.startsWith('image/')) {
      throw new Error(`Invalid file type for PDF conversion: ${file.type}`);
    }
    
    if (file.size === 0) {
      throw new Error('Cannot convert empty file to PDF');
    }
    
    // Create image element with enhanced error handling
    const image = new Image();
    const imageUrl = URL.createObjectURL(file);
    
    // Set up image loading with timeout
    const imageLoadPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Image loading timeout (10 seconds)'));
      }, 10000);
      
      image.onload = () => {
        clearTimeout(timeout);
        console.log(`📐 Image loaded successfully: ${image.width}x${image.height}`);
        resolve();
      };
      
      image.onerror = (e) => {
        clearTimeout(timeout);
        console.error('❌ Image loading failed:', e);
        reject(new Error('Failed to load image for PDF conversion - file may be corrupted'));
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
    
    // 🎯 INTELLIGENT ITERATIVE COMPRESSION STRATEGY
    let pdfFile: File | null = null;
    
    if (maxSizeKB) {
      console.log(`🔄 Starting intelligent compression for ${maxSizeKB}KB limit...`);
      
      // ENHANCED: More aggressive quality levels for better compression
      const qualityLevels = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.08, 0.05];
      
      for (const quality of qualityLevels) {
        try {
          console.log(`🧪 Testing quality level: ${(quality * 100).toFixed(0)}%`);
          
          const testPDF = await createPDFWithQuality(image, quality, file.name, file.lastModified);
          const testSizeKB = Math.round(testPDF.size / 1024);
          
          console.log(`📊 Quality ${(quality * 100).toFixed(0)}%: ${testSizeKB}KB`);
          
          if (testSizeKB <= maxSizeKB) {
            console.log(`✅ SUCCESS: Found compliant PDF at ${(quality * 100).toFixed(0)}% quality: ${testSizeKB}KB ≤ ${maxSizeKB}KB`);
            
            // 🚨 QUALITY CAUTION & PREVIEW SYSTEM
            const qualityPercent = quality * 100;
            
            if (qualityPercent < 50) {
              // MANDATORY PREVIEW for very low quality
              console.warn(`🔴 MANDATORY PREVIEW REQUIRED: Quality reduced to ${qualityPercent.toFixed(0)}%`);
              throw new QualityPreviewRequiredError({
                quality: qualityPercent,
                sizeKB: testSizeKB,
                maxSizeKB: maxSizeKB,
                previewPDF: testPDF,
                previewRequired: true,
                message: `Document quality has been significantly reduced to ${qualityPercent.toFixed(0)}% to meet the ${maxSizeKB}KB size requirement. Please preview the document to ensure it's still readable before proceeding.`
              });
            } else if (qualityPercent < 90) {
              // CAUTION MESSAGE for moderate quality reduction
              console.warn(`🟡 QUALITY CAUTION: Quality reduced to ${qualityPercent.toFixed(0)}%`);
              throw new QualityPreviewRequiredError({
                quality: qualityPercent,
                sizeKB: testSizeKB,
                maxSizeKB: maxSizeKB,
                previewPDF: testPDF,
                previewRequired: false,
                message: `Document quality has been reduced to ${qualityPercent.toFixed(0)}% to meet the ${maxSizeKB}KB size requirement. You may want to preview the document to ensure it meets your quality standards.`
              });
            }
            
            pdfFile = testPDF;
            break;
          }
          
        } catch (error) {
          // Re-throw quality preview errors to be handled by UI
          if (error instanceof QualityPreviewRequiredError) {
            throw error;
          }
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.warn(`⚠️ Quality ${(quality * 100).toFixed(0)}% failed:`, errorMessage);
          continue;
        }
      }
      
      // If no quality level worked, try image resizing
      if (!pdfFile) {
        console.log(`🔄 All quality levels exceeded limit. Trying image resizing...`);
        pdfFile = await tryImageResizing(image, maxSizeKB, file.name, file.lastModified);
      }
      
      // Final check
      if (!pdfFile) {
        console.error(`❌ Could not create PDF within ${maxSizeKB}KB limit`);
        console.error(`💡 Consider: 1) Increasing size limit, 2) Using lower resolution image, 3) Different format`);
        throw new Error(`Cannot create PDF within ${maxSizeKB}KB size limit. Try increasing the limit or using a smaller image.`);
      }
      
    } else {
      // No size limit - use default quality
      console.log(`📄 Creating PDF without size restrictions...`);
      pdfFile = await createPDFWithQuality(image, 0.8, file.name, file.lastModified);
    }
    
    // Clean up
    URL.revokeObjectURL(imageUrl);
    
    const finalSizeKB = Math.round(pdfFile.size / 1024);
    console.log(`✅ PDF conversion complete: ${pdfFile.name} (${finalSizeKB}KB)`);
    console.log(`📊 Conversion: ${Math.round(file.size / 1024)}KB → ${finalSizeKB}KB (${((pdfFile.size / file.size) * 100).toFixed(1)}%)`);
    
    return pdfFile;
    
  } catch (error) {
    console.error('❌ PDF conversion failed:', error);
    throw new Error(`Failed to convert image to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function createPDFWithQuality(image: HTMLImageElement, quality: number, originalName: string, lastModified: number): Promise<File> {
  // Create canvas and draw image
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  // Set high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw white background (for transparency handling)
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw the image
  ctx.drawImage(image, 0, 0);
  
  // Convert to JPEG with specified quality
  const imageDataURL = canvas.toDataURL('image/jpeg', quality);
  
  if (!imageDataURL || imageDataURL.length < 100) {
    throw new Error('Failed to generate image data URL - canvas conversion failed');
  }
  
  // Create PDF using the robust method
  const pdfBlob = await createPDFWithEmbeddedImage(imageDataURL, image.width, image.height, originalName);
  
  // Validate PDF creation
  if (!pdfBlob || pdfBlob.size === 0) {
    throw new Error('PDF creation failed - generated blob is empty');
  }
  
  // Create PDF file
  const newFilename = originalName.replace(/\.[^.]+$/, '.pdf');
  return new File([pdfBlob], newFilename, {
    type: 'application/pdf',
    lastModified: lastModified,
  });
}

async function tryImageResizing(image: HTMLImageElement, maxSizeKB: number, originalName: string, lastModified: number): Promise<File | null> {
  console.log(`🔄 Attempting image resizing to meet ${maxSizeKB}KB limit...`);
  
  // 🎯 TARGET 85% of max size to avoid overcompression
  const targetSizeKB = Math.round(maxSizeKB * 0.85);
  console.log(`🎯 Target size: ${targetSizeKB}KB (85% of ${maxSizeKB}KB limit)`);
  
  // ENHANCED: More aggressive scaling factors for better compression
  const scalingFactors = [0.8, 0.7, 0.6, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15];
  
  for (const scale of scalingFactors) {
    try {
      const scaledWidth = Math.round(image.width * scale);
      const scaledHeight = Math.round(image.height * scale);
      
      console.log(`🔍 Testing ${(scale * 100).toFixed(0)}% scale: ${scaledWidth}x${scaledHeight}`);
      
      // Create scaled canvas
      const canvas = document.createElement('canvas');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      
      // High-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, scaledWidth, scaledHeight);
      
      // Draw scaled image
      ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
      
      // ENHANCED: More aggressive quality levels for each scale
      for (const quality of [0.8, 0.6, 0.4, 0.3, 0.2, 0.15, 0.1, 0.05]) {
        const imageDataURL = canvas.toDataURL('image/jpeg', quality);
        const pdfBlob = await createPDFWithEmbeddedImage(imageDataURL, scaledWidth, scaledHeight, originalName);
        
        const newFilename = originalName.replace(/\.[^.]+$/, '.pdf');
        const testFile = new File([pdfBlob], newFilename, {
          type: 'application/pdf',
          lastModified: lastModified,
        });
        
        const sizeKB = Math.round(testFile.size / 1024);
        console.log(`📊 Scale ${(scale * 100).toFixed(0)}%, Quality ${(quality * 100).toFixed(0)}%: ${sizeKB}KB`);
        
        // 🎯 Check if we hit the target (85% of max) first
        if (sizeKB <= targetSizeKB) {
          console.log(`✅ TARGET ACHIEVED with resizing: ${sizeKB}KB ≤ ${targetSizeKB}KB (target)`);
          return testFile;
        }
        
        // 🔥 Fallback: If we're within max limit but over target, still acceptable
        if (sizeKB <= maxSizeKB) {
          console.log(`⚠️ ACCEPTABLE with resizing: ${sizeKB}KB ≤ ${maxSizeKB}KB (over target but within limit)`);
          return testFile;
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`⚠️ Scaling ${(scale * 100).toFixed(0)}% failed:`, errorMessage);
      continue;
    }
  }
  
  console.log(`❌ Image resizing could not achieve ${maxSizeKB}KB limit`);
  return null;
}

async function createPDFWithEmbeddedImage(imageDataURL: string, originalWidth: number, originalHeight: number, originalName: string): Promise<Blob> {
  // Calculate optimal PDF page size
  const A4_WIDTH = 595.28; // A4 width in points (8.27 inches * 72 points/inch)
  const A4_HEIGHT = 841.89; // A4 height in points (11.69 inches * 72 points/inch)
  
  // Smart margin calculation based on image aspect ratio and type
  const aspectRatio = originalWidth / originalHeight;
  let margin = 20; // Default margin
  
  // Detect document type based on filename and aspect ratio
  const filename = originalName.toLowerCase();
  const isIDCard = filename.includes('id') || filename.includes('card') || filename.includes('aadhar') || filename.includes('license');
  const isCertificate = filename.includes('certificate') || filename.includes('marksheet') || filename.includes('diploma');
  
  // Adjust margins based on document type
  if (isIDCard) {
    // ID cards are usually small, use smaller margins for better visibility
    margin = 12;
    console.log(`📇 Detected ID card - using reduced margins (${margin}pt)`);
  } else if (isCertificate) {
    // Certificates usually have important content at edges, use minimal margins
    margin = 8;
    console.log(`📜 Detected certificate/marksheet - using minimal margins (${margin}pt)`);
  } else if (aspectRatio > 1.5) {
    // Wide images (landscape documents) - reduce margins
    margin = 15;
    console.log(`🖼️ Detected wide document - using reduced margins (${margin}pt)`);
  }
  
  const availableWidth = A4_WIDTH - (2 * margin);
  const availableHeight = A4_HEIGHT - (2 * margin);
  
  console.log(`📐 Original image: ${originalWidth}x${originalHeight} (aspect ratio: ${aspectRatio.toFixed(2)})`);
  console.log(`📄 Available PDF area: ${availableWidth.toFixed(1)}x${availableHeight.toFixed(1)} with ${margin}pt margins`);
  
  // Calculate scaling to fit within A4 with margins (preserve aspect ratio)
  const scaleX = availableWidth / originalWidth;
  const scaleY = availableHeight / originalHeight;
  const scale = Math.min(scaleX, scaleY); // Use minimum scale to fit entirely (no cropping)
  
  // Don't upscale images that are already small enough
  const finalScale = Math.min(scale, 1.0);
  
  // Final scaled dimensions for display
  const displayWidth = originalWidth * finalScale;
  const displayHeight = originalHeight * finalScale;
  
  // Center the image on the page
  const x = (A4_WIDTH - displayWidth) / 2;
  const y = (A4_HEIGHT - displayHeight) / 2;
  
  console.log(`📊 Scale factor: ${finalScale.toFixed(3)} (${(finalScale * 100).toFixed(1)}%)`);
  console.log(`📄 Display size: ${displayWidth.toFixed(1)}x${displayHeight.toFixed(1)}`);
  console.log(`📍 Position: (${x.toFixed(1)}, ${y.toFixed(1)})`);
  
  // Validate that image will fit properly
  if (displayWidth > availableWidth || displayHeight > availableHeight) {
    console.warn(`⚠️ Warning: Image may still be too large for page!`);
    console.warn(`   Display: ${displayWidth.toFixed(1)}x${displayHeight.toFixed(1)}`);
    console.warn(`   Available: ${availableWidth.toFixed(1)}x${availableHeight.toFixed(1)}`);
  }
  const base64Data = imageDataURL.split(',')[1];
  
  // ✅ KEY FIX: Pass original image dimensions to XObject, display dimensions to content stream
  const pdfDoc = createMinimalPDF(originalWidth, originalHeight, displayWidth, displayHeight, x, y, base64Data, originalName);

  return new Blob([new Uint8Array(pdfDoc)], { type: 'application/pdf' });
}

function createMinimalPDF(
  originalWidth: number, 
  originalHeight: number, 
  displayWidth: number, 
  displayHeight: number, 
  x: number, 
  y: number, 
  imageBase64: string, 
  title: string
): Uint8Array {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  
  console.log(`📄 Creating PDF:`);
  console.log(`   🖼️ Original image: ${originalWidth}x${originalHeight}`);
  console.log(`   📺 Display size: ${displayWidth.toFixed(1)}x${displayHeight.toFixed(1)}`);
  console.log(`   📍 Position: (${x.toFixed(1)}, ${y.toFixed(1)})`);
  console.log(`   📊 Image data: ${imageBase64.length} chars`);
  
  // Convert base64 to Uint8Array for proper binary handling
  const binaryString = atob(imageBase64);
  const imageBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    imageBytes[i] = binaryString.charCodeAt(i);
  }
  
  console.log(`🔢 Binary image data: ${imageBytes.length} bytes, first few: [${Array.from(imageBytes.slice(0, 4)).map(b => b.toString(16)).join(' ')}]`);
  
  // Verify JPEG signature
  if (imageBytes[0] !== 0xFF || imageBytes[1] !== 0xD8) {
    console.warn(`⚠️ Warning: Image doesn't have JPEG signature, got: ${imageBytes[0].toString(16)} ${imageBytes[1].toString(16)}`);
  }
  
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  
  // PDF header
  parts.push(encoder.encode('%PDF-1.4\n'));
  
  // Build each object and track offsets
  const offsets: number[] = [];
  
  // Calculate current length helper
  const getCurrentLength = () => parts.reduce((sum, part) => sum + part.length, 0);
  
  // Object 1: Document catalog
  offsets[1] = getCurrentLength();
  const obj1 = encoder.encode(`1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n/Title (${title})\n/Producer (Dockit PDF Converter)\n/CreationDate (D:${timestamp})\n>>\nendobj\n\n`);
  parts.push(obj1);
  
  // Object 2: Pages
  offsets[2] = getCurrentLength();
  const obj2 = encoder.encode(`2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n\n`);
  parts.push(obj2);
  
  // Object 3: Page
  offsets[3] = getCurrentLength();
  const obj3 = encoder.encode(`3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 595.28 841.89]\n/Resources <<\n/XObject <<\n/Im1 4 0 R\n>>\n>>\n/Contents 5 0 R\n>>\nendobj\n\n`);
  parts.push(obj3);
  
  // Object 4: Image XObject (use ORIGINAL dimensions - this is the source image)
  offsets[4] = getCurrentLength();
  const obj4Header = encoder.encode(`4 0 obj\n<<\n/Type /XObject\n/Subtype /Image\n/Width ${originalWidth}\n/Height ${originalHeight}\n/ColorSpace /DeviceRGB\n/BitsPerComponent 8\n/Filter /DCTDecode\n/Length ${imageBytes.length}\n>>\nstream\n`);
  const obj4Footer = encoder.encode('\nendstream\nendobj\n\n');
  
  parts.push(obj4Header);
  parts.push(imageBytes);  // Add raw binary image data
  parts.push(obj4Footer);
  
  // Object 5: Content stream (use DISPLAY dimensions - this is how it appears on page)
  offsets[5] = getCurrentLength();
  // PDF uses bottom-up coordinates
  const pdfY = 841.89 - y - displayHeight;
  
  // ✅ KEY FIX: The transformation matrix scales from original to display size
  // Format: [a b c d e f] where a=width_scale, d=height_scale, e=x_offset, f=y_offset
  const contentStream = `q\n${displayWidth.toFixed(2)} 0 0 ${displayHeight.toFixed(2)} ${x.toFixed(2)} ${pdfY.toFixed(2)} cm\n/Im1 Do\nQ\n`;
  
  console.log(`📄 Content stream: "${contentStream.trim()}"`);
  
  const obj5 = encoder.encode(`5 0 obj\n<<\n/Length ${contentStream.length}\n>>\nstream\n${contentStream}\nendstream\nendobj\n\n`);
  parts.push(obj5);
  
  // Cross-reference table with correct offsets
  const xrefStart = getCurrentLength();
  let xrefContent = 'xref\n0 6\n0000000000 65535 f \n';
  
  for (let i = 1; i <= 5; i++) {
    const offset = offsets[i].toString().padStart(10, '0');
    xrefContent += `${offset} 00000 n \n`;
  }
  
  parts.push(encoder.encode(xrefContent));
  
  // Trailer
  const trailer = encoder.encode(`trailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n${xrefStart}\n%%EOF\n`);
  parts.push(trailer);
  
  // Combine all parts into single Uint8Array
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(totalLength);
  
  let position = 0;
  for (const part of parts) {
    result.set(part, position);
    position += part.length;
  }
  
  console.log(`✅ PDF created successfully: ${result.length} bytes total`);
  console.log(`📊 Cross-reference starts at: ${xrefStart}`);
  console.log(`📊 Offsets: [${offsets.slice(1).join(', ')}]`);
  
  return result;
}

// Enhanced format conversion that handles PDF
export async function convertFormatEnhanced(file: File, targetFormat: string, maxSizeKB?: number): Promise<File> {
  console.log(`🔄 Enhanced format conversion: ${file.type} → ${targetFormat} (${Math.round(file.size / 1024)}KB)`);
  if (maxSizeKB) {
    console.log(`🎯 Target size limit: ${maxSizeKB}KB`);
  }
  
  // Normalize format string
  const normalizedFormat = normalizeFormat(targetFormat);
  
  // Handle PDF conversion
  if (isPDFFormat(normalizedFormat)) {
    console.log(`📄 Detected PDF conversion request`);
    
    try {
      // 🎯 USE NEW INTELLIGENT COMPRESSION SYSTEM
      console.log(`🔄 Using intelligent PDF compression system...`);
      const result = await convertImageToPDF(file, maxSizeKB);
      
      // The new system handles size limits internally and throws quality preview errors
      return result;
      
    } catch (pdfError) {
      // Re-throw quality preview errors to be handled by UI
      if (pdfError instanceof QualityPreviewRequiredError) {
        console.log(`🔍 Quality preview required - forwarding to UI`);
        throw pdfError;
      }
      
      console.warn(`⚠️ Intelligent PDF conversion failed:`, pdfError);
      
      try {
        // ENHANCED FALLBACK: Use ultra-aggressive compression
        console.log(`🔄 Attempting ultra-aggressive fallback compression...`);
        const fallbackResult = await convertImageToPDFUltraCompressed(file, maxSizeKB);
        
        return fallbackResult;
      } catch (fallbackError) {
        console.error(`❌ Both PDF conversion methods failed:`, fallbackError);
        const primaryMsg = pdfError instanceof Error ? pdfError.message : 'Unknown primary error';
        const fallbackMsg = fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error';
        throw new Error(`PDF conversion failed: ${primaryMsg} (fallback also failed: ${fallbackMsg})`);
      }
    }
  }
  
  // Handle image-to-image conversion
  console.log(`🖼️ Detected image format conversion`);
  return await convertImageToImage(file, normalizedFormat);
}

function normalizeFormat(format: string): string {
  const normalized = format.toLowerCase().trim();
  
  if (normalized.includes('pdf') || normalized === 'application/pdf') {
    return 'application/pdf';
  }
  
  if (normalized.includes('jpg') || normalized.includes('jpeg')) {
    return 'image/jpeg';
  }
  
  if (normalized.includes('png')) {
    return 'image/png';
  }
  
  if (normalized.includes('webp')) {
    return 'image/webp';
  }
  
  // Default to original format if unknown
  return format;
}

function isPDFFormat(format: string): boolean {
  return format.includes('pdf') || format === 'application/pdf';
}

async function convertImageToImage(file: File, targetFormat: string): Promise<File> {
  // This is the existing image-to-image conversion logic
  const image = new Image();
  const imageUrl = URL.createObjectURL(file);

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('Failed to load image for format conversion'));
    image.src = imageUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  ctx.drawImage(image, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob during format conversion'));
        return;
      }
      resolve(blob);
    }, targetFormat, 0.95);
  });

  URL.revokeObjectURL(imageUrl);
  
  const extension = targetFormat.split('/')[1];
  const newFilename = file.name.replace(/\.[^.]+$/, `.${extension}`);

  return new File([blob], newFilename, {
    type: targetFormat,
    lastModified: file.lastModified,
  });
}

/**
 * Ultra-aggressive PDF compression as last resort
 * This function tries extreme measures to meet size requirements
 */
async function convertImageToPDFUltraCompressed(file: File, maxSizeKB?: number): Promise<File> {
  console.log(`🚨 Ultra-aggressive PDF compression for: ${file.name}`);
  
  if (!maxSizeKB) {
    // If no size limit, just use normal conversion
    return convertImageToPDF(file);
  }

  // 🎯 TARGET 85% of max size even in ultra-aggressive mode
  const targetSizeKB = Math.round(maxSizeKB * 0.85);
  console.log(`🎯 Ultra-aggressive target: ${targetSizeKB}KB (85% of ${maxSizeKB}KB limit)`);
  console.log(`🔥 Fallback limit: ${maxSizeKB}KB (absolute maximum)`);
  
  // Load image
  const image = new Image();
  const imageUrl = URL.createObjectURL(file);
  
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Failed to load image for ultra compression'));
    image.src = imageUrl;
  });
  
  // Ultra-aggressive strategy: Start with very small dimensions and very low quality
  const ultraScales = [0.3, 0.25, 0.2, 0.15, 0.12, 0.1, 0.08, 0.06, 0.05, 0.04, 0.03];
  const ultraQualities = [0.1, 0.08, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01];
  
  for (const scale of ultraScales) {
    for (const quality of ultraQualities) {
      try {
        const scaledWidth = Math.max(50, Math.round(image.width * scale)); // Minimum 50px width
        const scaledHeight = Math.max(50, Math.round(image.height * scale)); // Minimum 50px height
        
        console.log(`🔬 Ultra test: ${(scale * 100).toFixed(1)}% scale (${scaledWidth}x${scaledHeight}) + ${(quality * 100).toFixed(1)}% quality`);
        
        // Create ultra-small canvas
        const canvas = document.createElement('canvas');
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        
        // Disable smoothing for maximum compression (creates more artifacts but smaller file)
        ctx.imageSmoothingEnabled = false;
        
        // Draw white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, scaledWidth, scaledHeight);
        
        // Draw ultra-compressed image
        ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
        
        // Create ultra-low quality JPEG
        const imageDataURL = canvas.toDataURL('image/jpeg', quality);
        const pdfBlob = await createPDFWithEmbeddedImage(imageDataURL, scaledWidth, scaledHeight, file.name);
        
        const newFilename = file.name.replace(/\.[^.]+$/, '.pdf');
        const testFile = new File([pdfBlob], newFilename, {
          type: 'application/pdf',
          lastModified: file.lastModified,
        });
        
        const sizeKB = Math.round(testFile.size / 1024);
        
        // 🎯 Check if we hit the target (85% of max) first
        if (sizeKB <= targetSizeKB) {
          console.log(`🎉 ULTRA TARGET ACHIEVED: ${sizeKB}KB ≤ ${targetSizeKB}KB with ${(scale * 100).toFixed(1)}% scale + ${(quality * 100).toFixed(1)}% quality`);
          
          // Clean up
          URL.revokeObjectURL(imageUrl);
          
          return testFile;
        }
        
        // 🔥 Fallback: If we're within max limit but over target
        if (sizeKB <= maxSizeKB) {
          console.log(`⚠️ ULTRA OVERCOMPRESSED: ${sizeKB}KB ≤ ${maxSizeKB}KB with ${(scale * 100).toFixed(1)}% scale + ${(quality * 100).toFixed(1)}% quality`);
          console.warn(`⚠️ WARNING: Document quality severely reduced for size compliance (overcompressed)`);
          
          // Clean up
          URL.revokeObjectURL(imageUrl);
          
          return testFile;
        }
        
        console.log(`   📊 Result: ${sizeKB}KB (still too large)`);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`⚠️ Ultra compression failed at ${(scale * 100).toFixed(1)}%/${(quality * 100).toFixed(1)}%:`, errorMessage);
        continue;
      }
    }
  }
  
  // Clean up
  URL.revokeObjectURL(imageUrl);
  
  // If even ultra-aggressive compression failed, throw detailed error
  const currentSizeKB = Math.round(file.size / 1024);
  throw new Error(`Cannot compress ${currentSizeKB}KB image to ${maxSizeKB}KB PDF even with ultra-aggressive compression. The image may be too complex or the size limit too restrictive. Consider: 1) Using a simpler image with less detail, 2) Increasing the size limit to at least ${Math.ceil(currentSizeKB * 0.1)}KB, or 3) Pre-processing the image to reduce complexity.`);
}