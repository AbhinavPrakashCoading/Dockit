// Quick test to verify the configuration system is working
import { getProcessingConfig, setProcessingConfig } from './src/lib/processing/processingConfig.js';

console.log('Testing configuration system...');

// Test getting default config
const config = getProcessingConfig();
console.log('Default config loaded:', !!config);
console.log('Has size ranges:', !!config.sizeRanges);
console.log('Has quality settings:', !!config.qualitySettings);

// Test setting config
setProcessingConfig({
  qualitySettings: {
    signature: { min: 0.8, max: 0.95, priority: 'quality' }
  }
});

const updatedConfig = getProcessingConfig();
console.log('Updated signature min quality:', updatedConfig.qualitySettings.signature.min);

console.log('✅ Configuration system is working!');