import { ExamSchema } from '@/features/exam/examSchema';

/**
 * Professional Exams Schemas - Lazy Loaded Module
 * Professional certifications and chartered exams
 */

export const professionalExams: Record<string, ExamSchema> = {
  'ca-foundation': {
    examId: 'ca-foundation',
    examName: 'CA Foundation',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Recent Photograph',
        description: 'Recent passport size photograph',
        format: 'JPEG',
        maxSizeKB: 100,
        dimensions: '200x230',
        aliases: ['passport photo', 'photograph'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Recent photograph with formal business attire',
            context: 'For chartered accountancy professional examination',
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
        examples: ['Professional business attire photograph'],
        commonMistakes: ['Casual clothing', 'Inappropriate background'],
        helpText: 'Upload a professional photograph in business attire'
      }
    ],
    generalGuidelines: [
      'Maintain professional business appearance',
      'Follow ICAI photograph guidelines',
      'Ensure clear facial visibility'
    ],
    scrapingMetadata: {
      sources: ['icai_website', 'official_notification'],
      confidence: 0.9,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'CA-FOUNDATION',
      baseUrl: 'https://icai.org',
      formUrls: ['https://icai.org/post/ca-foundation-application'],
      faqUrls: ['https://icai.org/post/ca-foundation-faqs'],
      guidelineUrls: ['https://icai.org/post/ca-foundation-guidelines'],
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

  'cfa-level1': {
    examId: 'cfa-level1',
    examName: 'CFA Level 1',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Professional Photograph',
        description: 'Professional passport-style photograph',
        format: 'JPEG',
        maxSizeKB: 100,
        dimensions: '200x200',
        aliases: ['passport photo', 'professional photo'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Professional photograph in business attire',
            context: 'For CFA Institute examination',
            confidence: 0.92,
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
        examples: ['Professional finance sector photograph'],
        commonMistakes: ['Casual attire', 'Inappropriate background'],
        helpText: 'Upload a professional photograph suitable for finance industry'
      }
    ],
    generalGuidelines: [
      'Maintain professional finance industry appearance',
      'Follow CFA Institute standards',
      'Ensure international professional standards'
    ],
    scrapingMetadata: {
      sources: ['cfainstitute_website', 'official_notification'],
      confidence: 0.92,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'CFA-LEVEL1',
      baseUrl: 'https://cfainstitute.org',
      formUrls: ['https://cfainstitute.org/programs/cfa/register'],
      faqUrls: ['https://cfainstitute.org/programs/cfa/faqs'],
      guidelineUrls: ['https://cfainstitute.org/programs/cfa/guidelines'],
      updateFrequency: 'monthly',
      priority: 1
    },
    stats: {
      totalDocuments: 1,
      mandatoryDocuments: 1,
      avgConfidenceScore: 0.92,
      subjectiveRequirements: 1
    }
  },

  'frm-part1': {
    examId: 'frm-part1',
    examName: 'FRM Part 1',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Professional Photograph',
        description: 'Professional passport-style photograph',
        format: 'JPEG',
        maxSizeKB: 100,
        dimensions: '200x200',
        aliases: ['passport photo', 'professional photo'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Professional photograph in business attire',
            context: 'For GARP FRM examination',
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
        examples: ['Professional risk management sector photograph'],
        commonMistakes: ['Casual attire', 'Poor lighting'],
        helpText: 'Upload a professional photograph for risk management certification'
      }
    ],
    generalGuidelines: [
      'Maintain professional risk management appearance',
      'Follow GARP examination standards',
      'Ensure global professional standards'
    ],
    scrapingMetadata: {
      sources: ['garp_website', 'official_notification'],
      confidence: 0.9,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'FRM-PART1',
      baseUrl: 'https://garp.org',
      formUrls: ['https://garp.org/frm/register'],
      faqUrls: ['https://garp.org/frm/faqs'],
      guidelineUrls: ['https://garp.org/frm/guidelines'],
      updateFrequency: 'monthly',
      priority: 2
    },
    stats: {
      totalDocuments: 1,
      mandatoryDocuments: 1,
      avgConfidenceScore: 0.9,
      subjectiveRequirements: 1
    }
  }
};