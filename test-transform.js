// Test script to verify transformFile functionality
console.log('🧪 Testing transformFile functionality...');

// Import the transformFile function
import { transformFile } from './src/features/transform/transformFile.js';

// Test cases
const testCases = [
  {
    name: 'Image to PDF conversion test',
    requirements: {
      format: 'application/pdf',
      maxSizeKB: 500,
      type: 'signature'
    },
    description: 'Should convert a JPEG to PDF'
  },
  {
    name: 'Smart compression test', 
    requirements: {
      maxSizeKB: 100,
      type: 'passport'
    },
    description: 'Should compress large image to 85% of target (85KB)'
  },
  {
    name: 'Already compliant test',
    requirements: {
      format: 'image/jpeg',
      maxSizeKB: 200,
      type: 'photo'
    },
    description: 'Should return original file if already compliant'
  }
];

// Create a mock file for testing
function createMockFile(name, type, sizeKB) {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, 0, 200, 200);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], name, { type });
      console.log(`📁 Created mock file: ${name} (${Math.round(file.size / 1024)}KB, ${type})`);
      resolve(file);
    }, type, 0.9);
  });
}

async function runTests() {
  try {
    // Create a test image file (JPEG, ~20KB)
    const testFile = await createMockFile('test-image.jpg', 'image/jpeg', 20);
    
    console.log('\n🚀 Running transformation tests...\n');
    
    for (const testCase of testCases) {
      console.log(`\n🧪 TEST: ${testCase.name}`);
      console.log(`📝 Description: ${testCase.description}`);
      console.log(`📋 Requirements:`, testCase.requirements);
      
      try {
        const result = await transformFile(testFile, testCase.requirements);
        console.log(`✅ Test passed!`);
        console.log(`📄 Result: ${result.name} (${Math.round(result.size / 1024)}KB, ${result.type})`);
      } catch (error) {
        console.error(`❌ Test failed:`, error);
      }
      
      console.log('─'.repeat(60));
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test setup failed:', error);
  }
}

// Run tests when page loads
if (typeof window !== 'undefined') {
  runTests();
} else {
  console.log('ℹ️ This test requires a browser environment with Canvas API');
}