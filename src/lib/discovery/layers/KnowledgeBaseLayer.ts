/**
 * Knowledge Base Layer
 * Manages static exam database and pattern matching
 */

interface DiscoveryRequest {
  examName: string;
  query: string;
  context?: {
    year?: string;
    region?: string;
    level?: string;
  };
}

interface ExamRequirement {
  id: string;
  name: string;
  type: 'document' | 'form-field' | 'media';
  required: boolean;
  description: string;
  formats?: string[];
  constraints?: any;
}

interface DiscoveryResult {
  examId: string;
  examName: string;
  requirements: ExamRequirement[];
  sources: any[];
  confidence: number;
  validationScore: number;
  discoveryPath: string[];
  metadata: any;
}

export class KnowledgeBaseLayer {
  private examDatabase: Map<string, any> = new Map();
  private patterns: Map<string, RegExp[]> = new Map();

  constructor() {
    this.initializeExamDatabase();
    this.initializePatterns();
  }

  /**
   * Find exam in knowledge base
   */
  async findExam(request: DiscoveryRequest): Promise<DiscoveryResult | null> {
    console.log(`📚 Searching knowledge base for: ${request.examName}`);

    // Try exact match first
    const exactMatch = this.findExactMatch(request.examName);
    if (exactMatch) {
      return this.createResultFromKnowledge(exactMatch, 0.95);
    }

    // Try pattern matching
    const patternMatch = this.findPatternMatch(request.examName, request.query);
    if (patternMatch) {
      return this.createResultFromKnowledge(patternMatch, 0.8);
    }

    // Try fuzzy matching
    const fuzzyMatch = this.findFuzzyMatch(request.examName);
    if (fuzzyMatch) {
      return this.createResultFromKnowledge(fuzzyMatch, 0.6);
    }

    return null;
  }

  /**
   * Find exact match in database
   */
  private findExactMatch(examName: string): any | null {
    const normalizedName = this.normalizeExamName(examName);
    
    for (const [key, exam] of this.examDatabase) {
      if (key === normalizedName) {
        return exam;
      }
      
      // Check aliases
      if (exam.aliases && exam.aliases.some((alias: string) => 
        this.normalizeExamName(alias) === normalizedName
      )) {
        return exam;
      }
    }

    return null;
  }

  /**
   * Find using pattern matching
   */
  private findPatternMatch(examName: string, query: string): any | null {
    const searchText = (examName + ' ' + query).toLowerCase();

    for (const [key, exam] of this.examDatabase) {
      if (exam.patterns) {
        const matches = exam.patterns.some((pattern: string) => 
          searchText.includes(pattern.toLowerCase())
        );
        
        if (matches) {
          return exam;
        }
      }
    }

    return null;
  }

  /**
   * Find using fuzzy matching
   */
  private findFuzzyMatch(examName: string): any | null {
    const threshold = 0.7;
    let bestMatch: any = null;
    let bestScore = 0;

    for (const [key, exam] of this.examDatabase) {
      const similarity = this.calculateSimilarity(examName, exam.name);
      
      if (similarity > threshold && similarity > bestScore) {
        bestScore = similarity;
        bestMatch = exam;
      }
    }

    return bestMatch;
  }

  /**
   * Create result from knowledge base entry
   */
  private createResultFromKnowledge(exam: any, confidence: number): DiscoveryResult {
    const requirements = this.createRequirementsFromExam(exam);

    return {
      examId: exam.id,
      examName: exam.name,
      requirements,
      sources: exam.websites ? exam.websites.map((url: string) => ({
        url,
        title: `${exam.name} Official Website`,
        type: 'official',
        reliability: exam.sourceMetadata?.reliability || 0.9,
        lastAccessed: new Date().toISOString(),
        contentHash: this.generateHash(url)
      })) : [],
      confidence,
      validationScore: 0,
      discoveryPath: [],
      metadata: {
        discoveredAt: new Date().toISOString(),
        discoveryMethod: 'knowledge-base',
        category: exam.category,
        subcategory: exam.subcategory,
        reliability: exam.sourceMetadata?.reliability || 0.9,
        needsVerification: confidence < 0.8
      }
    };
  }

  /**
   * Create requirements from exam definition
   */
  private createRequirementsFromExam(exam: any): ExamRequirement[] {
    const requirements: ExamRequirement[] = [];

    // Use documentFields if available, otherwise commonRequirements
    const fields = exam.documentFields || exam.commonRequirements || [];

    fields.forEach((field: string) => {
      const requirement = this.createRequirementFromField(field);
      if (requirement) {
        requirements.push(requirement);
      }
    });

    return requirements;
  }

  /**
   * Create requirement object from field name
   */
  private createRequirementFromField(field: string): ExamRequirement | null {
    const fieldMap: Record<string, { name: string; description: string }> = {
      'photo': {
        name: 'Passport Size Photograph',
        description: 'Recent passport size photograph with white background'
      },
      'signature': {
        name: 'Signature',
        description: 'Clear signature of the candidate'
      },
      'left-thumb-impression': {
        name: 'Left Thumb Impression',
        description: 'Clear left thumb impression of the candidate'
      },
      'handwritten-declaration': {
        name: 'Handwritten Declaration',
        description: 'Handwritten declaration as specified in the application'
      },
      'educational-certificate': {
        name: 'Educational Certificate',
        description: 'Educational qualification certificate (10th/12th/Graduation)'
      },
      'category-certificate': {
        name: 'Category Certificate',
        description: 'Category/Caste certificate for reserved category candidates'
      },
      'identity-proof': {
        name: 'Identity Proof',
        description: 'Valid identity proof (Aadhar/PAN/Passport)'
      },
      'address-proof': {
        name: 'Address Proof',
        description: 'Valid address proof document'
      }
    };

    const fieldInfo = fieldMap[field];
    if (!fieldInfo) return null;

    return {
      id: field,
      name: fieldInfo.name,
      type: 'document',
      required: true,
      description: fieldInfo.description,
      formats: this.getDefaultFormats(field),
      constraints: this.getDefaultConstraints(field)
    };
  }

  /**
   * Get default file formats for field
   */
  private getDefaultFormats(field: string): string[] {
    const formatMap: Record<string, string[]> = {
      'photo': ['JPEG', 'PNG'],
      'signature': ['JPEG', 'PNG'],
      'educational-certificate': ['PDF', 'JPEG', 'PNG'],
      'category-certificate': ['PDF', 'JPEG', 'PNG'],
      'identity-proof': ['PDF', 'JPEG', 'PNG'],
      'address-proof': ['PDF', 'JPEG', 'PNG']
    };

    return formatMap[field] || ['JPEG', 'PNG', 'PDF'];
  }

  /**
   * Get default constraints for field
   */
  private getDefaultConstraints(field: string): any {
    const constraintMap: Record<string, any> = {
      'photo': {
        maxSize: '200KB',
        dimensions: '200x230',
        fileTypes: ['jpg', 'jpeg', 'png']
      },
      'signature': {
        maxSize: '100KB',
        dimensions: '200x100',
        fileTypes: ['jpg', 'jpeg', 'png']
      }
    };

    return constraintMap[field];
  }

  /**
   * Initialize exam database
   */
  private initializeExamDatabase(): void {
    // This would typically be loaded from a database
    const exams = [
      {
        id: 'ibps-clerk',
        name: 'IBPS Clerk',
        category: 'government',
        subcategory: 'banking',
        patterns: ['ibps clerk', 'ibps clerical', 'banking clerk'],
        aliases: ['ibps-clerk-2025', 'ibps clerk 2025'],
        commonRequirements: ['photo', 'signature', 'left-thumb-impression', 'handwritten-declaration', 'educational-certificate'],
        documentFields: ['photo', 'signature', 'left-thumb-impression', 'handwritten-declaration', 'educational-certificate', 'category-certificate'],
        websites: ['https://www.ibps.in'],
        sourceMetadata: {
          reliability: 0.97,
          lastUpdated: '2024-10-10'
        }
      },
      {
        id: 'sbi-clerk',
        name: 'SBI Clerk',
        category: 'government',
        subcategory: 'banking',
        patterns: ['sbi clerk', 'state bank clerk', 'sbi junior associate'],
        aliases: ['sbi-clerk-2025'],
        commonRequirements: ['photo', 'signature', 'left-thumb-impression', 'handwritten-declaration', 'educational-certificate'],
        documentFields: ['photo', 'signature', 'left-thumb-impression', 'handwritten-declaration', 'educational-certificate', 'category-certificate'],
        websites: ['https://sbi.co.in/careers'],
        sourceMetadata: {
          reliability: 0.96,
          lastUpdated: '2024-10-05'
        }
      },
      {
        id: 'ssc-cgl',
        name: 'SSC CGL',
        category: 'government',
        subcategory: 'general',
        patterns: ['ssc cgl', 'staff selection commission', 'combined graduate level'],
        aliases: ['ssc-cgl-2025'],
        commonRequirements: ['photo', 'signature', 'educational-certificate', 'category-certificate'],
        documentFields: ['photo', 'signature', 'educational-certificate', 'category-certificate', 'domicile-certificate'],
        websites: ['https://ssc.nic.in'],
        sourceMetadata: {
          reliability: 0.95,
          lastUpdated: '2024-09-15'
        }
      }
    ];

    exams.forEach(exam => {
      this.examDatabase.set(this.normalizeExamName(exam.name), exam);
    });
  }

  /**
   * Initialize search patterns
   */
  private initializePatterns(): void {
    this.patterns.set('banking', [
      /ibps|sbi|bank|po|clerk/i,
      /banking|financial|rural.*bank/i
    ]);

    this.patterns.set('ssc', [
      /ssc|staff.*selection|combined.*graduate/i,
      /cgl|chsl|mts|constable/i
    ]);

    this.patterns.set('railway', [
      /railway|rrb|indian.*railway/i,
      /ntpc|group.*d|alp|technician/i
    ]);
  }

  /**
   * Utility methods
   */
  private normalizeExamName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity
    const set1 = new Set(str1.toLowerCase().split(''));
    const set2 = new Set(str2.toLowerCase().split(''));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  /**
   * Add new exam to database
   */
  addExam(exam: any): void {
    const key = this.normalizeExamName(exam.name);
    this.examDatabase.set(key, exam);
  }

  /**
   * Get database statistics
   */
  getStats(): { totalExams: number; categories: string[] } {
    const categories = new Set<string>();
    
    for (const exam of this.examDatabase.values()) {
      if (exam.category) categories.add(exam.category);
    }

    return {
      totalExams: this.examDatabase.size,
      categories: Array.from(categories)
    };
  }
}