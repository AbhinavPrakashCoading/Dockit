/**
 * Test Script for Schema Extraction Debugging
 * Tests different URLs to ensure unique schemas are generated
 */

const { analyzeCustomText } = require('./src/lib/schema-extraction/examples');

// Mock different exam scenarios
const testCases = [
  {
    name: "IBPS Clerk",
    text: `
      IBPS CLERK 2025 RECRUITMENT NOTIFICATION
      Document Upload Requirements:
      1. Recent passport size color photograph (JPG/JPEG format, size: 20KB to 50KB, dimensions: 200x230 pixels)
      2. Signature in black ink (JPG/JPEG format, maximum size: 40KB, dimensions: 140x60 pixels)
      3. Left thumb impression (JPG format, maximum 40KB)
      4. Educational marksheets (PDF format, maximum size: 500KB each)
    `
  },
  {
    name: "SBI PO",
    text: `
      SBI PO 2025 APPLICATION FORM
      Upload Documents:
      - Color photograph (JPEG only, 4KB to 40KB, 200x200 pixels minimum)
      - Handwritten signature (JPEG, max 30KB, 140x60 pixels)
      - Category certificate (PDF format, up to 300KB)
      - Educational certificates (PDF, maximum 1MB per file)
    `
  },
  {
    name: "UPSC CSE",
    text: `
      UPSC CIVIL SERVICES EXAMINATION 2025
      Document Requirements:
      - Recent photograph (JPG/PNG, 3KB-50KB, passport size)
      - Digital signature (JPG only, 1KB-30KB)
      - Identity proof (PDF, maximum 2MB)
      - Address proof (PDF format, up to 1MB)
      - Educational qualification certificates (PDF, max 500KB each)
    `
  },
  {
    name: "Generic Page",
    text: `
      Welcome to our website. This is a generic page with no specific document requirements.
      We offer various services and solutions. Contact us for more information.
      Our team is here to help you with your needs.
    `
  }
];

async function runTests() {
  console.log('🧪 Testing Schema Extraction with Different Content\n');
  console.log('=' .repeat(60));

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log('-'.repeat(30));

    try {
      const schema = await analyzeCustomText(testCase.text);
      
      console.log(`✅ Exam: ${schema.exam}`);
      console.log(`📊 Confidence: ${schema.metadata?.confidence || 0}`);
      console.log(`📄 Documents: ${schema.documents.length}`);
      
      if (schema.documents.length > 0) {
        schema.documents.forEach((doc, index) => {
          console.log(`   ${index + 1}. ${doc.type} (${doc.requirements.format?.join(', ') || 'no format'}) - ${doc.requirements.maxSize || 'no size limit'}`);
        });
      } else {
        console.log('   ⚠️ No documents found');
      }

    } catch (error) {
      console.error(`❌ Failed to analyze ${testCase.name}:`, error.message);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🎯 Test completed! Each exam should have unique schemas.');
}

// Run the tests
runTests().catch(console.error);