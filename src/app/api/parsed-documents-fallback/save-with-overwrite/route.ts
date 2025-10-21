import { NextRequest, NextResponse } from 'next/server';
import { IndividualFileStorage } from '@/lib/individual-file-storage';

const storage = new IndividualFileStorage();

// POST /api/parsed-documents-fallback/save-with-overwrite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      examName, 
      examType, 
      source, 
      parsedJson, 
      originalText, 
      confidence, 
      documentCount, 
      method, 
      userId,
      overwrite = false,
      targetFilename = null 
    } = body;

    // Generate ID
    function generateId() {
      return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    const now = new Date().toISOString();

    if (overwrite && targetFilename) {
      // Overwrite existing file
      const existingDoc = storage.loadDocument(targetFilename);
      if (!existingDoc) {
        return NextResponse.json(
          { error: 'Target document not found' },
          { status: 404 }
        );
      }

      const updatedDocument = {
        ...existingDoc,
        examName,
        examType: examType || existingDoc.examType,
        source: source || existingDoc.source,
        parsedJson,
        originalText: originalText || existingDoc.originalText,
        confidence: confidence || existingDoc.confidence,
        documentCount: documentCount || existingDoc.documentCount,
        method: method || existingDoc.method,
        userId: userId || existingDoc.userId,
        updatedAt: now
      };

      const success = storage.updateDocument(targetFilename, updatedDocument);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to update document' },
          { status: 500 }
        );
      }

      return NextResponse.json({ ...updatedDocument, filename: targetFilename });
    } else {
      // Create new file (even if duplicates exist)
      const newDocument = {
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

      const filename = await storage.saveDocument(newDocument);
      return NextResponse.json({ ...newDocument, filename }, { status: 201 });
    }
  } catch (error) {
    console.error('Error in save-with-overwrite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}