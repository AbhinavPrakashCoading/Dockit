#!/usr/bin/env node

/**
 * Logo Integration Test
 * 
 * Verifies that the DocKit brand logos have been properly integrated
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Testing DocKit Logo Integration...\n');

// Test components and files
const testTargets = [
  {
    name: 'DockitLogo Component',
    path: './src/components/DockitLogo.tsx',
    expected: [
      'DockitLogo',
      '/logos/main/dockit-icon.png',
      'from-purple-600 to-blue-600',
      'onError'
    ]
  },
  {
    name: 'Dashboard Sidebar',
    path: './src/components/dashboard/DashboardSidebar.tsx',
    expected: [
      'DockitLogo',
      'DocKit',
      'import { DockitLogo }',
      'variant="icon"'
    ]
  },
  {
    name: 'App Layout',
    path: './src/app/layout.tsx',
    expected: [
      'DocKit - Document Intelligence Platform',
      '#8B5CF6',
      'title: \'DocKit\'',
      'apple-mobile-web-app-title'
    ]
  },
  {
    name: 'SVG Placeholder',
    path: './public/logos/main/dockit-icon.svg',
    expected: [
      'linearGradient',
      '#8B5CF6',
      '#3B82F6',
      'viewBox="0 0 512 512"'
    ]
  }
];

let allTestsPassed = true;
let totalTests = 0;
let passedTests = 0;

// Run tests
testTargets.forEach(target => {
  console.log(`📄 Testing ${target.name}...`);
  
  try {
    const content = fs.readFileSync(path.resolve(target.path), 'utf8');
    let targetPassed = 0;
    let targetTotal = target.expected.length;
    totalTests += targetTotal;
    
    target.expected.forEach(expected => {
      if (content.includes(expected)) {
        console.log(`  ✅ Found: "${expected}"`);
        targetPassed++;
        passedTests++;
      } else {
        console.log(`  ❌ Missing: "${expected}"`);
        allTestsPassed = false;
      }
    });
    
    console.log(`  📊 Score: ${targetPassed}/${targetTotal}\n`);
    
  } catch (error) {
    console.log(`  ❌ Error reading file: ${error.message}\n`);
    allTestsPassed = false;
  }
});

// File structure test
console.log('📁 Testing File Structure...');
const requiredDirs = [
  './public/logos',
  './public/logos/main'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(path.resolve(dir))) {
    console.log(`  ✅ Directory exists: ${dir}`);
  } else {
    console.log(`  ❌ Directory missing: ${dir}`);
    allTestsPassed = false;
  }
});

// Summary
console.log('\n📋 Logo Integration Summary');
console.log('============================');
console.log(`Tests: ${passedTests}/${totalTests} passed`);

if (allTestsPassed) {
  console.log('🎉 Logo integration is complete!');
  console.log('\n✨ Features implemented:');
  console.log('  • DockitLogo component with fallbacks');
  console.log('  • Dashboard sidebar uses brand logo');
  console.log('  • App metadata updated for DocKit brand');
  console.log('  • Purple gradient theme (#8B5CF6) applied');
  console.log('  • SVG placeholder created');
  console.log('\n📝 Next Steps:');
  console.log('  1. Save your PNG logo files to /public/logos/main/');
  console.log('  2. Create favicon.ico from your logo');
  console.log('  3. Add PWA icons (192x192, 512x512)');
  console.log('  4. Test in browser');
} else {
  console.log('❌ Some integration issues found. Please check the implementation.');
}

console.log('\n🎨 Your logo design perfectly matches the purple theme! 🚀');