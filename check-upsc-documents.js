// Check for saved UPSC Civil Services Examination 2025 documents
const fetch = require('node-fetch');

async function checkUPSCDocuments() {
  console.log('🔍 Checking for UPSC Civil Services Examination 2025 Documents');
  console.log('==============================================================');

  try {
    // Search for UPSC documents
    const response = await fetch('http://localhost:3000/api/parsed-documents-fallback?examName=UPSC');
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const result = await response.json();
    
    console.log(`\n📊 Search Results:`);
    console.log(`   - Total UPSC documents found: ${result.data?.length || 0}`);
    
    if (result.data && result.data.length > 0) {
      result.data.forEach((doc, index) => {
        console.log(`\n📄 Document ${index + 1}:`);
        console.log(`   - ID: ${doc.id}`);
        console.log(`   - Exam Name: ${doc.examName}`);
        console.log(`   - Exam Type: ${doc.examType}`);
        console.log(`   - Source: ${doc.source}`);
        console.log(`   - Document Count: ${doc.documentCount}`);
        console.log(`   - Confidence: ${doc.confidence}`);
        console.log(`   - Created: ${new Date(doc.createdAt).toLocaleString()}`);
        console.log(`   - Access Count: ${doc.accessCount}`);
        console.log(`   - Has Original Text: ${!!doc.originalText}`);
        console.log(`   - Has Parsed JSON: ${!!doc.parsedJson}`);
        
        if (doc.parsedJson && doc.parsedJson.documents) {
          console.log(`   - Documents in JSON:`);
          doc.parsedJson.documents.forEach((document, docIndex) => {
            console.log(`     ${docIndex + 1}. ${document.type} (${document.requirements.format?.join(', ') || 'No format'}, ${document.requirements.mandatory ? 'Mandatory' : 'Optional'})`);
          });
        }
      });

      // Check for the exact "UPSC Civil Services Examination 2025"
      const exactMatch = result.data.find(doc => 
        doc.examName === 'UPSC Civil Services Examination 2025'
      );
      
      if (exactMatch) {
        console.log(`\n✅ FOUND: "UPSC Civil Services Examination 2025"`);
        console.log(`   - Document ID: ${exactMatch.id}`);
        console.log(`   - Saved on: ${new Date(exactMatch.createdAt).toLocaleString()}`);
        console.log(`   - Contains ${exactMatch.documentCount} document types`);
        
        if (exactMatch.parsedJson && exactMatch.parsedJson.documents) {
          console.log(`   - Document types found:`);
          exactMatch.parsedJson.documents.forEach(doc => {
            console.log(`     • ${doc.type}`);
            if (doc.requirements.subcategories) {
              console.log(`       └─ Has ${doc.requirements.subcategories.length} subcategories`);
            }
          });
        }
      } else {
        console.log(`\n❌ No exact match for "UPSC Civil Services Examination 2025"`);
      }
      
    } else {
      console.log(`\n❌ No UPSC documents found in the database`);
    }

  } catch (error) {
    console.error('❌ Error checking UPSC documents:', error.message);
  }
}

checkUPSCDocuments();