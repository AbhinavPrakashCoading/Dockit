import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/parsed-documents/[id] - Get a single parsed document by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const parsedDocument = await prisma.parsedDocument.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!parsedDocument) {
      return NextResponse.json(
        { error: 'Parsed document not found' },
        { status: 404 }
      );
    }

    // Update access tracking
    await prisma.parsedDocument.update({
      where: { id },
      data: {
        accessCount: { increment: 1 },
        lastAccessed: new Date()
      }
    });

    return NextResponse.json(parsedDocument);
  } catch (error) {
    console.error('Error fetching parsed document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/parsed-documents/[id] - Update a parsed document
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      examName,
      examType,
      source,
      parsedJson,
      originalText,
      confidence,
      documentCount,
      method
    } = body;

    // Check if document exists
    const existingDocument = await prisma.parsedDocument.findUnique({
      where: { id }
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Parsed document not found' },
        { status: 404 }
      );
    }

    // Update the document
    const updatedDocument = await prisma.parsedDocument.update({
      where: { id },
      data: {
        ...(examName && { examName }),
        ...(examType && { examType }),
        ...(source && { source }),
        ...(parsedJson && { parsedJson }),
        ...(originalText && { originalText }),
        ...(confidence !== undefined && { confidence }),
        ...(documentCount !== undefined && { documentCount }),
        ...(method && { method }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating parsed document:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/parsed-documents/[id] - Delete a parsed document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if document exists
    const existingDocument = await prisma.parsedDocument.findUnique({
      where: { id }
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Parsed document not found' },
        { status: 404 }
      );
    }

    // Delete the document
    await prisma.parsedDocument.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Parsed document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting parsed document:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}