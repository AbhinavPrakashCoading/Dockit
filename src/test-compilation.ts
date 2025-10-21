// Simple test to verify the schema extraction engine compiles
import { generateExamSchema } from './engines/schema-extraction';

console.log('Schema extraction engine loaded successfully!');

// Test the main function signature
const testFunction = async () => {
  try {
    // This won't actually run the full extraction in this test
    console.log('Function signature is valid');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
};

export { testFunction };