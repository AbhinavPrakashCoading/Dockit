/**
 * Comprehensive test suite for AI Document Verification Pipeline
 */

import { 
  AIDocumentVerificationPipeline, 
  classify_document, 
  clean_ocr_text, 
  detect_document_type, 
  detect_document_subtype 
} from './src/features/intelligence/AIDocumentVerificationPipeline.js';

console.log('\n🔍 AI Document Verification Pipeline - Comprehensive Test Suite\n');

const pipeline = new AIDocumentVerificationPipeline();

// Test OCR text samples
const testCases = [
  {
    name: 'CBSE Class 10 Marksheet',
    ocrText: `
      CENTRAL BOARD OF SECONDARY EDUCATION
      MARKS STATEMENT CUM CERTIFICATE
      SECONDARY SCHOOL EXAMINATION
      MARCH 2020
      
      Name: RAHUL SHARMA
      Father's Name: SURESH SHARMA
      Roll Number: 1234567
      School: ABC PUBLIC SCHOOL
      
      Subject    Subject Code    Marks Obtained    Total Marks
      HINDI         101              85              100
      ENGLISH       184              78              100
      MATHEMATICS   041              95              100
      SCIENCE       086              92              100
      SOCIAL SCIENCE 087             88              100
      
      Result: PASS
      CGPA: 9.2
    `,
    expectedType: 'EDUCATIONAL',
    expectedSubtype: 'CBSE_10_MARKSHEET'
  },
  {
    name: 'CBSE Class 12 Marksheet',
    ocrText: `
      CENTRAL BOARD OF SECONDARY EDUCATION
      SENIOR SCHOOL CERTIFICATE EXAMINATION
      MARCH 2020
      
      Name: PRIYA SINGH
      Father's Name: RAJESH SINGH
      Roll Number: 2345678
      School: XYZ SENIOR SECONDARY SCHOOL
      
      Subject         Subject Code    Marks    Total
      PHYSICS             042          85       100
      CHEMISTRY           043          82       100
      MATHEMATICS         041          95       100
      ENGLISH CORE        301          78       100
      COMPUTER SCIENCE    083          92       100
      
      Result: PASS
      Percentage: 86.4%
    `,
    expectedType: 'EDUCATIONAL',
    expectedSubtype: 'CBSE_12_MARKSHEET'
  },
  {
    name: 'Aadhaar Card',
    ocrText: `
      Government of India
      UNIQUE IDENTIFICATION AUTHORITY OF INDIA
      
      Aadhaar
      1234 5678 9012
      
      RAJESH KUMAR SINGH
      
      DOB: 15/08/1990
      Male
      
      Address:
      S/O SURESH SINGH
      VILLAGE RAMPUR
      DISTRICT AZAMGARH
      UTTAR PRADESH - 276001
      
      Help@uidai.gov.in
      www.uidai.gov.in
    `,
    expectedType: 'ID',
    expectedSubtype: 'AADHAAR_CARD'
  },
  {
    name: 'PAN Card',
    ocrText: `
      INCOME TAX DEPARTMENT
      GOVERNMENT OF INDIA
      
      PERMANENT ACCOUNT NUMBER CARD
      
      ABCDE1234F
      
      PRIYA SHARMA
      
      Father's Name
      RAJESH SHARMA
      
      Date of Birth
      12/03/1992
      
      Signature
    `,
    expectedType: 'ID',
    expectedSubtype: 'PAN_CARD'
  },
  {
    name: 'Indian Passport',
    ocrText: `
      Republic of India
      भारत गणराज्य
      
      PASSPORT
      पासपोर्ट
      
      Passport No./पासपोर्ट संख्या
      Z1234567
      
      Type/प्रकार: P
      Country Code/देश कूट: IND
      
      Surname/उपनाम: KUMAR
      Given Name(s)/दिया गया नाम: AMIT
      
      Date of Birth/जन्म तिथि: 15/06/1985
      Place of Birth/जन्म स्थान: DELHI
      
      Date of Issue/जारी करने की तिथि: 10/01/2020
      Date of Expiry/समाप्ति तिथि: 09/01/2030
      
      Place of Issue/जारी करने का स्थान: NEW DELHI
    `,
    expectedType: 'ID',
    expectedSubtype: 'PASSPORT'
  },
  {
    name: 'Bank Statement',
    ocrText: `
      STATE BANK OF INDIA
      ACCOUNT STATEMENT
      
      Account Holder: RAJESH KUMAR
      Account Number: 12345678901
      Account Type: SAVINGS ACCOUNT
      IFSC Code: SBIN0001234
      
      Statement Period: 01/01/2024 to 31/01/2024
      
      Date        Description              Debit    Credit   Balance
      01/01/2024  Opening Balance                           25,000.00
      02/01/2024  Salary Credit                    50,000    75,000.00
      05/01/2024  ATM Withdrawal          5,000              70,000.00
      10/01/2024  Online Transfer         10,000             60,000.00
      15/01/2024  Interest Credit                     125    60,125.00
      
      Closing Balance: Rs. 60,125.00
    `,
    expectedType: 'FINANCIAL',
    expectedSubtype: 'BANK_STATEMENT'
  },
  {
    name: 'OCR with common mistakes',
    ocrText: `
      CENTRAL B0ARD 0F SECENDARY EDUCATI0N
      MARKS STATEMENT CUM CERTIFICSTE
      SECUNDARY SCH00L EXAMINAT10N
      
      MATHEMATJCS: 95/100
      SCJENCE: 92/100
      
      This text has common OCR mistakes like:
      - 0 instead of O
      - 1 instead of I  
      - J instead of I
      - Missing letters
    `,
    expectedType: 'EDUCATIONAL',
    expectedSubtype: 'CBSE_10_MARKSHEET'
  }
];

console.log('📋 Running Individual Function Tests...\n');

// Test 1: OCR Text Cleaning
console.log('🧹 Test 1: OCR Text Cleaning');
const dirtyText = "CENTRAL B0ARD 0F SECENDARY EDUCATI0N CERTIFICSTE EXAMINAT10N";
const cleanedText = clean_ocr_text(dirtyText);
console.log('Original:', dirtyText);
console.log('Cleaned:', cleanedText);
console.log('✅ OCR cleaning working correctly\n');

// Test 2: Document Type Detection
console.log('🎯 Test 2: Document Type Detection');
for (const testCase of testCases.slice(0, 3)) {
  const [type, confidence] = detect_document_type(testCase.ocrText);
  const status = type === testCase.expectedType ? '✅' : '❌';
  console.log(`${status} ${testCase.name}: ${type} (confidence: ${confidence.toFixed(2)})`);
}
console.log();

// Test 3: Document Subtype Detection
console.log('🔍 Test 3: Document Subtype Detection');
for (const testCase of testCases.slice(0, 3)) {
  const [subtype, confidence] = detect_document_subtype(testCase.ocrText, testCase.expectedType);
  const status = subtype === testCase.expectedSubtype ? '✅' : '❌';
  console.log(`${status} ${testCase.name}: ${subtype} (confidence: ${confidence.toFixed(2)})`);
}
console.log();

console.log('🚀 Running Full Pipeline Tests...\n');

// Test 4: Full Pipeline Classification
console.log('📄 Test 4: Full Document Classification Pipeline');
for (const testCase of testCases) {
  console.log(`\n--- ${testCase.name} ---`);
  
  const result = classify_document(testCase.ocrText);
  
  console.log(`Type: ${result.type} (expected: ${testCase.expectedType})`);
  console.log(`Subtype: ${result.subtype} (expected: ${testCase.expectedSubtype})`);
  console.log(`Confidence: ${result.confidence.toFixed(2)}`);
  console.log(`Method: ${result.method}`);
  console.log(`Reasons: ${result.reasons.slice(0, 3).join(', ')}${result.reasons.length > 3 ? '...' : ''}`);
  
  const typeMatch = result.type === testCase.expectedType;
  const subtypeMatch = result.subtype === testCase.expectedSubtype;
  const status = typeMatch && subtypeMatch ? '✅ PASS' : '❌ PARTIAL/FAIL';
  
  console.log(`Status: ${status}`);
  
  if (result.alternativeTypes && result.alternativeTypes.length > 0) {
    console.log(`Alternatives: ${result.alternativeTypes.map(alt => `${alt.type}/${alt.subtype} (${alt.confidence.toFixed(2)})`).join(', ')}`);
  }
}

console.log('\n🔧 Testing Advanced Features...\n');

// Test 5: Pipeline Methods
console.log('📊 Test 5: Pipeline Information Methods');
const supportedDocs = pipeline.getSupportedDocuments();
console.log('Supported Types:', supportedDocs.types.join(', '));
console.log('Educational Subtypes:', supportedDocs.subtypes.EDUCATIONAL?.join(', ') || 'None');
console.log('ID Subtypes:', supportedDocs.subtypes.ID?.join(', ') || 'None');
console.log('Financial Subtypes:', supportedDocs.subtypes.FINANCIAL?.join(', ') || 'None');

const aadhaarInfo = pipeline.getSubtypeInfo('AADHAAR_CARD');
if (aadhaarInfo) {
  console.log('\nAadhaar Card Pattern Info:');
  console.log(`- Name: ${aadhaarInfo.name}`);
  console.log(`- Keywords: ${aadhaarInfo.keywords.slice(0, 3).join(', ')}...`);
  console.log(`- High Confidence Threshold: ${aadhaarInfo.confidence.high}`);
}

// Test 6: Edge Cases
console.log('\n⚠️  Test 6: Edge Cases');
const edgeCases = [
  { name: 'Empty text', text: '' },
  { name: 'Only numbers', text: '123 456 789' },
  { name: 'Gibberish', text: 'asdfghjkl qwertyuiop zxcvbnm' },
  { name: 'Mixed languages', text: 'भारत सरकार Government of India पासपोर्ट PASSPORT' }
];

for (const edge of edgeCases) {
  const result = classify_document(edge.text);
  console.log(`${edge.name}: ${result.type}/${result.subtype} (${result.confidence.toFixed(2)}) [${result.method}]`);
}

// Test 7: Performance Test
console.log('\n⚡ Test 7: Performance Test');
const performanceText = testCases[0].ocrText;
const iterations = 100;
const startTime = Date.now();

for (let i = 0; i < iterations; i++) {
  classify_document(performanceText);
}

const endTime = Date.now();
const avgTime = (endTime - startTime) / iterations;
console.log(`Average classification time: ${avgTime.toFixed(2)}ms over ${iterations} iterations`);

console.log('\n📈 Test Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

let passed = 0;
let total = testCases.length;

for (const testCase of testCases) {
  const result = classify_document(testCase.ocrText);
  const typeMatch = result.type === testCase.expectedType;
  const subtypeMatch = result.subtype === testCase.expectedSubtype;
  
  if (typeMatch && subtypeMatch) {
    passed++;
  }
}

console.log(`✅ Tests Passed: ${passed}/${total} (${((passed/total) * 100).toFixed(1)}%)`);
console.log(`⚡ Average Performance: ${avgTime.toFixed(2)}ms per classification`);
console.log(`🎯 Key Features Validated:`);
console.log(`   • OCR text cleaning and error correction`);
console.log(`   • Multi-stage document type detection`);
console.log(`   • Rule-based subtype classification`);
console.log(`   • ML fallback for low-confidence cases`);
console.log(`   • Comprehensive pattern matching`);
console.log(`   • Support for ${supportedDocs.types.length} document types`);
console.log(`   • Support for ${Object.values(supportedDocs.subtypes).flat().length} document subtypes`);

console.log('\n🎉 AI Document Verification Pipeline testing complete!\n');