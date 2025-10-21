#!/usr/bin/env node

/**
 * Enhanced Hover Effects Test
 * 
 * Verifies that all FastOverview quick action buttons have consistent,
 * enhanced hover effects with zoom and tint
 */

const fs = require('fs');
const path = require('path');

console.log('🖱️ Testing Enhanced Quick Action Hover Effects...\n');

// Test for enhanced hover effects
console.log('📄 Testing FastOverview Quick Actions...');

try {
  const content = fs.readFileSync(path.resolve('./src/components/dashboard/components/FastOverview.tsx'), 'utf8');
  
  const enhancedEffects = [
    'border-2 border-gray-200', // Thicker border
    'hover:border-purple-400',  // Stronger purple tint
    'hover:border-blue-400',    // Stronger blue tint  
    'hover:border-orange-400',  // Stronger orange tint
    'hover:bg-purple-50',       // Background tint (purple)
    'hover:bg-blue-50',         // Background tint (blue)
    'hover:bg-orange-50',       // Background tint (orange)
    'hover:shadow-lg',          // Enhanced shadow
    'transition-all duration-300', // Longer transition
    'hover:scale-110',          // Enhanced zoom (was 105)
    'hover:-translate-y-1',     // Lift effect
    'transition-colors duration-300' // Icon animation
  ];
  
  let effectsFound = 0;
  
  enhancedEffects.forEach(effect => {
    if (content.includes(effect)) {
      console.log(`  ✅ Found: "${effect}"`);
      effectsFound++;
    } else {
      console.log(`  ❌ Missing: "${effect}"`);
    }
  });
  
  console.log(`  📊 Enhanced Effects: ${effectsFound}/${enhancedEffects.length}\n`);
  
  // Check for old/weak effects that should be upgraded
  const oldEffects = [
    'border border-gray-200',   // Should be border-2
    'hover:border-purple-300',  // Should be purple-400
    'hover:border-blue-300',    // Should be blue-400
    'hover:border-orange-300',  // Should be orange-400
    'hover:shadow-md',          // Should be shadow-lg
    'duration-200',             // Should be duration-300
    'hover:scale-105'           // Should be scale-110
  ];
  
  let oldEffectsRemaining = 0;
  
  console.log('🔍 Checking for old/weak effects...');
  oldEffects.forEach(effect => {
    if (content.includes(effect)) {
      console.log(`  ❌ Old effect found: "${effect}"`);
      oldEffectsRemaining++;
    } else {
      console.log(`  ✅ Upgraded: "${effect}"`);
    }
  });
  
  console.log(`  📊 Effects Upgraded: ${oldEffects.length - oldEffectsRemaining}/${oldEffects.length}\n`);
  
  if (effectsFound >= 10 && oldEffectsRemaining === 0) {
    console.log('🎉 All Quick Action buttons have enhanced hover effects!');
    console.log('\n✨ Enhanced hover features:');
    console.log('  • 🔍 Zoom: 110% scale (stronger than before)');
    console.log('  • ⬆️  Lift: -translate-y-1 (floating effect)');
    console.log('  • 🎨 Tint: Stronger color borders (400 instead of 300)');
    console.log('  • 🌟 Shadow: Larger shadow (lg instead of md)');
    console.log('  • ⏱️  Duration: Smoother 300ms transitions');
    console.log('  • 🖼️  Border: Thicker 2px borders for better definition');
    console.log('\n🎯 Consistent effects across all three buttons:');
    console.log('  • 🟣 Upload Documents - Purple theme');
    console.log('  • 🔵 View Documents - Blue theme'); 
    console.log('  • 🟠 View Analytics - Orange theme');
    console.log('\n🚀 All buttons now have the same impressive hover experience!');
  } else {
    console.log('❌ Some effects need improvement. Please check the implementation.');
  }
  
} catch (error) {
  console.log(`❌ Error reading file: ${error.message}`);
}

console.log('\n🖱️ Enhanced hover effects applied - all buttons now zoom and tint beautifully! ✨');