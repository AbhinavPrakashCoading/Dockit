// Utility to migrate existing data to individual files and manage individual file storage
import fs from 'fs';
import path from 'path';

interface ParsedDocument {
  id: string;
  examName: string;
  examType: string;
  source: string;
  parsedJson: any;
  createdAt?: string;
  updatedAt?: string;
}

class IndividualFileStorage {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'data', 'parsed-documents');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  // Generate filename from exam name and timestamp
  private generateFileName(examName: string, timestamp?: string): string {
    const cleanExamName = examName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const ts = timestamp || new Date().toISOString().replace(/[:.]/g, '-');
    return `${cleanExamName}-${ts}.json`;
  }

  // Get file path from filename
  private getFilePath(filename: string): string {
    return path.join(this.baseDir, filename);
  }

  // Save document as individual file
  async saveDocument(document: ParsedDocument): Promise<string> {
    const filename = this.generateFileName(document.examName, document.id);
    const filePath = this.getFilePath(filename);
    
    // Add metadata
    const documentWithMeta = {
      ...document,
      createdAt: document.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      filename: filename
    };
    
    fs.writeFileSync(filePath, JSON.stringify(documentWithMeta, null, 2), 'utf-8');
    return filename;
  }

  // Check if exam already exists
  checkDuplicates(examName: string): string[] {
    const files = this.listFiles();
    const cleanExamName = examName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return files.filter(filename => filename.startsWith(cleanExamName));
  }

  // List all document files
  listFiles(): string[] {
    try {
      return fs.readdirSync(this.baseDir).filter(file => file.endsWith('.json'));
    } catch (error) {
      return [];
    }
  }

  // Load document by filename
  loadDocument(filename: string): ParsedDocument | null {
    try {
      const filePath = this.getFilePath(filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  // Load all documents (for compatibility)
  loadAllDocuments(): ParsedDocument[] {
    const files = this.listFiles();
    const documents: ParsedDocument[] = [];
    
    for (const filename of files) {
      const doc = this.loadDocument(filename);
      if (doc) {
        documents.push(doc);
      }
    }
    
    return documents.sort((a, b) => 
      new Date(b.updatedAt || b.createdAt || '').getTime() - 
      new Date(a.updatedAt || a.createdAt || '').getTime()
    );
  }

  // Delete document
  deleteDocument(filename: string): boolean {
    try {
      const filePath = this.getFilePath(filename);
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Update existing document
  updateDocument(filename: string, updates: Partial<ParsedDocument>): boolean {
    try {
      const existing = this.loadDocument(filename);
      if (!existing) return false;
      
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const filePath = this.getFilePath(filename);
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Migrate from old JSON array format
  async migrateFromArray(arrayFilePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(arrayFilePath, 'utf-8');
      const documents: ParsedDocument[] = JSON.parse(content);
      
      console.log(`Migrating ${documents.length} documents to individual files...`);
      
      for (const doc of documents) {
        const filename = await this.saveDocument(doc);
        console.log(`Migrated: ${doc.examName} -> ${filename}`);
      }
      
      // Backup old file
      const backupPath = arrayFilePath + '.backup';
      fs.copyFileSync(arrayFilePath, backupPath);
      console.log(`Original file backed up to: ${backupPath}`);
      
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }
}

export { IndividualFileStorage };
export default IndividualFileStorage;