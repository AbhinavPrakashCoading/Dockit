import { NextRequest, NextResponse } from 'next/server'
// Temporarily disabled auth while auth system is being rebuilt
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'

/**
 * GET /api/storage/stats/user
 * Get user's storage statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Temporarily bypass auth while auth system is being rebuilt
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Return empty stats for guest users
    const stats = {
      totalDocuments: 0,
      storageUsed: 0, // MB
      storageLimit: 1024, // MB
      driveConnected: false, // Guest users don't have drive connected
      processingCount: 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching storage stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch storage stats' },
      { status: 500 }
    )
  }
}