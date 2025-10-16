// Test the JEE Mains 2025 input to see what's going wrong
const fetch = require('node-fetch');

async function testJEEInput() {
  console.log('🧪 Testing JEE Mains 2025 Input');
  console.log('================================');

  const inputText = `JEE Mains 2025

Documents Required:
Photo: JPEG/JPG format, 10KB–200KB, recent passport-size photo (80% face visible including ears, white/light background), mandatory
Signature: JPEG/JPG format, 4KB–30KB, scanned signature in black ink on white paper, mandatory
ID Proof: PDF format, 50KB–300KB, Aadhaar/Passport/Voter ID/any valid govt-issued ID, mandatory
Class 10th Marksheet/Pass Certificate: PDF format, 50KB–300KB, mandatory
Class 12th Marksheet/Admit Card/Certificate: PDF format, 50KB–300KB, mandatory if passed or appearing
Category Certificate (if applicable): PDF format, 50KB–300KB, SC/ST/OBC/EWS certificate, only if applicable
PwD Certificate (if applicable): PDF format, 50KB–300KB, for differently-abled candidates, only if applicable`;

  try {
    console.log('📝 Input text:');
    console.log(inputText);
    console.log('\n🔄 Parsing...');

    const response = await fetch('http://localhost:3000/api/text-to-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText })
    });

    if (!response.ok) {
      throw new Error(`Parse failed: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('\n📊 Parse Results:');
    console.log(`   - Exam: ${result.exam}`);
    console.log(`   - Documents found: ${result.documents?.length || 0}`);
    console.log(`   - Confidence: ${result.metadata?.confidence || 'N/A'}`);

    if (result.documents && result.documents.length > 0) {
      console.log('\n📄 Documents detected:');
      result.documents.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.type}`);
        console.log(`      - Format: ${doc.requirements.format?.join('/') || 'Not detected'}`);
        let sizeInfo = 'Not detected';
        if (doc.requirements.maxSize && doc.requirements.minSize) {
          sizeInfo = `${doc.requirements.minSize}–${doc.requirements.maxSize}`;
        } else if (doc.requirements.maxSize) {
          sizeInfo = doc.requirements.maxSize;
        } else if (doc.requirements.minSize) {
          sizeInfo = `Min: ${doc.requirements.minSize}`;
        }
        console.log(`      - Size: ${sizeInfo}`);
        console.log(`      - Mandatory: ${doc.requirements.mandatory ? 'Yes' : 'No'}`);
        if (doc.requirements.subcategories) {
          console.log(`      - Subcategories: ${doc.requirements.subcategories.length}`);
        }
      });
    } else {
      console.log('\n❌ No documents were detected!');
      if (result.metadata?.suggestions) {
        console.log('💡 Suggestions:');
        result.metadata.suggestions.forEach(suggestion => {
          console.log(`   - ${suggestion}`);
        });
      }
    }

    console.log('\n🔍 Issues Analysis:');
    
    // Check for format parsing issues
    const lines = inputText.split('\n');
    console.log('   - Lines with document info:');
    lines.forEach((line, index) => {
      if (line.includes(':') && (line.includes('format') || line.includes('JPEG') || line.includes('PDF'))) {
        console.log(`     ${index + 1}: "${line}"`);
      }
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testJEEInput();