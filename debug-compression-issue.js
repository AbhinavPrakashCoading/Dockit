/**
 * Debug compressImageWithSchema Issue
 * 
 * This script will help us identify why compressImageWithSchema is failing
 */

// Mock File for testing
class MockFile {
  constructor(name, size) {
    this.name = name;
    this.size = size;
    this.type = 'image/jpeg';
    this.lastModified = Date.now();
  }
}

async function debugCompression() {
  console.log('🔍 DEBUGGING COMPRESSION ISSUE\n');
  
  // Test the exact same call that's failing
  const testFile = new MockFile('test-signature.jpg', 150 * 1024); // 150KB
  const maxSizeKB = 30;
  
  console.log(`📁 Test File: ${testFile.name} (${(testFile.size / 1024).toFixed(1)}KB)`);
  console.log(`🎯 Target Size: ${maxSizeKB}KB`);
  
  // Test the requirements object format
  const requirements = {
    maxSize: `${maxSizeKB}KB`
  };
  
  console.log(`📋 Requirements:`, requirements);
  
  // Test parseSizeToBytes function
  console.log('\n🧪 Testing parseSizeToBytes:');
  console.log(`   parseSizeToBytes("${requirements.maxSize}") should return:`, maxSizeKB * 1024);
  
  // Test the regex pattern
  const sizeStr = requirements.maxSize;
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB)?$/i);
  console.log(`   Regex match for "${sizeStr}":`, match);
  
  if (match) {
    const value = parseFloat(match[1]);
    const unit = (match[2] || 'B').toUpperCase();
    console.log(`   Parsed value: ${value}, unit: ${unit}`);
    
    switch (unit) {
      case 'KB': 
        const result = value * 1024;
        console.log(`   Final result: ${result} bytes`);
        break;
      default:
        console.log(`   Unit ${unit} not handled`);
    }
  } else {
    console.log(`   ❌ NO MATCH - This could be the issue!`);
  }
  
  console.log('\n🎯 Potential Issues:');
  console.log('   1. parseSizeToBytes might be throwing an error');
  console.log('   2. compressImageWithSchema might not be imported correctly');
  console.log('   3. One of the dependency functions might be failing');
  console.log('   4. The function might be returning undefined instead of a result object');
  
  console.log('\n🔧 Recommended Fixes:');
  console.log('   1. Add try-catch around parseSizeToBytes call');
  console.log('   2. Add validation for requirements object');
  console.log('   3. Ensure all imports are working correctly');
  console.log('   4. Add more detailed error logging');
}

debugCompression().catch(console.error);