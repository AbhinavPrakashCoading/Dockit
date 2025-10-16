// Test Schema Loading in Upload Modal
const fs = require('fs');
const path = require('path');

console.log('🔧 Testing Upload Modal Schema Loading Issue...\n');

// 1. Check the parsed document structure
const parsedDocsPath = path.join(__dirname, 'data', 'parsed-documents');
const files = fs.readdirSync(parsedDocsPath);
const jsonFiles = files.filter(f => f.endsWith('.json'));

if (jsonFiles.length > 0) {
  const docPath = path.join(parsedDocsPath, jsonFiles[0]);
  const docContent = JSON.parse(fs.readFileSync(docPath, 'utf8'));
  
  console.log('📄 Original parsed document structure:');
  console.log(`   - examName: ${docContent.examName}`);
  console.log(`   - parsedJson exists: ${!!docContent.parsedJson}`);
  console.log(`   - parsedJson.documents exists: ${!!docContent.parsedJson?.documents}`);
  console.log(`   - documents count: ${docContent.parsedJson?.documents?.length || 0}`);
  
  // 2. Test the conversion to exam format (from useExamData)
  const convertedExam = {
    id: docContent.id,
    name: docContent.examName,
    category: docContent.examType || 'Parsed',
    hasSchema: true,
    isSchemaLoaded: true,
    schema: docContent.parsedJson,  // This is the key mapping
    source: 'parsed-document',
    requiredDocuments: docContent.parsedJson?.documents?.map(d => d.type) || [],
    documentCount: docContent.documentCount || docContent.parsedJson?.documents?.length || 0,
  };
  
  console.log('\n🔄 Converted exam format (what useExamData creates):');
  console.log(`   - name: ${convertedExam.name}`);
  console.log(`   - schema exists: ${!!convertedExam.schema}`);
  console.log(`   - schema.documents exists: ${!!convertedExam.schema?.documents}`);
  console.log(`   - schema.documents count: ${convertedExam.schema?.documents?.length || 0}`);
  
  // 3. Test what upload modal expects
  console.log('\n🎯 Testing Upload Modal expectations:');
  const selectedExam = convertedExam; // This is what gets passed to upload modal
  
  console.log(`   - selectedExam?.schema?.documents exists: ${!!selectedExam?.schema?.documents}`);
  
  if (selectedExam?.schema?.documents) {
    console.log('\n📋 Document mapping test:');
    const documentMapping = selectedExam.schema.documents.reduce((acc, doc) => {
      const isRequired = doc.requirements?.mandatory || doc.required || false;
      acc[doc.type] = {
        name: doc.type.charAt(0).toUpperCase() + doc.type.slice(1),
        icon: '📄',
        required: isRequired
      };
      return acc;
    }, {});
    
    console.log('✅ Document mapping created successfully:');
    Object.entries(documentMapping).forEach(([type, info]) => {
      console.log(`   - ${type}: ${info.name} (required: ${info.required})`);
    });
  } else {
    console.log('❌ No documents found in schema!');
  }
  
  // 4. Check first document structure in detail
  if (docContent.parsedJson?.documents?.[0]) {
    const firstDoc = docContent.parsedJson.documents[0];
    console.log('\n📝 First document structure:');
    console.log(`   - type: ${firstDoc.type}`);
    console.log(`   - requirements exists: ${!!firstDoc.requirements}`);
    console.log(`   - requirements.mandatory: ${firstDoc.requirements?.mandatory}`);
    console.log(`   - has "required" field: ${!!firstDoc.required}`);
  }
  
} else {
  console.log('❌ No parsed documents found!');
}

console.log('\n🎯 Analysis Complete. Check if schema mapping is working correctly.');