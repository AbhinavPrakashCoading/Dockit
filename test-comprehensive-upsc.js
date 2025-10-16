// Test with comprehensive UPSC format similar to what the user is inputting
const fetch = require('node-fetch');

const comprehensiveUpscText = `Document Requirements for UPSC Civil Services Examination 2025:

1. Photograph:
Format: JPEG/JPG only
Size: Between 20 KB to 300 KB  
Dimensions: Approximately 3.5 cm (width) x 1.5 cm (height)
Description: Recent color photograph with white background face covering 3/4th area of the photo frontal view with both ears visible natural expression no shadows or reflections eyes open
Mandatory: Yes

2. Signature:
Format: JPEG/JPG only
Size: Between 20 KB to 300 KB
Dimensions: Approximately 3.5 cm (width) x 1.5 cm (height)
Description: Handwritten signature in black ink on white paper clear scan without shadows or distortions
Mandatory: Yes

3. Identity Proof:
Format: PDF only
Size: Maximum 1 MB
Description: Valid government issued photo ID such as Aadhaar PAN Passport or Driving License
Mandatory: Yes

4. Address Proof:
Format: PDF only  
Size: Maximum 1 MB
Description: Utility bill bank statement or other official document with candidate's address (used primarily during document verification)
Mandatory: Yes

5. Educational Certificates:
Format: PDF only
Size: Maximum 500 KB per file
Description: All relevant academic certificates including graduation degree and mark sheets
Mandatory: Yes

6. Category Certificate:
Format: PDF only
Size: Around 300 KB max
Description: Caste certificates (SC/ST/OBC) or EWS certificate as per prescribed formats
Mandatory: No

7. Disability Certificate:
Format: PDF only
Description: Certificate issued by competent authority for persons with benchmark disabilities
Mandatory: No (only if applicable)`;

async function testComprehensiveApi() {
  try {
    console.log('🧪 Testing API with comprehensive UPSC format...');
    
    const response = await fetch('http://localhost:3000/api/text-to-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: comprehensiveUpscText })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ API Response received!');
    console.log('========================');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n📊 Analysis:');
    console.log(`- Exam detected: ${result.exam || 'Not detected'}`);
    console.log(`- Documents found: ${result.documents.length}`);
    console.log(`- Confidence: ${result.metadata.confidence}`);
    
    result.documents.forEach((doc, index) => {
      console.log(`\n📄 Document ${index + 1}: ${doc.type}`);
      console.log(`   Format: ${doc.requirements.format ? doc.requirements.format.join('/') : 'Not detected'}`);
      
      let sizeInfo = 'Not detected';
      if (doc.requirements.minSize && doc.requirements.maxSize) {
        sizeInfo = `${doc.requirements.minSize} - ${doc.requirements.maxSize}`;
      } else if (doc.requirements.maxSize) {
        sizeInfo = `Max: ${doc.requirements.maxSize}`;
      } else if (doc.requirements.minSize) {
        sizeInfo = `Min: ${doc.requirements.minSize}`;
      }
      console.log(`   Size: ${sizeInfo}`);
      
      if (doc.requirements.mandatory !== undefined) {
        console.log(`   ⚠️  Mandatory: ${doc.requirements.mandatory ? 'Yes' : 'No'}`);
      }
      
      if (doc.requirements.description) {
        const desc = doc.requirements.description.length > 50 
          ? doc.requirements.description.substring(0, 50) + '...'
          : doc.requirements.description;
        console.log(`   📝 Description: ${desc}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testComprehensiveApi();