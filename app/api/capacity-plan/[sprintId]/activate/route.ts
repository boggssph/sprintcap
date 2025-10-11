import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { devAuthGuard } from '@/lib/devAuthMiddleware'
import { prisma } from '@/lib/prisma'
import { capacityPlanService } from '@/lib/services/capacityPlanService'
import { activateSprintSchema } from '@/lib/validations/ticketValidation'
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

    // Only Scrum Masters can modify sprint activation
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

    // Validate request body
    const body = await request.json()
    const validationResult = activateSprintSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid request body',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { isActive } = validationResult.data
    const { sprintId } = params

    // Activate or deactivate the sprint
    const sprint = isActive
      ? await capacityPlanService.activateSprint(sprintId, dbUser.id)
      : await capacityPlanService.deactivateSprint(sprintId, dbUser.id)

    return NextResponse.json({
      sprint: {
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        status: sprint.status,
        isActive: sprint.isActive,
        squadId: sprint.squadId,
      },
    })
  } catch (error) {
    console.error('Error activating/deactivating sprint:', error)

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Sprint not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update sprint activation' },
      { status: 500 }
    )
  }
}