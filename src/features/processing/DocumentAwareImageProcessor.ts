/**
 * Document Type-Aware Image Processor
 * Processes images based on their specific document type requirements
 */

import { 
  DocumentTypeConfig, 
  detectDocumentType, 
  getDocumentConfig,
  validateDocumentRequirements 
} from './DocumentTypeProcessor';

export interface ProcessingResult {
  success: boolean;
  processedFile?: File;
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  transformations: string[];
  warnings: string[];
  errors: string[];
  metadata: {
    documentType: string;
    originalDimensions?: { width: number; height: number };
    processedDimensions?: { width: number; height: number };
    qualityUsed?: number;
    processingTime: number;
  };
}

export class DocumentAwareImageProcessor {
  
  /**
   * Process an image file based on its detected document type
   */
  async processImage(
    file: File, 
    documentType?: string,
    forceType?: boolean
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const originalSize = file.size;
    
    // Detect document type if not provided
    const detectedType = documentType || detectDocumentType(file.name, file.size);
    const config = getDocumentConfig(detectedType);
    
    const result: ProcessingResult = {
      success: false,
      originalSize,
      processedSize: originalSize,
      compressionRatio: 1,
      transformations: [],
      warnings: [],
      errors: [],
      metadata: {
        documentType: detectedType,
        processingTime: 0
      }
    };
    
    try {
      // Validate requirements
      const validation = validateDocumentRequirements(file, detectedType);
      if (!validation.valid && !forceType) {
        result.warnings.push(...validation.issues);
        result.warnings.push(...validation.recommendations);
      }
      
      // 🎯 CRITICAL FIX: Check size compliance - don't process files already within limits
      if (config.requirements.maxFileSizeKB) {
        const currentSizeKB = file.size / 1024;
        const maxSizeKB = config.requirements.maxFileSizeKB;
        const minSizeKB = config.requirements.minFileSizeKB || 0;
        
        if (currentSizeKB <= maxSizeKB && currentSizeKB >= minSizeKB && !forceType) {
          // File already complies with size requirements
          result.success = true;
          result.processedFile = file;
          result.processedSize = file.size;
          result.compressionRatio = 0; // No compression needed
          result.transformations.push('size-compliant-skip');
          result.warnings.push(`File already complies with size limit (${currentSizeKB.toFixed(1)}KB within ${minSizeKB}-${maxSizeKB}KB range)`);
          result.metadata.processingTime = Date.now() - startTime;
          return result;
        }
      }
      
      // Load image
      const imageData = await this.loadImage(file);
      result.metadata.originalDimensions = {
        width: imageData.width,
        height: imageData.height
      };
      
      // Process based on document type
      const processedImageData = await this.processBasedOnType(imageData, config, file);
      
      if (!processedImageData) {
        throw new Error('Failed to process image');
      }
      
      // Create processed file
      const processedFile = await this.createProcessedFile(
        processedImageData, 
        file.name, 
        config
      );
      
      result.success = true;
      result.processedFile = processedFile;
      result.processedSize = processedFile.size;
      result.compressionRatio = Math.round(((originalSize - processedFile.size) / originalSize) * 100);
      result.metadata.processedDimensions = processedImageData.dimensions;
      result.metadata.qualityUsed = processedImageData.quality;
      result.metadata.processingTime = Date.now() - startTime;
      
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown processing error');
    }
    
    return result;
  }
  
  /**
   * Load image and get its data
   */
  private async loadImage(file: File): Promise<{
    element: HTMLImageElement;
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          element: img,
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  /**
   * Process image based on document type configuration
   */
  private async processBasedOnType(
    imageData: { element: HTMLImageElement; width: number; height: number },
    config: DocumentTypeConfig,
    originalFile: File
  ): Promise<{
    canvas: HTMLCanvasElement;
    dimensions: { width: number; height: number };
    quality: number;
  } | null> {
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Cannot get canvas context');
    }
    
    let targetWidth = imageData.width;
    let targetHeight = imageData.height;
    let quality = 0.95; // Default high quality
    
    const { requirements } = config;
    
    // Handle different processing strategies based on document type
    switch (config.category) {
      case 'photo':
        ({ targetWidth, targetHeight, quality } = this.processPhoto(
          imageData, requirements, targetWidth, targetHeight
        ));
        break;
        
      case 'document':
      case 'certificate':
        ({ targetWidth, targetHeight, quality } = this.processDocument(
          imageData, requirements, targetWidth, targetHeight
        ));
        break;
        
      case 'form':
        ({ targetWidth, targetHeight, quality } = this.processForm(
          imageData, requirements, targetWidth, targetHeight
        ));
        break;
        
      default:
        // Preserve original for unknown types
        quality = 0.95;
    }
    
    // Set canvas dimensions
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    // Apply image enhancements based on config
    if (requirements.enhanceText) {
      this.applyTextEnhancement(ctx, targetWidth, targetHeight);
    }
    
    // Draw the image
    ctx.drawImage(imageData.element, 0, 0, targetWidth, targetHeight);
    
    // Apply post-processing effects
    if (requirements.backgroundRemoval) {
      this.removeBackground(ctx, targetWidth, targetHeight);
    }
    
    if (!requirements.preserveColors && config.type === 'signature') {
      this.convertToBlackWhite(ctx, targetWidth, targetHeight);
    }
    
    return {
      canvas,
      dimensions: { width: targetWidth, height: targetHeight },
      quality
    };
  }
  
  /**
   * Process photo documents (passport photos, etc.)
   */
  private processPhoto(
    imageData: { width: number; height: number },
    requirements: DocumentTypeConfig['requirements'],
    defaultWidth: number,
    defaultHeight: number
  ): { targetWidth: number; targetHeight: number; quality: number } {
    
    let targetWidth = defaultWidth;
    let targetHeight = defaultHeight;
    let quality = requirements.jpegQuality || 0.85;
    
    // Exact dimensions for photos (passport, UPSC, SSC)
    if (requirements.exactDimensions) {
      targetWidth = requirements.exactDimensions.width;
      targetHeight = requirements.exactDimensions.height;
      
      // Higher quality for passport photos
      if (requirements.jpegQuality) {
        quality = requirements.jpegQuality;
      }
    }
    // Max dimensions constraint
    else if (requirements.maxWidth && requirements.maxHeight) {
      const ratio = Math.min(
        requirements.maxWidth / imageData.width,
        requirements.maxHeight / imageData.height
      );
      
      if (ratio < 1) {
        targetWidth = Math.round(imageData.width * ratio);
        targetHeight = Math.round(imageData.height * ratio);
      }
    }
    
    return { targetWidth, targetHeight, quality };
  }
  
  /**
   * Process document images (certificates, marksheets, ID cards)
   */
  private processDocument(
    imageData: { width: number; height: number },
    requirements: DocumentTypeConfig['requirements'],
    defaultWidth: number,
    defaultHeight: number
  ): { targetWidth: number; targetHeight: number; quality: number } {
    
    let targetWidth = defaultWidth;
    let targetHeight = defaultHeight;
    let quality = 0.95;
    
    // Preserve original size for documents by default
    if (requirements.preserveOriginalSize) {
      targetWidth = imageData.width;
      targetHeight = imageData.height;
      quality = 0.98; // Very high quality for text preservation
    }
    
    // Apply compression level
    switch (requirements.compressionLevel) {
      case 'none':
        quality = 1.0;
        break;
      case 'lossless':
        quality = 1.0;
        break;
      case 'minimal':
        quality = 0.95;
        break;
      case 'moderate':
        quality = 0.85;
        break;
      case 'high':
        quality = 0.70;
        break;
    }
    
    return { targetWidth, targetHeight, quality };
  }
  
  /**
   * Process form documents
   */
  private processForm(
    imageData: { width: number; height: number },
    requirements: DocumentTypeConfig['requirements'],
    defaultWidth: number,
    defaultHeight: number
  ): { targetWidth: number; targetHeight: number; quality: number } {
    
    // Forms need text clarity, so preserve size and use high quality
    return {
      targetWidth: imageData.width,
      targetHeight: imageData.height,
      quality: 0.95
    };
  }
  
  /**
   * Apply text enhancement filter
   */
  private applyTextEnhancement(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number
  ): void {
    // Increase contrast and sharpness for better text readability
    ctx.filter = 'contrast(110%) brightness(105%)';
  }
  
  /**
   * Remove background (for signatures)
   */
  private removeBackground(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number
  ): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Simple background removal - make white pixels transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If pixel is close to white, make it transparent
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0; // Set alpha to 0
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  /**
   * Convert to black and white (for signatures)
   */
  private convertToBlackWhite(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number
  ): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      // High contrast: make it pure black or white
      const bw = gray > 128 ? 255 : 0;
      
      data[i] = bw;     // Red
      data[i + 1] = bw; // Green
      data[i + 2] = bw; // Blue
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  /**
   * Create the final processed file
   */
  private async createProcessedFile(
    processedData: { canvas: HTMLCanvasElement; quality: number },
    originalName: string,
    config: DocumentTypeConfig
  ): Promise<File> {
    
    const { canvas, quality } = processedData;
    const { requirements } = config;
    
    // Determine output format
    let mimeType = 'image/jpeg';
    let extension = 'jpg';
    
    if (requirements.outputFormat === 'png' || requirements.compressionLevel === 'lossless') {
      mimeType = 'image/png';
      extension = 'png';
    }
    
    // Create blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        mimeType,
        mimeType === 'image/jpeg' ? quality : undefined
      );
    });
    
    // Generate processed filename
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
    const processedName = `${nameWithoutExtension}_processed_${config.type}.${extension}`;
    
    return new File([blob], processedName, { type: mimeType });
  }
}

// Export singleton instance
export const documentAwareImageProcessor = new DocumentAwareImageProcessor();