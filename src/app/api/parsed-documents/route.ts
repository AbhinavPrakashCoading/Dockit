import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// POST /api/parsed-documents - Create a new parsed document
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

    // Create the parsed document
    const parsedDocument = await prisma.parsedDocument.create({
      data: {
        examName,
        examType,
        source,
        parsedJson,
        originalText,
        confidence,
        documentCount,
        method,
        userId,
        extractedAt: new Date()
      },
    });

    return NextResponse.json(parsedDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating parsed document:', error);
    
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

// GET /api/parsed-documents - List all parsed documents with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const examType = searchParams.get('examType');
    const examName = searchParams.get('examName');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter object
    const where: Prisma.ParsedDocumentWhereInput = {};
    
    if (userId) where.userId = userId;
    if (examType) where.examType = { contains: examType, mode: 'insensitive' };
    if (examName) where.examName = { contains: examName, mode: 'insensitive' };
    if (source) where.source = source;

    // Get parsed documents with pagination
    const [parsedDocuments, total] = await Promise.all([
      prisma.parsedDocument.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.parsedDocument.count({ where })
    ]);

    return NextResponse.json({
      data: parsedDocuments,
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