import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { devAuthGuard } from '@/lib/devAuthMiddleware'
import { prisma } from '@/lib/prisma'
import { capacityPlanService } from '@/lib/services/capacityPlanService'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(
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
      where: { email: user.email },
      select: { id: true, role: true }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not found' },
        { status: 401 }
      )
    }

    // Only Scrum Masters can sync with Jira
    if (dbUser.role !== 'SCRUM_MASTER') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Scrum Master role required' },
        { status: 403 }
      )
    }

    // Rate limiting: 60 requests per hour per user
    const rateLimitResult = await rateLimit(`capacity-plan:${dbUser.id}`, 60, 3600)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const { sprintId } = params

    // Sync tickets with Jira
    const syncResult = await capacityPlanService.syncWithJira(sprintId, dbUser.id)

    return NextResponse.json(syncResult)
  } catch (error) {
    console.error('Error syncing with Jira:', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Not Found', message: 'Sprint not found or access denied' },
          { status: 404 }
        )
      }
      if (error.message.includes('Jira')) {
        return NextResponse.json(
          { error: 'External Service Error', message: 'Failed to sync with Jira' },
          { status: 502 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to sync with Jira' },
      { status: 500 }
    )
  }
}