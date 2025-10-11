import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { devAuthGuard } from '@/lib/devAuthMiddleware'
import { prisma } from '@/lib/prisma'
import { updateSprintStatus } from '@/lib/services/sprintService'
import { rateLimit } from '@/lib/rateLimit'

export async function PUT(
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

    // Only Scrum Masters can update sprint status
    if (dbUser.role !== 'SCRUM_MASTER') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Scrum Master role required' },
        { status: 403 }
      )
    }

    // Rate limiting: 30 requests per hour per user
    const rateLimitResult = await rateLimit(`sprint-status:${dbUser.id}`, 30, 3600)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Validate request body
    const body = await request.json()
    const { status } = body

    if (!status || !['ACTIVE', 'INACTIVE', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid status. Must be ACTIVE, INACTIVE, or COMPLETED'
        },
        { status: 400 }
      )
    }

    const { sprintId } = params

    // Update sprint status
    const updatedSprint = await updateSprintStatus(sprintId, status, dbUser.id)

    return NextResponse.json({
      sprint: {
        id: updatedSprint.id,
        name: updatedSprint.name,
        status: updatedSprint.status,
        startDate: updatedSprint.startDate,
        endDate: updatedSprint.endDate,
        squadId: updatedSprint.squadId
      }
    })
  } catch (error) {
    console.error('Error updating sprint status:', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Not Found', message: 'Sprint not found or access denied' },
          { status: 404 }
        )
      }
      if (error.message.includes('Invalid status transition')) {
        return NextResponse.json(
          { error: 'Validation Error', message: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update sprint status' },
      { status: 500 }
    )
  }
}