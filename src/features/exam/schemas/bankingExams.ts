import { ExamSchema } from '@/features/exam/examSchema';

/**
 * Banking Exams Schemas - Lazy Loaded Module
 * Banking sector competitive examinations
 */

export const bankingExams: Record<string, ExamSchema> = {
  'sbi-po': {
    examId: 'sbi-po',
    examName: 'SBI Probationary Officer',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Recent Photograph',
        description: 'Recent passport size color photograph',
        format: 'JPEG',
        maxSizeKB: 200,
        dimensions: '200x230',
        aliases: ['passport photo', 'photograph'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Recent professional photograph in banking attire',
            context: 'For State Bank of India recruitment',
            confidence: 0.9,
            source: 'guidelines',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Photo file size must be between 20KB to 200KB',
            field: 'photo',
            canOverride: false
          }
        ],
        examples: ['Professional banking sector photograph'],
        commonMistakes: ['Casual attire', 'Inappropriate background'],
        helpText: 'Upload a professional photograph suitable for banking sector'
      },
      {
        id: 'signature',
        type: 'Signature',
        displayName: 'Digital Signature',
        description: 'Scanned handwritten signature',
        format: 'JPEG',
        maxSizeKB: 50,
        dimensions: '140x60',
        aliases: ['signature', 'sign'],
        category: 'signature',
        mandatory: true,
        subjective: [
          {
            field: 'signature',
            requirement: 'Clear handwritten signature in black ink',
            context: 'Must match signature on all banking documents',
            confidence: 0.85,
            source: 'guidelines',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Signature file size must be between 10KB to 50KB',
            field: 'signature',
            canOverride: false
          }
        ],
        examples: ['Clear handwritten signature for banking'],
        commonMistakes: ['Printed signatures', 'Unclear scan'],
        helpText: 'Scan your handwritten signature clearly for banking verification'
      }
    ],
    generalGuidelines: [
      'Maintain professional banking appearance',
      'Ensure documents meet SBI standards',
      'Follow banking sector requirements'
    ],
    scrapingMetadata: {
      sources: ['form', 'guidelines'],
      confidence: 0.9,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'SBI-PO',
      baseUrl: 'https://sbi.co.in',
      formUrls: ['https://sbi.co.in/careers'],
      faqUrls: ['https://sbi.co.in/careers/faqs'],
      guidelineUrls: ['https://sbi.co.in/careers/guidelines'],
      updateFrequency: 'monthly',
      priority: 1
    },
    stats: {
      totalDocuments: 2,
      mandatoryDocuments: 2,
      avgConfidenceScore: 0.87,
      subjectiveRequirements: 2
    }
  },

  'ibps-clerk': {
    examId: 'ibps-clerk',
    examName: 'IBPS Clerk',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Recent Photograph',
        description: 'Recent passport size photograph',
        format: 'JPEG',
        maxSizeKB: 200,
        dimensions: '200x230',
        aliases: ['passport photo', 'photograph'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Recent photograph with professional appearance',
            context: 'For IBPS clerical position',
            confidence: 0.88,
            source: 'guidelines',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Photo file size must be between 20KB to 200KB',
            field: 'photo',
            canOverride: false
          }
        ],
        examples: ['Professional clerical position photograph'],
        commonMistakes: ['Casual clothing', 'Poor image quality'],
        helpText: 'Upload a professional photograph for clerical position'
      }
    ],
    generalGuidelines: [
      'Maintain professional clerical appearance',
      'Follow IBPS photo guidelines',
      'Ensure clear visibility'
    ],
    scrapingMetadata: {
      sources: ['form', 'guidelines'],
      confidence: 0.88,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'IBPS-CLERK',
      baseUrl: 'https://ibps.in',
      formUrls: ['https://ibps.in/clerk-application'],
      faqUrls: ['https://ibps.in/clerk-faqs'],
      guidelineUrls: ['https://ibps.in/clerk-guidelines'],
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

  'rbi-grade-b': {
    examId: 'rbi-grade-b',
    examName: 'RBI Grade B Officer',
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
            requirement: 'Recent professional photograph in formal attire',
            context: 'For Reserve Bank of India officer position',
            confidence: 0.92,
            source: 'guidelines',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Photo file size must be between 20KB to 100KB',
            field: 'photo',
            canOverride: false
          }
        ],
        examples: ['Formal RBI officer photograph'],
        commonMistakes: ['Casual attire', 'Inappropriate background'],
        helpText: 'Upload a formal photograph suitable for RBI officer position'
      }
    ],
    generalGuidelines: [
      'Maintain highest professional standards',
      'Follow RBI officer requirements',
      'Ensure formal business appearance'
    ],
    scrapingMetadata: {
      sources: ['form', 'guidelines'],
      confidence: 0.92,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'RBI-GRADE-B',
      baseUrl: 'https://rbi.org.in',
      formUrls: ['https://rbi.org.in/careers'],
      faqUrls: ['https://rbi.org.in/careers/faqs'],
      guidelineUrls: ['https://rbi.org.in/careers/guidelines'],
      updateFrequency: 'monthly',
      priority: 1
    },
    stats: {
      totalDocuments: 1,
      mandatoryDocuments: 1,
      avgConfidenceScore: 0.92,
      subjectiveRequirements: 1
    }
  }
};