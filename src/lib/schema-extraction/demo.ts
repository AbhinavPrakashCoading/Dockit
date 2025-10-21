/**
 * Schema Extraction Demo Script
 * Demonstrates the schema extraction module with mock data
 */

import { analyzeCustomText, runTests } from './examples';

async function demo() {
  console.log('🚀 Schema Extraction Module Demo\n');
  console.log('=' .repeat(60));

  // Demo 1: Analyze a mock exam notification text
  console.log('\n📋 Demo 1: Analyzing Mock Exam Requirements');
  console.log('-'.repeat(40));

  const mockExamText = `
    IBPS CLERK 2025 RECRUITMENT NOTIFICATION
    
    DOCUMENT UPLOAD REQUIREMENTS:
    
    1. Recent passport size color photograph (JPG/JPEG format, size: 20KB to 50KB, dimensions: 200x230 pixels)
    2. Signature in black ink (JPG/JPEG format, maximum size: 40KB, dimensions: 140x60 pixels)  
    3. Left thumb impression (JPG format, maximum 40KB)
    4. Educational marksheets (PDF format, maximum size: 500KB each)
    5. Caste certificate if applicable (PDF format, maximum 300KB)
    
    Note: All documents are mandatory except caste certificate.
  `;

  try {
    const schema = await analyzeCustomText(mockExamText);
    
    console.log('✅ Extraction Result:');
    console.log(`📝 Exam: ${schema.exam}`);
    console.log(`📊 Confidence: ${schema.metadata?.confidence}`);
    console.log(`📄 Documents Found: ${schema.documents.length}\n`);

    schema.documents.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.type}`);
      console.log(`   📎 Formats: ${doc.requirements.format?.join(', ') || 'Not specified'}`);
      console.log(`   📏 Max Size: ${doc.requirements.maxSize || 'Not specified'}`);
      console.log(`   📐 Dimensions: ${doc.requirements.dimensions ? 
        `${doc.requirements.dimensions.width}x${doc.requirements.dimensions.height}` : 'Not specified'}`);
      console.log(`   ⚠️  Mandatory: ${doc.requirements.mandatory ? 'Yes' : 'No'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }

  console.log('=' .repeat(60));

  // Demo 2: Show the full JSON schema
  console.log('\n📄 Demo 2: Complete JSON Schema Output');
  console.log('-'.repeat(40));

  try {
    const fullSchema = await analyzeCustomText(mockExamText);
    console.log(JSON.stringify(fullSchema, null, 2));
  } catch (error) {
    console.error('❌ JSON demo failed:', error);
  }

  console.log('\n' + '=' .repeat(60));

  // Demo 3: Run comprehensive tests
  console.log('\n🧪 Demo 3: Running Comprehensive Tests');
  console.log('-'.repeat(40));

  try {
    await runTests();
  } catch (error) {
    console.error('❌ Tests failed:', error);
  }

  console.log('\n✨ Demo completed! The module is ready for use.');
  console.log('\nTo use with real URLs:');
  console.log('```typescript');
  console.log('import { generateSchemaFromLink } from "./src/lib/schema-extraction";');
  console.log('');
  console.log('const schema = await generateSchemaFromLink("https://ibpsonline.ibps.in/clerk25");');
  console.log('console.log(schema);');
  console.log('```');
}

// Run the demo
if (require.main === module) {
  demo().catch(console.error);
}

export { demo };