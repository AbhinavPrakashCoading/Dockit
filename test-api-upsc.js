// Test the API endpoint with UPSC format
const fetch = require('node-fetch');

const upscText = `Civil Services Examination 2024

Documents Required for Online Application:

1. Recent colour photograph:
   Format: JPEG/JPG only
   Size: Between 50 KB to 300 KB
   Dimensions: 3.5 cm (width) x 4.5 cm (height)
   Background: White or light colored

2. Signature:
   Format: JPEG/JPG only
   Size: Between 10 KB to 40 KB
   Dimensions: 3.5 cm (width) x 1.5 cm (height)
   Note: Use only black or blue pen

3. Identity proof copy:
   Acceptable documents: Aadhaar Card / Passport / Driving License / PAN Card
   Format: PDF only
   Size: Maximum 1 MB
   Note: Document should be clear and readable

4. Educational qualification certificates:
   Format: PDF only
   Size: Maximum 2 MB per document
   Note: All required certificates must be uploaded`;

async function testApi() {
  try {
    console.log('🧪 Testing API with UPSC format...');
    
    const response = await fetch('http://localhost:3000/api/text-to-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: upscText })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ API Response received!');
    console.log('========================');
    console.log(JSON.stringify(result, null, 2));
    
    // Test analysis
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
      
      let dimensionInfo = 'Not detected';
      if (doc.requirements.dimensions) {
        if (doc.requirements.dimensions.ratio) {
          dimensionInfo = doc.requirements.dimensions.ratio;
        } else if (doc.requirements.dimensions.width && doc.requirements.dimensions.height) {
          dimensionInfo = `${doc.requirements.dimensions.width} x ${doc.requirements.dimensions.height}`;
        }
      }
      console.log(`   Dimensions: ${dimensionInfo}`);
      
      if (doc.requirements.mandatory) {
        console.log(`   ⚠️  Mandatory: Yes`);
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testApi();