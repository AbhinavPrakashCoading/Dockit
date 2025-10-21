#!/usr/bin/env node

/**
 * Color Theme and Tint Test
 * 
 * Verifies that all buttons have proper color themes, tints, and outlines
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Testing Button Color Themes and Tints...\n');

// Test color themes for both components
const colorTests = [
  {
    name: 'Overview - Quick Actions Color Themes',
    path: './src/components/dashboard/sections/Overview.tsx',
    expected: [
      {
        pattern: 'from-purple-500 to-purple-600',
        description: 'Upload button - Purple gradient'
      },
      {
        pattern: 'from-emerald-500 to-emerald-600', 
        description: 'Generate ZIP button - Emerald gradient'
      },
      {
        pattern: 'from-blue-500 to-blue-600',
        description: 'Documents button - Blue gradient'
      },
      {
        pattern: 'from-orange-500 to-orange-600',
        description: 'Analytics button - Orange gradient'
      }
    ]
  },
  {
    name: 'FastOverview - Action Cards Color Themes',
    path: './src/components/dashboard/components/FastOverview.tsx',
    expected: [
      {
        pattern: 'border-purple-300 hover:bg-purple-50',
        description: 'Upload button - Purple theme'
      },
      {
        pattern: 'bg-purple-100',
        description: 'Upload icon background - Purple'
      },
      {
        pattern: 'border-blue-300 hover:bg-blue-50',
        description: 'Documents button - Blue theme'
      },
      {
        pattern: 'bg-blue-100',
        description: 'Documents icon background - Blue'
      },
      {
        pattern: 'border-orange-300 hover:bg-orange-50',
        description: 'Analytics button - Orange theme'
      },
      {
        pattern: 'bg-orange-100',
        description: 'Analytics icon background - Orange'
      }
    ]
  }
];

let allTestsPassed = true;
let totalTests = 0;
let passedTests = 0;

// Run color theme tests
colorTests.forEach(component => {
  console.log(`📄 Testing ${component.name}...`);
  
  try {
    const content = fs.readFileSync(path.resolve(component.path), 'utf8');
    let componentPassed = 0;
    let componentTotal = component.expected.length;
    totalTests += componentTotal;
    
    component.expected.forEach(test => {
      if (content.includes(test.pattern)) {
        console.log(`  ✅ ${test.description}`);
        componentPassed++;
        passedTests++;
      } else {
        console.log(`  ❌ ${test.description} - Missing: "${test.pattern}"`);
        allTestsPassed = false;
      }
    });
    
    console.log(`  📊 Score: ${componentPassed}/${componentTotal}\n`);
    
  } catch (error) {
    console.log(`  ❌ Error reading file: ${error.message}\n`);
    allTestsPassed = false;
  }
});

// Check for white text on colored backgrounds
console.log('🔍 Checking Text Colors...');

const textColorTests = [
  {
    file: './src/components/dashboard/sections/Overview.tsx',
    pattern: 'text-white',
    count: 4, // Should have 4 buttons with white text
    description: 'Overview buttons with white text on colored backgrounds'
  }
];

textColorTests.forEach(test => {
  try {
    const content = fs.readFileSync(path.resolve(test.file), 'utf8');
    const matches = (content.match(new RegExp(test.pattern, 'g')) || []).length;
    
    if (matches >= test.count) {
      console.log(`  ✅ ${test.description} (${matches} found)`);
    } else {
      console.log(`  ❌ ${test.description} (${matches}/${test.count} found)`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`  ❌ Error checking ${test.description}: ${error.message}`);
    allTestsPassed = false;
  }
});

// Summary
console.log('\n📋 Color Theme Test Summary');
console.log('============================');
console.log(`Tests: ${passedTests}/${totalTests} passed`);

if (allTestsPassed) {
  console.log('🎉 All color themes and tints are perfect!');
  console.log('\n🎨 Color Scheme Implemented:');
  console.log('  • Upload Actions: Purple gradients/themes');
  console.log('  • Document Actions: Blue gradients/themes');  
  console.log('  • Package Actions: Emerald gradients/themes');
  console.log('  • Analytics Actions: Orange gradients/themes');
  console.log('\n✨ Visual Features:');
  console.log('  • Overview: Gradient backgrounds with white text');
  console.log('  • FastOverview: Colored borders, backgrounds, and icons');
  console.log('  • Consistent color coding across both components');
  console.log('  • Professional tints and hover effects');
  console.log('\n🚀 All buttons now have distinctive color themes!');
} else {
  console.log('❌ Some color themes are missing. Please check the implementation.');
}

console.log('\n🎯 Analytics button now has beautiful orange tint and outline! 🧡');