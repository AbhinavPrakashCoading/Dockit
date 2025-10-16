// Simple test for the save API endpoint
const fetch = require('node-fetch');

async function testSaveAPI() {
  console.log('🧪 Testing Save Parsed Document API');
  console.log('====================================');

  const mockParsedResult = {
    exam: 'NEET UG 2025 Test',
    source: 'text-input',
    extractedAt: new Date().toISOString(),
    documents: [
      {
        type: 'Photo',
        requirements: {
          format: ['JPEG'],
          maxSize: '80 KB',
          dimensions: { width: 35, height: 45, ratio: '35 x 45 mm' },
          mandatory: true,
          description: 'format passport size (35x45mm) mandatory'
        }
      },
      {
        type: 'ID Proof',
        requirements: {
          format: ['PDF'],
          maxSize: '2 MB',
          mandatory: true,
          description: 'format Aadhaar/PAN/Passport mandatory'
        }
      }
    ],
    metadata: {
      method: 'text-parser',
      confidence: 0.95
    }
  };

  try {
    console.log('\n1️⃣ Testing Save Parsed Document API...');
    const saveResponse = await fetch('http://localhost:3000/api/save-parsed-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parsedJson: mockParsedResult,
        originalText: 'NEET UG 2025 Test\n\nPhoto: JPEG format, max 80KB, passport size\nID Proof: PDF format, max 2MB, Aadhaar/PAN/Passport',
        userId: 'test-user-manual-save'
      })
    });

    const responseText = await saveResponse.text();
    console.log('Response status:', saveResponse.status);
    console.log('Response text:', responseText);

    if (!saveResponse.ok) {
      throw new Error(`Save failed: ${saveResponse.status} - ${responseText}`);
    }

    const saveResult = JSON.parse(responseText);
    console.log('✅ Save API successful');
    console.log(`   - Success: ${saveResult.success}`);
    console.log(`   - Message: ${saveResult.message}`);
    console.log(`   - Document ID: ${saveResult.document?.id}`);

    // Verify in database
    console.log('\n2️⃣ Verifying in database...');
    const listResponse = await fetch('http://localhost:3000/api/parsed-documents-fallback');
    
    if (listResponse.ok) {
      const listResult = await listResponse.json();
      console.log(`✅ Found ${listResult.data?.length || 0} documents in database`);
      
      const testDoc = listResult.data?.find(doc => doc.examName.includes('NEET UG 2025 Test'));
      if (testDoc) {
        console.log(`✅ Found our test document: ${testDoc.id}`);
      }
    }

    console.log('\n🎉 Save to Database API is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSaveAPI();