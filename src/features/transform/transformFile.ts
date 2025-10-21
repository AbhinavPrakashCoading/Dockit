import { resizeImage, Dimensions } from './utils/resizeImage';
import { convertFormat } from './utils/convertFormat';
import { convertFormatEnhanced, QualityPreviewRequiredError } from './utils/imageToPDFConverter';
import { compressImage } from './utils/compressImage';
import { normalizeName } from './utils/normalizeName';
import { Requirement } from '@/features/exam/types';

// 📊 Transformation Details Collection
export interface TransformationDetails {
  steps: string[];
  warnings: string[];
  originalSize: number;
  finalSize: number;
  compressionRatio: number;
  formatChange: string;
  qualityReduction?: number;
  processing: boolean;
  isOvercompressed?: boolean; // 🚨 New: True when file was compressed below 85% target
  targetSizeKB?: number; // 🎯 New: The 85% target size that was aimed for
  maxSizeKB?: number; // 📏 New: The actual maximum size limit
}

let transformationDetails: TransformationDetails = {
  steps: [],
  warnings: [],
  originalSize: 0,
  finalSize: 0,
  compressionRatio: 100,
  formatChange: '',
  processing: false,
  isOvercompressed: false
};

function addStep(message: string) {
  transformationDetails.steps.push(`${new Date().toLocaleTimeString()}: ${message}`);
  console.log(`📋 ${message}`);
}

function addWarning(message: string) {
  transformationDetails.warnings.push(`${new Date().toLocaleTimeString()}: ${message}`);
  console.warn(`⚠️ ${message}`);
}

export function getTransformationDetails(): TransformationDetails {
  return { ...transformationDetails };
}

export function resetTransformationDetails() {
  transformationDetails = {
    steps: [],
    warnings: [],
    originalSize: 0,
    finalSize: 0,
    compressionRatio: 100,
    formatChange: '',
    processing: false,
    isOvercompressed: false
  };
}

export async function transformFile(file: File, req: Requirement, examType?: string): Promise<File> {
  // Reset and initialize details
  resetTransformationDetails();
  transformationDetails.processing = true;
  transformationDetails.originalSize = file.size;
  
  let transformed = file;
  
  addStep(`Starting transformation for: ${file.name} (${Math.round(file.size / 1024)}KB)`);
  addStep(`Target requirements: Format=${req.format || 'any'}, MaxSize=${req.maxSizeKB}KB`);
  if (examType) {
    addStep(`Exam type: ${examType.toUpperCase()}`);
  }

  try {
    // 🎯 FIXED: Check each requirement separately to avoid incorrect early returns
    const currentSizeKB = Math.round(file.size / 1024);
    const formatMatches = !req.format || file.type === req.format;
    // Fix: Since maxSizeKB is required, check if current size is within limit
    const sizeCompliant = currentSizeKB <= req.maxSizeKB;
    
    addStep(`Compliance check: Format=${formatMatches ? '✅' : '❌'}, Size=${sizeCompliant ? '✅' : '❌'} (${currentSizeKB}KB ≤ ${req.maxSizeKB}KB)`);
    
    // ONLY return early if BOTH format AND size are compliant AND no other processing needed
    if (formatMatches && sizeCompliant) {
      addStep(`FILE ALREADY FULLY COMPLIANT - No processing needed`);
      transformationDetails.finalSize = file.size;
      transformationDetails.compressionRatio = 100;
      transformationDetails.formatChange = 'No change needed';
      transformationDetails.processing = false;
      return file;
    }
    
    if (!formatMatches) {
      addStep(`FORMAT CONVERSION NEEDED: ${file.type} → ${req.format}`);
    }
    if (!sizeCompliant) {
      addStep(`SIZE REDUCTION NEEDED: ${currentSizeKB}KB → ${req.maxSizeKB}KB`);
    }

    // Pre-compression for extremely large files (>5MB) to make processing more manageable
    const initialSizeKB = Math.round(file.size / 1024);
    if (initialSizeKB > 5120) { // 5MB
      addStep(`Pre-compressing extremely large file: ${initialSizeKB}KB`);
      try {
        // Pre-compress to roughly 2MB to make subsequent processing faster
        const preCompressTarget = Math.min(2048, req.maxSizeKB * 3);
        transformed = await compressImage(transformed, preCompressTarget);
        addStep(`Pre-compression complete: ${Math.round(transformed.size / 1024)}KB`);
      } catch (preCompressError) {
        addWarning(`Pre-compression failed, continuing with original file: ${preCompressError}`);
        // Continue with original file if pre-compression fails
      }
    }

    // Convert format first (might help with compression)
    if (req.format && transformed.type !== req.format) {
      addStep(`Converting format: ${transformed.type} → ${req.format}`);
      transformationDetails.formatChange = `${transformed.type} → ${req.format}`;
      
      try {
        // Use enhanced converter for PDF conversion, basic converter for image-to-image
        if (req.format.toLowerCase().includes('pdf') || req.format === 'application/pdf') {
          addStep(`Using enhanced PDF converter for image-to-PDF conversion`);
          // 🎯 CRITICAL FIX: Pass size limit to PDF converter and track overcompression
          transformationDetails.maxSizeKB = req.maxSizeKB;
          transformationDetails.targetSizeKB = Math.round(req.maxSizeKB * 0.85);
          
          transformed = await convertFormatEnhanced(transformed, req.format, req.maxSizeKB);
          
          // 🚨 Check for overcompression after PDF conversion
          const convertedSizeKB = Math.round(transformed.size / 1024);
          const targetSizeKB = transformationDetails.targetSizeKB!;
          
          // 🎯 FIXED: Detect when file is UNDER target (overcompressed)
          if (convertedSizeKB < targetSizeKB && convertedSizeKB <= req.maxSizeKB) {
            transformationDetails.isOvercompressed = true;
            addWarning(`OVERCOMPRESSION DETECTED: File size ${convertedSizeKB}KB is below optimal target ${targetSizeKB}KB (85% of ${req.maxSizeKB}KB limit). Quality was unnecessarily reduced.`);
            addStep(`🚨 Overcompression: ${convertedSizeKB}KB < ${targetSizeKB}KB target`);
          } else if (convertedSizeKB <= targetSizeKB) {
            addStep(`✅ Optimal compression: ${convertedSizeKB}KB ≤ ${targetSizeKB}KB target`);
          }
        } else {
          addStep(`Using standard converter for image-to-image conversion`);
          transformed = await convertFormat(transformed, req.format);
        }
        addStep(`Format conversion complete: ${transformed.type}, size: ${Math.round(transformed.size / 1024)}KB`);
      } catch (formatError) {
        // 🎯 HANDLE QUALITY PREVIEW REQUIREMENT
        if (formatError instanceof QualityPreviewRequiredError) {
          addStep(`Quality preview required: ${formatError.quality.toFixed(0)}% quality`);
          
          // Create user-friendly error with preview data
          const previewError = new Error(
            formatError.previewRequired 
              ? `MANDATORY_PREVIEW_REQUIRED|${formatError.quality}|${formatError.sizeKB}|${formatError.maxSizeKB}|${formatError.message}`
              : `QUALITY_CAUTION|${formatError.quality}|${formatError.sizeKB}|${formatError.maxSizeKB}|${formatError.message}`
          );
          
          // Attach preview PDF and transformation details to error for UI consumption
          (previewError as any).previewPDF = formatError.previewPDF;
          (previewError as any).qualityData = {
            quality: formatError.quality,
            sizeKB: formatError.sizeKB,
            maxSizeKB: formatError.maxSizeKB,
            previewRequired: formatError.previewRequired
          };
          (previewError as any).transformationDetails = getTransformationDetails();
          
          throw previewError;
        }
        
        addWarning(`Format conversion failed: ${formatError}`);
        addStep(`Continuing with original format: ${transformed.type}`);
        // Continue with original format instead of failing completely
      }
      
      // Check if file now meets requirements after format conversion
      const newSizeKB = Math.round(transformed.size / 1024);
      if (newSizeKB <= req.maxSizeKB) {
        addStep(`File now compliant after format conversion: ${newSizeKB}KB ≤ ${req.maxSizeKB}KB`);
        transformationDetails.finalSize = transformed.size;
        transformationDetails.compressionRatio = (transformed.size / transformationDetails.originalSize) * 100;
        transformationDetails.processing = false;
        return transformed; // Early return if format conversion solved the size issue
      }
    }

    // Resize if dimensions are specified (do this before compression for better results)
    if (req.dimensions) {
      addStep(`Resizing to dimensions: ${req.dimensions}`);
      
      // Handle string dimensions (e.g., "200x230") by converting to Dimensions object
      let dimensionsObj: Dimensions;
      if (typeof req.dimensions === 'string') {
        const [width, height] = req.dimensions.split('x').map((d: string) => parseInt(d));
        dimensionsObj = { width, height };
      } else {
        dimensionsObj = req.dimensions;
      }
      
      transformed = await resizeImage(transformed, dimensionsObj);
      addStep(`Resize complete: ${Math.round(transformed.size / 1024)}KB`);
      
      // Check if file now meets requirements after resizing
      const newSizeKB = Math.round(transformed.size / 1024);
      if (newSizeKB <= req.maxSizeKB) {
        addStep(`File now compliant after resizing: ${newSizeKB}KB ≤ ${req.maxSizeKB}KB`);
        transformationDetails.finalSize = transformed.size;
        transformationDetails.compressionRatio = (transformed.size / transformationDetails.originalSize) * 100;
        transformationDetails.processing = false;
        return transformed; // Early return if resizing solved the size issue
      }
    }

    // Smart compression targeting 80-90% of max size limit
    const sizeKB = Math.round(transformed.size / 1024);
    if (sizeKB > req.maxSizeKB) {
      addStep(`Compression needed: ${sizeKB}KB > ${req.maxSizeKB}KB limit`);
      
      // Target 85% of max size to provide buffer
      const targetSizeKB = Math.floor(req.maxSizeKB * 0.85);
      addStep(`Target compression size: ${targetSizeKB}KB (85% of ${req.maxSizeKB}KB limit)`);
      
      try {
        transformed = await compressImage(transformed, targetSizeKB);
        const compressedSizeKB = Math.round(transformed.size / 1024);
        addStep(`Compression complete: ${compressedSizeKB}KB`);
        
        // Verify final size
        if (compressedSizeKB <= req.maxSizeKB) {
          addStep(`✅ Compression successful: ${compressedSizeKB}KB ≤ ${req.maxSizeKB}KB`);
        } else {
          addWarning(`Compression still exceeds limit: ${compressedSizeKB}KB > ${req.maxSizeKB}KB`);
        }
      } catch (compressionError) {
        addWarning(`Compression failed: ${compressionError}`);
      }
    } else {
      addStep(`No compression needed: ${sizeKB}KB ≤ ${req.maxSizeKB}KB`);
    }

    // Normalize filename
    transformed = normalizeName(transformed, req.type || 'document');
    addStep(`Filename normalized: ${transformed.name}`);

    // 🔍 CRITICAL VALIDATION: Check final result against requirements
    const finalSizeKB = Math.round(transformed.size / 1024);
    addStep(`Transformation complete: ${file.name} → ${transformed.name} (${finalSizeKB}KB)`);
    
    // Update transformation details
    transformationDetails.finalSize = transformed.size;
    transformationDetails.compressionRatio = (transformed.size / transformationDetails.originalSize) * 100;
    
    // 🚨 UNIVERSAL OVERCOMPRESSION CHECK (for all compression paths)
    if (req.maxSizeKB && !transformationDetails.targetSizeKB) {
      // Set target if not already set (for non-PDF conversions)
      transformationDetails.maxSizeKB = req.maxSizeKB;
      transformationDetails.targetSizeKB = Math.round(req.maxSizeKB * 0.85);
    }
    
    if (transformationDetails.targetSizeKB && transformationDetails.maxSizeKB) {
      const targetSizeKB = transformationDetails.targetSizeKB;
      const maxSizeKB = transformationDetails.maxSizeKB;
      
      if (finalSizeKB < targetSizeKB && finalSizeKB <= maxSizeKB) {
        transformationDetails.isOvercompressed = true;
        addWarning(`🚨 OVERCOMPRESSION DETECTED: Final size ${finalSizeKB}KB is below optimal target ${targetSizeKB}KB (85% of ${maxSizeKB}KB limit). Quality was unnecessarily reduced.`);
        addStep(`🚨 Overcompression detected: ${finalSizeKB}KB < ${targetSizeKB}KB target`);
      } else if (finalSizeKB <= targetSizeKB) {
        addStep(`✅ Optimal result: ${finalSizeKB}KB ≤ ${targetSizeKB}KB target`);
      } else if (finalSizeKB <= maxSizeKB) {
        addStep(`✅ Within limits: ${finalSizeKB}KB ≤ ${maxSizeKB}KB maximum`);
      }
    }
    
    // Validate final result against requirements
    let validationErrors: string[] = [];
    
    // Check format compliance
    if (req.format && transformed.type !== req.format) {
      validationErrors.push(`Format mismatch: required ${req.format}, got ${transformed.type}`);
    }
    
    // Check size compliance - CRITICAL CHECK
    if (finalSizeKB > req.maxSizeKB) {
      validationErrors.push(`Size exceeds limit: ${finalSizeKB}KB > ${req.maxSizeKB}KB maximum`);
      addWarning(`VALIDATION FAILED: File size ${finalSizeKB}KB exceeds maximum ${req.maxSizeKB}KB`);
    }
    
    // If there are validation errors, throw them
    if (validationErrors.length > 0) {
      const errorMessage = `Transformation validation failed: ${validationErrors.join(', ')}`;
      addWarning(`TRANSFORMATION VALIDATION FAILED: ${errorMessage}`);
      addWarning(`This indicates a bug in the transformation pipeline - it should produce compliant files`);
      
      // Attach transformation details to error
      const validationError = new Error(errorMessage);
      (validationError as any).transformationDetails = getTransformationDetails();
      transformationDetails.processing = false;
      
      throw validationError;
    }
    
    addStep(`VALIDATION PASSED: File meets all requirements`);
    addStep(`   📄 Format: ${transformed.type} ✓`);
    addStep(`   📊 Size: ${finalSizeKB}KB (≤ ${req.maxSizeKB}KB) ✓`);
    
    transformationDetails.processing = false;
    return transformed;
    
  } catch (error) {
    transformationDetails.processing = false;
    addWarning(`Transformation failed: ${error}`);
    
    // Attach transformation details to any error
    (error as any).transformationDetails = getTransformationDetails();
    
    throw error;
  }
}
