/**
 * AI Document Verification Pipeline
 * 
 * Goal:
 * - Given OCR text extracted from a document, classify it into:
 *   1. Document Type (broad category, e.g., EDUCATIONAL, ID, FINANCIAL)
 *   2. Document Subtype (specific, e.g., CBSE_10_MARKSHEET, CBSE_12_CERTIFICATE, AADHAAR_CARD)
 * 
 * Approach:
 * - Step 1: Clean OCR text (remove noise, normalize, fuzzy match common errors)
 * - Step 2: Detect broad type based on anchor keywords
 * - Step 3: Detect subtype based on header keywords, subject codes, layout anchors
 * - Step 4: Return subtype with confidence score
 * - Step 5: If rule-based detection < 70% confidence → fallback to ML classifier
 */

export interface DocumentVerificationResult {
  type: string;
  subtype: string;
  confidence: number;
  method: 'rule-based' | 'ml-fallback';
  reasons: string[];
  rawText?: string;
  cleanedText?: string;
  detectedPatterns?: string[];
  alternativeTypes?: Array<{
    type: string;
    subtype: string;
    confidence: number;
  }>;
}

interface OCRCleaning {
  original: string;
  cleaned: string;
  corrections: Array<{
    original: string;
    corrected: string;
    confidence: number;
  }>;
}

interface DocumentTypePattern {
  type: string;
  keywords: string[];
  patterns: RegExp[];
  weight: number;
  exclusions?: string[];
}

interface DocumentSubtypePattern {
  subtype: string;
  name: string;
  parentType: string;
  keywords: string[];
  patterns: RegExp[];
  subjectCodes?: string[];
  headerKeywords?: string[];
  requiredElements?: string[];
  weight: number;
  confidence: {
    high: number;
    medium: number;
    low: number;
  };
}

export class AIDocumentVerificationPipeline {
  private readonly CONFIDENCE_THRESHOLD = 0.7;
  
  // Common OCR mistakes and their corrections
  private readonly OCR_CORRECTIONS = new Map([
    ['CERTIFICSTE', 'CERTIFICATE'],
    ['CERTIFCATE', 'CERTIFICATE'],
    ['CERTIFICAT', 'CERTIFICATE'],
    ['MARKSHEST', 'MARKSHEET'],
    ['MARKSHSET', 'MARKSHEET'],
    ['MARKSHEEET', 'MARKSHEET'],
    ['EXAMINAT10N', 'EXAMINATION'],
    ['EXAMINATI0N', 'EXAMINATION'],
    ['EXAMINATOIN', 'EXAMINATION'],
    ['CENTRAL B0ARD', 'CENTRAL BOARD'],
    ['CENTRAL B0RD', 'CENTRAL BOARD'],
    ['SECENDARY', 'SECONDARY'],
    ['SECUNDARY', 'SECONDARY'],
    ['SCONDARY', 'SECONDARY'],
    ['AUTHCRITY', 'AUTHORITY'],
    ['AUTHORTY', 'AUTHORITY'],
    ['AUTHORIT1', 'AUTHORITY'],
    ['IDENT1FICATION', 'IDENTIFICATION'],
    ['IDENTIF1CATION', 'IDENTIFICATION'],
    ['IDENTJFICATION', 'IDENTIFICATION'],
    ['GQVERNMENT', 'GOVERNMENT'],
    ['G0VERNMENT', 'GOVERNMENT'],
    ['GOVERNMFNT', 'GOVERNMENT'],
    ['SENIOR SCH00L', 'SENIOR SCHOOL'],
    ['SENI0R SCHOOL', 'SENIOR SCHOOL'],
    ['UNIQUE IDENT1FICATION', 'UNIQUE IDENTIFICATION'],
    ['PERMANENT ACCOUNT', 'PERMANENT ACCOUNT'],
    ['PERMAMENT ACCOUNT', 'PERMANENT ACCOUNT'],
    ['INCOME TAX', 'INCOME TAX'],
    ['1NCOME TAX', 'INCOME TAX'],
    ['ELIG1BILITY', 'ELIGIBILITY'],
    ['ELIGIB1LITY', 'ELIGIBILITY'],
    ['ENGINEERING', 'ENGINEERING'],
    ['ENG1NEERING', 'ENGINEERING'],
    ['ADMISSION', 'ADMISSION'],
    ['ADM1SSION', 'ADMISSION'],
    ['ADDM1SSION', 'ADMISSION']
  ]);

  // Document type patterns for broad classification
  private readonly DOCUMENT_TYPE_PATTERNS: DocumentTypePattern[] = [
    {
      type: 'EDUCATIONAL',
      keywords: [
        'education', 'school', 'college', 'university', 'examination', 'marksheet', 
        'certificate', 'diploma', 'degree', 'cbse', 'icse', 'state board',
        'secondary', 'higher secondary', 'graduation', 'post graduation',
        'marks', 'grade', 'result', 'transcript', 'academic'
      ],
      patterns: [
        /\b(?:cbse|icse|state\s+board|central\s+board)\b/i,
        /\bsecondary\s+school\s+(?:examination|certificate)\b/i,
        /\bsenior\s+school\s+certificate\b/i,
        /\bmarks?\s*(?:statement|sheet)\b/i,
        /\b(?:class|grade)\s*(?:x|10|xii|12)\b/i,
        /\b(?:bachelor|master|diploma)\s*(?:of|in)?\b/i
      ],
      weight: 1.0
    },
    {
      type: 'ID',
      keywords: [
        'identification', 'identity', 'aadhaar', 'aadhar', 'pan', 'passport',
        'driving license', 'voter id', 'election', 'authority', 'government',
        'unique identification', 'permanent account', 'income tax', 'uidai'
      ],
      patterns: [
        /\b(?:aadhaar|aadhar|uid)\b/i,
        /\bunique\s+identification\s+authority\b/i,
        /\bpermanent\s+account\s+number\b/i,
        /\bincome\s+tax\s+department\b/i,
        /\bpassport\s*(?:number|no)?\b/i,
        /\bdriving\s*licen[cs]e\b/i,
        /\bvoter\s*(?:id|identity)\b/i,
        /\belection\s+commission\b/i,
        /\bgovernment\s+of\s+india\b/i
      ],
      weight: 1.0
    },
    {
      type: 'FINANCIAL',
      keywords: [
        'bank', 'account', 'statement', 'balance', 'transaction', 'deposit',
        'withdrawal', 'credit', 'debit', 'loan', 'investment', 'insurance',
        'policy', 'premium', 'claim', 'ifsc', 'swift', 'micr', 'cheque'
      ],
      patterns: [
        /\bbank\s+(?:statement|account)\b/i,
        /\b(?:saving|current)\s+account\b/i,
        /\bifsc\s*(?:code|number)?\b/i,
        /\bmicr\s*(?:code|number)?\b/i,
        /\b(?:loan|credit|debit)\s*(?:card|account)?\b/i,
        /\binsurance\s+policy\b/i,
        /\btransaction\s+(?:history|statement)\b/i
      ],
      weight: 1.0
    },
    {
      type: 'EMPLOYMENT',
      keywords: [
        'employment', 'salary', 'payslip', 'pay slip', 'offer letter',
        'appointment', 'experience', 'relieving', 'resignation', 'employee',
        'employer', 'company', 'organization', 'hr', 'human resources'
      ],
      patterns: [
        /\b(?:salary|pay)\s*(?:slip|certificate)\b/i,
        /\boffer\s+letter\b/i,
        /\bappointment\s+(?:letter|order)\b/i,
        /\bexperience\s+(?:letter|certificate)\b/i,
        /\brelieving\s+letter\b/i,
        /\bemployment\s+(?:certificate|verification)\b/i
      ],
      weight: 1.0
    }
  ];

  // Document subtype patterns for specific classification
  private readonly DOCUMENT_SUBTYPE_PATTERNS: DocumentSubtypePattern[] = [
    // EDUCATIONAL SUBTYPES
    {
      subtype: 'CBSE_10_MARKSHEET',
      name: 'CBSE Class 10 Marksheet',
      parentType: 'EDUCATIONAL',
      keywords: ['cbse', 'central board', 'secondary education', 'class x', 'class 10'],
      patterns: [
        /\bcentral\s+board\s+of\s+secondary\s+education\b/i,
        /\bsecondary\s+school\s+examination\b/i,
        /\bclass\s*(?:x|10)\b/i,
        /\bmarks?\s*(?:statement|sheet)\s*cum\s*certificate\b/i
      ],
      subjectCodes: ['101', '041', '043', '044', '045', '049', '083', '087'],
      headerKeywords: ['secondary school examination', 'marks statement cum certificate'],
      requiredElements: ['central board', 'secondary', 'marks'],
      weight: 1.0,
      confidence: { high: 0.9, medium: 0.75, low: 0.6 }
    },
    {
      subtype: 'CBSE_12_MARKSHEET',
      name: 'CBSE Class 12 Marksheet', 
      parentType: 'EDUCATIONAL',
      keywords: ['cbse', 'central board', 'senior secondary', 'class xii', 'class 12'],
      patterns: [
        /\bcentral\s+board\s+of\s+secondary\s+education\b/i,
        /\bsenior\s+(?:secondary\s+)?school\s+certificate\s+examination\b/i,
        /\bclass\s*(?:xii|12)\b/i,
        /\bhigher\s+secondary\s+(?:certificate|examination)\b/i
      ],
      subjectCodes: ['301', '042', '048', '028', '029', '030', '064', '065'],
      headerKeywords: ['senior school certificate examination', 'higher secondary certificate'],
      requiredElements: ['central board', 'senior', 'certificate'],
      weight: 1.0,
      confidence: { high: 0.9, medium: 0.75, low: 0.6 }
    },
    {
      subtype: 'ICSE_10_MARKSHEET',
      name: 'ICSE Class 10 Marksheet',
      parentType: 'EDUCATIONAL',
      keywords: ['icse', 'indian certificate', 'secondary education', 'class x', 'class 10'],
      patterns: [
        /\bindian\s+certificate\s+of\s+secondary\s+education\b/i,
        /\bicse\s+examination\b/i,
        /\bclass\s*(?:x|10)\b/i
      ],
      headerKeywords: ['indian certificate of secondary education'],
      requiredElements: ['icse', 'secondary', 'certificate'],
      weight: 1.0,
      confidence: { high: 0.9, medium: 0.75, low: 0.6 }
    },
    {
      subtype: 'ISC_12_MARKSHEET',
      name: 'ISC Class 12 Marksheet',
      parentType: 'EDUCATIONAL',
      keywords: ['isc', 'indian school certificate', 'class xii', 'class 12'],
      patterns: [
        /\bindian\s+school\s+certificate\b/i,
        /\bisc\s+examination\b/i,
        /\bclass\s*(?:xii|12)\b/i
      ],
      headerKeywords: ['indian school certificate'],
      requiredElements: ['isc', 'school', 'certificate'],
      weight: 1.0,
      confidence: { high: 0.9, medium: 0.75, low: 0.6 }
    },
    {
      subtype: 'STATE_BOARD_10_MARKSHEET',
      name: 'State Board Class 10 Marksheet',
      parentType: 'EDUCATIONAL',
      keywords: ['state board', 'secondary school leaving certificate', 'sslc', 'class 10'],
      patterns: [
        /\bstate\s+board\s+of\s+(?:secondary\s+)?education\b/i,
        /\bsecondary\s+school\s+leaving\s+certificate\b/i,
        /\bsslc\s+examination\b/i,
        /\bclass\s*(?:x|10)\b/i
      ],
      headerKeywords: ['state board', 'secondary school leaving certificate', 'sslc'],
      requiredElements: ['state', 'secondary', 'certificate'],
      weight: 1.0,
      confidence: { high: 0.85, medium: 0.7, low: 0.55 }
    },
    {
      subtype: 'STATE_BOARD_12_MARKSHEET',
      name: 'State Board Class 12 Marksheet',
      parentType: 'EDUCATIONAL',
      keywords: ['state board', 'higher secondary certificate', 'hsc', 'class 12'],
      patterns: [
        /\bstate\s+board\s+of\s+(?:higher\s+)?secondary\s+education\b/i,
        /\bhigher\s+secondary\s+(?:certificate|examination)\b/i,
        /\bhsc\s+examination\b/i,
        /\bclass\s*(?:xii|12)\b/i
      ],
      headerKeywords: ['state board', 'higher secondary certificate', 'hsc'],
      requiredElements: ['state', 'higher', 'secondary'],
      weight: 1.0,
      confidence: { high: 0.85, medium: 0.7, low: 0.55 }
    },
    {
      subtype: 'UNIVERSITY_DEGREE',
      name: 'University Degree Certificate',
      parentType: 'EDUCATIONAL',
      keywords: ['university', 'degree', 'bachelor', 'master', 'diploma', 'graduation'],
      patterns: [
        /\b(?:bachelor|master|diploma)\s+(?:of|in)\b/i,
        /\buniversity\s+(?:of|examination)\b/i,
        /\bdegree\s+(?:certificate|examination)\b/i,
        /\b(?:b\.?a\.?|b\.?sc\.?|b\.?com\.?|b\.?tech\.?|m\.?a\.?|m\.?sc\.?|m\.?com\.?|m\.?tech\.?)\b/i
      ],
      headerKeywords: ['university', 'degree certificate', 'convocation'],
      requiredElements: ['university', 'degree'],
      weight: 1.0,
      confidence: { high: 0.85, medium: 0.7, low: 0.55 }
    },

    // ID DOCUMENT SUBTYPES
    {
      subtype: 'AADHAAR_CARD',
      name: 'Aadhaar Card',
      parentType: 'ID',
      keywords: ['aadhaar', 'aadhar', 'uid', 'unique identification authority'],
      patterns: [
        /\bunique\s+identification\s+authority\s+of\s+india\b/i,
        /\baadhaar\b/i,
        /\buid\s*(?:ai)?\b/i,
        /\b\d{4}\s+\d{4}\s+\d{4}\b/
      ],
      headerKeywords: ['unique identification authority of india', 'government of india'],
      requiredElements: ['aadhaar', 'unique identification'],
      weight: 1.0,
      confidence: { high: 0.95, medium: 0.8, low: 0.65 }
    },
    {
      subtype: 'PAN_CARD',
      name: 'PAN Card',
      parentType: 'ID',
      keywords: ['pan', 'permanent account number', 'income tax department'],
      patterns: [
        /\bpermanent\s+account\s+number\b/i,
        /\bincome\s+tax\s+department\b/i,
        /\bgovernment\s+of\s+india\b/i,
        /\b[A-Z]{5}\d{4}[A-Z]\b/
      ],
      headerKeywords: ['permanent account number', 'income tax department'],
      requiredElements: ['permanent account', 'income tax'],
      weight: 1.0,
      confidence: { high: 0.95, medium: 0.8, low: 0.65 }
    },
    {
      subtype: 'PASSPORT',
      name: 'Indian Passport',
      parentType: 'ID',
      keywords: ['passport', 'republic of india', 'ministry of external affairs'],
      patterns: [
        /\brepublic\s+of\s+india\b/i,
        /\bministry\s+of\s+external\s+affairs\b/i,
        /\bpassport\s*(?:no|number)?\b/i,
        /\b[A-Z]\d{7}\b/
      ],
      headerKeywords: ['republic of india', 'passport', 'ministry of external affairs'],
      requiredElements: ['passport', 'republic of india'],
      weight: 1.0,
      confidence: { high: 0.95, medium: 0.8, low: 0.65 }
    },
    {
      subtype: 'DRIVING_LICENSE',
      name: 'Driving License',
      parentType: 'ID',
      keywords: ['driving license', 'driving licence', 'transport authority', 'motor vehicle'],
      patterns: [
        /\bdriving\s*licen[cs]e\b/i,
        /\btransport\s+(?:authority|department)\b/i,
        /\bmotor\s+vehicle\s+(?:act|department)\b/i,
        /\b[A-Z]{2}\d{2}\s?\d{11}\b/
      ],
      headerKeywords: ['driving license', 'transport authority', 'motor vehicle'],
      requiredElements: ['driving', 'license'],
      weight: 1.0,
      confidence: { high: 0.9, medium: 0.75, low: 0.6 }
    },
    {
      subtype: 'VOTER_ID',
      name: 'Voter ID Card',
      parentType: 'ID',
      keywords: ['voter', 'election commission', 'electoral photo identity'],
      patterns: [
        /\belection\s+commission\s+of\s+india\b/i,
        /\belectoral\s+photo\s+identity\s+card\b/i,
        /\bvoter\s*(?:id|identity)\b/i,
        /\b[A-Z]{3}\d{7}\b/
      ],
      headerKeywords: ['election commission', 'electoral photo identity card'],
      requiredElements: ['election commission', 'voter'],
      weight: 1.0,
      confidence: { high: 0.9, medium: 0.75, low: 0.6 }
    },

    // FINANCIAL SUBTYPES
    {
      subtype: 'BANK_STATEMENT',
      name: 'Bank Statement',
      parentType: 'FINANCIAL',
      keywords: ['bank statement', 'account statement', 'transaction history'],
      patterns: [
        /\bbank\s+statement\b/i,
        /\baccount\s+statement\b/i,
        /\btransaction\s+(?:history|statement)\b/i,
        /\b(?:saving|current)\s+account\b/i
      ],
      headerKeywords: ['bank statement', 'account statement'],
      requiredElements: ['bank', 'statement'],
      weight: 1.0,
      confidence: { high: 0.9, medium: 0.75, low: 0.6 }
    },
    {
      subtype: 'INCOME_TAX_RETURN',
      name: 'Income Tax Return',
      parentType: 'FINANCIAL',
      keywords: ['income tax return', 'itr', 'assessment year'],
      patterns: [
        /\bincome\s+tax\s+return\b/i,
        /\bitr\s*[-\s]?\d\b/i,
        /\bassessment\s+year\b/i,
        /\bfinancial\s+year\b/i
      ],
      headerKeywords: ['income tax return', 'itr'],
      requiredElements: ['income tax', 'return'],
      weight: 1.0,
      confidence: { high: 0.9, medium: 0.75, low: 0.6 }
    }
  ];

  /**
   * Clean OCR text - remove noise, normalize, fix common OCR mistakes
   */
  public cleanOCRText(rawText: string): OCRCleaning {
    if (!rawText || typeof rawText !== 'string') {
      return {
        original: rawText || '',
        cleaned: '',
        corrections: []
      };
    }

    const corrections: Array<{original: string; corrected: string; confidence: number}> = [];
    let cleaned = rawText;

    // Normalize whitespace and remove excessive spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Remove common OCR artifacts
    cleaned = cleaned.replace(/[|\\\/\[\]{}()]+/g, ' ');
    cleaned = cleaned.replace(/[^\w\s\-.:,]/g, ' ');
    
    // Fix common OCR mistakes
    for (const [wrong, correct] of this.OCR_CORRECTIONS) {
      const wrongRegex = new RegExp(`\\b${wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (wrongRegex.test(cleaned)) {
        corrections.push({
          original: wrong,
          corrected: correct,
          confidence: 0.9
        });
        cleaned = cleaned.replace(wrongRegex, correct);
      }
    }

    // Additional fuzzy matching for key terms
    const fuzzyCorrections = [
      { pattern: /certificat[es]?/gi, correction: 'CERTIFICATE', confidence: 0.8 },
      { pattern: /marksheet?/gi, correction: 'MARKSHEET', confidence: 0.8 },
      { pattern: /examinatio[ns]?/gi, correction: 'EXAMINATION', confidence: 0.8 },
      { pattern: /secondar[yi]?/gi, correction: 'SECONDARY', confidence: 0.8 },
      { pattern: /authorit[yi]?/gi, correction: 'AUTHORITY', confidence: 0.8 }
    ];

    for (const { pattern, correction, confidence } of fuzzyCorrections) {
      const matches = cleaned.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.toUpperCase() !== correction) {
            corrections.push({
              original: match,
              corrected: correction,
              confidence
            });
          }
        });
        cleaned = cleaned.replace(pattern, correction);
      }
    }

    // Final cleanup
    cleaned = cleaned.replace(/\s+/g, ' ').trim().toUpperCase();

    return {
      original: rawText,
      cleaned,
      corrections
    };
  }

  /**
   * Detect broad document type based on anchor keywords
   */
  public detectDocumentType(ocrText: string): { type: string; confidence: number; reasons: string[] } {
    const cleaned = this.cleanOCRText(ocrText).cleaned;
    const scores = new Map<string, { score: number; matches: string[] }>();

    // Initialize scores for all types
    for (const pattern of this.DOCUMENT_TYPE_PATTERNS) {
      scores.set(pattern.type, { score: 0, matches: [] });
    }

    // Calculate scores for each document type
    for (const pattern of this.DOCUMENT_TYPE_PATTERNS) {
      const typeScore = scores.get(pattern.type)!;
      
      // Check keywords
      for (const keyword of pattern.keywords) {
        const keywordRegex = new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'i');
        if (keywordRegex.test(cleaned)) {
          typeScore.score += pattern.weight * 0.3;
          typeScore.matches.push(`keyword: ${keyword}`);
        }
      }
      
      // Check patterns
      for (const regex of pattern.patterns) {
        if (regex.test(cleaned)) {
          typeScore.score += pattern.weight * 0.7;
          typeScore.matches.push(`pattern: ${regex.source}`);
        }
      }
      
      // Check exclusions
      if (pattern.exclusions) {
        for (const exclusion of pattern.exclusions) {
          const exclusionRegex = new RegExp(`\\b${exclusion.replace(/\s+/g, '\\s+')}\\b`, 'i');
          if (exclusionRegex.test(cleaned)) {
            typeScore.score *= 0.5; // Reduce score by half if exclusion found
            typeScore.matches.push(`exclusion: ${exclusion}`);
          }
        }
      }
    }

    // Find the best match
    let bestType = 'UNKNOWN';
    let bestScore = 0;
    let bestMatches: string[] = [];

    for (const [type, { score, matches }] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
        bestMatches = matches;
      }
    }

    // Normalize confidence score
    const confidence = Math.min(bestScore / 2.0, 1.0); // Max possible score is ~2.0

    return {
      type: bestType,
      confidence,
      reasons: bestMatches
    };
  }

  /**
   * Detect specific document subtype within a type
   */
  public detectDocumentSubtype(ocrText: string, docType: string): { subtype: string; confidence: number; reasons: string[] } {
    const cleaned = this.cleanOCRText(ocrText).cleaned;
    const applicableSubtypes = this.DOCUMENT_SUBTYPE_PATTERNS.filter(p => p.parentType === docType);
    
    if (applicableSubtypes.length === 0) {
      return {
        subtype: 'UNKNOWN',
        confidence: 0,
        reasons: [`No subtypes defined for type: ${docType}`]
      };
    }

    const scores = new Map<string, { score: number; matches: string[] }>();

    // Calculate scores for each subtype
    for (const pattern of applicableSubtypes) {
      const subtypeScore = { score: 0, matches: [] as string[] };
      
      // Check keywords
      for (const keyword of pattern.keywords) {
        const keywordRegex = new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'i');
        if (keywordRegex.test(cleaned)) {
          subtypeScore.score += pattern.weight * 0.2;
          subtypeScore.matches.push(`keyword: ${keyword}`);
        }
      }
      
      // Check patterns (higher weight)
      for (const regex of pattern.patterns) {
        if (regex.test(cleaned)) {
          subtypeScore.score += pattern.weight * 0.4;
          subtypeScore.matches.push(`pattern: ${regex.source}`);
        }
      }
      
      // Check header keywords (high importance)
      if (pattern.headerKeywords) {
        for (const headerKeyword of pattern.headerKeywords) {
          const headerRegex = new RegExp(`\\b${headerKeyword.replace(/\s+/g, '\\s+')}\\b`, 'i');
          if (headerRegex.test(cleaned)) {
            subtypeScore.score += pattern.weight * 0.5;
            subtypeScore.matches.push(`header: ${headerKeyword}`);
          }
        }
      }
      
      // Check subject codes (for educational documents)
      if (pattern.subjectCodes) {
        for (const code of pattern.subjectCodes) {
          const codeRegex = new RegExp(`\\b${code}\\b`);
          if (codeRegex.test(cleaned)) {
            subtypeScore.score += pattern.weight * 0.3;
            subtypeScore.matches.push(`subject_code: ${code}`);
          }
        }
      }
      
      // Check required elements
      if (pattern.requiredElements) {
        let requiredFound = 0;
        for (const element of pattern.requiredElements) {
          const elementRegex = new RegExp(`\\b${element.replace(/\s+/g, '\\s+')}\\b`, 'i');
          if (elementRegex.test(cleaned)) {
            requiredFound++;
          }
        }
        const requiredRatio = requiredFound / pattern.requiredElements.length;
        subtypeScore.score += pattern.weight * 0.4 * requiredRatio;
        subtypeScore.matches.push(`required_elements: ${requiredFound}/${pattern.requiredElements.length}`);
      }
      
      scores.set(pattern.subtype, subtypeScore);
    }

    // Find the best match
    let bestSubtype = 'UNKNOWN';
    let bestScore = 0;
    let bestMatches: string[] = [];

    for (const [subtype, { score, matches }] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestSubtype = subtype;
        bestMatches = matches;
      }
    }

    // Normalize confidence score based on pattern confidence thresholds
    const pattern = applicableSubtypes.find(p => p.subtype === bestSubtype);
    let confidence = 0;
    
    if (pattern && bestScore > 0) {
      // Map score to confidence based on pattern thresholds
      const maxPossibleScore = pattern.weight * 1.8; // Theoretical max
      const normalizedScore = bestScore / maxPossibleScore;
      
      if (normalizedScore >= pattern.confidence.high / pattern.confidence.high) {
        confidence = Math.min(normalizedScore, 1.0);
      } else if (normalizedScore >= pattern.confidence.medium / pattern.confidence.high) {
        confidence = normalizedScore * 0.8;
      } else if (normalizedScore >= pattern.confidence.low / pattern.confidence.high) {
        confidence = normalizedScore * 0.6;
      } else {
        confidence = normalizedScore * 0.4;
      }
    }

    return {
      subtype: bestSubtype,
      confidence: Math.min(confidence, 1.0),
      reasons: bestMatches
    };
  }

  /**
   * ML Fallback classifier using TF-IDF + Logistic Regression simulation
   * This is a simplified simulation - in production, you'd use actual ML models
   */
  private mlFallbackClassifier(ocrText: string): { type: string; subtype: string; confidence: number } {
    // Simplified ML simulation based on text features
    const cleaned = this.cleanOCRText(ocrText).cleaned;
    const words = cleaned.split(/\s+/);
    const wordCount = words.length;
    
    // Feature extraction (simplified)
    const features = {
      hasEducationTerms: /\b(education|school|examination|marks|certificate|class|cbse|icse)\b/i.test(cleaned),
      hasIdTerms: /\b(aadhaar|pan|passport|license|voter|identification|authority)\b/i.test(cleaned),
      hasFinancialTerms: /\b(bank|account|statement|transaction|income|tax)\b/i.test(cleaned),
      hasNumbers: /\d+/.test(cleaned),
      hasCodes: /\b\d{3,4}\b/.test(cleaned),
      wordCount,
      avgWordLength: words.reduce((sum, word) => sum + word.length, 0) / Math.max(words.length, 1)
    };
    
    // Simplified decision tree logic
    if (features.hasEducationTerms && features.hasCodes) {
      if (/\bclass\s*(?:x|10)\b/i.test(cleaned)) {
        return { type: 'EDUCATIONAL', subtype: 'CBSE_10_MARKSHEET', confidence: 0.75 };
      } else if (/\bclass\s*(?:xii|12)\b/i.test(cleaned)) {
        return { type: 'EDUCATIONAL', subtype: 'CBSE_12_MARKSHEET', confidence: 0.75 };
      }
      return { type: 'EDUCATIONAL', subtype: 'UNIVERSITY_DEGREE', confidence: 0.7 };
    }
    
    if (features.hasIdTerms) {
      if (/aadhaar/i.test(cleaned)) {
        return { type: 'ID', subtype: 'AADHAAR_CARD', confidence: 0.75 };
      } else if (/pan/i.test(cleaned)) {
        return { type: 'ID', subtype: 'PAN_CARD', confidence: 0.75 };
      }
      return { type: 'ID', subtype: 'UNKNOWN', confidence: 0.65 };
    }
    
    if (features.hasFinancialTerms) {
      return { type: 'FINANCIAL', subtype: 'BANK_STATEMENT', confidence: 0.7 };
    }
    
    return { type: 'UNKNOWN', subtype: 'UNKNOWN', confidence: 0.3 };
  }

  /**
   * Full document classification pipeline
   */
  public classifyDocument(ocrText: string): DocumentVerificationResult {
    if (!ocrText || typeof ocrText !== 'string' || ocrText.trim().length === 0) {
      return {
        type: 'UNKNOWN',
        subtype: 'UNKNOWN',
        confidence: 0,
        method: 'rule-based',
        reasons: ['Empty or invalid OCR text'],
        rawText: ocrText,
        cleanedText: ''
      };
    }

    // Step 1: Clean OCR text
    const cleaning = this.cleanOCRText(ocrText);
    
    // Step 2: Detect broad document type
    const typeResult = this.detectDocumentType(cleaning.cleaned);
    
    // Step 3: Detect specific subtype
    const subtypeResult = this.detectDocumentSubtype(cleaning.cleaned, typeResult.type);
    
    // Step 4: Determine if confidence is sufficient
    const combinedConfidence = (typeResult.confidence + subtypeResult.confidence) / 2;
    
    let finalResult: DocumentVerificationResult;
    
    if (combinedConfidence >= this.CONFIDENCE_THRESHOLD) {
      // Rule-based classification succeeded
      finalResult = {
        type: typeResult.type,
        subtype: subtypeResult.subtype,
        confidence: combinedConfidence,
        method: 'rule-based',
        reasons: [...typeResult.reasons, ...subtypeResult.reasons],
        rawText: ocrText,
        cleanedText: cleaning.cleaned,
        detectedPatterns: [...typeResult.reasons, ...subtypeResult.reasons]
      };
    } else {
      // Step 5: Fallback to ML classifier
      const mlResult = this.mlFallbackClassifier(cleaning.cleaned);
      finalResult = {
        type: mlResult.type,
        subtype: mlResult.subtype,
        confidence: mlResult.confidence,
        method: 'ml-fallback',
        reasons: [`Rule-based confidence too low (${combinedConfidence.toFixed(2)}), using ML fallback`],
        rawText: ocrText,
        cleanedText: cleaning.cleaned,
        detectedPatterns: [...typeResult.reasons, ...subtypeResult.reasons]
      };
    }
    
    // Add alternative classifications
    finalResult.alternativeTypes = [
      {
        type: typeResult.type,
        subtype: subtypeResult.subtype,
        confidence: combinedConfidence
      }
    ].filter(alt => alt.type !== finalResult.type || alt.subtype !== finalResult.subtype);

    return finalResult;
  }

  /**
   * Get all supported document types and subtypes
   */
  public getSupportedDocuments(): { types: string[]; subtypes: Record<string, string[]> } {
    const types = this.DOCUMENT_TYPE_PATTERNS.map(p => p.type);
    const subtypes: Record<string, string[]> = {};
    
    for (const pattern of this.DOCUMENT_SUBTYPE_PATTERNS) {
      if (!subtypes[pattern.parentType]) {
        subtypes[pattern.parentType] = [];
      }
      subtypes[pattern.parentType].push(pattern.subtype);
    }
    
    return { types, subtypes };
  }

  /**
   * Get detailed information about a specific subtype
   */
  public getSubtypeInfo(subtype: string): DocumentSubtypePattern | null {
    return this.DOCUMENT_SUBTYPE_PATTERNS.find(p => p.subtype === subtype) || null;
  }
}

// Export utility functions for backward compatibility
export function clean_ocr_text(raw_text: string): string {
  const pipeline = new AIDocumentVerificationPipeline();
  return pipeline.cleanOCRText(raw_text).cleaned;
}

export function detect_document_type(ocr_text: string): [string, number] {
  const pipeline = new AIDocumentVerificationPipeline();
  const result = pipeline.detectDocumentType(ocr_text);
  return [result.type, result.confidence];
}

export function detect_document_subtype(ocr_text: string, doc_type: string): [string, number] {
  const pipeline = new AIDocumentVerificationPipeline();
  const result = pipeline.detectDocumentSubtype(ocr_text, doc_type);
  return [result.subtype, result.confidence];
}

export function classify_document(ocr_text: string): DocumentVerificationResult {
  const pipeline = new AIDocumentVerificationPipeline();
  return pipeline.classifyDocument(ocr_text);
}

// The main class is already exported above, no need to re-export