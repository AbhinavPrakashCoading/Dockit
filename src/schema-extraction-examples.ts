// Example usage of the Schema Extraction Engine

import { generateExamSchema } from './engines/schema-extraction';

/**
 * Example 1: Basic usage
 */
async function basicExample() {
  console.log('📝 Basic Example: Generating schema for IBPS Clerk 2025\n');
  
  try {
    const schema = await generateExamSchema('ibps-clerk-2025');
    
    console.log('✅ Generated Schema:');
    console.log(JSON.stringify(schema, null, 2));
    
    return schema;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Example 2: With custom options
 */
async function advancedExample() {
  console.log('\n🔧 Advanced Example: Custom options for SSC CGL\n');
  
  try {
    const schema = await generateExamSchema('ssc-cgl-2025', {
      maxSearchResults: 8,
      timeout: 45000,
      includeOfficialOnly: true,
      preferPdfs: true
    });
    
    console.log('✅ Generated Schema with Custom Options:');
    console.log(`Exam: ${schema.exam}`);
    console.log(`Documents: ${schema.documents.length}`);
    console.log(`Source: ${schema.extractedFrom}`);
    
    // Display document requirements in a readable format
    schema.documents.forEach((doc, index) => {
      console.log(`\n${index + 1}. ${doc.type.toUpperCase()}`);
      
      if (doc.requirements.format) {
        console.log(`   📄 Format: ${doc.requirements.format.join(', ')}`);
      }
      
      if (doc.requirements.size_kb) {
        const size = doc.requirements.size_kb;
        const sizeStr = size.min ? `${size.min} - ${size.max} KB` : `Max ${size.max} KB`;
        console.log(`   📏 Size: ${sizeStr}`);
      }
      
      if (doc.requirements.dimensions) {
        console.log(`   📐 Dimensions: ${doc.requirements.dimensions}`);
      }
      
      if (doc.requirements.color) {
        console.log(`   🎨 Color: ${doc.requirements.color}`);
      }
      
      if (doc.requirements.notes && doc.requirements.notes.length > 0) {
        console.log(`   📝 Notes:`);
        doc.requirements.notes.forEach(note => {
          console.log(`      • ${note}`);
        });
      }
    });
    
    return schema;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Example 3: Batch processing multiple exams
 */
async function batchExample() {
  console.log('\n🔄 Batch Example: Processing multiple exams\n');
  
  const exams = [
    'ibps-po-2025',
    'sbi-clerk-2025',
    'rrb-je-2025'
  ];
  
  const schemas = [];
  
  for (const exam of exams) {
    console.log(`Processing ${exam}...`);
    
    try {
      const schema = await generateExamSchema(exam, {
        maxSearchResults: 5,
        timeout: 30000
      });
      
      schemas.push(schema);
      console.log(`✅ ${exam}: ${schema.documents.length} documents found`);
      
    } catch (error) {
      console.error(`❌ Failed to process ${exam}:`, error);
    }
    
    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n📊 Batch Summary: Processed ${schemas.length}/${exams.length} exams successfully`);
  return schemas;
}

/**
 * Example 4: Using the schema for validation
 */
async function validationExample() {
  console.log('\n✅ Validation Example: Using schema for document validation\n');
  
  try {
    const schema = await generateExamSchema('upsc-cse-2025');
    
    // Simulate document validation
    const mockUploadedFile = {
      name: 'photo.jpg',
      size: 45 * 1024, // 45KB
      type: 'image/jpeg',
      dimensions: '200x230'
    };
    
    // Find photo requirements in schema
    const photoReq = schema.documents.find(doc => doc.type === 'photograph');
    
    if (photoReq) {
      console.log('📸 Validating photo upload against schema...');
      
      // Check format
      const isFormatValid = photoReq.requirements.format?.some(format => 
        mockUploadedFile.type.includes(format.toLowerCase())
      );
      console.log(`Format validation: ${isFormatValid ? '✅ PASS' : '❌ FAIL'}`);
      
      // Check size
      const sizeKB = mockUploadedFile.size / 1024;
      const isSizeValid = photoReq.requirements.size_kb ? 
        (!photoReq.requirements.size_kb.min || sizeKB >= photoReq.requirements.size_kb.min) &&
        (!photoReq.requirements.size_kb.max || sizeKB <= photoReq.requirements.size_kb.max) : true;
      console.log(`Size validation: ${isSizeValid ? '✅ PASS' : '❌ FAIL'} (${sizeKB}KB)`);
      
      console.log('\n📋 Photo Requirements from Schema:');
      console.log(`• Format: ${photoReq.requirements.format?.join(', ')}`);
      if (photoReq.requirements.size_kb) {
        const size = photoReq.requirements.size_kb;
        console.log(`• Size: ${size.min ? `${size.min}-${size.max}` : `Max ${size.max}`} KB`);
      }
      if (photoReq.requirements.dimensions) {
        console.log(`• Dimensions: ${photoReq.requirements.dimensions}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Validation example failed:', error);
  }
}

/**
 * Example 5: Integration with existing system
 */
async function integrationExample() {
  console.log('\n🔗 Integration Example: Using with existing DocKit system\n');
  
  try {
    // Generate schema
    const schema = await generateExamSchema('neet-2025');
    
    // Convert to DocKit format (example transformation)
    const dockitConfig = {
      examId: schema.exam.toLowerCase().replace(/\s+/g, '-'),
      name: schema.exam,
      lastUpdated: schema.extractedAt,
      uploadRequirements: schema.documents.map(doc => ({
        fieldName: doc.type,
        label: doc.type.charAt(0).toUpperCase() + doc.type.slice(1),
        required: true,
        accept: doc.requirements.format?.map(f => `.${f.toLowerCase()}`).join(','),
        maxSize: doc.requirements.size_kb?.max ? doc.requirements.size_kb.max * 1024 : 5 * 1024 * 1024,
        validation: {
          dimensions: doc.requirements.dimensions,
          color: doc.requirements.color,
          notes: doc.requirements.notes
        }
      }))
    };
    
    console.log('✅ Converted to DocKit format:');
    console.log(JSON.stringify(dockitConfig, null, 2));
    
    return dockitConfig;
    
  } catch (error) {
    console.error('❌ Integration example failed:', error);
  }
}

// Main function to run all examples
async function runExamples() {
  console.log('🚀 Schema Extraction Engine - Usage Examples');
  console.log('='.repeat(60));
  
  try {
    await basicExample();
    await advancedExample();
    await batchExample();
    await validationExample();
    await integrationExample();
    
    console.log('\n🎉 All examples completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Examples failed:', error);
  }
}

// Export examples for external use
export {
  basicExample,
  advancedExample,
  batchExample,
  validationExample,
  integrationExample,
  runExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}