// Test with the user's exact input
const fetch = require('node-fetch');

const userInput = `UPSC Civil Services Examination 2025

Documents Required:
Photo: JPEG format, max 50KB, passport size (35x45mm), mandatory​
Signature: JPG only, max 30KB, scanned in black ink, mandatory​
ID Proof: PDF format, max 2MB, Aadhaar/PAN/Passport/Driving License, mandatory​
Address Proof: PDF format, max 1MB, utility bill/bank statement, mandatory (often required for verification during DAF or interview stage)​
Educational Certificates: PDF format, max 500KB per file, graduation and all supporting degree certificates, mandatory`;

async function testUserInput() {
  try {
    console.log('🧪 Testing with user\'s exact input...');
    console.log('📝 Input text:');
    console.log(userInput);
    console.log('\n' + '='.repeat(50));
    
    const response = await fetch('http://localhost:3000/api/text-to-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: userInput })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ API Response:');
    console.log('================');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n📊 Detailed Analysis:');
    console.log(`- Exam: ${result.exam}`);
    console.log(`- Documents found: ${result.documents.length}`);
    
    result.documents.forEach((doc, index) => {
      console.log(`\n📄 Document ${index + 1}: ${doc.type}`);
      
      // Check format specifically
      if (doc.requirements.format) {
        console.log(`   ✅ Format: ${doc.requirements.format.join(', ')}`);
        
        // Validate expected formats
        if (doc.type === 'Photo' && doc.requirements.format.includes('JPEG') && doc.requirements.format.length === 1) {
          console.log(`   ✅ Correct! Photo should only be JPEG`);
        } else if (doc.type === 'Photo') {
          console.log(`   ❌ Wrong! Photo shows ${doc.requirements.format.join(', ')} but should be only JPEG`);
        }
        
        if (doc.type === 'Signature' && doc.requirements.format.includes('JPG') && doc.requirements.format.length === 1) {
          console.log(`   ✅ Correct! Signature should only be JPG`);
        } else if (doc.type === 'Signature') {
          console.log(`   ❌ Wrong! Signature shows ${doc.requirements.format.join(', ')} but should be only JPG`);
        }
      } else {
        console.log(`   ❌ No format detected`);
      }
      
      // Check size
      if (doc.requirements.maxSize) {
        console.log(`   📏 Size: ${doc.requirements.maxSize}`);
      }
      
      // Check mandatory status
      if (doc.requirements.mandatory !== undefined) {
        console.log(`   ⚠️  Mandatory: ${doc.requirements.mandatory}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserInput();