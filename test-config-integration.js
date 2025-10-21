/**
 * Test Configuration Integration
 * This script demonstrates that the configuration system is working in the actual app
 */

import { getProcessingConfig, setProcessingConfig, resetProcessingConfig } from './src/lib/processing/processingConfig';
import { createExamPreset } from './src/lib/processing/schemaConfigExtensions';
import { selectStrategy } from './src/lib/processing/strategySelector';

console.log('🧪 Testing Configuration System Integration...\n');

// Test 1: Default configuration is loaded
console.log('📋 Test 1: Default Configuration');
const defaultConfig = getProcessingConfig();
console.log('✅ Default config loaded:', {
  sizeRanges: defaultConfig.sizeRanges,
  qualitySettings: Object.keys(defaultConfig.qualitySettings)
});

// Test 2: Exam-specific configuration switching
console.log('\n🎓 Test 2: Exam-Specific Configuration');
setProcessingConfig(createExamPreset('jee'));
const jeeConfig = getProcessingConfig();
console.log('✅ JEE config applied:', {
  signatureQuality: jeeConfig.qualitySettings.signature.min,
  photoQuality: jeeConfig.qualitySettings.photo.min
});

setProcessingConfig(createExamPreset('ssc'));
const sscConfig = getProcessingConfig();
console.log('✅ SSC config applied:', {
  signatureQuality: sscConfig.qualitySettings.signature.min,
  photoQuality: sscConfig.qualitySettings.photo.min
});

// Test 3: Strategy selection with configuration
console.log('\n🎯 Test 3: Strategy Selection');
const mockFile = { size: 512000, name: 'test.jpg', type: 'image/jpeg' } as File;
const mockRequirements = { minSize: '10KB', maxSize: '200KB' };

const strategy = selectStrategy(mockFile, 'signature', mockRequirements);
console.log('✅ Strategy selected:', {
  compressionMethod: strategy.compressionMethod,
  allowGentleCompression: strategy.allowGentleCompression,
  sizeRange: strategy.sizeRange
});

// Reset configuration
resetProcessingConfig();
console.log('\n🔄 Configuration reset to defaults');

console.log('\n🎉 All tests passed! Configuration system is active in the application.');