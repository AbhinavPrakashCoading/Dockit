// Test the fixed API route
const testUrls = [
  'https://ibpsonline.ibps.in/clerk25',
  'https://sbi.co.in/careers',
  'https://upsconline.nic.in',
  'https://rrb.gov.in/ntpc'
];

async function testSchemaExtraction() {
  console.log('🧪 Testing Schema Extraction API...\n');
  
  for (const url of testUrls) {
    try {
      const response = await fetch('/api/extract-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });
      
      const schema = await response.json();
      
      console.log(`URL: ${url}`);
      console.log(`Exam: ${schema.exam}`);
      console.log(`Documents: ${schema.documents.length}`);
      console.log(`First document: ${schema.documents[0]?.type || 'None'}`);
      console.log(`Photo format: ${schema.documents.find(d => d.type === 'Photo')?.requirements.format.join(', ') || 'Not found'}`);
      console.log('---');
      
    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error);
    }
  }
}

// Test when document loads
document.addEventListener('DOMContentLoaded', testSchemaExtraction);

console.log('📋 API Test Script Loaded - check console for results when page loads');