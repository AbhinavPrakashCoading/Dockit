/**
 * Test script for Schema Engine Demo
 */

console.log('Testing Schema Engine Demo API...');

// Test the API endpoint
async function testSchemaAPI() {
  try {
    const baseUrl = 'http://localhost:3000';
    
    console.log('Testing sources endpoint...');
    const sourcesResponse = await fetch(`${baseUrl}/api/schema-discovery?action=sources`);
    const sourcesData = await sourcesResponse.json();
    console.log('Sources:', sourcesData.success ? 'OK' : 'FAILED');
    
    console.log('Testing schemas endpoint...');
    const schemasResponse = await fetch(`${baseUrl}/api/schema-discovery?action=schemas`);
    const schemasData = await schemasResponse.json();
    console.log('Schemas:', schemasData.success ? 'OK' : 'FAILED');
    
    console.log('Testing discovery endpoint...');
    const discoveryResponse = await fetch(`${baseUrl}/api/schema-discovery?action=discover`);
    const discoveryData = await discoveryResponse.json();
    console.log('Discovery:', discoveryData.success ? 'OK' : 'FAILED');
    
    console.log('Testing manual generation...');
    const generateResponse = await fetch(`${baseUrl}/api/schema-discovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_schema',
        data: { url: 'https://test.com/form', source: 'Test' }
      })
    });
    const generateData = await generateResponse.json();
    console.log('Manual Generation:', generateData.success ? 'OK' : 'FAILED');
    
    console.log('\nAll tests completed!');
    console.log('\nTo access the demo:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Navigate to: http://localhost:3000/demo/schema-engine');
    
  } catch (error) {
    console.error('Test failed:', error);
    console.log('\nMake sure the development server is running first!');
  }
}

// Run if server is available
if (typeof fetch !== 'undefined') {
  testSchemaAPI();
} else {
  console.log('This script requires a server environment to test the API.');
  console.log('\nTo test the Schema Engine Demo:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Navigate to: http://localhost:3000/demo/schema-engine');
  console.log('3. Use the interface to:');
  console.log('   - Run automatic discovery');
  console.log('   - Start/stop auto discovery');
  console.log('   - Generate schemas manually');
  console.log('   - View discovered schemas and their details');
}