#!/usr/bin/env node
/**
 * Smoke test for /api/schema-gen endpoint
 * Verifies: 200 status, coverage >95%, <30s response time
 */

const http = require('http');
const https = require('https');

const TEST_URL = process.env.TEST_URL || 'http://localhost:3000/api/schema-gen';
const TIMEOUT_MS = 30000; // 30 seconds
const MIN_COVERAGE = 95;

async function testSchemaGen() {
  console.log('🧪 Testing /api/schema-gen endpoint...');
  console.log(`📍 URL: ${TEST_URL}`);
  
  const startTime = Date.now();
  
  const payload = JSON.stringify({
    exam_form: 'JEE',
    url: 'https://jeemain.nta.nic.in/webinfo2024/File/GetFile?FileId=9&LangId=P'
  });

  const url = new URL(TEST_URL);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: TIMEOUT_MS
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        console.log(`\n✅ Response received in ${duration.toFixed(2)}s`);
        console.log(`📊 HTTP Status: ${res.statusCode}`);

        try {
          const response = JSON.parse(data);
          
          // Assertions
          const assertions = {
            status: res.statusCode === 200,
            responseTime: duration < 30,
            coverage: response.coverage >= MIN_COVERAGE,
            success: response.success === true,
            schema: response.schema && Object.keys(response.schema).length > 0
          };

          console.log('\n📋 Test Results:');
          console.log(`  ✓ Status 200: ${assertions.status ? '✅' : '❌'} (${res.statusCode})`);
          console.log(`  ✓ Response < 30s: ${assertions.responseTime ? '✅' : '❌'} (${duration.toFixed(2)}s)`);
          console.log(`  ✓ Coverage >95%: ${assertions.coverage ? '✅' : '❌'} (${response.coverage}%)`);
          console.log(`  ✓ Success flag: ${assertions.success ? '✅' : '❌'}`);
          console.log(`  ✓ Schema fields: ${assertions.schema ? '✅' : '❌'} (${response.schema ? Object.keys(response.schema).length : 0} fields)`);

          if (response.issues && response.issues.length > 0) {
            console.log(`\n⚠️  Issues detected:`);
            response.issues.forEach(issue => console.log(`    - ${issue}`));
          }

          const allPassed = Object.values(assertions).every(v => v);
          
          if (allPassed) {
            console.log('\n🎉 All tests passed!');
            resolve(response);
          } else {
            console.log('\n❌ Some tests failed!');
            reject(new Error('Test assertions failed'));
          }

        } catch (error) {
          console.error('❌ Failed to parse response:', error.message);
          console.log('Raw response:', data.substring(0, 500));
          reject(error);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      console.error(`❌ Request timeout after ${TIMEOUT_MS}ms`);
      reject(new Error('Request timeout'));
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

// Run test
testSchemaGen()
  .then(() => {
    console.log('\n✅ Smoke test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Smoke test failed:', error.message);
    process.exit(1);
  });
