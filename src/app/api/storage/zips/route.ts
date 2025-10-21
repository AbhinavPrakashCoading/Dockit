import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/storage/zips
 * List user's ZIP files
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const examType = searchParams.get('examType')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const zips = await prisma.documentZip.findMany({
      where: {
        userId: user.id,
        ...(examType && { examType })
      },
      select: {
        id: true,
        filename: true,
        fileSize: true,
        examType: true,
        rollNumber: true,
        generatedAt: true,
        downloadCount: true,
        storageType: true
      },
      orderBy: { generatedAt: 'desc' },
      take: limit,
      skip: offset
    })

    const totalCount = await prisma.documentZip.count({
      where: {
        userId: user.id,
        ...(examType && { examType })
      }
    })

    return NextResponse.json({
      success: true,
      zips,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('ZIP list error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve ZIP files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}