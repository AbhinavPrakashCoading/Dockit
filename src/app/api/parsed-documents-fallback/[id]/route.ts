import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'parsed-documents.json');

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
}

// Read all documents from storage
async function readDocuments(): Promise<StoredParsedDocument[]> {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write all documents to storage
async function writeDocuments(documents: StoredParsedDocument[]): Promise<void> {
  const dir = path.dirname(STORAGE_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(STORAGE_FILE, JSON.stringify(documents, null, 2));
}

// GET /api/parsed-documents-fallback/[id] - Get a single parsed document by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const documents = await readDocuments();
    const document = documents.find(doc => doc.id === id);

    if (!document) {
      return NextResponse.json(
        { error: 'Parsed document not found' },
        { status: 404 }
      );
    }

    // Update access tracking
    document.accessCount += 1;
    document.lastAccessed = new Date().toISOString();
    await writeDocuments(documents);

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching parsed document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/parsed-documents-fallback/[id] - Update a parsed document
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const documents = await readDocuments();
    const docIndex = documents.findIndex(doc => doc.id === id);

    if (docIndex === -1) {
      return NextResponse.json(
        { error: 'Parsed document not found' },
        { status: 404 }
      );
    }

    // Update the document
    const updatedDocument = {
      ...documents[docIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    documents[docIndex] = updatedDocument;
    await writeDocuments(documents);

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating parsed document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/parsed-documents-fallback/[id] - Delete a parsed document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const documents = await readDocuments();
    const docIndex = documents.findIndex(doc => doc.id === id);

    if (docIndex === -1) {
      return NextResponse.json(
        { error: 'Parsed document not found' },
        { status: 404 }
      );
    }

    documents.splice(docIndex, 1);
    await writeDocuments(documents);

    return NextResponse.json(
      { message: 'Parsed document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting parsed document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}