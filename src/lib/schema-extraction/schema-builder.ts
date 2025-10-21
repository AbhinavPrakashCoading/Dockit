/**
 * Schema Builder Module
 * Constructs structured JSON schema from extracted and analyzed requirements
 */

import { ExamSchema, DocumentRequirement, ParsedRequirement } from './types';

export class SchemaBuilder {
  /**
   * Build a complete exam schema from parsed requirements
   */
  buildSchema(
    parsedRequirements: ParsedRequirement[],
    examTitle: string,
    sourceUrl: string,
    extractionMethod: 'html' | 'pdf' | 'dynamic' = 'html'
  ): ExamSchema {
    const documents = this.buildDocumentRequirements(parsedRequirements);
    const averageConfidence = this.calculateAverageConfidence(parsedRequirements);

    return {
      exam: this.normalizeExamTitle(examTitle),
      source: sourceUrl,
      extractedAt: new Date().toISOString(),
      documents,
      metadata: {
        url: sourceUrl,
        contentType: extractionMethod === 'pdf' ? 'application/pdf' : 'text/html',
        extractionMethod,
        confidence: averageConfidence
      }
    };
  }

  /**
   * Convert parsed requirements to document requirements
   */
  private buildDocumentRequirements(parsedRequirements: ParsedRequirement[]): DocumentRequirement[] {
    return parsedRequirements
      .filter(req => req.confidence > 0.5) // Filter low confidence requirements
      .map(req => this.buildSingleDocumentRequirement(req))
      .sort((a, b) => {
        // Sort by priority: photo, signature, documents, others
        const priorityOrder = ['photo', 'signature', 'thumb_impression', 'marksheet', 'certificate'];
        const aIndex = priorityOrder.indexOf(a.type);
        const bIndex = priorityOrder.indexOf(b.type);
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.type.localeCompare(b.type);
      });
  }

  /**
   * Build a single document requirement from parsed data
   */
  private buildSingleDocumentRequirement(parsed: ParsedRequirement): DocumentRequirement {
    const requirement: DocumentRequirement = {
      type: this.normalizeDocumentType(parsed.documentType),
      requirements: {
        mandatory: this.inferMandatory(parsed.description),
        description: this.cleanDescription(parsed.description)
      }
    };

    // Add format requirements
    if (parsed.formats && parsed.formats.length > 0) {
      requirement.requirements.format = parsed.formats;
    }

    // Add size constraints
    if (parsed.sizeConstraints.max) {
      requirement.requirements.maxSize = this.normalizeSizeConstraint(parsed.sizeConstraints.max);
    }
    if (parsed.sizeConstraints.min) {
      requirement.requirements.minSize = this.normalizeSizeConstraint(parsed.sizeConstraints.min);
    }

    // Add dimension constraints
    if (parsed.dimensions) {
      requirement.requirements.dimensions = {
        width: parsed.dimensions.width,
        height: parsed.dimensions.height,
        ratio: parsed.dimensions.ratio
      };
    }

    return requirement;
  }

  /**
   * Normalize document type names
   */
  private normalizeDocumentType(type: string): string {
    const normalizedType = type.toLowerCase().trim();
    
    // Map common variations to standard names
    const typeMapping: Record<string, string> = {
      'photo': 'Photo',
      'photograph': 'Photo',
      'passport_photo': 'Photo',
      'recent_photo': 'Photo',
      'color_photo': 'Photo',
      'signature': 'Signature',
      'sign': 'Signature',
      'digital_signature': 'Signature',
      'thumb_impression': 'Thumb Impression',
      'thumb_print': 'Thumb Impression',
      'left_thumb': 'Left Thumb Impression',
      'right_thumb': 'Right Thumb Impression',
      'marksheet': 'Marksheet',
      'mark_sheet': 'Marksheet',
      'certificate': 'Certificate',
      'id_proof': 'ID Proof',
      'identity_proof': 'ID Proof',
      'address_proof': 'Address Proof',
      'caste_certificate': 'Caste Certificate',
      'income_certificate': 'Income Certificate',
      'experience_certificate': 'Experience Certificate'
    };

    return typeMapping[normalizedType] || this.capitalizeWords(normalizedType.replace(/_/g, ' '));
  }

  /**
   * Normalize exam title
   */
  private normalizeExamTitle(title: string): string {
    const cleaned = title
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-()]/g, '')
      .trim();
    
    return cleaned || 'Unknown Exam';
  }

  /**
   * Infer if a document is mandatory from description
   */
  private inferMandatory(description: string): boolean {
    const lowerDescription = description.toLowerCase();
    
    // Keywords that suggest mandatory
    const mandatoryKeywords = [
      'mandatory', 'required', 'must', 'compulsory', 'essential', 
      'necessary', 'should', 'need to', 'have to'
    ];
    
    // Keywords that suggest optional
    const optionalKeywords = [
      'optional', 'if applicable', 'if available', 'may', 'can'
    ];

    const hasMandatory = mandatoryKeywords.some(keyword => lowerDescription.includes(keyword));
    const hasOptional = optionalKeywords.some(keyword => lowerDescription.includes(keyword));

    if (hasOptional && !hasMandatory) return false;
    return true; // Default to mandatory if unclear
  }

  /**
   * Clean and format description text
   */
  private cleanDescription(description: string): string {
    return description
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-().,;:]/g, '')
      .trim()
      .substring(0, 200); // Limit length
  }

  /**
   * Normalize size constraint format
   */
  private normalizeSizeConstraint(size: string): string {
    const sizeRegex = /(\d+(?:\.\d+)?)\s*(kb|mb|bytes?)/i;
    const match = size.match(sizeRegex);
    
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      // Normalize to standard units
      if (unit.startsWith('byte')) {
        if (value < 1024) return `${value} bytes`;
        if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
        return `${(value / (1024 * 1024)).toFixed(1)} MB`;
      }
      
      return `${value} ${unit.toUpperCase()}`;
    }
    
    return size;
  }

  /**
   * Calculate average confidence from parsed requirements
   */
  private calculateAverageConfidence(requirements: ParsedRequirement[]): number {
    if (requirements.length === 0) return 0;
    
    const totalConfidence = requirements.reduce((sum, req) => sum + req.confidence, 0);
    return Math.round((totalConfidence / requirements.length) * 100) / 100;
  }

  /**
   * Capitalize words in a string
   */
  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, letter => letter.toUpperCase());
  }

  /**
   * Validate the generated schema
   */
  validateSchema(schema: ExamSchema): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema.exam || schema.exam.trim().length === 0) {
      errors.push('Exam name is required');
    }

    if (!schema.source || !this.isValidUrl(schema.source)) {
      errors.push('Valid source URL is required');
    }

    if (!schema.documents || schema.documents.length === 0) {
      errors.push('At least one document requirement is required');
    }

    schema.documents?.forEach((doc, index) => {
      if (!doc.type || doc.type.trim().length === 0) {
        errors.push(`Document ${index + 1}: type is required`);
      }

      if (!doc.requirements) {
        errors.push(`Document ${index + 1}: requirements object is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if a string is a valid URL
   */
  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }
}

export const schemaBuilder = new SchemaBuilder();