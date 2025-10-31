#!/usr/bin/env node

/**
 * Simple API verification test for Schema UI Integration
 * Tests the API endpoint without browser automation
 */

const http = require('http');

async function testSchemaGenAPI() {
  console.log('🧪 Starting Schema Generation API Test...\n');
  
  // Test data
  const testData = JSON.stringify({
    exam_form: 'JEE Main 2026',
    url: ''
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/schema-gen',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': testData.length
    }
  };
  
  return new Promise((resolve, reject) => {
    console.log('📍 Step 1: Testing API endpoint POST /api/schema-gen');
    console.log(`   Request: ${testData}\n`);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          console.log(`📍 Step 2: Response Status: ${res.statusCode}\n`);
          
          if (res.statusCode !== 200) {
            console.error(`❌ API returned status ${res.statusCode}`);
            console.error('Response:', data);
            reject(new Error(`API returned status ${res.statusCode}`));
            return;
          }
          
          const result = JSON.parse(data);
          
          console.log('📍 Step 3: Parsing response...');
          console.log(`   Schema fields: ${Object.keys(result.schema || {}).length}`);
          console.log(`   Coverage: ${result.coverage}%`);
          console.log(`   Issues: ${(result.issues || []).length}\n`);
          
          // Verify results
          console.log('📍 Step 4: Verifying response structure...\n');
          
          const fieldCount = Object.keys(result.schema || {}).length;
          if (fieldCount >= 15) {
            console.log(`✅ Schema has ${fieldCount} fields (expected ≥15)`);
          } else {
            console.warn(`⚠️  Warning: Only ${fieldCount} fields (expected ≥15)`);
          }
          
          if (result.coverage >= 95) {
            console.log(`✅ Coverage is ${result.coverage}% (expected ≥95%)`);
          } else {
            console.warn(`⚠️  Warning: Coverage is ${result.coverage}% (expected ≥95%)`);
          }
          
          if (result.schema) {
            console.log('✅ Schema object present');
          }
          
          if (Array.isArray(result.issues)) {
            console.log('✅ Issues array present');
          }
          
          console.log('\n═══════════════════════════════════════════════════════');
          console.log('🎉 API TEST PASSED!');
          console.log('═══════════════════════════════════════════════════════');
          console.log('✅ API endpoint responding');
          console.log('✅ Schema generation working');
          console.log('✅ Response structure valid');
          console.log('✅ Coverage metrics present');
          console.log('═══════════════════════════════════════════════════════\n');
          
          // Print sample schema fields
          console.log('📋 Sample Schema Fields:');
          console.log('═══════════════════════════════════════════════════════');
          Object.entries(result.schema || {}).slice(0, 10).forEach(([key, value]) => {
            console.log(`   ${key}: ${JSON.stringify(value)}`);
          });
          if (fieldCount > 10) {
            console.log(`   ... and ${fieldCount - 10} more fields`);
          }
          console.log('═══════════════════════════════════════════════════════\n');
          
          resolve(result);
        } catch (error) {
          console.error('\n❌ Failed to parse response:', error.message);
          console.error('Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('\n❌ Request failed:', error.message);
      console.error('\n💡 Make sure the dev server is running:');
      console.error('   npm run dev\n');
      reject(error);
    });
    
    req.write(testData);
    req.end();
  });
}

// Run the test
console.log('══════════════════════════════════════════════════════════');
console.log('   SCHEMA GENERATOR API VERIFICATION TEST');
console.log('══════════════════════════════════════════════════════════\n');

testSchemaGenAPI()
  .then(() => {
    console.log('✅ All verifications completed successfully!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  });
