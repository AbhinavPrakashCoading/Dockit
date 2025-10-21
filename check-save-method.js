// Check how UPSC documents were saved and where files are stored
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function checkSaveMethod() {
  console.log('🔍 Checking Save Method and Storage Location');
  console.log('==============================================');

  try {
    // Check the storage file location
    const storageFile = path.join(process.cwd(), 'data', 'parsed-documents.json');
    console.log(`📁 Storage file location: ${storageFile}`);
    
    // Check if the file exists
    if (fs.existsSync(storageFile)) {
      console.log('✅ Storage file exists');
      
      // Read the file content
      const fileContent = fs.readFileSync(storageFile, 'utf8');
      const documents = JSON.parse(fileContent);
      
      console.log(`📊 Total documents in storage: ${documents.length}`);
      
      // Find UPSC documents and analyze their creation
      const upscDocs = documents.filter(doc => 
        doc.examName.includes('UPSC Civil Services Examination 2025')
      );
      
      console.log(`\n🎯 UPSC Civil Services Examination 2025 Analysis:`);
      console.log(`   - Found ${upscDocs.length} UPSC document(s)`);
      
      upscDocs.forEach((doc, index) => {
        console.log(`\n📄 Document ${index + 1}:`);
        console.log(`   - ID: ${doc.id}`);
        console.log(`   - Created: ${new Date(doc.createdAt).toLocaleString()}`);
        console.log(`   - Source: ${doc.source}`);
        console.log(`   - Method: ${doc.method}`);
        console.log(`   - User ID: ${doc.userId || 'None (anonymous)'}`);
        
        // Analyze creation time pattern to determine save method
        const createdTime = new Date(doc.createdAt);
        const now = new Date();
        const timeDiff = (now - createdTime) / (1000 * 60); // minutes ago
        
        console.log(`   - Created ${timeDiff.toFixed(0)} minutes ago`);
        
        // Check if it was saved by button (manual) or auto-saved
        if (doc.source === 'text-input' && doc.method === 'text-parser') {
          if (doc.userId) {
            console.log(`   - 💾 LIKELY SAVED BY BUTTON (has user ID)`);
          } else {
            console.log(`   - 🤖 LIKELY AUTO-SAVED (no user ID)`);
          }
        }
        
        console.log(`   - Document types: ${doc.documentCount}`);
        if (doc.originalText) {
          console.log(`   - Original text length: ${doc.originalText.length} characters`);
          console.log(`   - Original text preview: "${doc.originalText.substring(0, 100)}..."`);
        }
      });
      
      // Show file size and location
      const stats = fs.statSync(storageFile);
      console.log(`\n📁 Storage File Details:`);
      console.log(`   - Location: ${storageFile}`);
      console.log(`   - Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   - Last modified: ${stats.mtime.toLocaleString()}`);
      
      // Show directory structure
      const dataDir = path.dirname(storageFile);
      console.log(`\n📂 Data Directory: ${dataDir}`);
      if (fs.existsSync(dataDir)) {
        const files = fs.readdirSync(dataDir);
        console.log(`   - Files in data directory:`);
        files.forEach(file => {
          const filePath = path.join(dataDir, file);
          const fileStats = fs.statSync(filePath);
          console.log(`     • ${file} (${(fileStats.size / 1024).toFixed(2)} KB)`);
        });
      }
      
    } else {
      console.log('❌ Storage file not found');
      console.log(`   Expected location: ${storageFile}`);
    }

    // Also check via API to compare
    console.log(`\n🌐 API Verification:`);
    const response = await fetch('http://localhost:3000/api/parsed-documents-fallback?examName=UPSC');
    
    if (response.ok) {
      const result = await response.json();
      console.log(`   - API returned ${result.data?.length || 0} UPSC documents`);
      console.log(`   - File storage and API are in sync: ${result.data?.length === upscDocs.length ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSaveMethod();