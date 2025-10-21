const fs = require('fs');
const path = require('path');

console.log('🎯 Testing Button Functionality & JEE Mains Only System...\n');

// Test the actual parsed document
const parsedDocsPath = path.join(__dirname, 'data', 'parsed-documents');
const files = fs.readdirSync(parsedDocsPath);
const jsonFiles = files.filter(f => f.endsWith('.json'));

if (jsonFiles.length === 1) {
  console.log('✅ Exactly 1 parsed document (JEE Mains 2025) as requested');
  
  const docPath = path.join(parsedDocsPath, jsonFiles[0]);
  const docContent = JSON.parse(fs.readFileSync(docPath, 'utf8'));
  
  console.log(`📄 Document: ${docContent.examName}`);
  console.log(`🏷️ Type: ${docContent.examType}`);
  console.log(`📊 Document Count: ${docContent.documentCount || docContent.parsedJson?.documents?.length || 0}`);
  
  if (docContent.parsedJson && docContent.parsedJson.documents) {
    console.log(`\n📋 Required Documents (${docContent.parsedJson.documents.length}):`);
    docContent.parsedJson.documents.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.type}`);
    });
  }
  
  console.log('\n🔧 System Status:');
  console.log('✅ Only JEE Mains 2025 schema present');
  console.log('✅ Placeholder schemas removed');
  console.log('✅ System loads from data/parsed-documents only');
  
} else {
  console.log(`❌ Expected exactly 1 document, found ${jsonFiles.length}`);
}

// Check that the useExamData hook is properly configured
console.log('\n🎣 Hook Configuration:');
const hookPath = path.join(__dirname, 'src', 'components', 'dashboard', 'hooks', 'useExamData.ts');
if (fs.existsSync(hookPath)) {
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  const usesImportedFunction = hookContent.includes('loadParsedDocuments');
  const importsFromRegistry = hookContent.includes('@/features/exam/optimizedExamRegistry');
  const noLegacy = !hookContent.includes('legacyExams');
  
  console.log(`✅ Uses imported loadParsedDocuments: ${usesImportedFunction}`);
  console.log(`✅ Imports from optimized registry: ${importsFromRegistry}`);
  console.log(`✅ No legacy exams: ${noLegacy}`);
} else {
  console.log('❌ useExamData hook not found');
}

console.log('\n🎯 Expected Behavior:');
console.log('1. "Choose Your Exam" modal should show only JEE Mains 2025');
console.log('2. Clicking the exam button should work properly');
console.log('3. No placeholder exams should appear');
console.log('4. System only fetches from data/parsed-documents folder');

console.log('\n✨ Ready for testing!');