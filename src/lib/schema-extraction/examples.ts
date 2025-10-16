/**
 * Schema Extraction Examples and Tests
 * Demonstrates usage of the schema extraction module
 */

import { generateSchemaFromLink, SchemaExtractor, ExamSchema } from './index';

// Example usage function
export async function exampleUsage() {
  console.log('=== Schema Extraction Examples ===\n');

  // Example 1: Basic usage with IBPS URL
  console.log('1. Extracting from IBPS Clerk notification...');
  try {
    const schema1 = await generateSchemaFromLink('https://ibpsonline.ibps.in/clerk25');
    console.log('✅ IBPS Schema extracted:');
    console.log(JSON.stringify(schema1, null, 2));
  } catch (error) {
    console.log('❌ Failed to extract IBPS schema:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 2: Using with custom options for dynamic content
  console.log('2. Extracting with dynamic content support...');
  try {
    const schema2 = await generateSchemaFromLink('https://sbi.co.in/careers', {
      enableJavascript: true,
      timeout: 45000,
      waitForSelector: '.content, .main'
    });
    console.log('✅ SBI Schema extracted:');
    console.log(JSON.stringify(schema2, null, 2));
  } catch (error) {
    console.log('❌ Failed to extract SBI schema:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 3: PDF extraction
  console.log('3. Extracting from PDF document...');
  try {
    const schema3 = await generateSchemaFromLink('https://example.com/notification.pdf');
    console.log('✅ PDF Schema extracted:');
    console.log(JSON.stringify(schema3, null, 2));
  } catch (error) {
    console.log('❌ Failed to extract PDF schema:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 4: Batch processing
  console.log('4. Batch processing multiple URLs...');
  const extractor = new SchemaExtractor();
  try {
    const urls = [
      'https://ibpsonline.ibps.in/clerk25',
      'https://sbi.co.in/careers',
      'https://upsconline.nic.in'
    ];

    const schemas = await extractor.processMultipleLinks(urls, {
      timeout: 30000
    });

    console.log(`✅ Processed ${schemas.length} schemas successfully`);
    schemas.forEach((schema, index) => {
      console.log(`\nSchema ${index + 1} (${schema.source}):`);
      console.log(`- Exam: ${schema.exam}`);
      console.log(`- Documents: ${schema.documents.length}`);
      console.log(`- Confidence: ${schema.metadata?.confidence || 0}`);
    });
  } catch (error) {
    console.log('❌ Batch processing failed:', error);
  } finally {
    await extractor.cleanup();
  }
}

// Mock test data for testing without real URLs
export const mockExamData = {
  htmlContent: `
    <html>
      <head><title>IBPS Clerk 2025 Recruitment Notification</title></head>
      <body>
        <h1>IBPS Clerk 2025 - Online Application</h1>
        <div class="document-requirements">
          <h2>Document Upload Requirements</h2>
          <p>Candidates must upload the following documents:</p>
          <ul>
            <li>Recent passport size color photograph (JPG/JPEG format, size: 20KB to 50KB, dimensions: 200x230 pixels)</li>
            <li>Signature in black ink (JPG/JPEG format, size: 10KB to 40KB, dimensions: 140x60 pixels)</li>
            <li>Left thumb impression (JPG/JPEG format, size: 10KB to 40KB)</li>
            <li>Educational marksheets (PDF format, maximum size: 500KB each)</li>
            <li>Caste certificate (if applicable, PDF format, maximum size: 300KB)</li>
          </ul>
          <p><strong>Important:</strong> All documents are mandatory except caste certificate.</p>
        </div>
      </body>
    </html>
  `,
  
  pdfContent: `
    IBPS CLERK 2025 RECRUITMENT NOTIFICATION
    
    Institute of Banking Personnel Selection
    Online Application Form Instructions
    
    DOCUMENT UPLOAD REQUIREMENTS:
    
    1. Photograph: Recent passport size color photograph
       - Format: JPG/JPEG only
       - Size: Minimum 20KB, Maximum 50KB
       - Dimensions: 200 x 230 pixels
       - Background: Light colored (preferably white)
    
    2. Signature: Clear signature in black ink
       - Format: JPG/JPEG only  
       - Size: Maximum 40KB
       - Dimensions: 140 x 60 pixels
    
    3. Thumb Impression: Left thumb impression
       - Format: JPG/JPEG only
       - Size: Maximum 40KB
       - Clear and complete impression required
    
    4. Documents:
       - Educational marksheets (PDF format, max 500KB each)
       - Experience certificates (PDF format, max 300KB each)
       - Caste certificate (if applicable, PDF format, max 300KB)
    
    Note: All uploads are mandatory except caste certificate.
  `
};

// Test function using mock data
export async function runTests() {
  console.log('=== Schema Extraction Tests ===\n');

  const { htmlParser } = await import('./html-parser');
  const { textAnalyzer } = await import('./text-analyzer');
  const { schemaBuilder } = await import('./schema-builder');

  // Test 1: HTML parsing
  console.log('1. Testing HTML parsing...');
  const htmlText = htmlParser.extractText(mockExamData.htmlContent);
  const htmlTitle = htmlParser.extractTitle(mockExamData.htmlContent);
  console.log(`✅ HTML parsed - Title: "${htmlTitle}", Text length: ${htmlText.length}`);

  // Test 2: Text analysis
  console.log('\n2. Testing text analysis...');
  const htmlRequirements = textAnalyzer.analyzeText(htmlText);
  console.log(`✅ Found ${htmlRequirements.length} requirements from HTML`);
  htmlRequirements.forEach(req => {
    console.log(`   - ${req.documentType}: ${req.formats.join(', ')} (confidence: ${req.confidence})`);
  });

  const pdfRequirements = textAnalyzer.analyzeText(mockExamData.pdfContent);
  console.log(`✅ Found ${pdfRequirements.length} requirements from PDF text`);
  pdfRequirements.forEach(req => {
    console.log(`   - ${req.documentType}: ${req.formats.join(', ')} (confidence: ${req.confidence})`);
  });

  // Test 3: Schema building
  console.log('\n3. Testing schema building...');
  const htmlSchema = schemaBuilder.buildSchema(
    htmlRequirements,
    htmlTitle,
    'https://example.com/html-test',
    'html'
  );
  
  const pdfSchema = schemaBuilder.buildSchema(
    pdfRequirements,
    'IBPS Clerk 2025',
    'https://example.com/pdf-test',
    'pdf'
  );

  console.log('✅ HTML Schema:');
  console.log(JSON.stringify(htmlSchema, null, 2));
  
  console.log('\n✅ PDF Schema:');
  console.log(JSON.stringify(pdfSchema, null, 2));

  // Test 4: Schema validation
  console.log('\n4. Testing schema validation...');
  const htmlValidation = schemaBuilder.validateSchema(htmlSchema);
  const pdfValidation = schemaBuilder.validateSchema(pdfSchema);
  
  console.log(`✅ HTML schema valid: ${htmlValidation.isValid}`);
  if (!htmlValidation.isValid) {
    console.log('   Errors:', htmlValidation.errors);
  }
  
  console.log(`✅ PDF schema valid: ${pdfValidation.isValid}`);
  if (!pdfValidation.isValid) {
    console.log('   Errors:', pdfValidation.errors);
  }

  console.log('\n=== All tests completed ===');
}

// Utility function to analyze a custom text snippet
export async function analyzeCustomText(text: string): Promise<ExamSchema> {
  const { textAnalyzer } = await import('./text-analyzer');
  const { schemaBuilder } = await import('./schema-builder');

  const requirements = textAnalyzer.analyzeText(text);
  const schema = schemaBuilder.buildSchema(
    requirements,
    'Custom Analysis',
    'manual-input',
    'html'
  );

  return schema;
}

// Performance test
export async function performanceTest() {
  console.log('=== Performance Test ===\n');

  const startTime = Date.now();
  
  // Test with mock data to measure processing speed
  const iterations = 10;
  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const iterationStart = Date.now();
    await analyzeCustomText(mockExamData.pdfContent);
    const iterationTime = Date.now() - iterationStart;
    results.push(iterationTime);
  }

  const totalTime = Date.now() - startTime;
  const averageTime = results.reduce((a, b) => a + b, 0) / results.length;
  const minTime = Math.min(...results);
  const maxTime = Math.max(...results);

  console.log(`✅ Performance Test Results (${iterations} iterations):`);
  console.log(`   Total time: ${totalTime}ms`);
  console.log(`   Average time per iteration: ${averageTime.toFixed(2)}ms`);
  console.log(`   Min time: ${minTime}ms`);
  console.log(`   Max time: ${maxTime}ms`);
}

// Export all functions for usage
export { mockExamData };

// Main test runner
if (require.main === module) {
  (async () => {
    try {
      await runTests();
      console.log('\n');
      await performanceTest();
      console.log('\n');
      // Note: Uncomment below to test with real URLs (be mindful of rate limits)
      // await exampleUsage();
    } catch (error) {
      console.error('Test execution failed:', error);
    }
  })();
}