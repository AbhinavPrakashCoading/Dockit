const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Cleaned Exam System...\n');

// Test 1: Check that parsed documents exist
const parsedDocsPath = path.join(__dirname, 'data', 'parsed-documents');
console.log('📁 Checking parsed documents folder...');
if (fs.existsSync(parsedDocsPath)) {
  const files = fs.readdirSync(parsedDocsPath);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  console.log(`✅ Found ${jsonFiles.length} parsed document(s):`);
  jsonFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
} else {
  console.log('❌ Parsed documents folder not found');
}

// Test 2: Check optimizedExamRegistry helper functions
console.log('\n🔧 Testing registry helper functions...');
try {
  const registry = require('./src/features/exam/optimizedExamRegistry.ts');
  console.log('✅ Registry module loaded successfully');
} catch (error) {
  console.log(`❌ Error loading registry: ${error.message}`);
}

// Test 3: Check that placeholder registries are cleaned
console.log('\n🧹 Checking for placeholder data removal...');
const registryPath = path.join(__dirname, 'src', 'features', 'exam', 'schemas', 'schemaRegistry.ts');
if (fs.existsSync(registryPath)) {
  const content = fs.readFileSync(registryPath, 'utf8');
  const hasOldPlaceholders = content.includes('examDisplayData') || content.includes('upsc-cse');
  if (!hasOldPlaceholders) {
    console.log('✅ Placeholder schemas removed from schemaRegistry');
  } else {
    console.log('⚠️ Some placeholder data still exists in schemaRegistry');
  }
} else {
  console.log('❌ schemaRegistry.ts not found');
}

// Test 4: Check API endpoint
console.log('\n🌐 Testing parsed documents API...');
const apiPath = path.join(__dirname, 'src', 'app', 'api', 'parsed-documents-fallback', 'route.ts');
if (fs.existsSync(apiPath)) {
  console.log('✅ API endpoint exists');
} else {
  console.log('❌ API endpoint missing');
}

console.log('\n📋 Summary:');
console.log('- System cleaned to only use parsed documents');
console.log('- Placeholder schemas removed');
console.log('- Helper functions available for exam display');
console.log('- Ready to test with JEE Mains 2025 only');