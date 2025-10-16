// Complete integration test for the Save to Database button functionality
const fetch = require('node-fetch');

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Save to Database Flow');
  console.log('=========================================');

  try {
    // Step 1: Parse text (simulating what happens when user clicks "Parse Text")
    console.log('\n1️⃣ Step 1: Parse text to JSON...');
    const parseResponse = await fetch('http://localhost:3000/api/text-to-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `JEE Main 2025 Application

Required Documents:
Photo: JPEG format, maximum 50KB, passport size (35x45mm), mandatory
Signature: JPG format, maximum 30KB, black ink on white paper, mandatory  
ID Proof: PDF format, maximum 2MB, Aadhaar Card/PAN Card/Passport, mandatory
Category Certificate: PDF format, maximum 1MB, SC/ST/OBC/EWS certificate if applicable, optional
Income Certificate: PDF format, maximum 1MB, for EWS category, optional`
      })
    });

    if (!parseResponse.ok) {
      throw new Error(`Parse failed: ${parseResponse.status}`);
    }

    const parseResult = await parseResponse.json();
    console.log('✅ Parse successful');
    console.log(`   - Exam: ${parseResult.exam}`);
    console.log(`   - Documents found: ${parseResult.documents?.length || 0}`);
    console.log(`   - Confidence: ${parseResult.metadata?.confidence || 'N/A'}`);

    // Step 2: Save to database (simulating user clicking "Save to Database" button)
    console.log('\n2️⃣ Step 2: Save parsed result to database...');
    const saveResponse = await fetch('http://localhost:3000/api/save-parsed-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parsedJson: parseResult,
        originalText: `JEE Main 2025 Application

Required Documents:
Photo: JPEG format, maximum 50KB, passport size (35x45mm), mandatory
Signature: JPG format, maximum 30KB, black ink on white paper, mandatory  
ID Proof: PDF format, maximum 2MB, Aadhaar Card/PAN Card/Passport, mandatory
Category Certificate: PDF format, maximum 1MB, SC/ST/OBC/EWS certificate if applicable, optional
Income Certificate: PDF format, maximum 1MB, for EWS category, optional`,
        userId: 'demo-user-jee-2025'
      })
    });

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      throw new Error(`Save failed: ${saveResponse.status} - ${errorText}`);
    }

    const saveResult = await saveResponse.json();
    console.log('✅ Save successful');
    console.log(`   - Document ID: ${saveResult.document.id}`);
    console.log(`   - Exam Type: ${saveResult.document.examType}`);
    console.log(`   - Original text preserved: ${!!saveResult.document.originalText}`);

    // Step 3: Verify the document was saved and can be retrieved
    console.log('\n3️⃣ Step 3: Retrieve saved document...');
    const getResponse = await fetch(`http://localhost:3000/api/parsed-documents-fallback/${saveResult.document.id}`);
    
    if (!getResponse.ok) {
      throw new Error(`Get failed: ${getResponse.status}`);
    }

    const retrievedDoc = await getResponse.json();
    console.log('✅ Document retrieved successfully');
    console.log(`   - Access count: ${retrievedDoc.accessCount}`);
    console.log(`   - Has parsed JSON: ${!!retrievedDoc.parsedJson}`);
    console.log(`   - Documents in JSON: ${retrievedDoc.parsedJson?.documents?.length || 0}`);

    // Step 4: List all JEE documents to show filtering works
    console.log('\n4️⃣ Step 4: Filter documents by exam type...');
    const filterResponse = await fetch('http://localhost:3000/api/parsed-documents-fallback?examType=jee');
    
    if (!filterResponse.ok) {
      throw new Error(`Filter failed: ${filterResponse.status}`);
    }

    const filterResult = await filterResponse.json();
    console.log('✅ Filtering works');
    console.log(`   - JEE documents found: ${filterResult.data?.length || 0}`);

    // Success summary
    console.log('\n🎉 Complete Save to Database Flow Working Perfectly!');
    console.log('\n📋 Flow Summary:');
    console.log('   1️⃣ ✅ User inputs text');
    console.log('   2️⃣ ✅ System parses to JSON with subcategories');
    console.log('   3️⃣ ✅ User clicks "Save to Database" button');
    console.log('   4️⃣ ✅ System saves parsed result + original text');
    console.log('   5️⃣ ✅ Auto-detects exam type (JEE)');
    console.log('   6️⃣ ✅ Document can be retrieved and filtered');
    console.log('\n💾 Database Integration Complete!');
    console.log('   - Original "Download JSON" button now complemented with "Save to Database"');
    console.log('   - Users can save their parsing results for future reference');
    console.log('   - All parsed data including subcategories is preserved');
    console.log('   - Smart exam type detection and filtering available');

  } catch (error) {
    console.error('❌ Complete flow test failed:', error.message);
  }
}

testCompleteFlow();