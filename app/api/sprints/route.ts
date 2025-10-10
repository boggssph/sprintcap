import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { devAuthGuard } from '../../../lib/devAuthMiddleware'
import { prisma } from '../../../lib/prisma'
import { validateCreateSprintRequest, CreateSprintRequest } from '../../../lib/validations/sprint'
import { getSprintsForScrumMaster, createSprint } from '../../../lib/services/sprintService'

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
      where: { email: user.email },
      select: { id: true, role: true }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not found' },
        { status: 401 }
      )
    }

    // Only Scrum Masters can view sprints
    if (dbUser.role !== 'SCRUM_MASTER') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Scrum Master role required' },
        { status: 403 }
      )
    }

    // Get sprints for this Scrum Master
    const sprints = await getSprintsForScrumMaster(dbUser.id)

    return NextResponse.json({ sprints })

  } catch (error) {
    console.error('GET /api/sprints error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Only Scrum Masters can create sprints
    if (dbUser.role !== 'SCRUM_MASTER') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Scrum Master role required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const validationErrors = validateCreateSprintRequest(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          details: validationErrors.reduce((acc, err) => {
            acc[err.field] = err.message
            return acc
          }, {} as Record<string, string>)
        },
        { status: 400 }
      )
    }

    const sprintData = body as CreateSprintRequest

    // Create the sprint
    const sprint = await createSprint(dbUser.id, dbUser.role, sprintData)

    return NextResponse.json({ sprint }, { status: 201 })

  } catch (error) {
    console.error('POST /api/sprints error:', error)

    // Handle specific service errors
    if (error instanceof Error) {
      // Check if it's a SprintServiceError with a specific code
      const isSprintServiceError = error.constructor.name === 'SprintServiceError' || error.name === 'SprintServiceError'
      if (isSprintServiceError && 'code' in error) {
        const serviceError = error as Error & { code: string }
        if (serviceError.code === 'CONFLICT') {
          return NextResponse.json(
            { error: 'Conflict', message: error.message },
            { status: 409 }
          )
        }
        if (serviceError.code === 'PERMISSION_DENIED') {
          return NextResponse.json(
            { error: 'Forbidden', message: error.message },
            { status: 403 }
          )
        }
        if (serviceError.code === 'NOT_FOUND') {
          return NextResponse.json(
            { error: 'Not Found', message: error.message },
            { status: 404 }
          )
        }
        if (serviceError.code === 'VALIDATION_ERROR') {
          return NextResponse.json(
            { error: 'Validation Error', message: error.message },
            { status: 400 }
          )
        }
      }

      // Fallback to message-based checking for backward compatibility
      if (error.message.includes('Squad not found') || error.message.includes('not authorized') || error.message.includes('Access denied')) {
        return NextResponse.json(
          { error: 'Forbidden', message: error.message },
          { status: 403 }
        )
      }
      if (error.message.includes('already exists') || error.message.includes('already exists in this squad') || error.message.includes('overlap')) {
        return NextResponse.json(
          { error: 'Conflict', message: error.message },
          { status: 409 }
        )
      }
      // Handle Prisma errors
      if (error.message.includes('P2002')) {
        return NextResponse.json(
          { error: 'Conflict', message: 'A sprint with this name already exists in this squad' },
          { status: 409 }
        )
      }
      if (error.message.includes('P2025') || error.message.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { error: 'Not Found', message: 'Squad not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Something went wrong' },
      { status: 500 }
    )
  }
}