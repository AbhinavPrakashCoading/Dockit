/**
 * Test Schema Loading Functionality
 * This script tests whether the upload modal correctly loads schema-specific requirements
 */

const { getExamSchema } = require('./src/features/exam/optimizedExamRegistry');

async function testSchemaLoading() {
  console.log('🧪 Testing Schema Loading Functionality...\n');

  const testExams = ['upsc-cse', 'jee-main', 'ielts', 'cat'];

  for (const examId of testExams) {
    try {
      console.log(`📋 Testing ${examId}...`);
      const schema = await getExamSchema(examId);
      
      if (schema) {
        console.log(`✅ Schema loaded for ${examId}`);
        console.log(`   Requirements: ${schema.requirements?.length || 0} documents`);
        
        if (schema.requirements && schema.requirements.length > 0) {
          console.log('   Document types:');
          schema.requirements.forEach(req => {
            console.log(`     - ${req.displayName} (${req.mandatory ? 'Required' : 'Optional'})`);
            if (req.format) console.log(`       Format: ${req.format}`);
            if (req.maxSizeKB) console.log(`       Max Size: ${req.maxSizeKB}KB`);
          });
        }
      } else {
        console.log(`❌ No schema found for ${examId}`);
      }
      console.log('');
    } catch (error) {
      console.log(`❌ Error loading schema for ${examId}:`, error.message);
    }
  }

  console.log('🏁 Schema loading test completed!\n');
  
  console.log('📊 Analysis:');
  console.log('   - If schemas show different requirements, the modal will display exam-specific fields');
  console.log('   - If schemas show similar generic fields, the schemas need more detailed requirements');
  console.log('   - The upload modal should now load schema data dynamically instead of using fallback');
}

// Run the test
testSchemaLoading().catch(console.error);