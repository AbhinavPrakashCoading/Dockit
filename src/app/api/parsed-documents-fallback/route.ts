import { NextRequest, NextResponse } from 'next/server';
import { IndividualFileStorage } from '@/lib/individual-file-storage';

interface StoredParsedDocument {
  id: string;
  examName: string;
  examType: string | null;
  source: string;
  parsedJson: any;
  originalText: string | null;
  confidence: number | null;
  documentCount: number | null;
  method: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  extractedAt: string;
  accessCount: number;
  lastAccessed: string | null;
  filename?: string;
}

// Use individual file storage instead of single JSON file
const storage = new IndividualFileStorage();

// Compatibility methods for existing interface
async function readDocuments(): Promise<StoredParsedDocument[]> {
  try {
    return storage.loadAllDocuments() as StoredParsedDocument[];
  } catch (error) {
    console.error('Error reading documents:', error);
    return [];
  }
}

// Save single document to individual file  
async function saveDocument(document: StoredParsedDocument): Promise<string> {
  try {
    return await storage.saveDocument(document);
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
}

// Check for duplicate documents
function checkDuplicates(examName: string): string[] {
  return storage.checkDuplicates(examName);
}

// Generate unique ID
function generateId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// POST /api/parsed-documents-fallback - Create a new parsed document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      examName, 
      examType, 
      source = 'text-input',
      parsedJson, 
      originalText,
      confidence,
      documentCount,
      method,
      userId 
    } = body;

    // Validation
    if (!examName || !parsedJson) {
      return NextResponse.json(
        { error: 'Missing required fields: examName and parsedJson' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newDocument: StoredParsedDocument = {
      id: generateId(),
      examName,
      examType: examType || null,
      source,
      parsedJson,
      originalText: originalText || null,
      confidence: confidence || null,
      documentCount: documentCount || null,
      method: method || null,
      userId: userId || null,
      createdAt: now,
      updatedAt: now,
      extractedAt: now,
      accessCount: 0,
      lastAccessed: null
    };

    // Check for duplicates
    const duplicates = checkDuplicates(examName);
    if (duplicates.length > 0) {
      return NextResponse.json(
        { 
          error: 'Duplicate documents found',
          duplicates: duplicates,
          examName: examName
        },
        { status: 409 }
      );
    }

    // Save as individual file
    const filename = await saveDocument(newDocument);
    const savedDocument = { ...newDocument, filename };

    return NextResponse.json(savedDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating parsed document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/parsed-documents-fallback - List all parsed documents with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const examType = searchParams.get('examType');
    const examName = searchParams.get('examName');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let documents = await readDocuments();

    // Apply filters
    if (userId) {
      documents = documents.filter(doc => doc.userId === userId);
    }
    if (examType) {
      documents = documents.filter(doc => 
        doc.examType?.toLowerCase().includes(examType.toLowerCase())
      );
    }
    if (examName) {
      documents = documents.filter(doc => 
        doc.examName.toLowerCase().includes(examName.toLowerCase())
      );
    }
    if (source) {
      documents = documents.filter(doc => doc.source === source);
    }

    // Sort by creation date (newest first)
    documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const total = documents.length;
    const paginatedDocs = documents.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedDocs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching parsed documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}