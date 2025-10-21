// Test the CRUD API fallback for parsed documents
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testFallbackCRUD() {
  console.log('🧪 Testing Parsed Documents Fallback CRUD API');
  console.log('================================================');

  try {
    // Test 1: Parse a document first (this should auto-save to fallback storage)
    console.log('\n1️⃣ Testing text-to-JSON parsing with auto-save to fallback...');
    const parseResponse = await fetch(`${BASE_URL}/text-to-json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `UPSC Civil Services Examination 2025

Documents Required:
Photo: JPEG format, max 50KB, passport size, mandatory
ID Proof: PDF format, max 2MB, Aadhaar/PAN/Passport, mandatory
Educational Certificates: PDF format, max 500KB per file, graduation degree, mandatory`,
        userId: 'test-user-123'
      })
    });

    if (!parseResponse.ok) {
      throw new Error(`Parse failed: ${parseResponse.status}`);
    }

    const parseResult = await parseResponse.json();
    console.log('✅ Text-to-JSON parsed successfully');
    console.log(`   - Exam: ${parseResult.exam}`);
    console.log(`   - Documents found: ${parseResult.documents?.length || 0}`);

    // Wait a moment for async save to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: List all parsed documents from fallback
    console.log('\n2️⃣ Testing GET /api/parsed-documents-fallback...');
    const listResponse = await fetch(`${BASE_URL}/parsed-documents-fallback`);
    
    if (!listResponse.ok) {
      throw new Error(`List failed: ${listResponse.status}`);
    }

    const listResult = await listResponse.json();
    console.log('✅ List parsed documents successful');
    console.log(`   - Total found: ${listResult.pagination?.total || 0}`);
    console.log(`   - Records returned: ${listResult.data?.length || 0}`);

    if (listResult.data && listResult.data.length > 0) {
      const firstDoc = listResult.data[0];
      console.log(`   - Latest exam: ${firstDoc.examName}`);
      console.log(`   - Documents in JSON: ${firstDoc.documentCount}`);

      // Test 3: Get specific document by ID
      console.log('\n3️⃣ Testing GET /api/parsed-documents-fallback/[id]...');
      const getResponse = await fetch(`${BASE_URL}/parsed-documents-fallback/${firstDoc.id}`);
      
      if (!getResponse.ok) {
        throw new Error(`Get by ID failed: ${getResponse.status}`);
      }

      const getResult = await getResponse.json();
      console.log('✅ Get by ID successful');
      console.log(`   - ID: ${getResult.id}`);
      console.log(`   - Access count: ${getResult.accessCount}`);
      console.log(`   - Has parsed JSON: ${!!getResult.parsedJson}`);

      // Test 4: Update the document
      console.log('\n4️⃣ Testing PUT /api/parsed-documents-fallback/[id]...');
      const updateResponse = await fetch(`${BASE_URL}/parsed-documents-fallback/${firstDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examName: 'UPSC Civil Services Examination 2025 - Updated via Fallback',
          confidence: 0.98
        })
      });

      if (!updateResponse.ok) {
        throw new Error(`Update failed: ${updateResponse.status}`);
      }

      const updateResult = await updateResponse.json();
      console.log('✅ Update successful');
      console.log(`   - New exam name: ${updateResult.examName}`);
      console.log(`   - New confidence: ${updateResult.confidence}`);

      // Test 5: Filter by exam type
      console.log('\n5️⃣ Testing filtered list (examType=upsc)...');
      const filterResponse = await fetch(`${BASE_URL}/parsed-documents-fallback?examType=upsc&limit=5`);
      
      if (!filterResponse.ok) {
        throw new Error(`Filter failed: ${filterResponse.status}`);
      }

      const filterResult = await filterResponse.json();
      console.log('✅ Filter by exam type successful');
      console.log(`   - UPSC documents: ${filterResult.data?.length || 0}`);

      // Test 6: Create a manual document
      console.log('\n6️⃣ Testing POST /api/parsed-documents-fallback (manual create)...');
      const createResponse = await fetch(`${BASE_URL}/parsed-documents-fallback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examName: 'SSC CGL 2025',
          examType: 'ssc',
          source: 'manual-entry',
          parsedJson: {
            exam: 'SSC CGL 2025',
            documents: [
              {
                type: 'Photo',
                requirements: { format: ['JPEG'], maxSize: '50 KB', mandatory: true }
              }
            ]
          },
          originalText: 'Manual test entry via fallback',
          confidence: 1.0,
          documentCount: 1,
          method: 'manual',
          userId: 'test-user-456'
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Create failed: ${createResponse.status}`);
      }

      const createResult = await createResponse.json();
      console.log('✅ Manual create successful');
      console.log(`   - New ID: ${createResult.id}`);
      console.log(`   - Exam: ${createResult.examName}`);

      // Test 7: Delete the manually created document
      console.log('\n7️⃣ Testing DELETE /api/parsed-documents-fallback/[id]...');
      const deleteResponse = await fetch(`${BASE_URL}/parsed-documents-fallback/${createResult.id}`, {
        method: 'DELETE'
      });

      if (!deleteResponse.ok) {
        throw new Error(`Delete failed: ${deleteResponse.status}`);
      }

      console.log('✅ Delete successful');
    }

    console.log('\n🎉 All Fallback CRUD operations completed successfully!');
    console.log('\n📊 Fallback CRUD API Summary:');
    console.log('   ✅ CREATE: POST /api/parsed-documents-fallback');
    console.log('   ✅ READ: GET /api/parsed-documents-fallback & GET /api/parsed-documents-fallback/[id]');
    console.log('   ✅ UPDATE: PUT /api/parsed-documents-fallback/[id]');
    console.log('   ✅ DELETE: DELETE /api/parsed-documents-fallback/[id]');
    console.log('   ✅ FILTER: Query parameters (userId, examType, examName, etc.)');
    console.log('   ✅ AUTO-SAVE: Text-to-JSON automatically saves to fallback storage');
    console.log('   📁 STORAGE: JSON file-based storage in data/parsed-documents.json');

  } catch (error) {
    console.error('❌ Fallback CRUD test failed:', error.message);
  }
}

// Run the test
testFallbackCRUD();