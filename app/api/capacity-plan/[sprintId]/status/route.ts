import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { devAuthGuard } from '@/lib/devAuthMiddleware'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'

export async function GET(
  request: NextRequest,
  { params }: { params: { sprintId: string } }
) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    const devUser = await devAuthGuard(request)

    if (!session && !devUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = devUser || session?.user
    if (!user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email.toLowerCase().trim() },
      select: { id: true, role: true }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not found' },
        { status: 401 }
      )
    }

    // Only Scrum Masters and Admins can check capacity planning status
    if (dbUser.role !== 'SCRUM_MASTER' && dbUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Scrum Master or Admin role required' },
        { status: 403 }
      )
    }

    // Rate limiting: 60 requests per hour per user
    const rateLimitResult = await rateLimit(`capacity-plan-status:${dbUser.id}`, 60, 3600)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const { sprintId } = params

    // Check if sprint exists and user has access
    const sprint = await prisma.sprint.findFirst({
      where: {
        id: sprintId,
        squad: {
          scrumMasterId: dbUser.id,
        },
      },
      select: {
        id: true,
        isActive: true,
      },
    })

    if (!sprint) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Sprint not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      isEnabled: sprint.isActive,
    })
  } catch (error) {
    console.error('Error checking sprint capacity status:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to check sprint status' },
      { status: 500 }
    )
  }
}