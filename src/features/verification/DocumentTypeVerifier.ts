/**
 * Intelligent Document Type Verification System
 * Uses OCR, Computer Vision, and AI to verify document types
 */

import { detectDocumentType, getDocumentConfig, DocumentTypeConfig } from '../processing/DocumentTypeProcessor';

export interface DocumentVerificationResult {
  verifiedType: string;
  confidence: number;
  reasons: string[];
  extractedData: {
    text?: string[];
    detectedElements?: string[];
    faces?: number;
    qrCodes?: number;
    barcodes?: string[];
    signatures?: number;
    seals?: number;
    watermarks?: boolean;
  };
  dimensions: { width: number; height: number };
  fileMetadata: {
    size: number;
    format: string;
    quality: number;
  };
  warnings: string[];
  recommendations: string[];
}

export interface DocumentPattern {
  type: string;
  textPatterns: RegExp[];
  requiredElements: string[];
  optionalElements: string[];
  dimensionRatio?: { min: number; max: number };
  expectedTextRegions: string[];
  confidenceWeights: {
    textMatch: number;
    elementDetection: number;
    dimensionMatch: number;
    qualityScore: number;
  };
}

// Document patterns for verification
export const DOCUMENT_PATTERNS: Record<string, DocumentPattern> = {
  passport_photo: {
    type: 'passport_photo',
    textPatterns: [], // Photos typically don't have text
    requiredElements: ['face'],
    optionalElements: ['white_background'],
    dimensionRatio: { min: 0.70, max: 0.90 }, // More flexible ratio for passport photos
    expectedTextRegions: [],
    confidenceWeights: {
      textMatch: 0.0, // No text expected
      elementDetection: 0.8, // High weight on face detection
      dimensionMatch: 0.15,
      qualityScore: 0.05
    }
  },
  
  upsc_photo: {
    type: 'upsc_photo',
    textPatterns: [], // Photos typically don't have text
    requiredElements: ['face'],
    optionalElements: ['white_background'],
    dimensionRatio: { min: 0.70, max: 0.90 },
    expectedTextRegions: [],
    confidenceWeights: {
      textMatch: 0.0,
      elementDetection: 0.8,
      dimensionMatch: 0.15,
      qualityScore: 0.05
    }
  },
  
  ssc_photo: {
    type: 'ssc_photo',
    textPatterns: [], // Photos typically don't have text
    requiredElements: ['face'],
    optionalElements: ['white_background'],
    dimensionRatio: { min: 0.70, max: 0.90 },
    expectedTextRegions: [],
    confidenceWeights: {
      textMatch: 0.0,
      elementDetection: 0.8,
      dimensionMatch: 0.15,
      qualityScore: 0.05
    }
  },
  
  aadhar_card: {
    type: 'aadhar_card',
    textPatterns: [
      /\b\d{4}\s\d{4}\s\d{4}\b/, // Aadhar number pattern
      /आधार|AADHAAR|Aadhaar/i,
      /भारत सरकार|Government of India/i,
      /जन्म तिथि|DOB|Date of Birth/i
    ],
    requiredElements: ['photo', 'qr_code', 'text'],
    optionalElements: ['hologram', 'signature'],
    dimensionRatio: { min: 1.5, max: 1.7 }, // Credit card ratio
    expectedTextRegions: ['top_header', 'personal_info', 'bottom_footer'],
    confidenceWeights: {
      textMatch: 0.5,
      elementDetection: 0.3,
      dimensionMatch: 0.1,
      qualityScore: 0.1
    }
  },
  
  pan_card: {
    type: 'pan_card',
    textPatterns: [
      /[A-Z]{5}\d{4}[A-Z]/i, // PAN number pattern
      /INCOME TAX DEPARTMENT/i,
      /PERMANENT ACCOUNT NUMBER/i,
      /SIGNATURE|हस्ताक्षर/i
    ],
    requiredElements: ['photo', 'signature', 'text'],
    optionalElements: ['hologram'],
    dimensionRatio: { min: 1.5, max: 1.7 },
    expectedTextRegions: ['header', 'personal_details', 'signature_area'],
    confidenceWeights: {
      textMatch: 0.6,
      elementDetection: 0.2,
      dimensionMatch: 0.1,
      qualityScore: 0.1
    }
  },
  
  marksheet: {
    type: 'marksheet',
    textPatterns: [
      /MARK SHEET|MARKSHEET|TRANSCRIPT|MARKS CARD/i,
      /UNIVERSITY|COLLEGE|BOARD|SCHOOL/i,
      /GRADE|MARKS|PERCENTAGE|CGPA|GPA|SCORE/i,
      /EXAMINATION|EXAM|TEST|RESULT/i,
      /CERTIFICATE|प्रमाण पत्र/i,
      /STUDENT|विद्यार्थी|छात्र/i,
      /CLASS|कक्षा|STANDARD|STD/i,
      /ROLL NUMBER|ROLL NO|रोल नंबर/i,
      /SUBJECT|विषय|PAPER/i,
      /TOTAL|GRAND TOTAL|कुल/i,
      /PASSED|PASS|उत्तीर्ण|FAILED|FAIL/i,
      /\b10th\b|\bTENTH\b|\bX\b/i, // 10th standard
      /\b12th\b|\bTWELFTH\b|\bXII\b/i, // 12th standard
      /CBSE|ICSE|STATE BOARD|BOARD OF/i,
      /SECONDARY|SENIOR SECONDARY|HIGHER SECONDARY/i,
      // Additional educational keywords
      /ACADEMIC|SCHOLASTIC|EDUCATIONAL/i,
      /SEMESTER|ANNUAL|HALF YEARLY/i,
      /THEORY|PRACTICAL|INTERNAL|EXTERNAL/i,
      /MATHEMATICS|SCIENCE|ENGLISH|HINDI/i, // Common subjects
      /PHYSICS|CHEMISTRY|BIOLOGY/i,
      /SOCIAL SCIENCE|HISTORY|GEOGRAPHY/i
    ],
    requiredElements: ['text'],
    optionalElements: ['seal', 'signature', 'watermark', 'logo'],
    expectedTextRegions: ['header', 'student_info', 'subjects_marks', 'footer', 'result_summary'],
    confidenceWeights: {
      textMatch: 0.9, // Very high weight for text patterns in marksheets
      elementDetection: 0.05,
      dimensionMatch: 0.025,
      qualityScore: 0.025
    }
  },
  
  degree_certificate: {
    type: 'degree_certificate',
    textPatterns: [
      /DEGREE|DIPLOMA|BACHELOR|MASTER|PhD|DOCTORATE/i,
      /UNIVERSITY|COLLEGE|INSTITUTE/i,
      /CONFERRED|AWARDED|GRANTED/i,
      /GRADUATION|CONVOCATION/i
    ],
    requiredElements: ['text', 'seal', 'signature'],
    optionalElements: ['watermark', 'embossed_seal'],
    expectedTextRegions: ['header', 'recipient_info', 'degree_details', 'authority_signatures'],
    confidenceWeights: {
      textMatch: 0.7,
      elementDetection: 0.2,
      dimensionMatch: 0.05,
      qualityScore: 0.05
    }
  },
  
  upsc_admit_card: {
    type: 'upsc_admit_card',
    textPatterns: [
      /UPSC|Union Public Service Commission/i,
      /ADMIT CARD|ADMISSION CERTIFICATE/i,
      /CIVIL SERVICES|IAS|IPS|IFS/i,
      /EXAMINATION|PRELIMINARY|MAINS/i,
      /ROLL NUMBER|REGISTRATION NUMBER/i
    ],
    requiredElements: ['photo', 'text', 'barcode'],
    optionalElements: ['qr_code', 'signature'],
    expectedTextRegions: ['header', 'candidate_info', 'exam_details', 'instructions'],
    confidenceWeights: {
      textMatch: 0.6,
      elementDetection: 0.2,
      dimensionMatch: 0.1,
      qualityScore: 0.1
    }
  },
  
  ssc_admit_card: {
    type: 'ssc_admit_card',
    textPatterns: [
      /SSC|Staff Selection Commission/i,
      /ADMIT CARD|ADMISSION CERTIFICATE/i,
      /CGL|CHSL|MTS|JE/i,
      /TIER-I|TIER-II|TIER-III/i,
      /ROLL NUMBER/i
    ],
    requiredElements: ['photo', 'text'],
    optionalElements: ['barcode', 'qr_code'],
    expectedTextRegions: ['header', 'candidate_details', 'exam_info'],
    confidenceWeights: {
      textMatch: 0.6,
      elementDetection: 0.2,
      dimensionMatch: 0.1,
      qualityScore: 0.1
    }
  },
  
  signature: {
    type: 'signature',
    textPatterns: [
      /SIGNATURE|SIGN|हस्ताक्षर/i
    ],
    requiredElements: ['handwriting'],
    optionalElements: ['text'],
    dimensionRatio: { min: 2.0, max: 5.0 }, // Wide signature format
    expectedTextRegions: ['signature_area'],
    confidenceWeights: {
      textMatch: 0.1,
      elementDetection: 0.8,
      dimensionMatch: 0.1,
      qualityScore: 0.0
    }
  }
};

export class DocumentTypeVerifier {
  private ocrWorker: any = null;
  private faceDetector: any = null;
  
  constructor() {
    this.initializeWorkers();
  }
  
  private async initializeWorkers() {
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      console.log('Server-side environment detected, skipping browser-specific initialization');
      return;
    }
    
    try {
      // Initialize Tesseract.js for OCR
      const Tesseract = await import('tesseract.js');
      this.ocrWorker = await Tesseract.createWorker('eng+hin'); // English + Hindi
      
      // Initialize face detection (if available)
      if ('FaceDetector' in window) {
        this.faceDetector = new (window as any).FaceDetector();
      }
    } catch (error) {
      console.warn('Some verification features may not be available:', error);
    }
  }
  
  /**
   * Verify document type using multiple AI technologies
   */
  async verifyDocumentType(
    file: File,
    suspectedType?: string
  ): Promise<DocumentVerificationResult> {
    
    const startTime = Date.now();
    const imageData = await this.loadImageData(file);
    
    const result: DocumentVerificationResult = {
      verifiedType: suspectedType || 'unknown',
      confidence: 0,
      reasons: [],
      extractedData: {},
      dimensions: imageData.dimensions,
      fileMetadata: {
        size: file.size,
        format: file.type,
        quality: await this.assessImageQuality(imageData.canvas)
      },
      warnings: [],
      recommendations: []
    };
    
    try {
      // Step 1: OCR Text Extraction
      const extractedText = await this.extractText(imageData.canvas);
      result.extractedData.text = extractedText;
      
      // Step 2: Computer Vision Element Detection
      const detectedElements = await this.detectElements(imageData.canvas);
      result.extractedData = { ...result.extractedData, ...detectedElements };
      
      // Step 3: Pattern Matching and Verification
      const verificationResults = await this.matchDocumentPatterns(
        extractedText,
        detectedElements,
        imageData.dimensions,
        result.fileMetadata,
        suspectedType
      );
      
      result.verifiedType = verificationResults.bestMatch;
      result.confidence = verificationResults.confidence;
      result.reasons = verificationResults.reasons;
      result.warnings = verificationResults.warnings;
      result.recommendations = verificationResults.recommendations;
      
      // Step 4: Cross-validation with filename detection
      const filenameDetected = detectDocumentType(file.name, file.size);
      if (filenameDetected !== result.verifiedType && result.confidence < 0.8) {
        result.warnings.push(
          `Filename suggests ${filenameDetected}, but content analysis suggests ${result.verifiedType}`
        );
        result.recommendations.push(
          'Consider renaming the file to match its content or verify the document type'
        );
      }
      
      console.log(`Document verification completed in ${Date.now() - startTime}ms`);
      
    } catch (error) {
      result.warnings.push(`Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.confidence = 0.1; // Very low confidence on error
    }
    
    return result;
  }
  
  /**
   * Load image data for processing
   */
  private async loadImageData(file: File): Promise<{
    canvas: HTMLCanvasElement;
    dimensions: { width: number; height: number };
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Cannot get canvas context'));
          return;
        }
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        
        resolve({
          canvas,
          dimensions: { width: img.naturalWidth, height: img.naturalHeight }
        });
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  /**
   * Extract text using OCR with enhanced fallback
   */
  private async extractText(canvas: HTMLCanvasElement): Promise<string[]> {
    try {
      if (!this.ocrWorker) {
        // Fallback: try to initialize on demand
        const Tesseract = await import('tesseract.js');
        this.ocrWorker = await Tesseract.createWorker('eng+hin');
      }
      
      const { data } = await this.ocrWorker.recognize(canvas);
      
      // Clean and process text
      const lines = data.text
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 2)
        .slice(0, 50); // Limit to first 50 lines for performance
      
      console.log('OCR extracted text lines:', lines.length, 'First few:', lines.slice(0, 3));
      return lines;
      
    } catch (error) {
      console.warn('OCR failed, using enhanced fallback text detection:', error);
      
      // Enhanced fallback: try to detect text presence using image analysis
      const fallbackText = await this.fallbackTextDetection(canvas);
      return fallbackText.length > 0 ? fallbackText : ['OCR_UNAVAILABLE'];
    }
  }
  
  /**
   * Fallback text detection when OCR fails
   */
  private async fallbackTextDetection(canvas: HTMLCanvasElement): Promise<string[]> {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return [];
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Detect text-like patterns (horizontal lines, regular spacing)
      let textRegions = 0;
      const width = canvas.width;
      const height = canvas.height;
      
      // Sample every 10th row for performance
      for (let y = 0; y < height; y += 10) {
        let darkPixels = 0;
        let lightPixels = 0;
        
        for (let x = 0; x < width; x += 5) {
          const i = (y * width + x) * 4;
          const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          if (gray < 128) darkPixels++;
          else lightPixels++;
        }
        
        // If this row has balanced dark/light pixels, might be text
        const ratio = darkPixels / (darkPixels + lightPixels);
        if (ratio > 0.1 && ratio < 0.6) {
          textRegions++;
        }
      }
      
      // If we found many text-like regions, create dummy content
      if (textRegions > height / 50) {
        return [
          'TEXT_DETECTED_BY_FALLBACK',
          'DOCUMENT_CONTAINS_TEXT_CONTENT',
          'ACADEMIC_DOCUMENT_POSSIBLE'
        ];
      }
      
      return [];
    } catch (error) {
      console.error('Fallback text detection failed:', error);
      return [];
    }
  }
  
  /**
   * Detect visual elements using Computer Vision
   */
  private async detectElements(canvas: HTMLCanvasElement): Promise<{
    faces?: number;
    qrCodes?: number;
    barcodes?: string[];
    signatures?: number;
    seals?: number;
    watermarks?: boolean;
    detectedElements?: string[];
    textDensity?: number;
    isPhotoLike?: boolean;
    isDocumentLike?: boolean;
  }> {
    const elements: string[] = [];
    const result: any = {};
    
    try {
      // Face Detection
      if (this.faceDetector) {
        const faces = await this.faceDetector.detect(canvas);
        result.faces = faces.length;
        if (faces.length > 0) {
          elements.push('face');
          elements.push('photo');
        }
      } else {
        // Fallback face detection using canvas analysis
        result.faces = await this.detectFacesFallback(canvas);
        if (result.faces > 0) {
          elements.push('face');
          elements.push('photo');
        }
      }
      
      // Text region detection with density analysis
      const textDensity = await this.analyzeTextDensity(canvas);
      result.textDensity = textDensity;
      
      if (textDensity > 0.1) {
        elements.push('text');
        if (textDensity > 0.3) {
          elements.push('structured_text');
          elements.push('text_blocks');
        }
      }
      
      // QR Code Detection
      result.qrCodes = await this.detectQRCodes(canvas);
      if (result.qrCodes > 0) elements.push('qr_code');
      
      // Signature Detection (basic heuristic)
      result.signatures = await this.detectSignatures(canvas);
      if (result.signatures > 0) elements.push('signature');
      
      // Seal/Stamp Detection
      result.seals = await this.detectSeals(canvas);
      if (result.seals > 0) {
        elements.push('seal');
        elements.push('official_seal');
      }
      
      // Watermark Detection
      result.watermarks = await this.detectWatermarks(canvas);
      if (result.watermarks) elements.push('watermark');
      
      // Table/Grid Detection
      const tables = await this.detectTableStructures(canvas);
      if (tables > 0) {
        elements.push('table');
        elements.push('grid_structure');
      }
      
      // Determine document type likelihood
      result.isPhotoLike = result.faces > 0 && textDensity < 0.1;
      result.isDocumentLike = textDensity > 0.2 && result.faces === 0;
      
      result.detectedElements = elements;
      
    } catch (error) {
      console.warn('Element detection failed:', error);
      result.detectedElements = ['detection_failed'];
      result.textDensity = 0;
      result.isPhotoLike = false;
      result.isDocumentLike = false;
    }
    
    return result;
  }
  
  /**
   * Match document patterns and determine best type
   */
  private async matchDocumentPatterns(
    extractedText: string[],
    detectedElements: any,
    dimensions: { width: number; height: number },
    fileMetadata: any,
    suspectedType?: string
  ): Promise<{
    bestMatch: string;
    confidence: number;
    reasons: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    
    const scores: Record<string, number> = {};
    const reasons: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    const allText = extractedText.join(' ').toLowerCase();
    const aspectRatio = dimensions.width / dimensions.height;
    const hasSignificantText = extractedText.filter(line => line.trim().length > 3).length > 5;
    const hasFace = detectedElements.faces && detectedElements.faces > 0;
    
    // First, determine if this is likely a photo or a document
    const isLikelyPhoto = hasFace && !hasSignificantText && extractedText.length < 5;
    const isLikelyTextDocument = hasSignificantText && extractedText.length > 10;
    
    reasons.push(`Document analysis: ${isLikelyPhoto ? 'Photo-like' : isLikelyTextDocument ? 'Text document' : 'Mixed content'}`);
    reasons.push(`Text lines found: ${extractedText.length}, Face detected: ${hasFace}`);
    
    // Debug: Log what we're working with
    reasons.push(`Debug - All text found: "${allText.slice(0, 200)}${allText.length > 200 ? '...' : ''}"`);
    reasons.push(`Debug - Text lines count: ${extractedText.length}, Has face: ${hasFace}`);
    
    // Test against all patterns, but prioritize based on content type
    for (const [patternType, pattern] of Object.entries(DOCUMENT_PATTERNS)) {
      let score = 0;
      const weights = pattern.confidenceWeights;
      
      // Skip photo patterns if we detected significant text, and vice versa
      const isPhotoPattern = ['passport_photo', 'upsc_photo', 'ssc_photo'].includes(patternType);
      
      if (isPhotoPattern && isLikelyTextDocument) {
        reasons.push(`Skipping ${patternType}: Document has significant text content`);
        continue;
      }
      
      if (!isPhotoPattern && isLikelyPhoto) {
        reasons.push(`Skipping ${patternType}: Document appears to be a photo`);
        continue;
      }
      
      // Text pattern matching - enhanced for better detection
      const textMatches = pattern.textPatterns.filter(regex => {
        const isMatch = regex.test(allText);
        if (isMatch && patternType === 'marksheet') {
          reasons.push(`Marksheet pattern matched: ${regex.source.slice(0, 50)}...`);
        }
        return isMatch;
      }).length;
      
      const textScore = pattern.textPatterns.length > 0 
        ? Math.min(textMatches / pattern.textPatterns.length, 1)
        : (allText.length > 0 ? 0.1 : 1); // For photos, lack of text is good
      score += textScore * weights.textMatch;
      
      if (textMatches > 0) {
        reasons.push(`Text patterns for ${patternType}: ${textMatches}/${pattern.textPatterns.length} matched (score: ${(textScore * weights.textMatch).toFixed(2)})`);
      }
      
      // Element detection matching
      const requiredElementsFound = pattern.requiredElements.filter(
        element => detectedElements.detectedElements?.includes(element)
      ).length;
      const elementScore = pattern.requiredElements.length > 0 
        ? requiredElementsFound / pattern.requiredElements.length
        : 0.5; // Neutral if no requirements
      score += elementScore * weights.elementDetection;
      
      if (requiredElementsFound > 0) {
        reasons.push(`Required elements for ${patternType}: ${requiredElementsFound}/${pattern.requiredElements.length} found`);
      }
      
      // Dimension ratio matching
      if (pattern.dimensionRatio) {
        const ratioMatch = aspectRatio >= pattern.dimensionRatio.min && 
                          aspectRatio <= pattern.dimensionRatio.max;
        if (ratioMatch) {
          score += weights.dimensionMatch;
          reasons.push(`Dimension ratio matches ${patternType} requirements (${aspectRatio.toFixed(2)})`);
        } else {
          reasons.push(`Dimension ratio mismatch for ${patternType}: ${aspectRatio.toFixed(2)} not in range ${pattern.dimensionRatio.min}-${pattern.dimensionRatio.max}`);
        }
      }
      
      // Quality score
      const qualityScore = fileMetadata.quality / 100;
      score += qualityScore * weights.qualityScore;
      
      scores[patternType] = score;
    }
    
    // Enhanced classification logic with better pattern matching
    if (Object.values(scores).every(score => score < 0.3)) {
      reasons.push('Low pattern matching scores, applying enhanced classification logic');
      
      if (isLikelyPhoto && hasFace) {
        scores['passport_photo'] = 0.6; // Generic photo classification
        reasons.push('Classified as passport_photo based on face detection and lack of text');
      } else if (isLikelyTextDocument) {
        // Enhanced marksheet detection with multiple strategies
        const marksheetIndicators = {
          educational: ['mark', 'marks', 'grade', 'result', 'examination', 'exam'],
          institutional: ['board', 'university', 'college', 'school', 'cbse', 'icse'],
          academic: ['subject', 'class', 'standard', 'percentage', 'cgpa', 'total'],
          studentInfo: ['student', 'roll', 'name', 'father'],
          gradeLevel: ['10th', '12th', 'tenth', 'twelfth', 'x', 'xii']
        };
        
        let marksheetScore = 0;
        let foundIndicators = [];
        
        Object.entries(marksheetIndicators).forEach(([category, keywords]) => {
          const found = keywords.filter(keyword => 
            allText.toLowerCase().includes(keyword.toLowerCase())
          );
          if (found.length > 0) {
            marksheetScore += found.length * 0.1;
            foundIndicators.push(`${category}: ${found.join(', ')}`);
          }
        });
        
        if (marksheetScore > 0.3) {
          scores['marksheet'] = Math.min(0.4 + marksheetScore, 0.95);
          reasons.push(`Classified as marksheet (score: ${marksheetScore.toFixed(2)}) based on indicators:`);
          foundIndicators.forEach(indicator => reasons.push(`  • ${indicator}`));
        } else if (allText.includes('aadhar') || allText.includes('aadhaar') || /\d{4}\s\d{4}\s\d{4}/.test(allText)) {
          scores['aadhar_card'] = 0.7;
          reasons.push('Classified as aadhar_card based on number pattern or text content');
        } else if (allText.includes('pan') || /[A-Z]{5}\d{4}[A-Z]/.test(allText)) {
          scores['pan_card'] = 0.7;
          reasons.push('Classified as pan_card based on PAN pattern or text content');
        } else {
          scores['document'] = 0.5;
          reasons.push('Classified as generic document based on text content');
        }
      } else {
        // Neither clearly photo nor text document
        scores['unknown_document'] = 0.3;
        reasons.push('Unable to classify - insufficient distinguishing features');
      }
    }
    
    // Find best match
    const bestMatch = Object.entries(scores).reduce((best, [type, score]) => 
      score > best.score ? { type, score } : best, { type: 'unknown_document', score: 0 }
    );
    
    // Generate warnings and recommendations
    if (bestMatch.score < 0.6) {
      warnings.push('Low confidence in document type detection');
      recommendations.push('Ensure the document is clear and well-lit');
      recommendations.push('Check if the document is complete and not cropped');
    }
    
    if (bestMatch.score < 0.3) {
      warnings.push('Document type could not be reliably determined');
      recommendations.push('Consider manual verification or re-scanning the document');
    }
    
    // Cross-check with suspected type
    if (suspectedType && suspectedType !== bestMatch.type && bestMatch.score > 0.5) {
      warnings.push(`Expected ${suspectedType} but detected ${bestMatch.type}`);
      recommendations.push('Verify document type or check for file naming issues');
    }
    
    return {
      bestMatch: bestMatch.type,
      confidence: Math.min(bestMatch.score, 1.0),
      reasons,
      warnings,
      recommendations
    };
  }
  
  // Helper methods for element detection
  private async detectFacesFallback(canvas: HTMLCanvasElement): Promise<number> {
    // Simple heuristic: look for skin-colored regions in photo-like areas
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let skinPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Basic skin color detection
      if (r > 95 && g > 40 && b > 20 && 
          Math.max(r, g, b) - Math.min(r, g, b) > 15 && 
          Math.abs(r - g) > 15 && r > g && r > b) {
        skinPixels++;
      }
    }
    
    const skinRatio = skinPixels / (data.length / 4);
    return skinRatio > 0.05 ? 1 : 0; // If >5% skin pixels, likely has face
  }
  
  private async detectQRCodes(canvas: HTMLCanvasElement): Promise<number> {
    // This would use a QR code detection library in production
    // For now, return 0 as placeholder
    return 0;
  }
  
  private async detectSignatures(canvas: HTMLCanvasElement): Promise<number> {
    // Look for irregular handwriting patterns
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    
    // This is a simplified heuristic - in production, use ML models
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let darkPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (gray < 100) darkPixels++;
    }
    
    const darkRatio = darkPixels / (data.length / 4);
    return darkRatio > 0.01 && darkRatio < 0.2 ? 1 : 0; // Signature-like density
  }
  
  private async detectSeals(canvas: HTMLCanvasElement): Promise<number> {
    // Look for circular patterns that might be seals
    return 0; // Placeholder - would use circle detection
  }
  
  private async detectWatermarks(canvas: HTMLCanvasElement): Promise<boolean> {
    // Look for semi-transparent overlays
    return false; // Placeholder
  }
  
  private async detectTextRegions(canvas: HTMLCanvasElement): Promise<boolean> {
    // Basic text detection using edge detection
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let edges = 0;
    for (let i = 0; i < data.length - 4; i += 4) {
      const gray1 = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const gray2 = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
      if (Math.abs(gray1 - gray2) > 30) edges++;
    }
    
    return edges > (data.length / 4) * 0.05; // If >5% edge pixels, likely has text
  }
  
  private async assessImageQuality(canvas: HTMLCanvasElement): Promise<number> {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 50;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Calculate variance (higher variance = better quality/sharpness)
    let mean = 0;
    for (let i = 0; i < data.length; i += 4) {
      mean += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    mean /= (data.length / 4);
    
    let variance = 0;
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      variance += Math.pow(gray - mean, 2);
    }
    variance /= (data.length / 4);
    
    // Convert variance to quality score (0-100)
    return Math.min(Math.sqrt(variance) / 2, 100);
  }
  
  
  /**
   * Analyze text density in the image
   */
  private async analyzeTextDensity(canvas: HTMLCanvasElement): Promise<number> {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    
    let textPixels = 0;
    const totalPixels = width * height;
    
    // Convert to grayscale and detect text-like regions
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      // Text regions tend to have high contrast edges
      if (i > width * 4 && i < data.length - width * 4) {
        const topGray = (data[i - width * 4] + data[i - width * 4 + 1] + data[i - width * 4 + 2]) / 3;
        const bottomGray = (data[i + width * 4] + data[i + width * 4 + 1] + data[i + width * 4 + 2]) / 3;
        
        if (Math.abs(gray - topGray) > 50 || Math.abs(gray - bottomGray) > 50) {
          textPixels++;
        }
      }
    }
    
    return textPixels / totalPixels;
  }
  
  /**
   * Detect table/grid structures in the image
   */
  private async detectTableStructures(canvas: HTMLCanvasElement): Promise<number> {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    
    let horizontalLines = 0;
    let verticalLines = 0;
    
    // Detect horizontal lines
    for (let y = 0; y < height; y += 5) {
      let linePixels = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (gray < 128) linePixels++; // Dark pixels (potential lines)
      }
      if (linePixels > width * 0.7) horizontalLines++;
    }
    
    // Detect vertical lines
    for (let x = 0; x < width; x += 5) {
      let linePixels = 0;
      for (let y = 0; y < height; y++) {
        const i = (y * width + x) * 4;
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (gray < 128) linePixels++; // Dark pixels (potential lines)
      }
      if (linePixels > height * 0.7) verticalLines++;
    }
    
    // Table detected if we have both horizontal and vertical lines
    return (horizontalLines > 2 && verticalLines > 2) ? 1 : 0;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
    }
  }
}

// Export singleton instance
export const documentTypeVerifier = new DocumentTypeVerifier();