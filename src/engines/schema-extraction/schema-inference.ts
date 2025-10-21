// Schema Inference Logic - Detect and normalize document requirements from text

import type { ExtractedContent, DocumentPattern, DocumentRequirement } from './types';
import { 
  DOCUMENT_TYPES, 
  SIZE_PATTERNS, 
  DIMENSION_PATTERNS, 
  FORMAT_PATTERNS,
  CONFIDENCE_THRESHOLDS 
} from './constants';

export class SchemaInferenceEngine {
  
  /**
   * Infer document requirements from extracted content
   */
  async inferDocumentRequirements(extractedContents: ExtractedContent[]): Promise<DocumentRequirement[]> {
    const allPatterns: DocumentPattern[] = [];

    // Extract patterns from all content sources
    for (const content of extractedContents) {
      const patterns = this.extractDocumentPatterns(content.text);
      allPatterns.push(...patterns);
    }

    // Group patterns by document type
    const groupedPatterns = this.groupPatternsByType(allPatterns);

    // Convert patterns to structured requirements
    const requirements: DocumentRequirement[] = [];
    for (const [type, patterns] of groupedPatterns) {
      const requirement = this.buildDocumentRequirement(type, patterns);
      if (requirement) {
        requirements.push(requirement);
      }
    }

    return this.deduplicateRequirements(requirements);
  }

  /**
   * Extract document patterns from text content
   */
  private extractDocumentPatterns(text: string): DocumentPattern[] {
    const patterns: DocumentPattern[] = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Look for document type mentions
      const documentType = this.identifyDocumentType(line);
      if (documentType) {
        // Extract requirements from this line and surrounding context
        const context = this.getContextLines(lines, i, 3);
        const requirement = this.extractRequirementsFromContext(documentType, context);
        
        if (requirement) {
          patterns.push({
            type: documentType,
            patterns: [line],
            extractedText: context.join(' '),
            confidence: this.calculatePatternConfidence(line, documentType)
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Identify document type from text line
   */
  private identifyDocumentType(line: string): string | null {
    const lowerLine = line.toLowerCase();

    // Check for each document type
    for (const [type, keywords] of Object.entries(DOCUMENT_TYPES)) {
      for (const keyword of keywords) {
        if (lowerLine.includes(keyword.toLowerCase())) {
          return type.toLowerCase();
        }
      }
    }

    return null;
  }

  /**
   * Get context lines around a specific line
   */
  private getContextLines(lines: string[], index: number, radius: number): string[] {
    const start = Math.max(0, index - radius);
    const end = Math.min(lines.length, index + radius + 1);
    return lines.slice(start, end);
  }

  /**
   * Extract requirements from context lines
   */
  private extractRequirementsFromContext(documentType: string, context: string[]): any {
    const fullText = context.join(' ').toLowerCase();
    
    const requirements: any = {};

    // Extract file formats
    const formats = this.extractFormats(fullText);
    if (formats.length > 0) {
      requirements.format = formats;
    }

    // Extract file sizes
    const sizes = this.extractFileSizes(fullText);
    if (sizes.kb) {
      requirements.size_kb = sizes.kb;
    }
    if (sizes.mb) {
      requirements.size_mb = sizes.mb;
    }

    // Extract dimensions
    const dimensions = this.extractDimensions(fullText);
    if (dimensions) {
      requirements.dimensions = dimensions;
    }

    // Extract color requirements
    const color = this.extractColorRequirements(fullText);
    if (color) {
      requirements.color = color;
    }

    // Extract background requirements
    const background = this.extractBackgroundRequirements(fullText);
    if (background) {
      requirements.background = background;
    }

    // Extract additional notes
    const notes = this.extractAdditionalNotes(fullText, documentType);
    if (notes.length > 0) {
      requirements.notes = notes;
    }

    return Object.keys(requirements).length > 0 ? requirements : null;
  }

  /**
   * Extract file formats from text
   */
  private extractFormats(text: string): string[] {
    const formats = new Set<string>();
    
    const matches = text.match(FORMAT_PATTERNS.IMAGE_FORMATS);
    if (matches) {
      matches.forEach(match => formats.add(match.toLowerCase()));
    }

    const docMatches = text.match(FORMAT_PATTERNS.DOCUMENT_FORMATS);
    if (docMatches) {
      docMatches.forEach(match => formats.add(match.toLowerCase()));
    }

    return Array.from(formats);
  }

  /**
   * Extract file sizes from text
   */
  private extractFileSizes(text: string): { kb?: any, mb?: any } {
    const sizes: any = {};

    // Extract KB ranges
    const kbRangeMatch = text.match(SIZE_PATTERNS.KB);
    if (kbRangeMatch) {
      const match = kbRangeMatch[0];
      const numbers = match.match(/(\d+(?:\.\d+)?)/g);
      if (numbers && numbers.length >= 2) {
        sizes.kb = {
          min: parseFloat(numbers[0]),
          max: parseFloat(numbers[1])
        };
      }
    } else {
      // Extract single KB values
      const kbMatch = text.match(SIZE_PATTERNS.SINGLE_KB);
      if (kbMatch) {
        const value = parseFloat(kbMatch[0].match(/(\d+(?:\.\d+)?)/)?.[0] || '0');
        sizes.kb = { max: value };
      }
    }

    // Extract MB ranges
    const mbRangeMatch = text.match(SIZE_PATTERNS.MB);
    if (mbRangeMatch) {
      const match = mbRangeMatch[0];
      const numbers = match.match(/(\d+(?:\.\d+)?)/g);
      if (numbers && numbers.length >= 2) {
        sizes.mb = {
          min: parseFloat(numbers[0]),
          max: parseFloat(numbers[1])
        };
      }
    } else {
      // Extract single MB values
      const mbMatch = text.match(SIZE_PATTERNS.SINGLE_MB);
      if (mbMatch) {
        const value = parseFloat(mbMatch[0].match(/(\d+(?:\.\d+)?)/)?.[0] || '0');
        sizes.mb = { max: value };
      }
    }

    return sizes;
  }

  /**
   * Extract dimensions from text
   */
  private extractDimensions(text: string): string | null {
    // Check for pixel dimensions
    const pixelMatch = text.match(DIMENSION_PATTERNS.PIXELS);
    if (pixelMatch) {
      const match = pixelMatch[0];
      const numbers = match.match(/(\d+)/g);
      if (numbers && numbers.length >= 2) {
        return `${numbers[0]}x${numbers[1]}`;
      }
    }

    // Check for mm dimensions
    const mmMatch = text.match(DIMENSION_PATTERNS.MM);
    if (mmMatch) {
      const match = mmMatch[0];
      const numbers = match.match(/(\d+)/g);
      if (numbers && numbers.length >= 2) {
        return `${numbers[0]}x${numbers[1]} mm`;
      }
    }

    // Check for cm dimensions
    const cmMatch = text.match(DIMENSION_PATTERNS.CM);
    if (cmMatch) {
      const match = cmMatch[0];
      const numbers = match.match(/(\d+(?:\.\d+)?)/g);
      if (numbers && numbers.length >= 2) {
        return `${numbers[0]}x${numbers[1]} cm`;
      }
    }

    // Check for inch dimensions
    const inchMatch = text.match(DIMENSION_PATTERNS.INCH);
    if (inchMatch) {
      const match = inchMatch[0];
      const numbers = match.match(/(\d+(?:\.\d+)?)/g);
      if (numbers && numbers.length >= 2) {
        return `${numbers[0]}x${numbers[1]} inch`;
      }
    }

    return null;
  }

  /**
   * Extract color requirements from text
   */
  private extractColorRequirements(text: string): string | null {
    if (text.includes('color') || text.includes('coloured') || text.includes('colored')) {
      return 'color';
    }
    if (text.includes('black and white') || text.includes('black & white') || text.includes('b&w')) {
      return 'black-white';
    }
    return null;
  }

  /**
   * Extract background requirements from text
   */
  private extractBackgroundRequirements(text: string): string | null {
    if (text.includes('white background') || text.includes('light background')) {
      return 'white';
    }
    if (text.includes('plain background')) {
      return 'plain';
    }
    if (text.includes('light colored background') || text.includes('light colour background')) {
      return 'light';
    }
    return null;
  }

  /**
   * Extract additional notes and requirements
   */
  private extractAdditionalNotes(text: string, documentType: string): string[] {
    const notes: string[] = [];

    // Common notes patterns
    const notePatterns = [
      /recent photo/i,
      /passport size/i,
      /clear (?:signature|photo|image)/i,
      /black ink/i,
      /blue ink/i,
      /white paper/i,
      /own handwriting/i,
      /thumb impression/i,
      /left thumb/i,
      /right thumb/i,
      /scanned copy/i,
      /high resolution/i,
      /good quality/i
    ];

    for (const pattern of notePatterns) {
      const match = text.match(pattern);
      if (match) {
        notes.push(match[0]);
      }
    }

    return notes;
  }

  /**
   * Calculate confidence score for a pattern
   */
  private calculatePatternConfidence(line: string, documentType: string): number {
    const lowerLine = line.toLowerCase();
    let confidence = 0.5; // Base confidence

    // Increase confidence for specific keywords
    if (lowerLine.includes('requirement') || lowerLine.includes('specification')) {
      confidence += 0.2;
    }
    if (lowerLine.includes('format') || lowerLine.includes('size') || lowerLine.includes('dimension')) {
      confidence += 0.2;
    }
    if (lowerLine.includes('upload') || lowerLine.includes('attach')) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Group patterns by document type
   */
  private groupPatternsByType(patterns: DocumentPattern[]): Map<string, DocumentPattern[]> {
    const groups = new Map<string, DocumentPattern[]>();

    for (const pattern of patterns) {
      if (!groups.has(pattern.type)) {
        groups.set(pattern.type, []);
      }
      groups.get(pattern.type)!.push(pattern);
    }

    return groups;
  }

  /**
   * Build document requirement from patterns
   */
  private buildDocumentRequirement(type: string, patterns: DocumentPattern[]): DocumentRequirement | null {
    if (patterns.length === 0) return null;

    // Find the highest confidence pattern
    const bestPattern = patterns.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    if (bestPattern.confidence < CONFIDENCE_THRESHOLDS.LOW) {
      return null;
    }

    // Extract requirements from all patterns of this type
    const combinedText = patterns.map(p => p.extractedText).join(' ');
    const requirements = this.extractRequirementsFromContext(type, [combinedText]);

    if (!requirements) return null;

    return {
      type: this.normalizeDocumentType(type),
      requirements
    };
  }

  /**
   * Normalize document type names
   */
  private normalizeDocumentType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'photo': 'photograph',
      'signature': 'signature',
      'certificates': 'certificate',
      'id_proof': 'id_proof'
    };

    return typeMap[type.toLowerCase()] || type.toLowerCase();
  }

  /**
   * Remove duplicate requirements
   */
  private deduplicateRequirements(requirements: DocumentRequirement[]): DocumentRequirement[] {
    const seen = new Set<string>();
    return requirements.filter(req => {
      const key = req.type.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}