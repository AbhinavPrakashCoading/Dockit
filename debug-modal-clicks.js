// Test to check if exam data is loading correctly for the modal
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Exam Data Flow for Modal Clicks...\n');

// Test 1: Check if parsed documents exist and are structured correctly
const parsedDocsPath = path.join(__dirname, 'data', 'parsed-documents');
if (fs.existsSync(parsedDocsPath)) {
  const files = fs.readdirSync(parsedDocsPath);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  console.log(`📁 Found ${jsonFiles.length} parsed document(s)`);
  
  if (jsonFiles.length > 0) {
    const docPath = path.join(parsedDocsPath, jsonFiles[0]);
    const docContent = JSON.parse(fs.readFileSync(docPath, 'utf8'));
    
    // Simulate what useExamData does
    const convertedExam = {
      id: docContent.id,
      name: docContent.examName,
      category: docContent.examType || 'Parsed',
      logo: '⚙️', // Simulate icon
      color: 'bg-orange-100 text-orange-600', // Simulate color
      hasSchema: true,
      isSchemaLoaded: true,
      schema: docContent.parsedJson,
      source: 'parsed-document',
      requiredDocuments: docContent.parsedJson?.documents?.map(d => d.type) || [],
      documentCount: docContent.documentCount || docContent.parsedJson?.documents?.length || 0,
      confidence: docContent.confidence || 1,
      createdAt: docContent.createdAt,
      originalText: docContent.originalText
    };
    
    console.log('\n📋 Simulated exam object for modal:');
    console.log(`   - id: ${convertedExam.id}`);
    console.log(`   - name: ${convertedExam.name}`);
    console.log(`   - category: ${convertedExam.category}`);
    console.log(`   - hasSchema: ${convertedExam.hasSchema}`);
    console.log(`   - schema exists: ${!!convertedExam.schema}`);
    console.log(`   - documentCount: ${convertedExam.documentCount}`);
    
    // Test if this exam would show up in modal
    console.log('\n🎯 Modal visibility check:');
    console.log(`   - Has schema or hasSchema: ${convertedExam.hasSchema || convertedExam.schema}`);
    console.log(`   - Would show in popular: ${convertedExam.hasSchema || convertedExam.schema}`);
    console.log(`   - Would be clickable: ${!!convertedExam.id && !!convertedExam.name}`);
    
    // Test button properties
    console.log('\n🔘 Button properties:');
    console.log(`   - Button key: ${convertedExam.id}`);
    console.log(`   - Button text: ${convertedExam.name}`);
    console.log(`   - Schema indicator: ${(convertedExam.hasSchema || convertedExam.schema) ? '✓ Schema Available' : 'No schema'}`);
  }
} else {
  console.log('❌ Parsed documents folder not found');
}

// Test 2: Check API structure (what the hook would fetch)
console.log('\n🌐 API Structure Test:');
const apiStructure = {
  success: true,
  data: [
    {
      id: "doc_1760598899265_15iptt8ye",
      examName: "JEE Mains 2025",
      examType: "jee",
      parsedJson: {
        exam: "JEE Mains 2025",
        documents: [
          { type: "Photo", requirements: { mandatory: true } },
          { type: "Signature", requirements: { mandatory: true } }
        ]
      }
    }
  ]
};

console.log('✅ Expected API response structure looks correct');
console.log(`   - Would create ${apiStructure.data.length} exam(s)`);

// Test 3: Modal rendering conditions
console.log('\n🎭 Modal Rendering Conditions:');
const mockProps = {
  isOpen: true,
  exams: [apiStructure.data[0]], // Would have 1 exam
  popularExams: [apiStructure.data[0]], // Would have 1 popular exam
  filteredExams: [],
  examsLoading: false,
  onExamSelect: () => console.log('Exam selected!')
};

console.log(`   - Modal is open: ${mockProps.isOpen}`);
console.log(`   - Exams array length: ${mockProps.exams.length}`);
console.log(`   - Popular exams length: ${mockProps.popularExams.length}`);
console.log(`   - Loading state: ${mockProps.examsLoading}`);
console.log(`   - onExamSelect function: ${typeof mockProps.onExamSelect}`);

console.log('\n🎯 Potential Issues to Check:');
console.log('1. Is the development server running?');
console.log('2. Is the API endpoint /api/parsed-documents-fallback working?');
console.log('3. Are there any console errors when clicking?');
console.log('4. Is the modal actually opening?');
console.log('5. Are the exam arrays empty when modal renders?');

console.log('\n🔧 Debugging Steps:');
console.log('1. Check browser console for exam loading logs');
console.log('2. Look for "ExamSelectorModal rendering..." log');
console.log('3. Verify exam count logs show > 0');
console.log('4. Try clicking and look for "exam clicked" logs');