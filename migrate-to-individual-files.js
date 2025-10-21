// Migration script to convert existing parsed-documents.json to individual files
const fs = require('fs');
const path = require('path');

// Simple version without TypeScript imports for immediate execution
class MigrationUtility {
  constructor() {
    this.baseDir = path.join(process.cwd(), 'data', 'parsed-documents');
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  generateFileName(examName, documentId) {
    const cleanExamName = examName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens  
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    // Use document ID for uniqueness
    return `${cleanExamName}-${documentId}.json`;
  }

  async migrateFromArray() {
    const arrayFilePath = path.join(process.cwd(), 'data', 'parsed-documents.json');
    
    try {
      console.log('📂 Starting migration...');
      const content = fs.readFileSync(arrayFilePath, 'utf-8');
      const documents = JSON.parse(content);
      
      console.log(`📄 Found ${documents.length} documents to migrate`);
      
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const filename = this.generateFileName(doc.examName, doc.id);
        const filePath = path.join(this.baseDir, filename);
        
        // Add metadata
        const documentWithMeta = {
          ...doc,
          createdAt: doc.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          filename: filename
        };
        
        fs.writeFileSync(filePath, JSON.stringify(documentWithMeta, null, 2), 'utf-8');
        console.log(`✅ Migrated: ${doc.examName} -> ${filename}`);
      }
      
      // Backup old file
      const backupPath = arrayFilePath + '.backup';
      fs.copyFileSync(arrayFilePath, backupPath);
      console.log(`💾 Original file backed up to: ${backupPath}`);
      
      console.log('✨ Migration completed successfully!');
      
      // List migrated files
      const files = fs.readdirSync(this.baseDir);
      console.log(`\n📋 Created ${files.length} individual files:`);
      files.forEach(file => console.log(`   - ${file}`));
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
    }
  }
}

// Run migration
const migrator = new MigrationUtility();
migrator.migrateFromArray();