/**
 * Text Analyzer Module
 * Applies regex/NLP rules to detect document requirements from extracted text
 */

import { AnalysisPattern, ParsedRequirement } from './types';

export class TextAnalyzer {
  private patterns: AnalysisPattern[];

  constructor() {
    this.patterns = this.initializePatterns();
  }

  /**
   * Analyze text and extract document requirements
   */
  analyzeText(text: string): ParsedRequirement[] {
    const normalizedText = this.normalizeText(text);
    const requirements: ParsedRequirement[] = [];
    const processedSections = new Set<string>();

    // Check if text contains meaningful content
    if (!this.containsMeaningfulContent(text)) {
      console.warn('⚠️ Text does not contain meaningful document requirements');
      return [];
    }

    // Split text into meaningful sections
    const sections = this.splitIntoSections(normalizedText);

    for (const section of sections) {
      const sectionKey = section.substring(0, 100); // Use first 100 chars as key
      if (processedSections.has(sectionKey)) continue;
      
      const sectionRequirements = this.analyzeSectionForRequirements(section);
      requirements.push(...sectionRequirements);
      processedSections.add(sectionKey);
    }

    const finalRequirements = this.deduplicateAndMergeRequirements(requirements);
    
    // Filter out low-confidence requirements if we have too many generic ones
    if (finalRequirements.length > 10) {
      return finalRequirements.filter(req => req.confidence > 0.7);
    }

    return finalRequirements;
  }

  /**
   * Check if text contains meaningful document requirement content
   */
  private containsMeaningfulContent(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Must contain document-related keywords
    const documentKeywords = ['document', 'upload', 'attach', 'photo', 'signature', 'certificate', 'marksheet'];
    const hasDocumentKeywords = documentKeywords.some(keyword => lowerText.includes(keyword));
    
    // Must contain format or size specifications
    const specKeywords = ['jpg', 'jpeg', 'png', 'pdf', 'kb', 'mb', 'size', 'format', 'dimension'];
    const hasSpecKeywords = specKeywords.some(keyword => lowerText.includes(keyword));
    
    // Must be substantial content (not just navigation or headers)
    const hasSubstantialContent = text.length > 200;
    
    return hasDocumentKeywords && hasSpecKeywords && hasSubstantialContent;
  }

  /**
   * Analyze a specific section of text for document requirements
   */
  private analyzeSectionForRequirements(section: string): ParsedRequirement[] {
    const requirements: ParsedRequirement[] = [];

    for (const pattern of this.patterns) {
      const matches = section.matchAll(pattern.regex);
      
      for (const match of matches) {
        try {
          const requirement = pattern.extractor(match, section);
          if (requirement.documentType) {
            requirements.push({
              documentType: requirement.documentType,
              formats: requirement.formats || [],
              sizeConstraints: requirement.sizeConstraints || {},
              dimensions: requirement.dimensions,
              description: requirement.description || section.substring(Math.max(0, match.index! - 50), match.index! + 200),
              confidence: pattern.confidence
            });
          }
        } catch (error) {
          console.warn(`Pattern ${pattern.name} failed:`, error);
        }
      }
    }

    return requirements;
  }

  /**
   * Initialize analysis patterns
   */
  private initializePatterns(): AnalysisPattern[] {
    return [
      // Photo/Photograph patterns
      {
        name: 'photo_requirements',
        regex: /(?:photo|photograph|passport\s+photo|recent\s+photo|color\s+photo)[:\s]*([^.]+?)(?:\.|$)/gi,
        confidence: 0.9,
        extractor: (match, context) => {
          const description = match[1] || '';
          return {
            documentType: 'photo',
            formats: this.extractFormats(description) || ['jpg', 'jpeg', 'png'],
            sizeConstraints: this.extractSizeConstraints(description),
            dimensions: this.extractDimensions(description),
            description: match[0]
          };
        }
      },

      // Signature patterns
      {
        name: 'signature_requirements',
        regex: /(?:signature|sign|digital\s+signature)[:\s]*([^.]+?)(?:\.|$)/gi,
        confidence: 0.85,
        extractor: (match, context) => {
          const description = match[1] || '';
          return {
            documentType: 'signature',
            formats: this.extractFormats(description) || ['jpg', 'jpeg', 'png'],
            sizeConstraints: this.extractSizeConstraints(description),
            dimensions: this.extractDimensions(description),
            description: match[0]
          };
        }
      },

      // Thumb impression patterns
      {
        name: 'thumb_requirements',
        regex: /(?:thumb\s+impression|thumb\s+print|left\s+thumb|right\s+thumb)[:\s]*([^.]+?)(?:\.|$)/gi,
        confidence: 0.8,
        extractor: (match, context) => {
          const description = match[1] || '';
          return {
            documentType: 'thumb_impression',
            formats: this.extractFormats(description) || ['jpg', 'jpeg', 'png'],
            sizeConstraints: this.extractSizeConstraints(description),
            dimensions: this.extractDimensions(description),
            description: match[0]
          };
        }
      },

      // Document upload patterns
      {
        name: 'document_upload',
        regex: /(?:upload|attach|submit)[:\s]+(?:the\s+)?([a-zA-Z\s]+?)(?:document|file|image|photo)[:\s]*([^.]+?)(?:\.|$)/gi,
        confidence: 0.7,
        extractor: (match, context) => {
          const docType = match[1]?.trim().toLowerCase().replace(/\s+/g, '_') || 'document';
          const description = match[2] || '';
          return {
            documentType: docType,
            formats: this.extractFormats(description),
            sizeConstraints: this.extractSizeConstraints(description),
            dimensions: this.extractDimensions(description),
            description: match[0]
          };
        }
      },

      // Specific document types
      {
        name: 'specific_documents',
        regex: /(?:marksheet|certificate|id\s+proof|address\s+proof|caste\s+certificate|income\s+certificate|experience\s+certificate)[:\s]*([^.]+?)(?:\.|$)/gi,
        confidence: 0.85,
        extractor: (match, context) => {
          const fullMatch = match[0];
          const docType = fullMatch.split(/[:\s]/)[0].toLowerCase().replace(/\s+/g, '_');
          const description = match[1] || '';
          return {
            documentType: docType,
            formats: this.extractFormats(description) || ['pdf', 'jpg', 'jpeg', 'png'],
            sizeConstraints: this.extractSizeConstraints(description),
            dimensions: this.extractDimensions(description),
            description: fullMatch
          };
        }
      },

      // Size constraint patterns
      {
        name: 'size_constraints',
        regex: /(?:size|file\s+size)[:\s]*(?:should\s+be|must\s+be|not\s+exceed|maximum|max|minimum|min)[:\s]*(\d+(?:\.\d+)?)\s*(kb|mb|bytes?)/gi,
        confidence: 0.95,
        extractor: (match, context) => {
          const size = match[1];
          const unit = match[2].toLowerCase();
          const documentType = this.inferDocumentTypeFromContext(context);
          return {
            documentType: documentType || 'document',
            sizeConstraints: {
              max: `${size}${unit}`
            },
            description: match[0]
          };
        }
      },

      // Dimension patterns
      {
        name: 'dimension_constraints',
        regex: /(?:dimension|size|resolution)[:\s]*(\d{2,4})\s*[x×]\s*(\d{2,4})\s*(?:pixels?|px)?/gi,
        confidence: 0.9,
        extractor: (match, context) => {
          const width = parseInt(match[1]);
          const height = parseInt(match[2]);
          const documentType = this.inferDocumentTypeFromContext(context);
          return {
            documentType: documentType || 'image',
            dimensions: { width, height },
            description: match[0]
          };
        }
      },

      // Format specifications
      {
        name: 'format_specifications',
        regex: /(?:format|file\s+type|extension)[:\s]*(?:should\s+be|must\s+be|only|accepted)[:\s]*([a-zA-Z,\s/]+)/gi,
        confidence: 0.8,
        extractor: (match, context) => {
          const formatString = match[1];
          const formats = this.parseFormatString(formatString);
          const documentType = this.inferDocumentTypeFromContext(context);
          return {
            documentType: documentType || 'document',
            formats,
            description: match[0]
          };
        }
      }
    ];
  }

  /**
   * Extract file formats from text
   */
  private extractFormats(text: string): string[] {
    const formatRegex = /\b(jpg|jpeg|png|pdf|gif|bmp|tiff|doc|docx)\b/gi;
    const matches = text.match(formatRegex);
    return matches ? [...new Set(matches.map(f => f.toLowerCase()))] : [];
  }

  /**
   * Extract size constraints from text
   */
  private extractSizeConstraints(text: string): { max?: string; min?: string } {
    const sizeRegex = /(\d+(?:\.\d+)?)\s*(kb|mb|bytes?)/gi;
    const constraints: { max?: string; min?: string } = {};
    
    const matches = text.matchAll(sizeRegex);
    for (const match of matches) {
      const size = `${match[1]}${match[2].toLowerCase()}`;
      const context = text.substring(Math.max(0, match.index! - 20), match.index! + 20).toLowerCase();
      
      if (context.includes('max') || context.includes('not exceed') || context.includes('upto')) {
        constraints.max = size;
      } else if (context.includes('min') || context.includes('atleast')) {
        constraints.min = size;
      } else {
        constraints.max = size; // Default to max if unclear
      }
    }
    
    return constraints;
  }

  /**
   * Extract dimensions from text
   */
  private extractDimensions(text: string): { width?: number; height?: number; ratio?: string } | undefined {
    const dimensionRegex = /(\d{2,4})\s*[x×]\s*(\d{2,4})/gi;
    const match = dimensionRegex.exec(text);
    
    if (match) {
      const width = parseInt(match[1]);
      const height = parseInt(match[2]);
      const ratio = `${width}:${height}`;
      return { width, height, ratio };
    }
    
    return undefined;
  }

  /**
   * Infer document type from surrounding context
   */
  private inferDocumentTypeFromContext(context: string): string | null {
    const lowerContext = context.toLowerCase();
    
    if (lowerContext.includes('photo') || lowerContext.includes('photograph')) return 'photo';
    if (lowerContext.includes('signature') || lowerContext.includes('sign')) return 'signature';
    if (lowerContext.includes('thumb')) return 'thumb_impression';
    if (lowerContext.includes('marksheet')) return 'marksheet';
    if (lowerContext.includes('certificate')) return 'certificate';
    if (lowerContext.includes('id proof')) return 'id_proof';
    if (lowerContext.includes('address')) return 'address_proof';
    
    return null;
  }

  /**
   * Parse format string into array of formats
   */
  private parseFormatString(formatString: string): string[] {
    return formatString
      .toLowerCase()
      .split(/[,\/\s]+/)
      .map(f => f.trim())
      .filter(f => f.length > 0 && /^[a-z]+$/.test(f));
  }

  /**
   * Normalize text for better pattern matching
   */
  private normalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[''""]/g, '"')
      .replace(/[–—]/g, '-')
      .toLowerCase()
      .trim();
  }

  /**
   * Split text into meaningful sections for analysis
   */
  private splitIntoSections(text: string): string[] {
    // Split by common section delimiters
    const sections = text.split(/(?:\n\s*\n|\.\s+(?=[A-Z])|•|[0-9]+\.\s)/);
    return sections
      .map(s => s.trim())
      .filter(s => s.length > 20); // Filter out very short sections
  }

  /**
   * Remove duplicate requirements and merge similar ones
   */
  private deduplicateAndMergeRequirements(requirements: ParsedRequirement[]): ParsedRequirement[] {
    const merged = new Map<string, ParsedRequirement>();

    for (const req of requirements) {
      const key = req.documentType;
      const existing = merged.get(key);

      if (existing) {
        // Merge requirements for the same document type
        merged.set(key, {
          documentType: req.documentType,
          formats: [...new Set([...existing.formats, ...req.formats])],
          sizeConstraints: {
            max: req.sizeConstraints.max || existing.sizeConstraints.max,
            min: req.sizeConstraints.min || existing.sizeConstraints.min
          },
          dimensions: req.dimensions || existing.dimensions,
          description: req.description.length > existing.description.length ? req.description : existing.description,
          confidence: Math.max(req.confidence, existing.confidence)
        });
      } else {
        merged.set(key, req);
      }
    }

    return Array.from(merged.values())
      .sort((a, b) => b.confidence - a.confidence); // Sort by confidence
  }
}

export const textAnalyzer = new TextAnalyzer();