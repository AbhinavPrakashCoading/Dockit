import { NextRequest, NextResponse } from 'next/server'
// Temporarily disabled auth while auth system is being rebuilt
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'

/**
 * GET /api/storage/documents/list
 * Get user's documents list for the dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Temporarily bypass auth while auth system is being rebuilt
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // For now, return empty array since we don't have actual document storage implemented
    // and we shouldn't show fake data to users
    const documents: any[] = [];

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}