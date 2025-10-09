import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { devAuthGuard } from '../../../lib/devAuthMiddleware'
import { prisma } from '../../../lib/prisma'
import { validateCreateSquadRequest } from '../../../lib/validations/squad'

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

    // Only Scrum Masters can view squads
    if (dbUser.role !== 'SCRUM_MASTER') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Scrum Master role required' },
        { status: 403 }
      )
    }

    // Get squads for this Scrum Master
    const squads = await prisma.squad.findMany({
      where: { scrumMasterId: dbUser.id },
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform to match contract expectations
    const transformedSquads = squads.map(squad => ({
      id: squad.id,
      name: squad.name,
      alias: squad.alias,
      memberCount: squad._count.members,
      createdAt: squad.createdAt.toISOString()
    }))

    return NextResponse.json({ squads: transformedSquads })

  } catch (error) {
    console.error('GET /api/squads error:', error)
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

    // Only Scrum Masters can create squads
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

    const validationErrors = validateCreateSquadRequest(body)
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

    const { name, alias } = body as { name: string; alias: string }

    // Check for duplicate alias
    const existingSquad = await prisma.squad.findUnique({
      where: { alias }
    })

    if (existingSquad) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'Squad alias already exists',
          details: { alias: 'This alias is already taken' }
        },
        { status: 409 }
      )
    }

    // Create the squad
    const squad = await prisma.squad.create({
      data: {
        name: name.trim(),
        alias: alias.trim(),
        scrumMasterId: dbUser.id
      }
    })

    // Return created squad
    const responseSquad = {
      id: squad.id,
      name: squad.name,
      alias: squad.alias,
      memberCount: 0,
      createdAt: squad.createdAt.toISOString()
    }

    return NextResponse.json({ squad: responseSquad }, { status: 201 })

  } catch (error) {
    console.error('POST /api/squads error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Something went wrong' },
      { status: 500 }
    )
  }
}