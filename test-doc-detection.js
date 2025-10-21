// Quick test to debug document detection issues
const { detectDocumentType } = require('./src/features/processing/DocumentTypeProcessor.ts');

console.log('Testing document detection...');

// Test different filename scenarios
const testCases = [
  { filename: '10th_marksheet.jpg', expected: 'marksheet' },
  { filename: 'marksheet_class_10.pdf', expected: 'marksheet' },
  { filename: 'ssc_photo.jpg', expected: 'ssc_photo' },
  { filename: 'random_document.jpg', expected: 'unknown_document' },
  { filename: 'aadhar_card.pdf', expected: 'aadhar_card' },
  { filename: 'passport_photo.jpg', expected: 'passport_photo' },
];

testCases.forEach(test => {
  try {
    const detected = detectDocumentType(test.filename, 500000);
    console.log(`File: ${test.filename}`);
    console.log(`  Expected: ${test.expected}`);
    console.log(`  Detected: ${detected}`);
    console.log(`  Match: ${detected === test.expected ? '✅' : '❌'}`);
    console.log('');
  } catch (error) {
    console.error(`Error testing ${test.filename}:`, error.message);
  }
});