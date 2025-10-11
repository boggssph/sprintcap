import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { devAuthGuard } from '@/lib/devAuthMiddleware'
import { prisma } from '@/lib/prisma'
import { capacityPlanService } from '@/lib/services/capacityPlanService'
import { rateLimit } from '@/lib/rateLimit'

export async function GET(request: NextRequest) {
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

    // Only Scrum Masters and Admins can access capacity planning
    if (dbUser.role !== 'SCRUM_MASTER' && dbUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Scrum Master or Admin role required' },
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

    // Get active sprints for this Scrum Master
    const activeSprints = await capacityPlanService.getActiveSprints(dbUser.id)

    return NextResponse.json({
      sprints: activeSprints.map(sprint => ({
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        status: sprint.status,
        isActive: sprint.isActive,
        squad: {
          id: sprint.squad.id,
          name: sprint.squad.name,
          alias: sprint.squad.alias,
          members: sprint.squad.members,
        },
      })),
    })
  } catch (error) {
    console.error('Error fetching active sprints:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch active sprints' },
      { status: 500 }
    )
  }
}