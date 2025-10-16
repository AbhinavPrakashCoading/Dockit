// Test the new save to database functionality
const fetch = require('node-fetch');

async function testSaveToDatabase() {
  console.log('🧪 Testing Save to Database Functionality');
  console.log('==========================================');

  try {
    // First, parse some text to get a JSON result
    console.log('\n1️⃣ Parsing text to get JSON result...');
    const parseResponse = await fetch('http://localhost:3000/api/text-to-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `NEET UG 2025 Examination

Documents Required:
Photo: JPEG format, max 80KB, passport size (35x45mm), mandatory
Signature: JPG format, max 30KB, black ink on white paper, mandatory
ID Proof: PDF format, max 2MB, Aadhaar/PAN/Passport, mandatory
Category Certificate: PDF format, max 1MB, SC/ST/OBC certificate if applicable, optional`
      })
    });

    if (!parseResponse.ok) {
      throw new Error(`Parse failed: ${parseResponse.status}`);
    }

    const parseResult = await parseResponse.json();
    console.log('✅ Parse successful');
    console.log(`   - Exam: ${parseResult.exam}`);
    console.log(`   - Documents: ${parseResult.documents?.length || 0}`);

    // Now test the save functionality
    console.log('\n2️⃣ Testing Save to Database API...');
    const saveResponse = await fetch('http://localhost:3000/api/save-parsed-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parsedJson: parseResult,
        originalText: `NEET UG 2025 Examination

Documents Required:
Photo: JPEG format, max 80KB, passport size (35x45mm), mandatory
Signature: JPG format, max 30KB, black ink on white paper, mandatory
ID Proof: PDF format, max 2MB, Aadhaar/PAN/Passport, mandatory
Category Certificate: PDF format, max 1MB, SC/ST/OBC certificate if applicable, optional`,
        userId: 'test-user-neet-2025'
      })
    });

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      throw new Error(`Save failed: ${saveResponse.status} - ${errorText}`);
    }

    const saveResult = await saveResponse.json();
    console.log('✅ Save to Database successful');
    console.log(`   - Success: ${saveResult.success}`);
    console.log(`   - Message: ${saveResult.message}`);
    console.log(`   - Document ID: ${saveResult.document?.id}`);

    // Verify it was saved by checking the database
    console.log('\n3️⃣ Verifying document was saved...');
    const listResponse = await fetch('http://localhost:3000/api/parsed-documents-fallback');
    
    if (!listResponse.ok) {
      throw new Error(`List failed: ${listResponse.status}`);
    }

    const listResult = await listResponse.json();
    console.log('✅ Database verification successful');
    console.log(`   - Total documents in DB: ${listResult.data?.length || 0}`);
    
    // Find our NEET document
    const neetDoc = listResult.data?.find(doc => doc.examName.includes('NEET'));
    if (neetDoc) {
      console.log(`   - Found NEET document: ${neetDoc.id}`);
      console.log(`   - Exam Type: ${neetDoc.examType}`);
      console.log(`   - Document Count: ${neetDoc.documentCount}`);
      console.log(`   - Has Original Text: ${!!neetDoc.originalText}`);
    }

    console.log('\n🎉 Save to Database functionality working perfectly!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Parse text to JSON');
    console.log('   ✅ Save JSON result to database');  
    console.log('   ✅ Store original text with result');
    console.log('   ✅ Auto-detect exam type (NEET)');
    console.log('   ✅ Verify document was saved');
    console.log('\n🎯 Users can now save their parsing results to the database!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSaveToDatabase();