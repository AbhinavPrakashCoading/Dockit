// Test duplicate detection functionality
const { IndividualFileStorage } = require('./src/lib/individual-file-storage.ts');

console.log('🧪 Testing Duplicate Detection');
console.log('==============================');

const storage = new IndividualFileStorage();

// Test 1: Check for JEE duplicates (should find 1)
console.log('\n📝 Test 1: Check for JEE Mains duplicates');
const jeeDuplicates = storage.checkDuplicates('JEE Mains 2025');
console.log(`   Found ${jeeDuplicates.length} duplicate(s):`);
jeeDuplicates.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
});

// Test 2: Check for UPSC duplicates (should find 3)
console.log('\n📝 Test 2: Check for UPSC duplicates');
const upscDuplicates = storage.checkDuplicates('UPSC Civil Services Examination 2025');
console.log(`   Found ${upscDuplicates.length} duplicate(s):`);
upscDuplicates.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
});

// Test 3: Check for non-existent exam (should find 0)
console.log('\n📝 Test 3: Check for non-existent exam');
const nonExistentDuplicates = storage.checkDuplicates('GATE 2025');
console.log(`   Found ${nonExistentDuplicates.length} duplicate(s)`);

// Test 4: List all documents
console.log('\n📝 Test 4: List all documents');
const allDocs = storage.loadAllDocuments();
console.log(`   Total documents: ${allDocs.length}`);
allDocs.forEach((doc, index) => {
    console.log(`   ${index + 1}. ${doc.examName} (${doc.examType}) - ${doc.filename || 'no filename'}`);
});

console.log('\n✅ Duplicate detection test completed!');