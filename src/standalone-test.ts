// Standalone test for Schema Extraction Engine
import { generateExamSchema } from './engines/schema-extraction';

async function testSchemaExtraction() {
  console.log('🚀 Testing Schema Extraction Engine...\n');
  
  try {
    console.log('Generating schema for IBPS Clerk 2025...');
    const schema = await generateExamSchema('ibps-clerk-2025', {
      maxSearchResults: 3,
      timeout: 15000
    });
    
    console.log('✅ Schema generated successfully!');
    console.log('\n📋 Generated Schema:');
    console.log(JSON.stringify(schema, null, 2));
    
    return schema;
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

// Run the test
testSchemaExtraction().then(() => {
  console.log('\n🎉 Test completed!');
}).catch(console.error);