// Test ID Proof subcategories specifically
const fetch = require('node-fetch');

async function testIDProofSubcategories() {
  const testText = `ID Proof: PDF format, max 2MB, Aadhaar/PAN/Passport, mandatory`;
  
  try {
    const response = await fetch('http://localhost:3000/api/text-to-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: testText })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 ID Proof Test Results:');
    console.log('=====================================');
    console.log(JSON.stringify(data, null, 2));
    
    // Check specifically for ID Proof subcategories
    const idProofDoc = data.documents.find(doc => doc.type.includes('ID') || doc.type.includes('Proof'));
    if (idProofDoc && idProofDoc.requirements.subcategories) {
      console.log('\n✅ ID Proof subcategories found:');
      idProofDoc.requirements.subcategories.forEach(sub => {
        console.log(`  - ${sub.label}: ${sub.description}`);
      });
    } else {
      console.log('\n❌ ID Proof subcategories NOT found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testIDProofSubcategories();