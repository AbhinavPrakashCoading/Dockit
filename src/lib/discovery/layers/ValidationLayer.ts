/**
 * Validation Layer
 * Validates discovered requirements against known patterns and rules
 */

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

interface ValidationReport {
  score: number;
  issues: ValidationIssue[];
  recommendations: string[];
  confidence: number;
}

interface ValidationIssue {
  type: 'missing' | 'suspicious' | 'duplicate' | 'format' | 'constraint';
  severity: 'low' | 'medium' | 'high';
  field: string;
  message: string;
  suggestion?: string;
}

export class ValidationLayer {
  private commonRequirements: Set<string> = new Set();
  private categoryRules: Map<string, ValidationRule[]> = new Map();
  private suspiciousPatterns: RegExp[] = [];

  constructor() {
    this.initializeCommonRequirements();
    this.initializeCategoryRules();
    this.initializeSuspiciousPatterns();
  }

  /**
   * Validate discovery result
   */
  async validate(result: DiscoveryResult): Promise<number> {
    console.log(`✅ Validating discovery result for: ${result.examName}`);

    const report = await this.generateValidationReport(result);
    
    // Log validation issues for debugging
    if (report.issues.length > 0) {
      console.log(`⚠️ Found ${report.issues.length} validation issues:`);
      report.issues.forEach(issue => {
        console.log(`  - ${issue.severity.toUpperCase()}: ${issue.message}`);
      });
    }

    return report.score;
  }

  /**
   * Generate comprehensive validation report
   */
  async generateValidationReport(result: DiscoveryResult): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    const recommendations: string[] = [];

    // 1. Check for common requirements
    const missingCommon = this.validateCommonRequirements(result.requirements);
    issues.push(...missingCommon);

    // 2. Validate against category rules
    const categoryIssues = this.validateCategoryRules(result);
    issues.push(...categoryIssues);

    // 3. Check for suspicious requirements
    const suspiciousIssues = this.validateSuspiciousPatterns(result.requirements);
    issues.push(...suspiciousIssues);

    // 4. Validate requirement formats
    const formatIssues = this.validateRequirementFormats(result.requirements);
    issues.push(...formatIssues);

    // 5. Check for duplicates
    const duplicateIssues = this.validateDuplicates(result.requirements);
    issues.push(...duplicateIssues);

    // 6. Validate source consistency
    const sourceIssues = this.validateSourceConsistency(result);
    issues.push(...sourceIssues);

    // Generate recommendations
    recommendations.push(...this.generateRecommendations(issues, result));

    // Calculate overall score
    const score = this.calculateValidationScore(issues, result);
    const confidence = this.calculateValidationConfidence(issues, result);

    return {
      score,
      issues,
      recommendations,
      confidence
    };
  }

  /**
   * Validate common requirements are present
   */
  private validateCommonRequirements(requirements: ExamRequirement[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const presentIds = new Set(requirements.map(r => r.id));

    const essentialRequirements = ['photo', 'signature'];
    
    essentialRequirements.forEach(essential => {
      if (!presentIds.has(essential)) {
        issues.push({
          type: 'missing',
          severity: 'high',
          field: essential,
          message: `Missing essential requirement: ${essential}`,
          suggestion: `Add ${essential} requirement as it's mandatory for most exams`
        });
      }
    });

    return issues;
  }

  /**
   * Validate against category-specific rules
   */
  private validateCategoryRules(result: DiscoveryResult): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const category = result.metadata?.category || 'general';
    const rules = this.categoryRules.get(category) || [];

    const presentIds = new Set(result.requirements.map(r => r.id));

    rules.forEach(rule => {
      if (rule.required && !presentIds.has(rule.requirement)) {
        issues.push({
          type: 'missing',
          severity: rule.severity,
          field: rule.requirement,
          message: `Missing ${category} exam requirement: ${rule.requirement}`,
          suggestion: rule.suggestion
        });
      }
    });

    return issues;
  }

  /**
   * Check for suspicious or unlikely requirements
   */
  private validateSuspiciousPatterns(requirements: ExamRequirement[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    requirements.forEach(req => {
      this.suspiciousPatterns.forEach(pattern => {
        if (pattern.test(req.id) || pattern.test(req.name)) {
          issues.push({
            type: 'suspicious',
            severity: 'medium',
            field: req.id,
            message: `Suspicious requirement detected: ${req.name}`,
            suggestion: 'Verify this requirement is actually needed for this exam'
          });
        }
      });
    });

    return issues;
  }

  /**
   * Validate requirement formats and constraints
   */
  private validateRequirementFormats(requirements: ExamRequirement[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    requirements.forEach(req => {
      // Check if document requirements have proper formats
      if (req.type === 'document' && (!req.formats || req.formats.length === 0)) {
        issues.push({
          type: 'format',
          severity: 'low',
          field: req.id,
          message: `Document requirement ${req.name} missing file format specification`,
          suggestion: 'Add supported file formats (JPEG, PNG, PDF)'
        });
      }

      // Check for reasonable constraints
      if (req.constraints) {
        if (req.constraints.maxSize) {
          const size = req.constraints.maxSize.toLowerCase();
          if (size.includes('gb') || (size.includes('mb') && parseInt(size) > 10)) {
            issues.push({
              type: 'constraint',
              severity: 'medium',
              field: req.id,
              message: `Unusually large file size constraint: ${req.constraints.maxSize}`,
              suggestion: 'Verify file size limits are reasonable (typically under 2MB)'
            });
          }
        }
      }
    });

    return issues;
  }

  /**
   * Check for duplicate requirements
   */
  private validateDuplicates(requirements: ExamRequirement[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const seen = new Set<string>();
    const namesSeen = new Set<string>();

    requirements.forEach(req => {
      // Check ID duplicates
      if (seen.has(req.id)) {
        issues.push({
          type: 'duplicate',
          severity: 'high',
          field: req.id,
          message: `Duplicate requirement ID: ${req.id}`,
          suggestion: 'Remove duplicate requirement'
        });
      }
      seen.add(req.id);

      // Check name duplicates
      const normalizedName = req.name.toLowerCase().trim();
      if (namesSeen.has(normalizedName)) {
        issues.push({
          type: 'duplicate',
          severity: 'medium',
          field: req.id,
          message: `Duplicate requirement name: ${req.name}`,
          suggestion: 'Merge similar requirements or use more specific names'
        });
      }
      namesSeen.add(normalizedName);
    });

    return issues;
  }

  /**
   * Validate source consistency
   */
  private validateSourceConsistency(result: DiscoveryResult): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check if we have official sources
    const officialSources = result.sources.filter(s => s.type === 'official');
    if (officialSources.length === 0 && result.requirements.length > 0) {
      issues.push({
        type: 'missing',
        severity: 'medium',
        field: 'sources',
        message: 'No official sources found for requirements',
        suggestion: 'Try to find official exam websites or notifications'
      });
    }

    // Check source reliability
    const lowReliabilitySources = result.sources.filter(s => s.reliability < 0.5);
    if (lowReliabilitySources.length > 0) {
      issues.push({
        type: 'suspicious',
        severity: 'low',
        field: 'sources',
        message: `${lowReliabilitySources.length} sources have low reliability scores`,
        suggestion: 'Verify information from more reliable sources'
      });
    }

    return issues;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(issues: ValidationIssue[], result: DiscoveryResult): string[] {
    const recommendations: string[] = [];

    const highSeverityIssues = issues.filter(i => i.severity === 'high');
    if (highSeverityIssues.length > 0) {
      recommendations.push('Address high-severity issues before using this schema');
    }

    const missingEssential = issues.filter(i => i.type === 'missing' && ['photo', 'signature'].includes(i.field));
    if (missingEssential.length > 0) {
      recommendations.push('Add essential requirements: photo and signature are mandatory for most exams');
    }

    if (result.sources.length === 0) {
      recommendations.push('Find official sources to improve reliability');
    }

    const category = result.metadata?.category;
    if (category === 'government-banking') {
      const bankingReqs = ['left-thumb-impression', 'handwritten-declaration'];
      const missing = bankingReqs.filter(req => !result.requirements.find(r => r.id === req));
      if (missing.length > 0) {
        recommendations.push(`Banking exams typically require: ${missing.join(', ')}`);
      }
    }

    return recommendations;
  }

  /**
   * Calculate validation score (0-1)
   */
  private calculateValidationScore(issues: ValidationIssue[], result: DiscoveryResult): number {
    let score = 1.0;

    // Deduct points for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score -= 0.3;
          break;
        case 'medium':
          score -= 0.15;
          break;
        case 'low':
          score -= 0.05;
          break;
      }
    });

    // Bonus for having essential requirements
    const essentialPresent = ['photo', 'signature'].filter(req => 
      result.requirements.find(r => r.id === req)
    ).length;
    score += essentialPresent * 0.1;

    // Bonus for having official sources
    const officialSources = result.sources.filter(s => s.type === 'official').length;
    if (officialSources > 0) {
      score += 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate validation confidence
   */
  private calculateValidationConfidence(issues: ValidationIssue[], result: DiscoveryResult): number {
    const criticalIssues = issues.filter(i => i.severity === 'high').length;
    if (criticalIssues > 0) return 0.3;

    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    if (mediumIssues > 2) return 0.6;

    const totalIssues = issues.length;
    if (totalIssues === 0) return 0.95;
    if (totalIssues <= 2) return 0.8;
    
    return 0.7;
  }

  /**
   * Initialize common requirements
   */
  private initializeCommonRequirements(): void {
    this.commonRequirements.add('photo');
    this.commonRequirements.add('signature');
    this.commonRequirements.add('educational-certificate');
    this.commonRequirements.add('identity-proof');
  }

  /**
   * Initialize category-specific validation rules
   */
  private initializeCategoryRules(): void {
    this.categoryRules.set('government-banking', [
      {
        requirement: 'left-thumb-impression',
        required: true,
        severity: 'high' as const,
        suggestion: 'Banking exams typically require left thumb impression'
      },
      {
        requirement: 'handwritten-declaration',
        required: true,
        severity: 'high' as const,
        suggestion: 'Banking exams typically require handwritten declaration'
      }
    ]);

    this.categoryRules.set('government-general', [
      {
        requirement: 'category-certificate',
        required: false,
        severity: 'medium' as const,
        suggestion: 'Government exams often require category certificate for reserved candidates'
      }
    ]);
  }

  /**
   * Initialize suspicious patterns
   */
  private initializeSuspiciousPatterns(): void {
    this.suspiciousPatterns = [
      /social.*media|facebook|twitter|instagram/i,
      /gaming|game|entertainment/i,
      /cryptocurrency|bitcoin|blockchain/i,
      /very.*large|extremely.*big/i
    ];
  }
}

interface ValidationRule {
  requirement: string;
  required: boolean;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}