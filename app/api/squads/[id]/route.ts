import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { devAuthGuard } from '../../../../lib/devAuthMiddleware'
import { prisma } from '../../../../lib/prisma'
import { validateUpdateSquadRequest, UpdateSquadRequest } from '../../../../lib/validations/squad'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Only Scrum Masters and Admins can update squads
    if (dbUser.role !== 'SCRUM_MASTER' && dbUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Scrum Master or Admin role required' },
        { status: 403 }
      )
    }

    const squadId = params.id

    // Verify the squad exists and belongs to this Scrum Master
    const existingSquad = await prisma.squad.findFirst({
      where: {
        id: squadId,
        scrumMasterId: dbUser.id
      }
    })

    if (!existingSquad) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Squad not found or access denied' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationErrors = validateUpdateSquadRequest(body)

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid request data',
          details: validationErrors
        },
        { status: 400 }
      )
    }

    // Extract validated data
    const updateData = body as UpdateSquadRequest

    // Check for name uniqueness within organization (same scrum master)
    if (updateData.name && updateData.name !== existingSquad.name) {
      const nameExists = await prisma.squad.findFirst({
        where: {
          name: updateData.name,
          scrumMasterId: dbUser.id,
          id: { not: squadId } // Exclude current squad
        }
      })

      if (nameExists) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Squad name must be unique within your organization',
            details: [{ field: 'name', message: 'Name already exists' }]
          },
          { status: 400 }
        )
      }
    }

    // Check for alias uniqueness globally
    if (updateData.alias && updateData.alias !== existingSquad.alias) {
      const aliasExists = await prisma.squad.findFirst({
        where: {
          alias: updateData.alias,
          id: { not: squadId } // Exclude current squad
        }
      })

      if (aliasExists) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Squad alias must be unique across all organizations',
            details: [{ field: 'alias', message: 'Alias already exists' }]
          },
          { status: 400 }
        )
      }
    }

    // Prepare update data - only include fields that were provided
    const updateFields: Partial<UpdateSquadRequest> = {}

    if (updateData.name !== undefined) updateFields.name = updateData.name
    if (updateData.alias !== undefined) updateFields.alias = updateData.alias
    if (updateData.dailyScrumMinutes !== undefined) updateFields.dailyScrumMinutes = updateData.dailyScrumMinutes
    if (updateData.refinementHours !== undefined) updateFields.refinementHours = updateData.refinementHours
    if (updateData.reviewDemoMinutes !== undefined) updateFields.reviewDemoMinutes = updateData.reviewDemoMinutes
    if (updateData.planningHours !== undefined) updateFields.planningHours = updateData.planningHours
    if (updateData.retrospectiveMinutes !== undefined) updateFields.retrospectiveMinutes = updateData.retrospectiveMinutes

    // Only update if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'No valid fields provided for update' },
        { status: 400 }
      )
    }

    // Update the squad
    const updatedSquad = await prisma.squad.update({
      where: { id: squadId },
      data: updateFields,
      select: {
        id: true,
        name: true,
        alias: true,
        dailyScrumMinutes: true,
        refinementHours: true,
        reviewDemoMinutes: true,
        planningHours: true,
        retrospectiveMinutes: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      squad: {
        id: updatedSquad.id,
        name: updatedSquad.name,
        alias: updatedSquad.alias,
        ceremonyDefaults: {
          dailyScrumMinutes: updatedSquad.dailyScrumMinutes,
          refinementHours: updatedSquad.refinementHours,
          reviewDemoMinutes: updatedSquad.reviewDemoMinutes,
          planningHours: updatedSquad.planningHours,
          retrospectiveMinutes: updatedSquad.retrospectiveMinutes
        },
        updatedAt: updatedSquad.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('PATCH /api/squads/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Something went wrong' },
      { status: 500 }
    )
  }
}