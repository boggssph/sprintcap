import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { devAuthGuard } from '../../../lib/devAuthMiddleware'
import { prisma } from '../../../lib/prisma'

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

    // Get sprintId from query
    const { searchParams } = new URL(request.url)
    const sprintId = searchParams.get('sprintId')

    if (!sprintId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'sprintId is required' },
        { status: 400 }
      )
    }

    // Get sprint and check if user is scrum master for the squad
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      select: { 
        id: true, 
        squadId: true, 
        squad: { 
          select: { 
            scrumMasterId: true,
            members: {
              select: {
                user: {
                  select: { id: true, name: true, displayName: true }
                }
              }
            }
          } 
        }
      }
    })

    if (!sprint) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Sprint not found' },
        { status: 404 }
      )
    }

    if (sprint.squad.scrumMasterId !== dbUser.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Scrum Master access required for this squad' },
        { status: 403 }
      )
    }

    // Get existing member hours for the sprint
    const existingHours = await prisma.memberHours.findMany({
      where: { sprintId },
      include: {
        member: {
          select: { id: true, name: true, displayName: true }
        }
      }
    })

    // Get all squad members
    const squadMembers = sprint.squad.members.map(member => member.user)

    // Create default hours records for members who don't have them
    const membersWithoutHours = squadMembers.filter(member => 
      !existingHours.some(hours => hours.memberId === member.id)
    )

    if (membersWithoutHours.length > 0) {
      await prisma.memberHours.createMany({
        data: membersWithoutHours.map(member => ({
          memberId: member.id,
          sprintId,
          supportIncidents: 0,
          prReview: 0,
          others: 0
        }))
      })
    }

    // Get all member hours (including newly created ones)
    const memberHours = await prisma.memberHours.findMany({
      where: { sprintId },
      include: {
        member: {
          select: { id: true, name: true, displayName: true }
        }
      }
    })

    // Format response
    const formattedHours = memberHours.map(hour => ({
      id: hour.id,
      memberId: hour.memberId,
      sprintId: hour.sprintId,
      memberName: hour.member.displayName || hour.member.name || 'Unknown',
      supportIncidents: hour.supportIncidents,
      prReview: hour.prReview,
      others: hour.others,
      createdAt: hour.createdAt,
      updatedAt: hour.updatedAt
    }))

    return NextResponse.json(formattedHours)
  } catch (error) {
    console.error('GET /api/member-hours error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch member hours' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { memberId, sprintId, supportIncidents, prReview, others } = body

    if (!memberId || !sprintId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'memberId and sprintId are required' },
        { status: 400 }
      )
    }

    // Validate numeric values
    const validateNumber = (value: unknown) => typeof value === 'number' && value >= 0
    if (!validateNumber(supportIncidents) || !validateNumber(prReview) || !validateNumber(others)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'All hour values must be non-negative numbers' },
        { status: 400 }
      )
    }

    // Get sprint and check if user is scrum master for the squad
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      select: { id: true, squadId: true, squad: { select: { scrumMasterId: true } } }
    })

    if (!sprint) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Sprint not found' },
        { status: 404 }
      )
    }

    if (sprint.squad.scrumMasterId !== dbUser.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Scrum Master access required for this squad' },
        { status: 403 }
      )
    }

    // Verify member exists in the squad
    const memberExists = await prisma.squadMember.findFirst({
      where: { squadId: sprint.squadId, userId: memberId }
    })

    if (!memberExists) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Member not found in squad' },
        { status: 404 }
      )
    }

    // Upsert member hours
    const memberHours = await prisma.memberHours.upsert({
      where: {
        memberId_sprintId: {
          memberId,
          sprintId
        }
      },
      update: {
        supportIncidents,
        prReview,
        others
      },
      create: {
        memberId,
        sprintId,
        supportIncidents,
        prReview,
        others
      }
    })

    return NextResponse.json(memberHours)
  } catch (error) {
    console.error('PUT /api/member-hours error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update member hours' },
      { status: 500 }
    )
  }
}