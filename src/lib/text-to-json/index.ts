// Text-to-JSON Parser for Document Requirements
// Converts unstructured text into structured JSON schemas

export interface DocumentRequirement {
  type: string;
  requirements: {
    format?: string[];
    maxSize?: string;
    minSize?: string;
    dimensions?: {
      width?: number;
      height?: number;
      ratio?: string;
    };
    description?: string;
    mandatory?: boolean;
  };
}

export interface ParsedSchema {
  exam?: string;
  source: string;
  extractedAt: string;
  documents: DocumentRequirement[];
  metadata: {
    extractionMethod: 'text-parsing';
    confidence: number;
    originalText: string;
    detectedPatterns: string[];
  };
}

export interface FormatSuggestion {
  id: string;
  title: string;
  description: string;
  example: string;
  pattern: RegExp;
  confidence: number;
}

export class TextToJsonParser {
  private documentPatterns = {
    photo: /(?:photo|photograph|picture|image|passport|pic)\s*(?:size|dimensions?)?/i,
    signature: /(?:signature|sign|handwritten)/i,
    certificate: /(?:certificate|cert|document|qualification|degree)/i,
    identity: /(?:identity|id\s*proof|identification|aadhar|pan|passport)/i,
    address: /(?:address|residential|domicile)/i,
    category: /(?:category|caste|reservation|sc|st|obc)/i,
    educational: /(?:educational|education|academic|qualification|degree|diploma)/i,
    experience: /(?:experience|employment|work|job)/i,
    medical: /(?:medical|health|fitness|disability)/i,
    income: /(?:income|salary|earning|financial)/i
  };

  private formatPatterns = {
    jpeg: /jpe?g/i,
    png: /png/i,
    pdf: /pdf/i,
    doc: /docx?/i,
    formats: /(?:format|extension|type)[\s:]*([a-z,\s\/]+)/i
  };

  private sizePatterns = {
    kb: /(\d+(?:\.\d+)?)\s*kb/i,
    mb: /(\d+(?:\.\d+)?)\s*mb/i,
    maxSize: /(?:max|maximum|up\s*to|not\s*more\s*than|below)\s*(\d+(?:\.\d+)?)\s*(kb|mb)/i,
    minSize: /(?:min|minimum|at\s*least|above|more\s*than)\s*(\d+(?:\.\d+)?)\s*(kb|mb)/i
  };

  private dimensionPatterns = {
    pixels: /(\d+)\s*[x×*]\s*(\d+)\s*(?:px|pixel|pixels?)?/i,
    ratio: /(\d+)\s*:\s*(\d+)/i,
    cm: /(\d+(?:\.\d+)?)\s*(?:cm|centimeter)/i,
    inch: /(\d+(?:\.\d+)?)\s*(?:inch|in|")/i,
    passportSize: /passport\s*size/i
  };

  private mandatoryPatterns = {
    required: /(?:required|mandatory|must|compulsory|essential)/i,
    optional: /(?:optional|if\s*applicable|not\s*mandatory|voluntary)/i
  };

  /**
   * Main method to parse text into JSON schema
   */
  public parseTextToJson(text: string, examName?: string): ParsedSchema {
    const lines = this.preprocessText(text);
    const documents: DocumentRequirement[] = [];
    const detectedPatterns: string[] = [];

    // Process each line or section
    for (const line of lines) {
      if (line.trim().length < 3) continue; // Skip empty or very short lines

      const document = this.parseDocumentLine(line);
      if (document) {
        documents.push(document);
        detectedPatterns.push(`Detected ${document.type} from: "${line.substring(0, 50)}..."`);
      }
    }

    // If no documents found, try to parse as a single block
    if (documents.length === 0) {
      const bulkDocument = this.parseBulkText(text);
      if (bulkDocument) {
        documents.push(bulkDocument);
        detectedPatterns.push('Parsed as single document block');
      }
    }

    return {
      exam: examName || this.extractExamName(text) || 'Parsed from Text',
      source: 'text-input',
      extractedAt: new Date().toISOString(),
      documents,
      metadata: {
        extractionMethod: 'text-parsing',
        confidence: this.calculateConfidence(documents, text),
        originalText: text,
        detectedPatterns
      }
    };
  }

  /**
   * Get format suggestions based on input text
   */
  public getFormatSuggestions(text: string): FormatSuggestion[] {
    const suggestions: FormatSuggestion[] = [];

    // Analyze text content to provide relevant suggestions
    const hasDocuments = /document|certificate|proof/i.test(text);
    const hasPhoto = /photo|image|picture/i.test(text);
    const hasFormats = /format|jpg|pdf|png/i.test(text);
    const hasSizes = /size|kb|mb/i.test(text);

    if (hasPhoto || /passport|photograph/i.test(text)) {
      suggestions.push({
        id: 'photo-format',
        title: 'Photo Requirements Format',
        description: 'Structure for photo/image requirements with dimensions and formats',
        example: `Photo Requirements:
- Format: JPG, JPEG
- Size: Max 50 KB, Min 10 KB  
- Dimensions: 200x230 pixels (passport size)
- Background: White/Light color
- Recent photograph (within 6 months)`,
        pattern: /photo|image|picture/i,
        confidence: 0.9
      });
    }

    if (hasDocuments || /certificate|qualification/i.test(text)) {
      suggestions.push({
        id: 'document-format',
        title: 'Document Requirements Format',
        description: 'Structure for certificates and document requirements',
        example: `Educational Certificate:
- Format: PDF only
- Size: Maximum 1 MB
- Quality: Clear, readable scan
- Content: All pages including marksheet
- Mandatory: Yes`,
        pattern: /document|certificate/i,
        confidence: 0.8
      });
    }

    if (!hasFormats && !hasSizes) {
      suggestions.push({
        id: 'general-format',
        title: 'General Document Structure',
        description: 'Basic structure for any document requirement',
        example: `Document Name:
- Type: [Photo/Certificate/Identity Proof]
- Format: [JPG, PDF, PNG]
- Size: Maximum [XX] KB/MB
- Dimensions: [if applicable]
- Description: [Brief description]
- Required: [Yes/No]`,
        pattern: /.*/,
        confidence: 0.6
      });
    }

    if (/signature|sign/i.test(text)) {
      suggestions.push({
        id: 'signature-format',
        title: 'Signature Requirements',
        description: 'Format for signature specifications',
        example: `Signature:
- Format: JPG, JPEG
- Size: Maximum 30 KB
- Dimensions: 140x60 pixels
- Background: White
- Ink: Black or blue
- Clear and legible`,
        pattern: /signature|sign/i,
        confidence: 0.85
      });
    }

    if (/exam|application|form/i.test(text)) {
      suggestions.push({
        id: 'exam-requirements',
        title: 'Complete Exam Requirements',
        description: 'Full structure for exam application requirements',
        example: `EXAM NAME Application Requirements:

1. Photo:
   - Format: JPG, JPEG
   - Size: 50 KB max, 20 KB min
   - Dimensions: 200x230 pixels

2. Signature:
   - Format: JPG
   - Size: 30 KB max
   - Dimensions: 140x60 pixels

3. Educational Certificate:
   - Format: PDF
   - Size: 1 MB max
   - Content: Degree/Diploma certificate

4. Identity Proof:
   - Format: PDF
   - Size: 500 KB max
   - Documents: Aadhar/PAN/Passport`,
        pattern: /exam|application/i,
        confidence: 0.7
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Preprocess text into manageable lines
   */
  private preprocessText(text: string): string[] {
    return text
      .split(/[\n\r]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/[•\-*]\s*/, '')); // Remove bullet points
  }

  /**
   * Parse a single line/section for document requirements
   */
  private parseDocumentLine(line: string): DocumentRequirement | null {
    // Detect document type
    const docType = this.detectDocumentType(line);
    if (!docType) return null;

    const requirements: DocumentRequirement['requirements'] = {};

    // Extract formats
    const formats = this.extractFormats(line);
    if (formats.length > 0) {
      requirements.format = formats;
    }

    // Extract sizes
    const sizes = this.extractSizes(line);
    if (sizes.maxSize) requirements.maxSize = sizes.maxSize;
    if (sizes.minSize) requirements.minSize = sizes.minSize;

    // Extract dimensions
    const dimensions = this.extractDimensions(line);
    if (dimensions) {
      requirements.dimensions = dimensions;
    }

    // Check if mandatory
    requirements.mandatory = this.isMandatory(line);

    // Add description
    requirements.description = this.extractDescription(line, docType);

    return {
      type: docType,
      requirements
    };
  }

  /**
   * Parse text as a single bulk document
   */
  private parseBulkText(text: string): DocumentRequirement | null {
    const formats = this.extractFormats(text);
    const sizes = this.extractSizes(text);
    const dimensions = this.extractDimensions(text);

    return {
      type: 'Document Upload',
      requirements: {
        format: formats.length > 0 ? formats : ['PDF', 'JPG', 'JPEG'],
        maxSize: sizes.maxSize || '500 KB',
        minSize: sizes.minSize,
        dimensions: dimensions || undefined,
        mandatory: this.isMandatory(text),
        description: text.substring(0, 100) + (text.length > 100 ? '...' : '')
      }
    };
  }

  /**
   * Detect document type from text
   */
  private detectDocumentType(text: string): string | null {
    for (const [type, pattern] of Object.entries(this.documentPatterns)) {
      if (pattern.test(text)) {
        return this.capitalizeFirst(type);
      }
    }
    return null;
  }

  /**
   * Extract file formats from text
   */
  private extractFormats(text: string): string[] {
    const formats: string[] = [];

    // Check for specific formats
    if (this.formatPatterns.jpeg.test(text)) formats.push('JPG', 'JPEG');
    if (this.formatPatterns.png.test(text)) formats.push('PNG');
    if (this.formatPatterns.pdf.test(text)) formats.push('PDF');
    if (this.formatPatterns.doc.test(text)) formats.push('DOC', 'DOCX');

    // Try to extract from format specifications
    const formatMatch = text.match(this.formatPatterns.formats);
    if (formatMatch) {
      const extractedFormats = formatMatch[1]
        .split(/[,\/\s]+/)
        .map(f => f.trim().toUpperCase())
        .filter(f => f.length > 0 && f.length < 6);
      formats.push(...extractedFormats);
    }

    return [...new Set(formats)]; // Remove duplicates
  }

  /**
   * Extract size requirements from text
   */
  private extractSizes(text: string): { maxSize?: string; minSize?: string } {
    const sizes: { maxSize?: string; minSize?: string } = {};

    const maxMatch = text.match(this.sizePatterns.maxSize);
    if (maxMatch) {
      sizes.maxSize = `${maxMatch[1]} ${maxMatch[2].toUpperCase()}`;
    }

    const minMatch = text.match(this.sizePatterns.minSize);
    if (minMatch) {
      sizes.minSize = `${minMatch[1]} ${minMatch[2].toUpperCase()}`;
    }

    // If no specific max/min found, look for general size mentions
    if (!sizes.maxSize && !sizes.minSize) {
      const kbMatch = text.match(this.sizePatterns.kb);
      const mbMatch = text.match(this.sizePatterns.mb);

      if (kbMatch) sizes.maxSize = `${kbMatch[1]} KB`;
      if (mbMatch) sizes.maxSize = `${mbMatch[1]} MB`;
    }

    return sizes;
  }

  /**
   * Extract dimension requirements from text
   */
  private extractDimensions(text: string): { width?: number; height?: number; ratio?: string } | null {
    // Check for pixel dimensions
    const pixelMatch = text.match(this.dimensionPatterns.pixels);
    if (pixelMatch) {
      return {
        width: parseInt(pixelMatch[1]),
        height: parseInt(pixelMatch[2]),
        ratio: `${pixelMatch[1]}:${pixelMatch[2]}`
      };
    }

    // Check for ratio
    const ratioMatch = text.match(this.dimensionPatterns.ratio);
    if (ratioMatch) {
      return {
        ratio: `${ratioMatch[1]}:${ratioMatch[2]}`
      };
    }

    // Check for passport size
    if (this.dimensionPatterns.passportSize.test(text)) {
      return {
        width: 35,
        height: 45,
        ratio: 'passport size'
      };
    }

    return null;
  }

  /**
   * Check if document is mandatory
   */
  private isMandatory(text: string): boolean {
    if (this.mandatoryPatterns.optional.test(text)) return false;
    if (this.mandatoryPatterns.required.test(text)) return true;
    return true; // Default to mandatory
  }

  /**
   * Extract description from text
   */
  private extractDescription(text: string, docType: string): string {
    // Clean up the text and create a meaningful description
    let description = text
      .replace(/[•\-*]\s*/, '')
      .replace(new RegExp(docType, 'gi'), '')
      .trim();

    if (description.length > 100) {
      description = description.substring(0, 100) + '...';
    }

    return description || `${docType} requirement`;
  }

  /**
   * Extract exam name from text
   */
  private extractExamName(text: string): string | null {
    const examPatterns = [
      /(?:IBPS|SBI|UPSC|RRB|SSC|GATE|JEE|NEET|CAT|MAT|XAT)\s*[A-Z0-9\s]*/i,
      /([A-Z\s]+)\s*(?:exam|examination|test|application)/i,
      /(?:exam|examination|test)\s*(?:for|of)?\s*([A-Z\s]+)/i
    ];

    for (const pattern of examPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim() || match[1]?.trim();
      }
    }

    return null;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(documents: DocumentRequirement[], originalText: string): number {
    if (documents.length === 0) return 0.1;

    let score = 0.3; // Base score
    
    // Add points for each document found
    score += documents.length * 0.2;

    // Add points for detailed requirements
    documents.forEach(doc => {
      if (doc.requirements.format?.length) score += 0.1;
      if (doc.requirements.maxSize) score += 0.1;
      if (doc.requirements.dimensions) score += 0.1;
    });

    // Penalize if original text is very short or very long without structure
    if (originalText.length < 50) score *= 0.7;
    if (originalText.length > 1000 && documents.length < 3) score *= 0.8;

    return Math.min(score, 0.95); // Cap at 95%
  }

  /**
   * Utility function to capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Export singleton instance
export const textToJsonParser = new TextToJsonParser();