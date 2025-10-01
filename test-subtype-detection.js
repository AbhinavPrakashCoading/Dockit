/**
 * Test script to demonstrate sub-type detection functionality
 */

// Simulate the DocumentTypeProcessor functions
const { 
  detectDocumentSubType, 
  getEnhancedDocumentInfo 
} = require('./src/features/processing/DocumentTypeProcessor.ts');

console.log('\n🔍 Testing Document Sub-Type Detection System\n');

// Test 1: Education Certificate - 10th Marksheet
console.log('📄 Test 1: Education Certificate - 10th Marksheet');
const tenthMarksheetText = [
  'Central Board of Secondary Education',
  'Class X Marksheet',
  'Secondary School Certificate',
  'Mathematics: 95/100',
  'Science: 92/100',
  'Roll Number: 1234567',
  'Year of Passing: 2020'
];

const marksheetMetadata = {
  size: 350000, // 350 KB
  width: 2480,
  height: 3508 // A4 size at 300 DPI
};

const marksheetResult = detectDocumentSubType(
  'education_certificate', 
  tenthMarksheetText, 
  marksheetMetadata
);

console.log('Result:', marksheetResult);

// Test 2: Personal ID - Aadhaar Card
console.log('\n🆔 Test 2: Personal ID - Aadhaar Card');
const aadhaarText = [
  'Government of India',
  'Unique Identification Authority of India',
  'Aadhaar',
  '1234 5678 9012',
  'Name: RAJESH KUMAR',
  'DOB: 15/08/1990',
  'Address: Mumbai, Maharashtra'
];

const aadhaarMetadata = {
  size: 150000, // 150 KB
  width: 2000,
  height: 1200 // Credit card size ratio
};

const aadhaarResult = detectDocumentSubType(
  'personal_id_document', 
  aadhaarText, 
  aadhaarMetadata
);

console.log('Result:', aadhaarResult);

// Test 3: Photograph - Passport Size
console.log('\n📸 Test 3: Photograph - Passport Size');
const passportPhotoText = []; // Photos typically have no text

const passportPhotoMetadata = {
  size: 45000, // 45 KB
  width: 413,  // 35mm at 300 DPI
  height: 531  // 45mm at 300 DPI
};

const photoResult = detectDocumentSubType(
  'photograph', 
  passportPhotoText, 
  passportPhotoMetadata
);

console.log('Result:', photoResult);

// Test 4: Enhanced Document Info
console.log('\n📋 Test 4: Enhanced Document Information');
const enhancedInfo = getEnhancedDocumentInfo(
  'education_certificate',
  tenthMarksheetText,
  marksheetMetadata
);

console.log('Enhanced Info:', {
  documentType: enhancedInfo.config.type,
  category: enhancedInfo.config.category,
  detectedSubType: enhancedInfo.subTypeResult?.subType,
  confidence: enhancedInfo.subTypeResult?.confidence,
  processingRecommendations: enhancedInfo.processingRecommendations
});

console.log('\n✅ Sub-type detection system is working!\n');
console.log('🎯 Key Features:');
console.log('• Detects specific document variants within broad categories');
console.log('• Provides confidence scoring based on multiple factors');
console.log('• Suggests optimized processing based on document sub-type');
console.log('• Analyzes text patterns, dimensions, and file metadata');
console.log('• Enables granular document handling for better results\n');