// Test the UI directly by making a request to the text-to-json page
const fetch = require('node-fetch');

async function testTextToJsonPage() {
  try {
    console.log('🌐 Testing text-to-json page...');
    
    const response = await fetch('http://localhost:3000/text-to-json');
    
    if (!response.ok) {
      throw new Error(`Page error: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    console.log('✅ Text-to-json page loaded successfully');
    console.log(`📄 Page size: ${html.length} characters`);
    
    // Check if the page contains expected elements
    const hasTextarea = html.includes('textarea') || html.includes('input');
    const hasConvertButton = html.includes('Convert') || html.includes('convert');
    const hasReactApp = html.includes('__next') || html.includes('react');
    
    console.log(`📝 Contains input field: ${hasTextarea}`);
    console.log(`🔄 Contains convert button: ${hasConvertButton}`);
    console.log(`⚛️  React app detected: ${hasReactApp}`);
    
  } catch (error) {
    console.error('❌ Failed to load text-to-json page:', error.message);
  }
}

testTextToJsonPage();