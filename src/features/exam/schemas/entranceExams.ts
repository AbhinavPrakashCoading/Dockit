import { ExamSchema } from '@/features/exam/examSchema';

/**
 * Entrance Exams Schemas - Lazy Loaded Module
 * Engineering, Medical, Management entrance exams
 */

export const entranceExams: Record<string, ExamSchema> = {
  'jee-main': {
    examId: 'jee-main',
    examName: 'JEE Main',
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
            requirement: 'Recent color photograph with white/light background',
            context: 'For NTA examination identification',
            confidence: 0.92,
            source: 'nta_guidelines',
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
        examples: ['Clear passport photo for engineering entrance'],
        commonMistakes: ['Blurred images', 'Wrong dimensions'],
        helpText: 'Upload a clear recent photograph with white background'
      },
      {
        id: 'signature',
        type: 'Signature',
        displayName: 'Digital Signature',
        description: 'Scanned signature in black ink',
        format: 'JPEG',
        maxSizeKB: 50,
        dimensions: '140x60',
        aliases: ['signature', 'sign'],
        category: 'signature',
        mandatory: true,
        subjective: [
          {
            field: 'signature',
            requirement: 'Clear signature in black ink on white paper',
            context: 'Must match signature during examination',
            confidence: 0.85,
            source: 'nta_guidelines',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Signature file size must be between 4KB to 50KB',
            field: 'signature',
            canOverride: false
          }
        ],
        examples: ['Handwritten signature in black ink'],
        commonMistakes: ['Printed signatures', 'Colored ink'],
        helpText: 'Scan your handwritten signature in black ink only'
      }
    ],
    generalGuidelines: [
      'All uploads must be in JPEG format only',
      'Maintain specified file size limits',
      'Ensure documents are clearly visible'
    ],
    scrapingMetadata: {
      sources: ['nta_website', 'jeemain_portal'],
      confidence: 0.88,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'JEE-MAIN',
      baseUrl: 'https://jeemain.nta.nic.in',
      formUrls: ['https://jeemain.nta.nic.in/application'],
      faqUrls: ['https://jeemain.nta.nic.in/faqs'],
      guidelineUrls: ['https://jeemain.nta.nic.in/guidelines'],
      updateFrequency: 'bi-yearly',
      priority: 1
    },
    stats: {
      totalDocuments: 2,
      mandatoryDocuments: 2,
      avgConfidenceScore: 0.88,
      subjectiveRequirements: 2
    }
  },

  'neet-ug': {
    examId: 'neet-ug',
    examName: 'NEET UG',
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
            requirement: 'Recent color photograph with white background, formal attire',
            context: 'For medical entrance examination identification',
            confidence: 0.9,
            source: 'nta_guidelines',
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
        examples: ['Professional photo in formal attire for medical entrance'],
        commonMistakes: ['Casual attire', 'Inappropriate background'],
        helpText: 'Upload a professional photograph in formal attire'
      }
    ],
    generalGuidelines: [
      'Maintain formal appearance in photograph',
      'Ensure high quality scan/image',
      'Follow medical entrance standards'
    ],
    scrapingMetadata: {
      sources: ['nta_website', 'neet_portal'],
      confidence: 0.9,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'NEET-UG',
      baseUrl: 'https://neet.nta.nic.in',
      formUrls: ['https://neet.nta.nic.in/application'],
      faqUrls: ['https://neet.nta.nic.in/faqs'],
      guidelineUrls: ['https://neet.nta.nic.in/guidelines'],
      updateFrequency: 'yearly',
      priority: 1
    },
    stats: {
      totalDocuments: 1,
      mandatoryDocuments: 1,
      avgConfidenceScore: 0.9,
      subjectiveRequirements: 1
    }
  },

  'cat': {
    examId: 'cat',
    examName: 'Common Admission Test',
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
            requirement: 'Recent color photograph with light background, business attire',
            context: 'For MBA entrance examination',
            confidence: 0.88,
            source: 'iim_guidelines',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Photo file size must be between 6KB to 100KB',
            field: 'photo',
            canOverride: false
          }
        ],
        examples: ['Professional business attire photograph'],
        commonMistakes: ['Casual clothing', 'Poor lighting'],
        helpText: 'Upload a professional photograph in business attire'
      }
    ],
    generalGuidelines: [
      'Maintain professional business appearance',
      'Ensure clear facial visibility',
      'Follow corporate standards'
    ],
    scrapingMetadata: {
      sources: ['iimcat_website', 'official_notification'],
      confidence: 0.88,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'CAT',
      baseUrl: 'https://iimcat.ac.in',
      formUrls: ['https://iimcat.ac.in/application'],
      faqUrls: ['https://iimcat.ac.in/faqs'],
      guidelineUrls: ['https://iimcat.ac.in/guidelines'],
      updateFrequency: 'yearly',
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