/**
 * Alternative PDF Generation using simpler approach
 * This creates the absolute minimum PDF structure to test if complexity is the issue
 */

export async function convertImageToPDFSimple(file: File): Promise<File> {
  console.log(`📄 Simple PDF conversion: ${file.name}`);
  
  try {
    // Load image
    const image = new Image();
    const imageUrl = URL.createObjectURL(file);
    
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = imageUrl;
    });
    
    // Create canvas and get image data
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No canvas context');
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    
    // Get image as JPEG blob directly (not data URL)
    const imageBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/jpeg', 0.9);
    });
    
    console.log(`🖼️ Image blob created: ${imageBlob.size} bytes`);
    
    // Convert blob to array buffer for PDF embedding
    const imageArrayBuffer = await imageBlob.arrayBuffer();
    const imageBytes = new Uint8Array(imageArrayBuffer);
    
    console.log(`🔢 Image bytes: ${imageBytes.length}, first few: [${Array.from(imageBytes.slice(0, 10)).join(', ')}]`);
    
    // Create minimal PDF with direct binary embedding
    const pdf = createMinimalPDFWithBytes(imageBytes, image.width, image.height);
    
    URL.revokeObjectURL(imageUrl);
    
    const newFilename = file.name.replace(/\.[^.]+$/, '.pdf');
    return new File([new Uint8Array(pdf)], newFilename, { type: 'application/pdf' });
    
  } catch (error) {
    console.error('❌ Simple PDF conversion failed:', error);
    throw error;
  }
}

function createMinimalPDFWithBytes(imageBytes: Uint8Array, width: number, height: number): Uint8Array {
  console.log(`📝 Creating minimal PDF with ${imageBytes.length} image bytes`);
  
  // Calculate page positioning (fit image to A4)
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  
  const availableWidth = pageWidth - (2 * margin);
  const availableHeight = pageHeight - (2 * margin);
  
  const scale = Math.min(availableWidth / width, availableHeight / height, 1);
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  
  const x = (pageWidth - scaledWidth) / 2;
  const y = (pageHeight - scaledHeight) / 2;
  
  console.log(`📐 PDF layout: ${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)} at (${x.toFixed(1)}, ${y.toFixed(1)})`);
  
  // Create PDF content as strings first, then convert to bytes
  const parts: string[] = [];
  
  // Header
  parts.push('%PDF-1.4\n');
  
  // Objects with placeholder lengths (we'll fix them later)
  const obj1 = '1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n\n';
  const obj2 = '2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n\n';
  const obj3 = `3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 ${pageWidth} ${pageHeight}]\n/Resources << /XObject << /Im1 4 0 R >> >>\n/Contents 5 0 R\n>>\nendobj\n\n`;
  
  // Calculate offsets
  let offset = parts.join('').length;
  const offset1 = offset;
  offset += obj1.length;
  const offset2 = offset;
  offset += obj2.length;  
  const offset3 = offset;
  offset += obj3.length;
  const offset4 = offset;
  
  // Add objects
  parts.push(obj1, obj2, obj3);
  
  // Image object
  const imageObjHeader = `4 0 obj\n<<\n/Type /XObject\n/Subtype /Image\n/Width ${Math.round(scaledWidth)}\n/Height ${Math.round(scaledHeight)}\n/ColorSpace /DeviceRGB\n/BitsPerComponent 8\n/Filter /DCTDecode\n/Length ${imageBytes.length}\n>>\nstream\n`;
  const imageObjFooter = '\nendstream\nendobj\n\n';
  
  parts.push(imageObjHeader);
  const beforeImageData = parts.join('').length;
  
  // We'll insert image bytes later
  parts.push(imageObjFooter);
  
  const offset5 = beforeImageData + imageBytes.length + imageObjFooter.length;
  
  // Content stream
  const contentStream = `q\n${scaledWidth.toFixed(2)} 0 0 ${scaledHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im1 Do\nQ\n`;
  const obj5 = `5 0 obj\n<<\n/Length ${contentStream.length}\n>>\nstream\n${contentStream}\nendstream\nendobj\n\n`;
  parts.push(obj5);
  
  // Cross-reference table
  const xrefStart = beforeImageData + imageBytes.length + imageObjFooter.length + obj5.length;
  const xref = `xref\n0 6\n0000000000 65535 f \n${offset1.toString().padStart(10, '0')} 00000 n \n${offset2.toString().padStart(10, '0')} 00000 n \n${offset3.toString().padStart(10, '0')} 00000 n \n${offset4.toString().padStart(10, '0')} 00000 n \n${offset5.toString().padStart(10, '0')} 00000 n \n`;
  
  // Trailer
  const trailer = `trailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n${xrefStart}\n%%EOF\n`;
  
  parts.push(xref, trailer);
  
  console.log(`📊 PDF structure: offsets [${offset1}, ${offset2}, ${offset3}, ${offset4}, ${offset5}], xref at ${xrefStart}`);
  
  // Convert to bytes
  const textEncoder = new TextEncoder();
  const pdfParts: Uint8Array[] = [];
  
  // Add text parts up to image
  const beforeImage = parts.slice(0, 4).join(''); // Header + 3 objects + image header
  pdfParts.push(textEncoder.encode(beforeImage));
  
  // Add image bytes
  pdfParts.push(imageBytes);
  
  // Add remaining text parts  
  const afterImage = parts.slice(4).join(''); // Image footer + obj5 + xref + trailer
  pdfParts.push(textEncoder.encode(afterImage));
  
  // Combine all parts
  const totalLength = pdfParts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(totalLength);
  
  let position = 0;
  for (const part of pdfParts) {
    result.set(part, position);
    position += part.length;
  }
  
  console.log(`✅ PDF created: ${result.length} total bytes`);
  return result;
}