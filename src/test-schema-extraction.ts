// Test file for Schema Extraction Engine

import { generateExamSchema } from './engines/schema-extraction';

async function testSchemaExtraction() {
  console.log('🧪 Testing Schema Extraction Engine\n');

  // Test cases
  const testCases = [
    'ibps-clerk-2025',
    'ssc-cgl-2025',
    'rrb-ntpc-2025',
    'upsc-cse-2025'
  ];

  for (const examName of testCases) {
    console.log(`\n🔍 Testing: ${examName}`);
    console.log('='.repeat(50));
    
    try {
      const startTime = Date.now();
      
      const schema = await generateExamSchema(examName, {
        maxSearchResults: 5,
        timeout: 30000,
        includeOfficialOnly: true,
        preferPdfs: true
      });
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log(`✅ Schema generated in ${duration.toFixed(2)}s`);
      console.log('\n📋 Generated Schema:');
      console.log(JSON.stringify(schema, null, 2));
      
      // Validate the schema
      if (schema.documents && schema.documents.length > 0) {
        console.log(`\n📊 Summary: Found ${schema.documents.length} document requirements`);
        schema.documents.forEach((doc: any, index: number) => {
          console.log(`  ${index + 1}. ${doc.type.toUpperCase()}`);
          if (doc.requirements.format) {
            console.log(`     - Formats: ${doc.requirements.format.join(', ')}`);
          }
          if (doc.requirements.size_kb) {
            const size = doc.requirements.size_kb;
            console.log(`     - Size: ${size.min ? `${size.min}-${size.max}` : `Max ${size.max}`} KB`);
          }
          if (doc.requirements.dimensions) {
            console.log(`     - Dimensions: ${doc.requirements.dimensions}`);
          }
        });
      }
      
    } catch (error) {
      console.error(`❌ Test failed for ${examName}:`, error);
    }
  }
}

// Test individual components
async function testComponents() {
  console.log('\n🔧 Testing Individual Components\n');
  
  try {
    // Test SearchLayer
    console.log('Testing SearchLayer...');
    const { SearchLayer } = await import('./engines/schema-extraction');
    const searchLayer = new SearchLayer();
    
    const queries = searchLayer.generateSearchQueries('ibps-clerk-2025');
    console.log(`✅ Generated ${queries.length} search queries`);
    
    // Test ContentExtractor
    console.log('Testing ContentExtractor...');
    const { ContentExtractor } = await import('./engines/schema-extraction');
    const extractor = new ContentExtractor();
    
    const isAccessible = await extractor.isUrlAccessible('https://www.ibps.in');
    console.log(`✅ URL accessibility test: ${isAccessible ? 'PASS' : 'FAIL'}`);
    
    // Test SchemaBuilder
    console.log('Testing SchemaBuilder...');
    const { SchemaBuilder } = await import('./engines/schema-extraction');
    const builder = new SchemaBuilder();
    
    const testSchema = builder.buildExamSchema('Test Exam', [], []);
    const validation = builder.validateSchema(testSchema);
    console.log(`✅ Schema validation test: ${validation.isValid ? 'PASS' : 'FAIL'}`);
    
  } catch (error) {
    console.error('❌ Component testing failed:', error);
  }
}

// Performance test
async function performanceTest() {
  console.log('\n⚡ Performance Testing\n');
  
  const trials = 3;
  const examName = 'ibps-clerk-2025';
  const times: number[] = [];
  
  for (let i = 1; i <= trials; i++) {
    console.log(`Trial ${i}/${trials}...`);
    
    const startTime = Date.now();
    
    try {
      await generateExamSchema(examName, {
        maxSearchResults: 3,
        timeout: 20000
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      times.push(duration);
      
      console.log(`  ✅ Completed in ${(duration / 1000).toFixed(2)}s`);
      
    } catch (error) {
      console.log(`  ❌ Failed: ${error}`);
    }
  }
  
  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log('\n📈 Performance Summary:');
    console.log(`  Average: ${(avgTime / 1000).toFixed(2)}s`);
    console.log(`  Fastest: ${(minTime / 1000).toFixed(2)}s`);
    console.log(`  Slowest: ${(maxTime / 1000).toFixed(2)}s`);
  }
}

// Error handling test
async function errorHandlingTest() {
  console.log('\n🛡️ Error Handling Testing\n');
  
  const errorCases = [
    '', // Empty exam name
    'invalid-exam-12345', // Non-existent exam
    'test exam with spaces', // Spaces in name
  ];
  
  for (const examName of errorCases) {
    console.log(`Testing error case: "${examName}"`);
    
    try {
      const schema = await generateExamSchema(examName, {
        maxSearchResults: 2,
        timeout: 10000
      });
      
      console.log(`  ✅ Handled gracefully - Generated fallback schema with ${schema.documents.length} documents`);
      
    } catch (error) {
      console.log(`  ❌ Unhandled error: ${error}`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Schema Extraction Engine Tests');
  console.log('='.repeat(60));
  
  try {
    await testComponents();
    await testSchemaExtraction();
    await performanceTest();
    await errorHandlingTest();
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
  }
}

// Export for external use
export {
  testSchemaExtraction,
  testComponents,
  performanceTest,
  errorHandlingTest,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}