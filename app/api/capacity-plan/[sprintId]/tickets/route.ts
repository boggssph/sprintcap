import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { devAuthGuard } from '@/lib/devAuthMiddleware'
import { prisma } from '@/lib/prisma'
import { capacityPlanService } from '@/lib/services/capacityPlanService'
import { createTicketSchema } from '@/lib/validations/ticketValidation'
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
      where: { email: user.email },
      select: { id: true, role: true }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not found' },
        { status: 401 }
      )
    }

    // Only Scrum Masters can access capacity planning
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

    // Get tickets for the sprint
    const tickets = await capacityPlanService.getSprintTickets(sprintId, dbUser.id)

    return NextResponse.json({
      tickets: tickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        assignee: ticket.assignee,
        jiraKey: ticket.jiraKey,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching sprint tickets:', error)

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Sprint not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch sprint tickets' },
      { status: 500 }
    )
  }
}

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

    // Only Scrum Masters can create tickets
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
    const validationResult = createTicketSchema.safeParse(body)

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

    const { sprintId } = params

    // Create the ticket
    const ticket = await capacityPlanService.createTicket(sprintId, validationResult.data, dbUser.id)

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        assignee: ticket.assignee,
        jiraKey: ticket.jiraKey,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Not Found', message: 'Sprint not found or access denied' },
          { status: 404 }
        )
      }
      if (error.message.includes('Jira issue not found')) {
        return NextResponse.json(
          { error: 'Validation Error', message: 'Referenced Jira issue does not exist' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}