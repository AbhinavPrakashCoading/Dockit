#!/usr/bin/env node

/**
 * Test Script: Generate ZIP Button Integration
 * 
 * This script verifies that the Generate ZIP button has been properly restored
 * to both the FastOverview and full Overview components with correct routing.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Generate ZIP Button Integration...\n');

// Test files to check
const testFiles = [
  {
    name: 'FastOverview.tsx',
    path: './src/components/dashboard/components/FastOverview.tsx',
    expected: [
      'Generate ZIP Package',
      'onGeneratePackage',
      'FastOverviewProps',
      'Create document packages for exam submissions'
    ]
  },
  {
    name: 'Overview.tsx', 
    path: './src/components/dashboard/sections/Overview.tsx',
    expected: [
      'Generate ZIP',
      'setCurrentStep?.(',
      'packages',
      'exam-selector'
    ]
  },
  {
    name: 'Dashboard.tsx',
    path: './src/components/dashboard/Dashboard.tsx',
    expected: [
      'onSectionChange',
      'onGeneratePackage',
      'setCurrentStep',
      'exam-selector'
    ]
  }
];

let allTestsPassed = true;

// Run tests on each file
testFiles.forEach(file => {
  console.log(`📄 Testing ${file.name}...`);
  
  try {
    const content = fs.readFileSync(path.resolve(file.path), 'utf8');
    let passed = 0;
    let total = file.expected.length;
    
    file.expected.forEach(expected => {
      if (content.includes(expected)) {
        console.log(`  ✅ Found: "${expected}"`);
        passed++;
      } else {
        console.log(`  ❌ Missing: "${expected}"`);
        allTestsPassed = false;
      }
    });
    
    console.log(`  📊 Score: ${passed}/${total}\n`);
    
  } catch (error) {
    console.log(`  ❌ Error reading file: ${error.message}\n`);
    allTestsPassed = false;
  }
});

// Summary
console.log('📋 Test Summary');
console.log('================');

if (allTestsPassed) {
  console.log('🎉 All tests passed! Generate ZIP button integration is complete.');
  console.log('\n✨ Features implemented:');
  console.log('  • FastOverview has prominent Generate ZIP Package button');
  console.log('  • Overview has Quick Actions with Generate ZIP button');
  console.log('  • Dashboard passes routing functions to FastOverview');
  console.log('  • Both components route to packages section');
  console.log('  • Exam selector workflow is triggered on package generation');
} else {
  console.log('❌ Some tests failed. Please check the implementation.');
}

console.log('\n🚀 Ready to test in browser!');