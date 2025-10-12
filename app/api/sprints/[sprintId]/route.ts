import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { devAuthGuard } from '../../../../lib/devAuthMiddleware'
import { prisma } from '../../../../lib/prisma'
import { validateSprintUpdateRequest, validateStatusTransition, type SprintUpdateRequest } from '../../../../lib/validations/sprintUpdate'

export async function PUT(
  request: NextRequest,
  { params }: { params: { sprintId: string } }
) {
  try {
    const { sprintId } = params

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

    // Only Scrum Masters can update sprints
    if (dbUser.role !== 'SCRUM_MASTER') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Scrum Master role required' },
        { status: 403 }
      )
    }

    // Get the sprint and verify ownership
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        squad: {
          select: { scrumMasterId: true }
        }
      }
    })

    if (!sprint) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Sprint not found' },
        { status: 404 }
      )
    }

    // Verify the user owns this squad
    if (sprint.squad.scrumMasterId !== dbUser.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only update sprints in squads you own' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    let updateData: SprintUpdateRequest
    try {
      const body = await request.json()
      updateData = validateSprintUpdateRequest(body)
    } catch (error) {
      return NextResponse.json(
        { error: 'Bad Request', message: error instanceof Error ? error.message : 'Invalid request data' },
        { status: 400 }
      )
    }

    // Validate status transition if status is being updated
    if (updateData.status && updateData.status !== sprint.status) {
      if (!validateStatusTransition(sprint.status, updateData.status)) {
        return NextResponse.json(
          { error: 'Bad Request', message: `Invalid status transition from ${sprint.status} to ${updateData.status}` },
          { status: 400 }
        )
      }
    }

    // Update the sprint
    const updatedSprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: {
        name: updateData.name,
        startDate: new Date(updateData.startDate),
        endDate: new Date(updateData.endDate),
        ...(updateData.status && { status: updateData.status }),
        dailyScrumMinutes: updateData.dailyScrum,
        sprintPlanningMinutes: updateData.sprintPlanning,
        sprintReviewMinutes: updateData.sprintReview,
        sprintRetrospectiveMinutes: updateData.sprintRetrospective,
        refinementMinutes: updateData.refinement,
        updatedAt: new Date()
      },
      include: {
        squad: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({
      sprint: {
        id: updatedSprint.id,
        name: updatedSprint.name,
        startDate: updatedSprint.startDate.toISOString(),
        endDate: updatedSprint.endDate.toISOString(),
        status: updatedSprint.status,
        dailyScrum: updatedSprint.dailyScrumMinutes,
        sprintPlanning: updatedSprint.sprintPlanningMinutes,
        sprintReview: updatedSprint.sprintReviewMinutes,
        sprintRetrospective: updatedSprint.sprintRetrospectiveMinutes,
        refinement: updatedSprint.refinementMinutes,
        squadName: updatedSprint.squad.name,
        updatedAt: updatedSprint.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('PUT /api/sprints/[sprintId] error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Something went wrong' },
      { status: 500 }
    )
  }
}