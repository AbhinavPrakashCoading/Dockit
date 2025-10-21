// Constants and configuration for the Schema Extraction Engine

export const SEARCH_KEYWORDS = {
  OFFICIAL: ['official', 'recruitment', 'notification', 'notice', 'circular'],
  APPLICATION: ['apply online', 'application form', 'registration', 'instructions to candidates'],
  DOCUMENT_UPLOAD: ['upload', 'document', 'photo', 'signature', 'certificate', 'marksheet'],
  REQUIREMENTS: ['requirements', 'specifications', 'format', 'size', 'dimension']
};

export const FILE_TYPES = {
  PDF: ['.pdf'],
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
  DOCUMENTS: ['.doc', '.docx', '.txt']
};

export const DOCUMENT_TYPES = {
  PHOTO: ['photo', 'photograph', 'passport size', 'recent photo', 'color photo'],
  SIGNATURE: ['signature', 'sign', 'thumb impression', 'left thumb'],
  CERTIFICATES: [
    'marksheet', 'mark sheet', 'grade sheet', 'transcript',
    'degree certificate', 'diploma certificate', 'passing certificate',
    'caste certificate', 'category certificate', 'income certificate',
    'domicile certificate', 'experience certificate', 'service certificate'
  ],
  ID_PROOF: [
    'id proof', 'identity proof', 'aadhar', 'aadhaar', 'pan card',
    'voter id', 'driving license', 'passport'
  ]
};

export const SIZE_PATTERNS = {
  KB: /(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*kb/gi,
  MB: /(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*mb/gi,
  SINGLE_KB: /(\d+(?:\.\d+)?)\s*kb/gi,
  SINGLE_MB: /(\d+(?:\.\d+)?)\s*mb/gi
};

export const DIMENSION_PATTERNS = {
  PIXELS: /(\d{2,4})\s*[x×*]\s*(\d{2,4})\s*(?:px|pixels?)?/gi,
  MM: /(\d{1,3})\s*[x×*]\s*(\d{1,3})\s*mm/gi,
  CM: /(\d{1,2}(?:\.\d+)?)\s*[x×*]\s*(\d{1,2}(?:\.\d+)?)\s*cm/gi,
  INCH: /(\d{1,2}(?:\.\d+)?)\s*[x×*]\s*(\d{1,2}(?:\.\d+)?)\s*(?:inch|inches)/gi
};

export const FORMAT_PATTERNS = {
  IMAGE_FORMATS: /(jpg|jpeg|png|gif|bmp|tiff?)/gi,
  DOCUMENT_FORMATS: /(pdf|doc|docx|txt)/gi
};

export const SEARCH_DOMAINS = {
  GOVERNMENT: ['gov.in', 'nic.in', 'ibps.in', 'sbi.co.in', 'rbi.org.in'],
  EDUCATIONAL: ['edu.in', 'ac.in', 'nta.ac.in', 'cbse.gov.in'],
  BANKING: ['ibps.in', 'sbi.co.in', 'rbi.org.in', 'iba.org.in'],
  RAILWAY: ['indianrailways.gov.in', 'rrcb.gov.in', 'rrb.gov.in'],
  SSC: ['ssc.nic.in', 'ssc.gov.in']
};

export const TIMEOUT_CONFIG = {
  SEARCH_TIMEOUT: 30000, // 30 seconds
  EXTRACTION_TIMEOUT: 60000, // 60 seconds
  PDF_TIMEOUT: 45000, // 45 seconds
  HTTP_TIMEOUT: 20000 // 20 seconds
};

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
];

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4
};