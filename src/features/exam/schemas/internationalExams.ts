import { ExamSchema } from '@/features/exam/examSchema';

/**
 * International Exams Schemas - Lazy Loaded Module
 * Language proficiency and international standardized tests
 */

export const internationalExams: Record<string, ExamSchema> = {
  'ielts': {
    examId: 'ielts',
    examName: 'IELTS',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Passport Style Photo',
        description: 'Recent passport-style photograph',
        format: 'JPEG',
        maxSizeKB: 100,
        dimensions: '200x200',
        aliases: ['passport photo', 'photograph', 'photo'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Recent photograph taken within last 6 months',
            context: 'For identification purposes during test',
            confidence: 0.9,
            source: 'form',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Photo file size must not exceed 100KB',
            field: 'photo',
            canOverride: false
          },
          {
            type: 'soft',
            rule: 'photo_quality',
            message: 'Ensure photo is clear and well-lit',
            field: 'photo',
            canOverride: true
          }
        ],
        examples: ['Clear passport photo with white background'],
        commonMistakes: ['Selfies', 'Dark photos', 'Wrong size'],
        helpText: 'Upload a recent passport-style photo with white background'
      },
      {
        id: 'id',
        type: 'ID',
        displayName: 'Identity Document',
        description: 'Government-issued identity proof',
        format: 'PDF',
        maxSizeKB: 1024,
        category: 'identity',
        mandatory: true,
        aliases: ['identity', 'id proof', 'government id'],
        subjective: [
          {
            field: 'id',
            requirement: 'Valid government-issued ID',
            context: 'Must be current and not expired',
            confidence: 0.95,
            source: 'guidelines',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'ID file size must not exceed 1MB',
            field: 'id',
            canOverride: false
          }
        ],
        examples: ['Passport', 'Driver\'s License', 'National ID'],
        commonMistakes: ['Expired ID', 'Low quality scan'],
        helpText: 'Upload a clear scan of your valid government ID'
      }
    ],
    generalGuidelines: [
      'All documents must be clear and legible',
      'Follow the specified format requirements',
      'Ensure all documents are current and valid'
    ],
    scrapingMetadata: {
      sources: ['form', 'guidelines'],
      confidence: 0.9,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'IELTS',
      baseUrl: 'https://ielts.org',
      formUrls: ['https://ielts.org/book-a-test'],
      faqUrls: ['https://ielts.org/faqs'],
      guidelineUrls: ['https://ielts.org/guidelines'],
      updateFrequency: 'monthly',
      priority: 1
    },
    stats: {
      totalDocuments: 2,
      mandatoryDocuments: 2,
      avgConfidenceScore: 0.92,
      subjectiveRequirements: 2
    }
  },

  'toefl': {
    examId: 'toefl',
    examName: 'TOEFL iBT',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Recent Photograph',
        description: 'Recent passport-style color photograph',
        format: 'JPEG',
        maxSizeKB: 100,
        dimensions: '200x200',
        aliases: ['passport photo', 'photograph'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Recent color photograph with neutral background',
            context: 'For ETS test center identification',
            confidence: 0.9,
            source: 'ets_guidelines',
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
        examples: ['Professional passport photo for international test'],
        commonMistakes: ['Inappropriate clothing', 'Poor image quality'],
        helpText: 'Upload a professional photograph suitable for international testing'
      },
      {
        id: 'id_document',
        type: 'ID',
        displayName: 'Valid ID Document',
        description: 'Government-issued photo identification',
        format: 'PDF',
        maxSizeKB: 2048,
        category: 'identity',
        mandatory: true,
        aliases: ['passport', 'government id', 'identity'],
        subjective: [
          {
            field: 'id_document',
            requirement: 'Valid passport or government-issued photo ID',
            context: 'Must be valid on test date',
            confidence: 0.95,
            source: 'ets_guidelines',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'ID document file size must not exceed 2MB',
            field: 'id_document',
            canOverride: false
          }
        ],
        examples: ['Valid passport', 'National ID card with photo'],
        commonMistakes: ['Expired documents', 'Student ID cards'],
        helpText: 'Upload a valid government-issued photo identification'
      }
    ],
    generalGuidelines: [
      'ID must be valid on test date',
      'Photo must match ID document appearance',
      'All documents must be clearly legible'
    ],
    scrapingMetadata: {
      sources: ['ets_website', 'toefl_portal'],
      confidence: 0.9,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'TOEFL',
      baseUrl: 'https://ets.org/toefl',
      formUrls: ['https://ets.org/toefl/register'],
      faqUrls: ['https://ets.org/toefl/faqs'],
      guidelineUrls: ['https://ets.org/toefl/guidelines'],
      updateFrequency: 'quarterly',
      priority: 1
    },
    stats: {
      totalDocuments: 2,
      mandatoryDocuments: 2,
      avgConfidenceScore: 0.92,
      subjectiveRequirements: 2
    }
  },

  'gre': {
    examId: 'gre',
    examName: 'GRE General Test',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Recent Photograph',
        description: 'Recent passport-style photograph',
        format: 'JPEG',
        maxSizeKB: 100,
        dimensions: '200x200',
        aliases: ['passport photo', 'photograph'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Recent color photograph matching ID appearance',
            context: 'For graduate school test identification',
            confidence: 0.9,
            source: 'ets_guidelines',
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
        examples: ['Academic professional photograph'],
        commonMistakes: ['Casual appearance', 'Mismatched ID photo'],
        helpText: 'Upload a professional photograph matching your ID document'
      }
    ],
    generalGuidelines: [
      'Photo must match ID document appearance',
      'Maintain professional academic appearance',
      'Ensure high image quality'
    ],
    scrapingMetadata: {
      sources: ['ets_website', 'gre_portal'],
      confidence: 0.88,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'GRE',
      baseUrl: 'https://ets.org/gre',
      formUrls: ['https://ets.org/gre/register'],
      faqUrls: ['https://ets.org/gre/faqs'],
      guidelineUrls: ['https://ets.org/gre/guidelines'],
      updateFrequency: 'quarterly',
      priority: 2
    },
    stats: {
      totalDocuments: 1,
      mandatoryDocuments: 1,
      avgConfidenceScore: 0.88,
      subjectiveRequirements: 1
    }
  }
};