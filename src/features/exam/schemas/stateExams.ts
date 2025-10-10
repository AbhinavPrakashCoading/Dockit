import { ExamSchema } from '@/features/exam/examSchema';

/**
 * State Exams Schemas - Lazy Loaded Module
 * State Public Service Commission examinations
 */

export const stateExams: Record<string, ExamSchema> = {
  'mpsc': {
    examId: 'mpsc',
    examName: 'Maharashtra Public Service Commission',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Recent Photograph',
        description: 'Recent passport size color photograph',
        format: 'JPEG',
        maxSizeKB: 100,
        dimensions: '200x230',
        aliases: ['passport photo', 'photograph'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Recent photograph with light colored background',
            context: 'For Maharashtra state service examination',
            confidence: 0.9,
            source: 'guidelines',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Photo file size must be between 10KB to 100KB',
            field: 'photo',
            canOverride: false
          }
        ],
        examples: ['State government service photograph'],
        commonMistakes: ['Dark background', 'Casual attire'],
        helpText: 'Upload a professional photograph for state government service'
      }
    ],
    generalGuidelines: [
      'Follow Maharashtra government photo guidelines',
      'Maintain professional government service appearance',
      'Ensure clear facial visibility'
    ],
    scrapingMetadata: {
      sources: ['form', 'guidelines'],
      confidence: 0.9,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'MPSC',
      baseUrl: 'https://mpsc.gov.in',
      formUrls: ['https://mpsc.gov.in/application'],
      faqUrls: ['https://mpsc.gov.in/faqs'],
      guidelineUrls: ['https://mpsc.gov.in/guidelines'],
      updateFrequency: 'monthly',
      priority: 2
    },
    stats: {
      totalDocuments: 1,
      mandatoryDocuments: 1,
      avgConfidenceScore: 0.9,
      subjectiveRequirements: 1
    }
  },

  'tnpsc': {
    examId: 'tnpsc',
    examName: 'Tamil Nadu Public Service Commission',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Recent Photograph',
        description: 'Recent passport size color photograph',
        format: 'JPEG',
        maxSizeKB: 100,
        dimensions: '200x230',
        aliases: ['passport photo', 'photograph'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Recent photograph for Tamil Nadu government service',
            context: 'For TNPSC examination',
            confidence: 0.88,
            source: 'guidelines',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Photo file size must be between 10KB to 100KB',
            field: 'photo',
            canOverride: false
          }
        ],
        examples: ['Tamil Nadu government service photograph'],
        commonMistakes: ['Inappropriate attire', 'Poor quality'],
        helpText: 'Upload a professional photograph for TN government service'
      }
    ],
    generalGuidelines: [
      'Follow Tamil Nadu government guidelines',
      'Maintain professional appearance',
      'Ensure photograph clarity'
    ],
    scrapingMetadata: {
      sources: ['form', 'guidelines'],
      confidence: 0.88,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'TNPSC',
      baseUrl: 'https://tnpsc.gov.in',
      formUrls: ['https://tnpsc.gov.in/application'],
      faqUrls: ['https://tnpsc.gov.in/faqs'],
      guidelineUrls: ['https://tnpsc.gov.in/guidelines'],
      updateFrequency: 'monthly',
      priority: 2
    },
    stats: {
      totalDocuments: 1,
      mandatoryDocuments: 1,
      avgConfidenceScore: 0.88,
      subjectiveRequirements: 1
    }
  },

  'kpsc': {
    examId: 'kpsc',
    examName: 'Karnataka Public Service Commission',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Recent Photograph',
        description: 'Recent passport size color photograph',
        format: 'JPEG',
        maxSizeKB: 100,
        dimensions: '200x230',
        aliases: ['passport photo', 'photograph'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Recent photograph for Karnataka government service',
            context: 'For KPSC examination',
            confidence: 0.87,
            source: 'guidelines',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Photo file size must be between 10KB to 100KB',
            field: 'photo',
            canOverride: false
          }
        ],
        examples: ['Karnataka government service photograph'],
        commonMistakes: ['Blurred images', 'Wrong format'],
        helpText: 'Upload a clear photograph for Karnataka government service'
      }
    ],
    generalGuidelines: [
      'Follow Karnataka government photo standards',
      'Maintain professional government appearance',
      'Ensure high image quality'
    ],
    scrapingMetadata: {
      sources: ['form', 'guidelines'],
      confidence: 0.87,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'KPSC',
      baseUrl: 'https://kpsc.kar.nic.in',
      formUrls: ['https://kpsc.kar.nic.in/application'],
      faqUrls: ['https://kpsc.kar.nic.in/faqs'],
      guidelineUrls: ['https://kpsc.kar.nic.in/guidelines'],
      updateFrequency: 'monthly',
      priority: 2
    },
    stats: {
      totalDocuments: 1,
      mandatoryDocuments: 1,
      avgConfidenceScore: 0.87,
      subjectiveRequirements: 1
    }
  },

  'uppsc': {
    examId: 'uppsc',
    examName: 'Uttar Pradesh Public Service Commission',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Recent Photograph',
        description: 'Recent passport size color photograph',
        format: 'JPEG',
        maxSizeKB: 100,
        dimensions: '200x230',
        aliases: ['passport photo', 'photograph'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Recent photograph for UP government service',
            context: 'For UPPSC examination',
            confidence: 0.89,
            source: 'guidelines',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Photo file size must be between 10KB to 100KB',
            field: 'photo',
            canOverride: false
          }
        ],
        examples: ['UP government service photograph'],
        commonMistakes: ['Low resolution', 'Improper lighting'],
        helpText: 'Upload a high-quality photograph for UP government service'
      }
    ],
    generalGuidelines: [
      'Follow UP government photo requirements',
      'Maintain professional standards',
      'Ensure photograph meets specifications'
    ],
    scrapingMetadata: {
      sources: ['form', 'guidelines'],
      confidence: 0.89,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'UPPSC',
      baseUrl: 'https://uppsc.up.nic.in',
      formUrls: ['https://uppsc.up.nic.in/application'],
      faqUrls: ['https://uppsc.up.nic.in/faqs'],
      guidelineUrls: ['https://uppsc.up.nic.in/guidelines'],
      updateFrequency: 'monthly',
      priority: 2
    },
    stats: {
      totalDocuments: 1,
      mandatoryDocuments: 1,
      avgConfidenceScore: 0.89,
      subjectiveRequirements: 1
    }
  },

  'bpsc': {
    examId: 'bpsc',
    examName: 'Bihar Public Service Commission',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Recent Photograph',
        description: 'Recent passport size color photograph',
        format: 'JPEG',
        maxSizeKB: 100,
        dimensions: '200x230',
        aliases: ['passport photo', 'photograph'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Recent photograph for Bihar government service',
            context: 'For BPSC examination',
            confidence: 0.86,
            source: 'guidelines',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Photo file size must be between 10KB to 100KB',
            field: 'photo',
            canOverride: false
          }
        ],
        examples: ['Bihar government service photograph'],
        commonMistakes: ['Wrong dimensions', 'Poor contrast'],
        helpText: 'Upload a clear photograph meeting Bihar government standards'
      }
    ],
    generalGuidelines: [
      'Follow Bihar government specifications',
      'Maintain professional appearance',
      'Ensure proper image quality'
    ],
    scrapingMetadata: {
      sources: ['form', 'guidelines'],
      confidence: 0.86,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'BPSC',
      baseUrl: 'https://bpsc.bih.nic.in',
      formUrls: ['https://bpsc.bih.nic.in/application'],
      faqUrls: ['https://bpsc.bih.nic.in/faqs'],
      guidelineUrls: ['https://bpsc.bih.nic.in/guidelines'],
      updateFrequency: 'monthly',
      priority: 2
    },
    stats: {
      totalDocuments: 1,
      mandatoryDocuments: 1,
      avgConfidenceScore: 0.86,
      subjectiveRequirements: 1
    }
  }
};