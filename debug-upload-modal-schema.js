console.log('🔍 Debugging Upload Modal Schema Loading...\n');

// Test the API first
async function testAPI() {
  try {
    console.log('📡 Testing parsed documents API...');
    const response = await fetch('http://localhost:3001/api/parsed-documents-fallback');
    
    if (!response.ok) {
      console.log('❌ API not available - server may not be running');
      return;
    }
    
    const data = await response.json();
    console.log(`✅ API returned ${data.data?.length || 0} documents`);
    
    if (data.data && data.data.length > 0) {
      const exam = data.data[0];
      console.log(`\n📋 First exam: ${exam.examName}`);
      console.log(`🔧 Has parsedJson: ${!!exam.parsedJson}`);
      console.log(`📄 Has documents: ${!!exam.parsedJson?.documents}`);
      console.log(`📊 Document count: ${exam.parsedJson?.documents?.length || 0}`);
      
      if (exam.parsedJson?.documents) {
        console.log('\n📝 Document types:');
        exam.parsedJson.documents.forEach((doc, index) => {
          console.log(`   ${index + 1}. ${doc.type}`);
        });
      }
      
      // Test the converted exam format
      console.log('\n🔄 Testing exam conversion...');
      const convertedExam = {
        id: exam.id,
        name: exam.examName,
        category: exam.examType || 'Parsed',
        hasSchema: true,
        isSchemaLoaded: true,
        schema: exam.parsedJson,
        source: 'parsed-document',
        requiredDocuments: exam.parsedJson?.documents?.map(d => d.type) || [],
        documentCount: exam.documentCount || exam.parsedJson?.documents?.length || 0,
      };
      
      console.log(`✅ Converted exam has schema: ${!!convertedExam.schema}`);
      console.log(`✅ Schema has documents: ${!!convertedExam.schema?.documents}`);
      console.log(`✅ Required documents: ${convertedExam.requiredDocuments.join(', ')}`);
    }
    
  } catch (error) {
    console.log(`❌ Error testing API: ${error.message}`);
  }
}

// Test the uploaded file detection in modal
function testModalSchemaAccess() {
  console.log('\n🎯 Testing Upload Modal Schema Access...');
  
  // Simulate what the upload modal receives
  const mockSelectedExam = {
    id: "doc_1760598899265_15iptt8ye",
    name: "JEE Mains 2025",
    schema: {
      exam: "JEE Mains 2025",
      documents: [
        { type: "Photo", requirements: { mandatory: true } },
        { type: "Signature", requirements: { mandatory: true } },
        { type: "ID Proof", requirements: { mandatory: true } }
      ]
    }
  };
  
  console.log(`✅ Mock exam has schema: ${!!mockSelectedExam.schema}`);
  console.log(`✅ Schema has documents: ${!!mockSelectedExam.schema?.documents}`);
  console.log(`📊 Document count: ${mockSelectedExam.schema?.documents?.length}`);
  
  // Test the modal's document type mapping logic
  const documentMapping = mockSelectedExam?.schema?.documents?.reduce((acc, doc) => {
    acc[doc.type] = {
      required: doc.requirements?.mandatory || false,
      uploaded: false
    };
    return acc;
  }, {});
  
  console.log('🗂️ Document mapping:', JSON.stringify(documentMapping, null, 2));
}

// Run tests
testAPI().then(() => {
  testModalSchemaAccess();
}).catch(console.error);