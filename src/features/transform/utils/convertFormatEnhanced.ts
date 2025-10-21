/**
 * Enhanced Format Conversion with PDF Support
 * Handles image-to-image and image-to-PDF conversions
 */

// Simple PDF generation library (you may want to use jsPDF or pdf-lib in production)
declare const jsPDF: any;

export async function convertFormatEnhanced(file: File, targetFormat: string): Promise<File> {
  console.log(`🔄 Enhanced format conversion: ${file.type} → ${targetFormat}`);
  
  // Handle PDF conversion specially
  if (targetFormat.toLowerCase().includes('pdf') || targetFormat.toLowerCase() === 'application/pdf') {
    return await convertImageToPDF(file);
  }
  
  // Handle image-to-image conversion (existing logic)
  return await convertImageToImage(file, targetFormat);
}

async function convertImageToPDF(file: File): Promise<File> {
  console.log(`📄 Converting image to PDF: ${file.name}`);
  
  try {
    // Create image element to get dimensions
    const image = new Image();
    const imageUrl = URL.createObjectURL(file);
    
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('Failed to load image for PDF conversion'));
      image.src = imageUrl;
    });
    
    // Create canvas to get image data
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    ctx.drawImage(image, 0, 0);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    // Simple PDF creation using canvas and PDF generation
    // This is a basic implementation - for production, use jsPDF or pdf-lib
    const pdf = await createSimplePDF(imageData, image.width, image.height);
    
    // Clean up
    URL.revokeObjectURL(imageUrl);
    
    // Create PDF file
    const newFilename = file.name.replace(/\.[^.]+$/, '.pdf');
    return new File([pdf], newFilename, {
      type: 'application/pdf',
      lastModified: file.lastModified,
    });
    
  } catch (error) {
    console.error('❌ PDF conversion failed:', error);
    throw new Error(`Failed to convert image to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function createSimplePDF(imageData: string, width: number, height: number): Promise<Blob> {
  // This is a basic PDF implementation
  // For production, you should use a proper PDF library like jsPDF or pdf-lib
  
  // Calculate PDF dimensions (A4 aspect ratio consideration)
  const maxWidth = 595; // A4 width in points
  const maxHeight = 842; // A4 height in points
  
  let pdfWidth = width;
  let pdfHeight = height;
  
  // Scale to fit A4 if needed
  if (width > maxWidth || height > maxHeight) {
    const scaleX = maxWidth / width;
    const scaleY = maxHeight / height;
    const scale = Math.min(scaleX, scaleY);
    
    pdfWidth = width * scale;
    pdfHeight = height * scale;
  }
  
  // Simple PDF structure (this is very basic - use a proper library for production)
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/XObject <<
/Im1 4 0 R
>>
>>
/MediaBox [0 0 ${pdfWidth} ${pdfHeight}]
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /XObject
/Subtype /Image
/Width ${width}
/Height ${height}
/ColorSpace /DeviceRGB
/BitsPerComponent 8
/Filter /DCTDecode
/Length ${imageData.length}
>>
stream
${imageData}
endstream
endobj

5 0 obj
<<
/Length 44
>>
stream
q
${pdfWidth} 0 0 ${pdfHeight} 0 0 cm
/Im1 Do
Q
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000000484 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
578
%%EOF`;

  return new Blob([pdfContent], { type: 'application/pdf' });
}

async function convertImageToImage(file: File, targetFormat: string): Promise<File> {
  console.log(`🖼️ Converting image format: ${file.type} → ${targetFormat}`);
  
  // Create an image element
  const image = new Image();
  const imageUrl = URL.createObjectURL(file);

  // Load the image
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('Failed to load image for format conversion'));
    image.src = imageUrl;
  });

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  // Draw image
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  ctx.drawImage(image, 0, 0);

  // Convert to blob with new format
  const blob = await new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob during format conversion'));
          return;
        }
        resolve(blob);
      }, targetFormat, 0.95);
    } catch (error) {
      reject(error);
    }
  });

  // Clean up
  URL.revokeObjectURL(imageUrl);

  // Create new filename with correct extension
  const extension = targetFormat.split('/')[1];
  const newFilename = file.name.replace(/\.[^.]+$/, `.${extension}`);

  // Return new file
  return new File([blob], newFilename, {
    type: targetFormat,
    lastModified: file.lastModified,
  });
}

// Enhanced format detection
export function detectTargetFormat(formatString: string): string {
  const format = formatString.toLowerCase();
  
  if (format.includes('pdf') || format === 'application/pdf') {
    return 'application/pdf';
  }
  
  if (format.includes('jpg') || format.includes('jpeg')) {
    return 'image/jpeg';
  }
  
  if (format.includes('png')) {
    return 'image/png';
  }
  
  if (format.includes('webp')) {
    return 'image/webp';
  }
  
  // Default to JPEG for unknown formats
  return 'image/jpeg';
}