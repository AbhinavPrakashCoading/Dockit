/**
 * Quick Schema Loading Test
 * Tests the core schema loading functionality
 */

console.log('🧪 Testing Schema Loading...\n');

// Test the getDocumentTypes function logic
function getDocumentTypes(exam, schema = null) {
  console.log(`Testing getDocumentTypes for: ${exam?.name || 'unknown'}`);
  console.log(`Has schema flag: ${exam?.hasSchema}`);
  console.log(`Schema object provided: ${!!schema}`);
  console.log(`Schema requirements: ${schema?.requirements?.length || 0}`);

  // Use schema if available
  if (schema?.requirements) {
    console.log('✅ Using schema requirements');
    return schema.requirements.map((req) => ({
      id: req.id,
      name: req.displayName,
      icon: '📄', // simplified for test
      required: req.mandatory,
      type: req.type,
      description: req.description,
      format: req.format,
      maxSizeKB: req.maxSizeKB,
      dimensions: req.dimensions
    }));
  }

  // Check if exam object has requiredDocuments (legacy)
  if (exam?.requiredDocuments) {
    console.log('⚠️ Using legacy requiredDocuments');
    return exam.requiredDocuments.map((docType) => ({
      id: docType,
      name: docType,
      icon: '📄',
      required: true,
    }));
  }

  // Fallback to generic document types
  console.log('❌ Using fallback generic documents');
  return [
    { id: 'id', name: 'Government ID', required: true, icon: '🪪' },
    { id: 'marksheet', name: 'Mark Sheet', required: true, icon: '📄' },
    { id: 'certificate', name: 'Certificate', required: true, icon: '🏆' },
    { id: 'transcript', name: 'Transcript', required: false, icon: '📋' },
    { id: 'recommendation', name: 'Recommendation Letter', required: false, icon: '✉️' },
  ];
}

// Test scenarios
console.log('📋 Test Scenario 1: Exam with schema');
const examWithSchema = { id: 'upsc-cse', name: 'UPSC CSE', hasSchema: true };
const mockSchema = {
  requirements: [
    {
      id: 'photo',
      displayName: 'Recent Photograph',
      type: 'Photo',
      mandatory: true,
      format: 'JPEG',
      maxSizeKB: 100,
      description: 'Recent passport size photograph'
    },
    {
      id: 'signature',
      displayName: 'Digital Signature',
      type: 'Signature',
      mandatory: true,
      format: 'JPEG',
      maxSizeKB: 50,
      description: 'Clear signature image'
    }
  ]
};

const result1 = getDocumentTypes(examWithSchema, mockSchema);
console.log('Result:', result1);
console.log('');

console.log('📋 Test Scenario 2: Exam without schema');
const examWithoutSchema = { id: 'unknown-exam', name: 'Unknown Exam', hasSchema: false };
const result2 = getDocumentTypes(examWithoutSchema, null);
console.log('Result:', result2);
console.log('');

console.log('📋 Test Scenario 3: Exam with hasSchema true but no schema loaded');
const examSchemaNotLoaded = { id: 'test-exam', name: 'Test Exam', hasSchema: true };
const result3 = getDocumentTypes(examSchemaNotLoaded, null);
console.log('Result:', result3);
console.log('');

console.log('🏁 Schema Loading Test Complete!');
console.log('');
console.log('📊 Analysis:');
console.log('- Scenario 1 should show schema-specific requirements (✅ if 2 documents)');
console.log('- Scenario 2 should show generic fallback (✅ if 5 documents)');
console.log('- Scenario 3 should show generic fallback (✅ if 5 documents)');
console.log('');
console.log('🔧 Next steps:');
console.log('1. Visit /dev-tools to access all debugging tools');
console.log('2. Visit /schema-debug to test actual schema loading');
console.log('3. Visit /schema-discovery to see auto-discovery demo');
console.log('4. Test upload modal in main dashboard with debug info');