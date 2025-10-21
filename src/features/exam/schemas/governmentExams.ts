import { ExamSchema } from '@/features/exam/examSchema';

/**
 * Government Exams Schemas - Lazy Loaded Module
 * Only loaded when government exam category is accessed
 */

export const governmentExams: Record<string, ExamSchema> = {
  'upsc-cse': {
    examId: 'upsc-cse',
    examName: 'UPSC Civil Services Examination',
    version: '2024.1.0',
    lastUpdated: new Date('2024-01-15'),
    requirements: [
      {
        id: 'photo',
        type: 'Photo',
        displayName: 'Recent Photograph',
        description: 'Recent passport size photograph with white background',
        format: 'JPEG',
        maxSizeKB: 100,
        dimensions: '200x200',
        aliases: ['passport photo', 'photograph', 'photo'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Recent photograph taken within last 6 months, white background',
            context: 'For identification during all stages of examination',
            confidence: 0.95,
            source: 'official_notification',
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
          }
        ],
        examples: ['Professional passport photo with white background'],
        commonMistakes: ['Colored background', 'Selfies', 'Old photographs'],
        helpText: 'Upload a professional passport-style photograph taken within the last 6 months'
      },
      {
        id: 'signature',
        type: 'Signature',
        displayName: 'Digital Signature',
        description: 'Scanned handwritten signature',
        format: 'JPEG',
        maxSizeKB: 50,
        dimensions: '140x60',
        aliases: ['sign', 'signature'],
        category: 'signature',
        mandatory: true,
        subjective: [
          {
            field: 'signature',
            requirement: 'Clear handwritten signature in black ink',
            context: 'Must match signature on all submitted documents',
            confidence: 0.9,
            source: 'official_notification',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Signature file size must not exceed 50KB',
            field: 'signature',
            canOverride: false
          }
        ],
        examples: ['Clear handwritten signature on white paper'],
        commonMistakes: ['Printed signature', 'Unclear scan', 'Signature in pencil'],
        helpText: 'Scan your handwritten signature clearly in black ink'
      },
      {
        id: 'educational-qualification',
        type: 'Educational Certificate',
        displayName: 'Educational Qualification Certificate',
        description: 'Bachelor\'s degree certificate or equivalent qualification',
        format: 'PDF',
        maxSizeKB: 2000,
        dimensions: 'A4',
        aliases: ['degree certificate', 'graduation certificate', 'bachelor degree'],
        category: 'educational',
        mandatory: true,
        subjective: [
          {
            field: 'educational-qualification',
            requirement: 'Bachelor\'s degree from recognized university or equivalent',
            context: 'Minimum educational qualification for UPSC CSE',
            confidence: 0.95,
            source: 'official_notification',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'degree_verification',
            message: 'Must be a recognized bachelor\'s degree or equivalent',
            field: 'educational-qualification',
            canOverride: false
          }
        ],
        examples: ['Bachelor\'s degree certificate from recognized university'],
        commonMistakes: ['Diploma certificates', 'Mark sheets instead of degree'],
        helpText: 'Upload your bachelor\'s degree certificate or equivalent qualification'
      },
      {
        id: 'age-proof',
        type: 'Age Proof',
        displayName: 'Age/Date of Birth Certificate',
        description: 'Valid age proof document (Birth Certificate/Class 10 Certificate)',
        format: 'PDF',
        maxSizeKB: 2000,
        dimensions: 'A4',
        aliases: ['birth certificate', 'class 10 certificate', 'age certificate'],
        category: 'identity',
        mandatory: true,
        subjective: [
          {
            field: 'age-proof',
            requirement: 'Valid government issued age proof document',
            context: 'To verify age eligibility (21-32 years for General category)',
            confidence: 0.95,
            source: 'official_notification',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'age_eligibility',
            message: 'Age must be between 21-32 years (as per category)',
            field: 'age-proof',
            canOverride: false
          }
        ],
        examples: ['Birth certificate', 'Class 10 mark sheet with DOB'],
        commonMistakes: ['Affidavits', 'Non-government documents'],
        helpText: 'Upload birth certificate or Class 10 certificate showing date of birth'
      },
      {
        id: 'caste-certificate',
        type: 'Caste Certificate',
        displayName: 'Caste/Category Certificate',
        description: 'Valid caste certificate (if claiming reservation)',
        format: 'PDF',
        maxSizeKB: 2000,
        dimensions: 'A4',
        aliases: ['category certificate', 'SC certificate', 'ST certificate', 'OBC certificate'],
        category: 'certificate',
        mandatory: false,
        subjective: [
          {
            field: 'caste-certificate',
            requirement: 'Valid caste certificate issued by competent authority',
            context: 'Required only if claiming reservation benefits',
            confidence: 0.90,
            source: 'official_notification',
            priority: 'medium'
          }
        ],
        validationRules: [
          {
            type: 'soft',
            rule: 'caste_validity',
            message: 'Caste certificate must be issued by competent authority',
            field: 'caste-certificate',
            canOverride: true
          }
        ],
        examples: ['SC/ST/OBC certificate from District Magistrate'],
        commonMistakes: ['Expired certificates', 'Invalid issuing authority'],
        helpText: 'Upload valid caste certificate if claiming reservation (SC/ST/OBC/EWS)'
      },
      {
        id: 'ews-certificate',
        type: 'Income Certificate',
        displayName: 'EWS Certificate',
        description: 'Economically Weaker Section certificate (if applicable)',
        format: 'PDF',
        maxSizeKB: 2000,
        dimensions: 'A4',
        aliases: ['income certificate', 'economically weaker section', 'EWS'],
        category: 'certificate',
        mandatory: false,
        subjective: [
          {
            field: 'ews-certificate',
            requirement: 'Valid EWS certificate for income limit verification',
            context: 'Required only if claiming EWS reservation',
            confidence: 0.85,
            source: 'official_notification',
            priority: 'medium'
          }
        ],
        validationRules: [
          {
            type: 'soft',
            rule: 'income_limit',
            message: 'Family income must be below 8 LPA for EWS',
            field: 'ews-certificate',
            canOverride: true
          }
        ],
        examples: ['EWS certificate showing family income below 8 LPA'],
        commonMistakes: ['Expired certificates', 'Income above limit'],
        helpText: 'Upload EWS certificate if family income is below 8 LPA (General category only)'
      },
      {
        id: 'pwd-certificate',
        type: 'Disability Certificate',
        displayName: 'Person with Disability Certificate',
        description: 'Disability certificate (if applicable)',
        format: 'PDF',
        maxSizeKB: 2000,
        dimensions: 'A4',
        aliases: ['disability certificate', 'handicap certificate', 'PWD certificate'],
        category: 'certificate',
        mandatory: false,
        subjective: [
          {
            field: 'pwd-certificate',
            requirement: 'Valid disability certificate with minimum 40% disability',
            context: 'Required only if claiming PWD reservation',
            confidence: 0.90,
            source: 'official_notification',
            priority: 'medium'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'disability_percentage',
            message: 'Minimum 40% disability required for reservation',
            field: 'pwd-certificate',
            canOverride: false
          }
        ],
        examples: ['Disability certificate showing 40% or more disability'],
        commonMistakes: ['Less than 40% disability', 'Expired certificates'],
        helpText: 'Upload disability certificate if you have 40% or more disability'
      },
      {
        id: 'domicile-certificate',
        type: 'Domicile Certificate',
        displayName: 'Domicile/Residence Certificate',
        description: 'Valid domicile certificate (if required)',
        format: 'PDF',
        maxSizeKB: 2000,
        dimensions: 'A4',
        aliases: ['residence certificate', 'local certificate'],
        category: 'certificate',
        mandatory: false,
        subjective: [
          {
            field: 'domicile-certificate',
            requirement: 'Valid domicile certificate from state government',
            context: 'May be required for certain posts or state cadre preference',
            confidence: 0.75,
            source: 'guidelines',
            priority: 'low'
          }
        ],
        validationRules: [
          {
            type: 'soft',
            rule: 'domicile_validity',
            message: 'Domicile certificate must be from recognized authority',
            field: 'domicile-certificate',
            canOverride: true
          }
        ],
        examples: ['Domicile certificate from state government'],
        commonMistakes: ['Invalid issuing authority', 'Expired documents'],
        helpText: 'Upload domicile certificate if required for your preferred state cadre'
      },
      {
        id: 'experience-certificate',
        type: 'Experience Certificate',
        displayName: 'Work Experience Certificate',
        description: 'Work experience certificates (if any)',
        format: 'PDF',
        maxSizeKB: 3000,
        dimensions: 'A4',
        aliases: ['employment certificate', 'service certificate', 'work certificate'],
        category: 'other',
        mandatory: false,
        subjective: [
          {
            field: 'experience-certificate',
            requirement: 'Valid work experience certificates from employers',
            context: 'May be beneficial for interview and service preference',
            confidence: 0.70,
            source: 'guidelines',
            priority: 'low'
          }
        ],
        validationRules: [
          {
            type: 'soft',
            rule: 'experience_verification',
            message: 'Experience certificates should be from recognized employers',
            field: 'experience-certificate',
            canOverride: true
          }
        ],
        examples: ['Experience certificate from previous employer'],
        commonMistakes: ['Fake certificates', 'Incomplete information'],
        helpText: 'Upload work experience certificates if you have relevant work experience'
      }
    ],
    generalGuidelines: [
      'All documents must be scanned at 300 DPI minimum',
      'Ensure documents are clear and legible',
      'Submit original documents during verification'
    ],
    scrapingMetadata: {
      sources: ['official_notification', 'upsc_website'],
      confidence: 0.95,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'UPSC-CSE',
      baseUrl: 'https://upsc.gov.in',
      formUrls: ['https://upsconline.nic.in/mainmenu2.php'],
      faqUrls: ['https://upsc.gov.in/faqs'],
      guidelineUrls: ['https://upsc.gov.in/guidelines'],
      updateFrequency: 'yearly',
      priority: 1
    },
    stats: {
      totalDocuments: 9,
      mandatoryDocuments: 4,
      avgConfidenceScore: 0.88,
      subjectiveRequirements: 9
    }
  },

  'ssc-cgl': {
    examId: 'ssc-cgl',
    examName: 'SSC Combined Graduate Level',
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
        aliases: ['passport photo', 'photograph', 'photo'],
        category: 'photo',
        mandatory: true,
        subjective: [
          {
            field: 'photo',
            requirement: 'Recent color photograph with light colored background',
            context: 'For identification during examination',
            confidence: 0.9,
            source: 'official_notification',
            priority: 'high'
          }
        ],
        validationRules: [
          {
            type: 'strict',
            rule: 'file_size_limit',
            message: 'Photo file size must be between 4KB to 100KB',
            field: 'photo',
            canOverride: false
          }
        ],
        examples: ['Color passport photo with light background'],
        commonMistakes: ['Black and white photos', 'Dark background'],
        helpText: 'Upload a recent color photograph with light colored background'
      }
    ],
    generalGuidelines: [
      'Documents should be in prescribed format only',
      'File size should be within specified limits',
      'Only JPEG format allowed for images'
    ],
    scrapingMetadata: {
      sources: ['official_notification', 'ssc_website'],
      confidence: 0.9,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'SSC-CGL',
      baseUrl: 'https://ssc.nic.in',
      formUrls: ['https://ssc.nic.in/apply'],
      faqUrls: ['https://ssc.nic.in/faqs'],
      guidelineUrls: ['https://ssc.nic.in/guidelines'],
      updateFrequency: 'yearly',
      priority: 2
    },
    stats: {
      totalDocuments: 1,
      mandatoryDocuments: 1,
      avgConfidenceScore: 0.9,
      subjectiveRequirements: 1
    }
  },

  // Adding more government exams...
  'ibps-po': {
    examId: 'ibps-po',
    examName: 'IBPS Probationary Officer',
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
            requirement: 'Recent photograph with light background',
            context: 'For bank identification purposes',
            confidence: 0.9,
            source: 'official_notification',
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
        examples: ['Professional passport photo for banking sector'],
        commonMistakes: ['Casual photos', 'Inappropriate attire'],
        helpText: 'Upload a professional photograph suitable for banking sector'
      }
    ],
    generalGuidelines: [
      'Maintain professional appearance in photograph',
      'Ensure clear visibility of face',
      'Follow banking sector dress code'
    ],
    scrapingMetadata: {
      sources: ['ibps_website', 'official_notification'],
      confidence: 0.88,
      lastScrapeAttempt: new Date('2024-01-15'),
      scrapeSuccess: true,
      errorCount: 0
    },
    configuration: {
      examType: 'IBPS-PO',
      baseUrl: 'https://ibps.in',
      formUrls: ['https://ibps.in/application'],
      faqUrls: ['https://ibps.in/faqs'],
      guidelineUrls: ['https://ibps.in/guidelines'],
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