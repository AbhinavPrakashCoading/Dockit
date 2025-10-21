// JSON Schema Builder - Convert extracted requirements into structured JSON schema

import type { DocumentRequirement, ExamSchema, ExtractedContent } from './types';

export class SchemaBuilder {
  
  /**
   * Build complete exam schema from document requirements
   */
  buildExamSchema(
    examName: string, 
    documentRequirements: DocumentRequirement[], 
    extractedContents: ExtractedContent[]
  ): ExamSchema {
    const normalizedExamName = this.normalizeExamName(examName);
    const enhancedRequirements = this.enhanceDocumentRequirements(documentRequirements);
    const sourceInfo = this.extractSourceInformation(extractedContents);

    return {
      exam: normalizedExamName,
      documents: enhancedRequirements,
      extractedFrom: sourceInfo.primarySource,
      extractedAt: new Date().toISOString()
    };
  }

  /**
   * Normalize exam name for display
   */
  private normalizeExamName(examName: string): string {
    return examName
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace(/\b(ibps|sbi|ssc|rrb|nta|upsc|cat|jee|neet)\b/gi, match => match.toUpperCase());
  }

  /**
   * Enhance document requirements with additional validations and defaults
   */
  private enhanceDocumentRequirements(requirements: DocumentRequirement[]): DocumentRequirement[] {
    const enhanced = requirements.map(req => this.enhanceSingleRequirement(req));
    
    // Add missing standard requirements if not found
    const standardRequirements = this.getStandardRequirements();
    const existingTypes = new Set(enhanced.map(req => req.type));

    for (const standardReq of standardRequirements) {
      if (!existingTypes.has(standardReq.type)) {
        enhanced.push(standardReq);
      }
    }

    return enhanced.sort((a, b) => this.getRequirementPriority(a.type) - this.getRequirementPriority(b.type));
  }

  /**
   * Enhance a single document requirement
   */
  private enhanceSingleRequirement(requirement: DocumentRequirement): DocumentRequirement {
    const enhanced = { ...requirement };
    
    // Normalize and validate formats
    if (enhanced.requirements.format) {
      enhanced.requirements.format = this.normalizeFormats(enhanced.requirements.format);
    }

    // Validate and enhance size requirements
    enhanced.requirements = this.validateSizeRequirements(enhanced.requirements);

    // Add missing format if not specified
    if (!enhanced.requirements.format) {
      enhanced.requirements.format = this.getDefaultFormats(enhanced.type);
    }

    // Add default notes if none exist
    if (!enhanced.requirements.notes || enhanced.requirements.notes.length === 0) {
      enhanced.requirements.notes = this.getDefaultNotes(enhanced.type);
    }

    // Validate dimensions
    if (enhanced.requirements.dimensions) {
      enhanced.requirements.dimensions = this.validateDimensions(enhanced.requirements.dimensions);
    }

    return enhanced;
  }

  /**
   * Normalize file formats
   */
  private normalizeFormats(formats: string[]): string[] {
    const formatMap: { [key: string]: string } = {
      'jpg': 'JPG',
      'jpeg': 'JPEG', 
      'png': 'PNG',
      'pdf': 'PDF',
      'gif': 'GIF',
      'bmp': 'BMP',
      'tiff': 'TIFF',
      'tif': 'TIFF'
    };

    return formats
      .map(format => formatMap[format.toLowerCase()] || format.toUpperCase())
      .filter((format, index, arr) => arr.indexOf(format) === index); // Remove duplicates
  }

  /**
   * Validate and enhance size requirements
   */
  private validateSizeRequirements(requirements: any): any {
    const enhanced = { ...requirements };

    // Convert MB to KB if needed
    if (enhanced.size_mb && !enhanced.size_kb) {
      enhanced.size_kb = {
        min: enhanced.size_mb.min ? enhanced.size_mb.min * 1024 : undefined,
        max: enhanced.size_mb.max ? enhanced.size_mb.max * 1024 : undefined
      };
    }

    // Ensure reasonable size limits
    if (enhanced.size_kb) {
      if (enhanced.size_kb.min && enhanced.size_kb.min < 1) {
        enhanced.size_kb.min = 1;
      }
      if (enhanced.size_kb.max && enhanced.size_kb.max > 10240) { // 10MB in KB
        enhanced.size_kb.max = 10240;
      }
    }

    return enhanced;
  }

  /**
   * Get default formats for document types
   */
  private getDefaultFormats(documentType: string): string[] {
    const defaultFormats: { [key: string]: string[] } = {
      'photograph': ['JPG', 'JPEG'],
      'signature': ['JPG', 'JPEG'],
      'certificate': ['PDF', 'JPG', 'JPEG'],
      'id_proof': ['PDF', 'JPG', 'JPEG'],
      'marksheet': ['PDF', 'JPG', 'JPEG'],
      'thumb_impression': ['JPG', 'JPEG']
    };

    return defaultFormats[documentType.toLowerCase()] || ['JPG', 'JPEG', 'PDF'];
  }

  /**
   * Get default notes for document types
   */
  private getDefaultNotes(documentType: string): string[] {
    const defaultNotes: { [key: string]: string[] } = {
      'photograph': [
        'Recent colored photograph',
        'Clear face visibility required',
        'Light background preferred'
      ],
      'signature': [
        'Clear signature in black or blue ink',
        'Sign on white paper',
        'Avoid decorative signatures'
      ],
      'certificate': [
        'Upload clear scanned copy',
        'All text should be readable',
        'Original certificate holder required'
      ],
      'thumb_impression': [
        'Use left thumb for impression',
        'Press firmly on white paper',
        'Clean thumb before impression'
      ]
    };

    return defaultNotes[documentType.toLowerCase()] || [
      'Upload clear and readable document',
      'Ensure good quality scan or photo'
    ];
  }

  /**
   * Validate and normalize dimensions
   */
  private validateDimensions(dimensions: string): string {
    // Extract numbers from dimension string
    const match = dimensions.match(/(\d+)\s*[x×*]\s*(\d+)/);
    if (match) {
      const width = parseInt(match[1]);
      const height = parseInt(match[2]);
      
      // Determine if these are pixel dimensions or physical dimensions
      if (width > 50 && height > 50) {
        return `${width}x${height} pixels`;
      } else if (width <= 50 && height <= 50) {
        return `${width}x${height} mm`;
      }
    }
    
    return dimensions;
  }

  /**
   * Get standard document requirements that are commonly needed
   */
  private getStandardRequirements(): DocumentRequirement[] {
    return [
      {
        type: 'photograph',
        requirements: {
          format: ['JPG', 'JPEG'],
          size_kb: { min: 10, max: 100 },
          dimensions: '200x230 pixels',
          color: 'color',
          background: 'light',
          notes: [
            'Recent colored photograph',
            'Passport size preferred',
            'Clear face visibility required'
          ]
        }
      },
      {
        type: 'signature',
        requirements: {
          format: ['JPG', 'JPEG'],
          size_kb: { min: 5, max: 50 },
          dimensions: '140x60 pixels',
          color: 'any',
          background: 'white',
          notes: [
            'Clear signature in black or blue ink',
            'Sign on white paper',
            'Scan or photograph clearly'
          ]
        }
      }
    ];
  }

  /**
   * Get priority order for document types
   */
  private getRequirementPriority(documentType: string): number {
    const priorities: { [key: string]: number } = {
      'photograph': 1,
      'signature': 2,
      'thumb_impression': 3,
      'id_proof': 4,
      'certificate': 5,
      'marksheet': 6
    };

    return priorities[documentType.toLowerCase()] || 10;
  }

  /**
   * Extract source information from extracted contents
   */
  private extractSourceInformation(extractedContents: ExtractedContent[]): { primarySource: string } {
    if (extractedContents.length === 0) {
      return { primarySource: 'Unknown source' };
    }

    // Prefer PDF sources over HTML
    const pdfSources = extractedContents.filter(content => content.type === 'pdf');
    if (pdfSources.length > 0) {
      return { primarySource: pdfSources[0].url };
    }

    // Use first HTML source
    return { primarySource: extractedContents[0].url };
  }

  /**
   * Validate the final schema
   */
  validateSchema(schema: ExamSchema): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema.exam || schema.exam.trim().length === 0) {
      errors.push('Exam name is required');
    }

    if (!schema.documents || schema.documents.length === 0) {
      errors.push('At least one document requirement is needed');
    }

    for (const doc of schema.documents) {
      if (!doc.type || doc.type.trim().length === 0) {
        errors.push('Document type is required for all documents');
      }

      if (!doc.requirements) {
        errors.push(`Requirements missing for document type: ${doc.type}`);
        continue;
      }

      // Validate format
      if (!doc.requirements.format || doc.requirements.format.length === 0) {
        errors.push(`File format is required for document type: ${doc.type}`);
      }

      // Validate size requirements
      if (doc.requirements.size_kb) {
        if (doc.requirements.size_kb.min && doc.requirements.size_kb.max && 
            doc.requirements.size_kb.min > doc.requirements.size_kb.max) {
          errors.push(`Invalid size range for document type: ${doc.type}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate schema summary for logging/debugging
   */
  generateSchemaSummary(schema: ExamSchema): string {
    const summary = [
      `Exam: ${schema.exam}`,
      `Documents: ${schema.documents.length}`,
      `Extracted from: ${schema.extractedFrom}`,
      `Generated at: ${schema.extractedAt}`,
      '',
      'Document Requirements:'
    ];

    for (const doc of schema.documents) {
      summary.push(`- ${doc.type.toUpperCase()}`);
      summary.push(`  Formats: ${doc.requirements.format?.join(', ') || 'Not specified'}`);
      
      if (doc.requirements.size_kb) {
        const sizeInfo = doc.requirements.size_kb.min 
          ? `${doc.requirements.size_kb.min}-${doc.requirements.size_kb.max} KB`
          : `Max ${doc.requirements.size_kb.max} KB`;
        summary.push(`  Size: ${sizeInfo}`);
      }
      
      if (doc.requirements.dimensions) {
        summary.push(`  Dimensions: ${doc.requirements.dimensions}`);
      }
      
      summary.push('');
    }

    return summary.join('\n');
  }
}