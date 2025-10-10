/**
 * Confidence Scorer
 * Calculates confidence scores for different discovery methods
 */

interface SourceInfo {
  url: string;
  title: string;
  type: 'official' | 'news' | 'forum' | 'guide';
  reliability: number;
  lastAccessed: string;
  contentHash: string;
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

export class ConfidenceScorer {
  private sourceTypeWeights = {
    'official': 1.0,
    'news': 0.7,
    'guide': 0.6,
    'forum': 0.4
  };

  private essentialRequirements = new Set([
    'photo', 'signature', 'educational-certificate'
  ]);

  /**
   * Calculate confidence for search engine results
   */
  calculateSearchConfidence(sources: SourceInfo[], requirements: ExamRequirement[]): number {
    let confidence = 0.2; // Base confidence for search

    // Source quality scoring
    const sourceScore = this.calculateSourceQuality(sources);
    confidence += sourceScore * 0.4;

    // Requirements completeness
    const completenessScore = this.calculateCompletenessScore(requirements);
    confidence += completenessScore * 0.3;

    // Official source bonus
    const officialSources = sources.filter(s => s.type === 'official').length;
    if (officialSources > 0) {
      confidence += Math.min(officialSources * 0.1, 0.3);
    }

    return Math.min(confidence, 0.9); // Search max 90%
  }

  /**
   * Calculate confidence for web scraping results
   */
  calculateScrapingConfidence(scrapingResults: any[]): number {
    let confidence = 0.3; // Base confidence for scraping

    if (scrapingResults.length === 0) return 0;

    // Average confidence from individual scraping results
    const avgScrapeConfidence = scrapingResults.reduce((sum, result) => 
      sum + (result.metadata?.confidence || 0.5), 0
    ) / scrapingResults.length;

    confidence += avgScrapeConfidence * 0.4;

    // Multiple source consistency bonus
    if (scrapingResults.length > 1) {
      const consistencyBonus = this.calculateConsistencyBonus(scrapingResults);
      confidence += consistencyBonus * 0.2;
    }

    // Official website bonus
    const officialScrapes = scrapingResults.filter(result => 
      result.source?.type === 'official'
    ).length;

    if (officialScrapes > 0) {
      confidence += Math.min(officialScrapes * 0.15, 0.3);
    }

    return Math.min(confidence, 0.95); // Scraping max 95%
  }

  /**
   * Calculate confidence for knowledge base matches
   */
  calculateKnowledgeConfidence(matchType: 'exact' | 'pattern' | 'fuzzy', exam: any): number {
    const baseConfidence = {
      'exact': 0.95,
      'pattern': 0.8,
      'fuzzy': 0.6
    };

    let confidence = baseConfidence[matchType];

    // Boost confidence based on exam metadata quality
    if (exam.sourceMetadata?.reliability) {
      confidence *= exam.sourceMetadata.reliability;
    }

    // Boost for recent updates
    if (exam.sourceMetadata?.lastUpdated) {
      const lastUpdate = new Date(exam.sourceMetadata.lastUpdated);
      const monthsOld = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsOld < 6) {
        confidence += 0.05; // Recent update bonus
      } else if (monthsOld > 24) {
        confidence -= 0.1; // Old data penalty
      }
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate confidence for ML inference
   */
  calculateMLConfidence(
    predictedRequirements: ExamRequirement[],
    category: string,
    similarExams: string[],
    sources: SourceInfo[]
  ): number {
    let confidence = 0.3; // Base ML confidence

    // Category-specific confidence
    const categoryConfidence = this.getCategoryConfidence(category);
    confidence += categoryConfidence * 0.2;

    // Similar exams confidence
    if (similarExams.length > 0) {
      confidence += Math.min(similarExams.length * 0.05, 0.2);
    }

    // Requirements quality
    const essentialCount = predictedRequirements.filter(req => 
      this.essentialRequirements.has(req.id)
    ).length;

    confidence += (essentialCount / this.essentialRequirements.size) * 0.2;

    // Source support
    if (sources.length > 0) {
      const sourceQuality = this.calculateSourceQuality(sources);
      confidence += sourceQuality * 0.1;
    }

    return Math.min(confidence, 0.8); // ML max 80%
  }

  /**
   * Calculate overall confidence from multiple methods
   */
  calculateOverallConfidence(
    methodResults: Array<{
      method: string;
      confidence: number;
      weight: number;
      requirements: ExamRequirement[];
    }>
  ): number {
    if (methodResults.length === 0) return 0;

    // Weighted average of method confidences
    const totalWeight = methodResults.reduce((sum, result) => sum + result.weight, 0);
    const weightedConfidence = methodResults.reduce((sum, result) => 
      sum + (result.confidence * result.weight), 0
    ) / totalWeight;

    // Consensus bonus - if multiple methods agree on requirements
    const consensusBonus = this.calculateConsensusBonus(methodResults);

    return Math.min(weightedConfidence + consensusBonus, 1.0);
  }

  /**
   * Calculate source quality score
   */
  private calculateSourceQuality(sources: SourceInfo[]): number {
    if (sources.length === 0) return 0;

    const totalScore = sources.reduce((sum, source) => {
      const typeWeight = this.sourceTypeWeights[source.type] || 0.3;
      return sum + (source.reliability * typeWeight);
    }, 0);

    return Math.min(totalScore / sources.length, 1.0);
  }

  /**
   * Calculate requirements completeness score
   */
  private calculateCompletenessScore(requirements: ExamRequirement[]): number {
    if (requirements.length === 0) return 0;

    // Check for essential requirements
    const essentialPresent = requirements.filter(req => 
      this.essentialRequirements.has(req.id)
    ).length;

    const essentialScore = essentialPresent / this.essentialRequirements.size;

    // Bonus for comprehensive requirements
    const comprehensivenessBonus = Math.min(requirements.length / 10, 0.3);

    return Math.min(essentialScore + comprehensivenessBonus, 1.0);
  }

  /**
   * Calculate consistency bonus for multiple results
   */
  private calculateConsistencyBonus(results: any[]): number {
    if (results.length < 2) return 0;

    // Simple consistency check - count overlapping requirements
    const allRequirements = results.flatMap(result => 
      result.requirements?.map((r: any) => r.id) || []
    );

    const uniqueRequirements = new Set(allRequirements);
    const overlap = allRequirements.length - uniqueRequirements.size;

    return Math.min(overlap / allRequirements.length, 0.3);
  }

  /**
   * Get category-specific confidence multiplier
   */
  private getCategoryConfidence(category: string): number {
    const categoryConfidence: Record<string, number> = {
      'government-banking': 0.9,
      'government-general': 0.8,
      'engineering': 0.7,
      'medical': 0.7,
      'management': 0.6,
      'language': 0.8,
      'general': 0.5
    };

    return categoryConfidence[category] || 0.5;
  }

  /**
   * Calculate consensus bonus when multiple methods agree
   */
  private calculateConsensusBonus(methodResults: any[]): number {
    if (methodResults.length < 2) return 0;

    // Find common requirements across methods
    const requirementSets = methodResults.map(result => 
      new Set(result.requirements.map((r: ExamRequirement) => r.id))
    );

    if (requirementSets.length === 0) return 0;

    // Calculate intersection of all sets
    const intersection = requirementSets.reduce((acc, set) => 
      new Set([...acc].filter(x => set.has(x)))
    );

    // Calculate union of all sets
    const union = requirementSets.reduce((acc, set) => 
      new Set([...acc, ...set])
    );

    const consensusRatio = intersection.size / union.size;
    return Math.min(consensusRatio * 0.2, 0.2); // Max 20% bonus
  }

  /**
   * Calculate risk score (inverse of confidence)
   */
  calculateRiskScore(confidence: number, sources: SourceInfo[], requirements: ExamRequirement[]): number {
    let riskScore = 1 - confidence;

    // Additional risk factors
    if (sources.filter(s => s.type === 'official').length === 0) {
      riskScore += 0.2; // No official sources
    }

    if (requirements.length < 3) {
      riskScore += 0.1; // Too few requirements
    }

    const essentialMissing = Array.from(this.essentialRequirements).filter(essential => 
      !requirements.find(r => r.id === essential)
    ).length;

    riskScore += essentialMissing * 0.1;

    return Math.min(riskScore, 1.0);
  }

  /**
   * Generate confidence explanation
   */
  generateConfidenceExplanation(
    confidence: number,
    factors: {
      sources: SourceInfo[];
      requirements: ExamRequirement[];
      method: string;
      category?: string;
    }
  ): string {
    const explanations: string[] = [];

    if (confidence > 0.8) {
      explanations.push('High confidence based on strong evidence');
    } else if (confidence > 0.6) {
      explanations.push('Moderate confidence with some verification needed');
    } else {
      explanations.push('Low confidence - requires manual verification');
    }

    const officialSources = factors.sources.filter(s => s.type === 'official').length;
    if (officialSources > 0) {
      explanations.push(`${officialSources} official source(s) found`);
    } else {
      explanations.push('No official sources - relying on secondary sources');
    }

    const essentialCount = factors.requirements.filter(req => 
      this.essentialRequirements.has(req.id)
    ).length;

    if (essentialCount === this.essentialRequirements.size) {
      explanations.push('All essential requirements present');
    } else {
      explanations.push(`${essentialCount}/${this.essentialRequirements.size} essential requirements found`);
    }

    explanations.push(`Discovery method: ${factors.method}`);

    return explanations.join('. ');
  }
}