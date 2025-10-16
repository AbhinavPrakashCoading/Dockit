// Quick test to verify exam loading with fallback
const fs = require('fs');

console.log('🧪 Testing Fallback Exam System...\n');

// Simulate the exam creation logic
function getExamIcon(examType) {
  const type = examType?.toLowerCase() || '';
  if (type.includes('jee')) return '⚙️';
  return '📄';
}

function getExamColor(examType) {
  const type = examType?.toLowerCase() || '';
  if (type.includes('jee')) return 'bg-orange-100 text-orange-600';
  return 'bg-gray-100 text-gray-600';
}

// Test the fallback exam creation
const fallbackExam = {
  id: "jee-mains-2025-fallback",
  name: "JEE Mains 2025 (Test Mode)",
  category: "Engineering",
  logo: getExamIcon("jee"),
  color: getExamColor("jee"),
  hasSchema: true,
  isSchemaLoaded: true,
  schema: {
    exam: "JEE Mains 2025",
    documents: [
      { type: "Photo", requirements: { mandatory: true } },
      { type: "Signature", requirements: { mandatory: true } },
      { type: "ID Proof", requirements: { mandatory: true } },
      { type: "Class 10th Marksheet", requirements: { mandatory: true } },
      { type: "Class 12th Marksheet", requirements: { mandatory: true } },
      { type: "Category Certificate", requirements: { mandatory: false } },
      { type: "PwD Certificate", requirements: { mandatory: false } }
    ]
  },
  source: 'fallback',
  requiredDocuments: ["Photo", "Signature", "ID Proof", "Class 10th Marksheet", "Class 12th Marksheet", "Category Certificate", "PwD Certificate"],
  documentCount: 7,
  confidence: 1
};

console.log('📋 Fallback Exam Created:');
console.log(`   - ID: ${fallbackExam.id}`);
console.log(`   - Name: ${fallbackExam.name}`);
console.log(`   - Category: ${fallbackExam.category}`);
console.log(`   - Has Schema: ${fallbackExam.hasSchema}`);
console.log(`   - Schema Documents: ${fallbackExam.schema.documents.length}`);
console.log(`   - Document Count: ${fallbackExam.documentCount}`);
console.log(`   - Logo: ${fallbackExam.logo}`);
console.log(`   - Color: ${fallbackExam.color}`);

// Test modal conditions
console.log('\n✅ Modal Compatibility Check:');
console.log(`   - Would show as popular exam: ${fallbackExam.hasSchema || fallbackExam.schema}`);
console.log(`   - Clickable (has ID & name): ${!!fallbackExam.id && !!fallbackExam.name}`);
console.log(`   - Schema indicator: ${(fallbackExam.hasSchema || fallbackExam.schema) ? '✓ Schema Available' : 'No schema'}`);

console.log('\n🎯 Expected Behavior:');
console.log('1. Modal should show "JEE Mains 2025 (Test Mode)" even without server');
console.log('2. Button should be clickable');
console.log('3. Should proceed to upload modal with 7 document requirements');
console.log('4. Console should show fallback loading messages');

console.log('\n✨ Ready to test the fallback system!');