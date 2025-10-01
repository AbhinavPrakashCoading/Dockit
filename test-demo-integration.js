// Quick test to verify the AI Document Verification Pipeline integration
const { classify_document } = require('./src/features/intelligence/AIDocumentVerificationPipeline.js');

console.log('🧪 Testing AI Document Verification Pipeline Integration...\n');

// Test with a simple educational document text
const testText = `
CENTRAL BOARD OF SECONDARY EDUCATION
MARKS STATEMENT CUM CERTIFICATE
SECONDARY SCHOOL EXAMINATION
MARCH 2024

Name: JOHN DOE
Roll Number: 1234567
Mathematics: 95/100
Science: 92/100
English: 88/100
Hindi: 85/100
Social Science: 90/100

Result: PASS
CGPA: 9.0
`;

try {
  const result = classify_document(testText);
  
  console.log('📄 Test Document Classification Result:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Type: ${result.type}`);
  console.log(`Subtype: ${result.subtype}`);
  console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`Method: ${result.method}`);
  console.log(`Reasons: ${result.reasons.slice(0, 3).join(', ')}`);
  
  if (result.type === 'EDUCATIONAL' && result.subtype === 'CBSE_10_MARKSHEET') {
    console.log('\n✅ SUCCESS: AI Pipeline correctly identified CBSE Class 10 Marksheet!');
    console.log('🎯 The demo page integration should work perfectly.');
  } else {
    console.log('\n⚠️  PARTIAL: Classification completed but may need fine-tuning.');
  }
  
} catch (error) {
  console.error('❌ ERROR: AI Pipeline test failed:', error.message);
}

console.log('\n🌐 Demo Page Access:');
console.log('   URL: http://localhost:3000/demo/ai-verification');
console.log('   Features: Upload documents to test the AI pipeline live');
console.log('   Comparison: See filename detection vs AI verification vs new AI pipeline\n');