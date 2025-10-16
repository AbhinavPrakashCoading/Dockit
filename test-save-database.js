// Test Save to Database functionality with JEE input
const jeeInput = `JEE Mains 2025

Documents Required:
Photo: JPEG/JPG format, 10KB–200KB, recent passport-size photo (80% face visible including ears, white/light background), mandatory
Signature: JPEG/JPG format, 4KB–30KB, scanned signature in black ink on white paper, mandatory
ID Proof: PDF format, 50KB–300KB, Aadhaar/Passport/Voter ID/any valid govt-issued ID, mandatory
Class 10th Marksheet/Pass Certificate: PDF format, 50KB–300KB, mandatory
Class 12th Marksheet/Admit Card/Certificate: PDF format, 50KB–300KB, mandatory if passed or appearing
Category Certificate (if applicable): PDF format, 50KB–300KB, SC/ST/OBC/EWS certificate, only if applicable
PwD Certificate (if applicable): PDF format, 50KB–300KB, for differently-abled candidates, only if applicable
`;

async function testSaveToDatabase() {
    console.log('🧪 Testing Save to Database with JEE Mains 2025');
    console.log('================================================');
    
    try {
        // Step 1: Parse the text
        console.log('📝 Step 1: Parsing text to JSON...');
        const parseResponse = await fetch('http://localhost:3000/api/text-to-json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: jeeInput.trim(),
                method: 'text-parser'
            })
        });
        
        if (!parseResponse.ok) {
            throw new Error(`Parse failed: ${parseResponse.status}`);
        }
        
        const parsedResult = await parseResponse.json();
        console.log('✅ Parsing successful!');
        console.log(`   - Exam: ${parsedResult.exam}`);
        console.log(`   - Documents: ${parsedResult.documents?.length || 0}`);
        
        // Step 2: Try to save to database
        console.log('\n💾 Step 2: Saving to database...');
        const saveResponse = await fetch('http://localhost:3000/api/save-parsed-document', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parsedJson: parsedResult,
                originalText: jeeInput.trim(),
                userId: null
            })
        });
        
        const saveResult = await saveResponse.json();
        
        if (saveResponse.status === 409 && saveResult.isDuplicate) {
            console.log('⚠️ Duplicates detected!');
            console.log(`   - Exam: ${saveResult.examName}`);
            console.log(`   - Existing files: ${saveResult.duplicates?.length || 0}`);
            console.log('   - Files:');
            saveResult.duplicates?.forEach((file, index) => {
                console.log(`     ${index + 1}. ${file}`);
            });
            
            console.log('\n🔄 Testing overwrite functionality...');
            
            // Test creating new (should work)
            const createNewResponse = await fetch('http://localhost:3000/api/parsed-documents-fallback/save-with-overwrite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...saveResult.originalData,
                    overwrite: false
                })
            });
            
            if (createNewResponse.ok) {
                const newDoc = await createNewResponse.json();
                console.log('✅ Create new document successful!');
                console.log(`   - Filename: ${newDoc.filename}`);
            } else {
                console.log('❌ Create new document failed');
            }
            
        } else if (saveResponse.ok) {
            console.log('✅ Save successful - no duplicates found');
            console.log(`   - Document ID: ${saveResult.document?.id}`);
            console.log(`   - Filename: ${saveResult.document?.filename}`);
        } else {
            console.log('❌ Save failed');
            console.log(`   - Status: ${saveResponse.status}`);
            console.log(`   - Error: ${saveResult.error}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testSaveToDatabase();